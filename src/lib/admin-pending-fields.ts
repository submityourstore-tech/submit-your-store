import type { Business } from "@/types/business";
import { hasValidPhone } from "@/lib/city-timezone";

export const REQUIRED_GALLERY_COUNT = 3;
export const MIN_DESCRIPTION_LENGTH = 40;

export type AdminPendingFieldId =
  | "gbp_url"
  | "founded_year"
  | "logo"
  | "gallery"
  | "description"
  | "phone"
  | "email"
  | "website"
  | "address"
  | "business_hours"
  | "weekly_hours"
  | "rating"
  | "top_reviews"
  | "social";

export type AdminPendingField = {
  id: AdminPendingFieldId;
  label: string;
  description: string;
  csvHeader: string;
  /** Columns to copy for Google Sheets scrape workflow */
  copyHeader: string;
  isPending: (business: Business) => boolean;
  /** Value for one row when copying scrape starter data */
  copyRow: (business: Business) => string;
  /** Whether this field needs an existing GBP URL to copy */
  requiresGbpForCopy: boolean;
};

function hasSocial(business: Business): boolean {
  const s = business.social;
  return Boolean(
    s.facebook?.trim() ||
      s.instagram?.trim() ||
      s.linkedin?.trim() ||
      s.youtube?.trim() ||
      s.twitter?.trim(),
  );
}

function tabJoin(values: string[]): string {
  return values.map((v) => v.replace(/\t/g, " ").replace(/\r?\n/g, " ")).join("\t");
}

export const ADMIN_PENDING_FIELDS: AdminPendingField[] = [
  {
    id: "gbp_url",
    label: "GBP URL missing",
    description: "No Google Business Profile link on file — add gbp_url to match by business id.",
    csvHeader: "id\tbusiness_name\tgbp_url",
    copyHeader: "id\tbusiness_name",
    requiresGbpForCopy: false,
    isPending: (b) => !b.googleMapsUrl?.trim(),
    copyRow: (b) => tabJoin([b.id, b.name]),
  },
  {
    id: "founded_year",
    label: "Founded year pending",
    description: "Year the business was founded — scrape from Google or company site.",
    csvHeader: "gbp_url\tfounded_year\tfounded_year_confidence",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => b.foundedYear == null,
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "logo",
    label: "Logo missing",
    description: "No logo image uploaded — paste logo_url after scraping.",
    csvHeader: "gbp_url\tlogo_url",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.logo?.trim(),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "gallery",
    label: "Gallery photos pending",
    description: `Fewer than ${REQUIRED_GALLERY_COUNT} gallery images — add image_1, image_2, image_3.`,
    csvHeader: "gbp_url\timage_1\timage_2\timage_3",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => (b.gallery?.length ?? 0) < REQUIRED_GALLERY_COUNT,
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "description",
    label: "Description pending",
    description: `Missing or short description (needs ${MIN_DESCRIPTION_LENGTH}+ characters).`,
    csvHeader: "gbp_url\tdescription_raw",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.description?.trim() || b.description.trim().length < MIN_DESCRIPTION_LENGTH,
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "phone",
    label: "Phone pending",
    description: "Missing or invalid phone number.",
    csvHeader: "gbp_url\tphone",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !hasValidPhone(b.phone),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "email",
    label: "Business email pending",
    description: "No business email on the listing.",
    csvHeader: "gbp_url\temail",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.email?.trim(),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "website",
    label: "Website pending",
    description: "No website URL on the listing.",
    csvHeader: "gbp_url\twebsite",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.website?.trim(),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "address",
    label: "Address pending",
    description: "Street address missing from listing.",
    csvHeader: "gbp_url\taddress",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.address?.trim(),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "business_hours",
    label: "Business hours pending",
    description: "Open/closed status text missing (e.g. Open ⋅ Closes 6 PM).",
    csvHeader: "gbp_url\tbusiness_hours",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.hoursStatus?.trim(),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "weekly_hours",
    label: "Weekly hours pending",
    description: "Day-by-day hours missing — use Monday: 8 AM – 5 PM|Tuesday: … format.",
    csvHeader: "gbp_url\tweekly_hours",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !b.weeklyHours?.length,
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "rating",
    label: "Google rating pending",
    description: "Google star rating or review count missing.",
    csvHeader: "gbp_url\trating\treview_count",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => b.googleRating == null || b.googleReviewCount == null,
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "top_reviews",
    label: "Top reviews pending",
    description: "Fewer than 3 Google review snippets stored.",
    csvHeader: "gbp_url\ttop_review_1\ttop_review_2\ttop_review_3",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => (b.googleReviews?.length ?? 0) < 3,
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
  {
    id: "social",
    label: "Social links pending",
    description: "No Facebook, Instagram, LinkedIn, YouTube, or Twitter links.",
    csvHeader: "gbp_url\tfacebook\tinstagram\tlinkedin\tyoutube\ttwitter",
    copyHeader: "gbp_url\tbusiness_name",
    requiresGbpForCopy: true,
    isPending: (b) => !hasSocial(b),
    copyRow: (b) => tabJoin([b.googleMapsUrl ?? "", b.name]),
  },
];

export function getPendingField(id: string): AdminPendingField | undefined {
  return ADMIN_PENDING_FIELDS.find((f) => f.id === id);
}

export type PendingFieldSummary = {
  id: AdminPendingFieldId;
  label: string;
  description: string;
  csvHeader: string;
  copyHeader: string;
  pendingCount: number;
  pendingBusinesses: {
    id: string;
    name: string;
    gbpUrl: string | null;
    city: string;
    state: string;
  }[];
};

export function summarizePendingFields(businesses: Business[]): PendingFieldSummary[] {
  return ADMIN_PENDING_FIELDS.map((field) => {
    const pending = businesses.filter(field.isPending);
    return {
      id: field.id,
      label: field.label,
      description: field.description,
      csvHeader: field.csvHeader,
      copyHeader: field.copyHeader,
      pendingCount: pending.length,
      pendingBusinesses: pending.map((b) => ({
        id: b.id,
        name: b.name,
        gbpUrl: b.googleMapsUrl,
        city: b.city,
        state: b.state,
      })),
    };
  });
}

export function buildCopyText(field: AdminPendingField, businesses: Business[]): string {
  const pending = businesses.filter(field.isPending);
  const lines = [field.copyHeader];
  for (const business of pending) {
    if (field.requiresGbpForCopy && !business.googleMapsUrl?.trim()) continue;
    lines.push(field.copyRow(business));
  }
  return lines.join("\n");
}

export function buildCopyGbpUrlsOnly(businesses: Business[]): string {
  return businesses
    .map((b) => b.googleMapsUrl?.trim())
    .filter(Boolean)
    .join("\n");
}
