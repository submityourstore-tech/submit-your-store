import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import {
  EXPORT_CSV_HEADERS,
  buildFullExportCsv,
  businessToExportRow,
  fetchBusinessesForExport,
} from "@/lib/admin-business-export.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (format === "csv" || format === "tsv") {
    const { csv, count } = await buildFullExportCsv();
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Content-Disposition": `attachment; filename="submityourstore-listings-${date}.tsv"`,
        "X-Export-Count": String(count),
      },
    });
  }

  const records = await fetchBusinessesForExport();
  const filtered = q
    ? records.filter(
        ({ business: b }) =>
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.email?.toLowerCase().includes(q) ?? false) ||
          (b.googleMapsUrl?.toLowerCase().includes(q) ?? false),
      )
    : records;

  const rows = filtered.map(({ business, createdAt, updatedAt }) =>
    businessToExportRow(business, { createdAt, updatedAt }),
  );

  const lastUpdated = records.reduce<string | null>((latest, r) => {
    if (!r.updatedAt) return latest;
    if (!latest || r.updatedAt > latest) return r.updatedAt;
    return latest;
  }, null);

  return NextResponse.json({
    total: rows.length,
    grandTotal: records.length,
    columns: EXPORT_CSV_HEADERS,
    previewColumns: [
      "id",
      "business_name",
      "gbp_url",
      "city",
      "state",
      "email",
      "phone",
      "category",
      "claim_status",
      "updated_at",
    ],
    rows,
    lastUpdated,
    downloadUrl: "/api/admin/data-export?format=csv",
  });
}
