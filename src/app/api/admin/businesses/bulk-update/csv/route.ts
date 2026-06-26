import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { parseCsvRows, validateCsvUploadContent } from "@/lib/admin-csv.server";
import {
  findBusinessForBulkRow,
  rowToBulkUpdatePatch,
} from "@/lib/admin-bulk-update.server";
import { getPendingField, type AdminPendingFieldId } from "@/lib/admin-pending-fields";
import { isAdminSession } from "@/lib/admin-auth.server";
import { readBusinesses } from "@/lib/businesses-data";
import { updateAdminBusiness } from "@/lib/businesses-write";
import { markBusinessFieldVerified } from "@/lib/field-verification.server";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";
import { getRowValue } from "@/lib/admin-csv-header-mapping";

export const maxDuration = 300;

type BulkResult = {
  label: string;
  ok: boolean;
  businessUrl?: string;
  error?: string;
};

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const fieldId = String(form.get("field") ?? "").trim() as AdminPendingFieldId;
    const field = getPendingField(fieldId);
    if (!field) {
      return NextResponse.json({ error: "Unknown update field." }, { status: 400 });
    }

    const file = form.get("file");
    const filename = file instanceof File ? file.name : undefined;
    const csvText =
      file instanceof File ? await file.text() : String(form.get("csvText") ?? "");

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

    const rows = parseCsvRows(csvText);
    if (!rows.length) {
      return NextResponse.json({ error: "No data rows found in CSV." }, { status: 400 });
    }

    let businesses = await readBusinesses();
    const results: BulkResult[] = [];

    for (const row of rows) {
      const gbpHint =
        getRowValue(row, "gbp_url") ||
        getRowValue(row, "business_name") ||
        getRowValue(row, "id") ||
        "(row)";
      const business = findBusinessForBulkRow(row, businesses);
      if (!business) {
        results.push({
          label: gbpHint,
          ok: false,
          error: "No matching business — check gbp_url, id, or business_name.",
        });
        continue;
      }

      const patch = rowToBulkUpdatePatch(fieldId, row);
      if (!patch) {
        results.push({
          label: business.name,
          ok: false,
          error: `No ${field.label.toLowerCase()} data in this row.`,
        });
        continue;
      }

      try {
        const updated = await updateAdminBusiness(business.id, patch);
        await markBusinessFieldVerified(business.id, fieldId, "bulk_upload");
        businesses = businesses.map((b) => (b.id === updated.id ? updated : b));
        revalidateBusinessListingPaths(updated);
        revalidatePath(`/business/${updated.id}`);
        results.push({
          label: updated.name,
          ok: true,
          businessUrl: `/business/${updated.id}`,
        });
      } catch (err) {
        results.push({
          label: business.name,
          ok: false,
          error: err instanceof Error ? err.message : "Update failed",
        });
      }
    }

    revalidatePath("/admin/data-pending");
    revalidatePath("/admin/data-verify");
    revalidatePath("/admin/data-issues");
    revalidatePath("/listings");
    revalidatePath("/sitemap.xml");

    const updated = results.filter((r) => r.ok).length;
    return NextResponse.json({
      success: true,
      field: fieldId,
      updated,
      failed: results.length - updated,
      results,
    });
  } catch (err) {
    console.error("Admin bulk update failed:", err);
    return NextResponse.json({ error: "Bulk update failed." }, { status: 500 });
  }
}
