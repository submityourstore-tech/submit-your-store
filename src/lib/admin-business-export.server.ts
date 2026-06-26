import { mapRowToBusiness, type BusinessRow } from "@/lib/businesses-supabase.server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { Business } from "@/types/business";

/** Same columns as bulk upload format + admin extras. */
export const EXPORT_CSV_HEADERS = [
  "id",
  "gbp_url",
  "business_name",
  "category",
  "city",
  "state",
  "address",
  "website",
  "email",
  "phone",
  "rating",
  "review_count",
  "business_hours",
  "weekly_hours",
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "twitter",
  "logo_url",
  "top_review_1",
  "top_review_2",
  "top_review_3",
  "founded_year",
  "founded_year_confidence",
  "description_raw",
  "image_1",
  "image_2",
  "image_3",
  "image_4",
  "image_5",
  "status",
  "claim_status",
  "created_at",
  "updated_at",
] as const;

export type BusinessExportRow = Record<(typeof EXPORT_CSV_HEADERS)[number], string>;

export type BusinessExportRecord = {
  business: Business;
  createdAt: string | null;
  updatedAt: string | null;
};

function cell(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/\r?\n/g, " ").trim();
}

export function businessToExportRow(
  business: Business,
  timestamps?: { createdAt?: string | null; updatedAt?: string | null },
): BusinessExportRow {
  const gallery = business.gallery ?? [];
  const reviews = business.googleReviews ?? [];
  const weekly =
    business.weeklyHours?.map((h) => `${h.day}: ${h.hours}`).join("|") ?? "";

  return {
    id: cell(business.id),
    gbp_url: cell(business.googleMapsUrl),
    business_name: cell(business.name),
    category: cell(business.category),
    city: cell(business.city),
    state: cell(business.state),
    address: cell(business.address),
    website: cell(business.website),
    email: cell(business.email),
    phone: cell(business.phone),
    rating: business.googleRating != null ? String(business.googleRating) : "",
    review_count:
      business.googleReviewCount != null ? String(business.googleReviewCount) : "",
    business_hours: cell(business.hoursStatus),
    weekly_hours: weekly,
    facebook: cell(business.social.facebook),
    instagram: cell(business.social.instagram),
    linkedin: cell(business.social.linkedin),
    youtube: cell(business.social.youtube),
    twitter: cell(business.social.twitter),
    logo_url: cell(business.logo),
    top_review_1: cell(reviews[0]),
    top_review_2: cell(reviews[1]),
    top_review_3: cell(reviews[2]),
    founded_year: business.foundedYear != null ? String(business.foundedYear) : "",
    founded_year_confidence: cell(business.foundedYearConfidence),
    description_raw: cell(business.description),
    image_1: cell(gallery[0]),
    image_2: cell(gallery[1]),
    image_3: cell(gallery[2]),
    image_4: cell(gallery[3]),
    image_5: cell(gallery[4]),
    status: cell(business.status ?? "active"),
    claim_status: cell(business.claimStatus ?? "verified"),
    created_at: timestamps?.createdAt ? timestamps.createdAt.slice(0, 19) : "",
    updated_at: timestamps?.updatedAt ? timestamps.updatedAt.slice(0, 19) : "",
  };
}

function escapeCsvCell(value: string, delimiter: string): string {
  if (value.includes('"') || value.includes("\n") || value.includes("\r") || value.includes(delimiter)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportRowsToTsv(rows: BusinessExportRow[]): string {
  const delimiter = "\t";
  const lines = [EXPORT_CSV_HEADERS.join(delimiter)];
  for (const row of rows) {
    lines.push(
      EXPORT_CSV_HEADERS.map((h) => escapeCsvCell(row[h] ?? "", delimiter)).join(delimiter),
    );
  }
  return lines.join("\n");
}

export async function fetchBusinessesForExport(): Promise<BusinessExportRecord[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(`Failed to load businesses for export: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const business = mapRowToBusiness(row as BusinessRow);
    return {
      business,
      createdAt: (row.created_at as string | null) ?? null,
      updatedAt: (row.updated_at as string | null) ?? null,
    };
  });
}

export async function buildFullExportCsv(): Promise<{ csv: string; count: number }> {
  const records = await fetchBusinessesForExport();
  const rows = records.map(({ business, createdAt, updatedAt }) =>
    businessToExportRow(business, { createdAt, updatedAt }),
  );
  return { csv: exportRowsToTsv(rows), count: rows.length };
}
