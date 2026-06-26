import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  csvRowToAdminInput,
  detectNameGbpMismatch,
  parseCsvWithMeta,
  validateCsvPublishRow,
  validateCsvUploadContent,
} from "@/lib/admin-csv.server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { readBusinesses } from "@/lib/businesses-data";
import { publishAdminBusiness } from "@/lib/businesses-write";
import {
  findDuplicateGbpListing,
  formatDuplicateGbpMessage,
  gbpUrlDedupeKey,
} from "@/lib/gbp";
import { metadataWithNameGbpMismatch, patchBusinessMetadata } from "@/lib/field-verification.server";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";
import { getRowValue } from "@/lib/admin-csv-header-mapping";

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const filename = file instanceof File ? file.name : undefined;
    const csvText =
      file instanceof File ? await file.text() : String(form.get("csvText") ?? "");
    const previewOnly = form.get("preview") === "true";

    if (!csvText.trim()) {
      return NextResponse.json({ error: "CSV file or text is required." }, { status: 400 });
    }

    const uploadCheck = validateCsvUploadContent(csvText, filename);
    if (!uploadCheck.ok) {
      return NextResponse.json(
        { error: uploadCheck.error, hint: uploadCheck.hint },
        { status: 400 },
      );
    }

    const { rows, headerMappings, skippedHeaders, delimiter } = parseCsvWithMeta(csvText);
    if (!rows.length) {
      return NextResponse.json({ error: "No data rows found in CSV." }, { status: 400 });
    }

    if (previewOnly) {
      const sample = rows[0];
      const validation = validateCsvPublishRow(sample);
      return NextResponse.json({
        preview: true,
        rowCount: rows.length,
        delimiter: delimiter === "\t" ? "tab" : "comma",
        headerMappings,
        skippedHeaders,
        sampleRow: sample,
        sampleValidation: validation,
      });
    }

    const existingBusinesses = await readBusinesses();
    const gbpKeysInBatch = new Set<string>();

    const results: {
      businessName: string;
      ok: boolean;
      businessUrl?: string;
      error?: string;
      flagged?: string;
    }[] = [];

    for (const row of rows) {
      const rawName = getRowValue(row, "business_name");
      const validation = validateCsvPublishRow(row);
      if (!validation.ok) {
        results.push({
          businessName: rawName || "(invalid row)",
          ok: false,
          error: validation.error ?? "Missing required fields (GBP URL, business name, description).",
        });
        continue;
      }

      const input = csvRowToAdminInput(row);
      if (!input) {
        results.push({
          businessName: rawName || "(invalid row)",
          ok: false,
          error: "Could not parse row — check business name and required fields.",
        });
        continue;
      }

      const gbp = input.gbpUrl?.trim();
      if (gbp) {
        const key = gbpUrlDedupeKey(gbp);
        if (key) {
          if (gbpKeysInBatch.has(key)) {
            results.push({
              businessName: input.businessName,
              ok: false,
              error: formatDuplicateGbpMessage(
                gbp,
                { id: "duplicate-row", name: "another row in this file" },
                true,
              ),
            });
            continue;
          }
          gbpKeysInBatch.add(key);
        }

        const duplicate = findDuplicateGbpListing(gbp, existingBusinesses);
        if (duplicate) {
          results.push({
            businessName: input.businessName,
            ok: false,
            error: formatDuplicateGbpMessage(duplicate.gbpUrl, duplicate.existing),
          });
          continue;
        }
      }

      try {
        const business = await publishAdminBusiness(input);
        existingBusinesses.push(business);

        let flagged: string | undefined;
        if (gbp) {
          const mismatch = detectNameGbpMismatch(input.businessName, gbp);
          if (mismatch.mismatch && mismatch.gbpPlaceName) {
            await patchBusinessMetadata(
              business.id,
              metadataWithNameGbpMismatch(null, input.businessName, mismatch.gbpPlaceName),
            );
            flagged = `Name flagged: CSV "${input.businessName}" vs GBP "${mismatch.gbpPlaceName}"`;
          }
        }

        revalidateBusinessListingPaths(business);
        revalidatePath(`/business/${business.id}`);
        results.push({
          businessName: business.name,
          ok: true,
          businessUrl: `/business/${business.id}`,
          flagged,
        });
      } catch (err) {
        results.push({
          businessName: input.businessName,
          ok: false,
          error: err instanceof Error ? err.message : "Publish failed",
        });
      }
    }

    revalidatePath("/listings");
    revalidatePath("/sitemap.xml");
    revalidatePath("/blog");
    revalidatePath("/admin/data-issues");

    const published = results.filter((r) => r.ok).length;
    return NextResponse.json({
      success: true,
      published,
      failed: results.length - published,
      headerMappings,
      results,
    });
  } catch (err) {
    console.error("Admin CSV import failed:", err);
    return NextResponse.json({ error: "CSV import failed." }, { status: 500 });
  }
}
