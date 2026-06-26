/**
 * Maps flexible spreadsheet headers (GBP, Mobile, Company Name, etc.)
 * to canonical CSV field keys used by import/update pipelines.
 */

export type CanonicalCsvField =
  | "gbp_url"
  | "business_name"
  | "description_raw"
  | "phone"
  | "email"
  | "website"
  | "address"
  | "category"
  | "city"
  | "state"
  | "rating"
  | "review_count"
  | "business_hours"
  | "weekly_hours"
  | "logo_url"
  | "founded_year"
  | "founded_year_confidence"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "top_review_1"
  | "top_review_2"
  | "top_review_3"
  | "image_1"
  | "image_2"
  | "image_3"
  | "image_4"
  | "image_5"
  | "id";

/** Normalized header → canonical field */
const DIRECT_ALIASES: Record<string, CanonicalCsvField> = {
  // GBP URL — caps/spacing/plural variants normalize to these keys
  gbp: "gbp_url",
  gbpurl: "gbp_url",
  gbpurls: "gbp_url",
  gbp_url: "gbp_url",
  gbp_link: "gbp_url",
  gbplink: "gbp_url",
  google_maps_url: "gbp_url",
  googlemapsurl: "gbp_url",
  google_maps_link: "gbp_url",
  google_business_profile: "gbp_url",
  googlebusinessprofile: "gbp_url",
  google_business_url: "gbp_url",
  googlebusinessurl: "gbp_url",
  maps_url: "gbp_url",
  mapsurl: "gbp_url",
  maps_link: "gbp_url",
  place_url: "gbp_url",
  google_url: "gbp_url",
  googleurl: "gbp_url",
  google_place_url: "gbp_url",
  googlemap: "gbp_url",
  google_map: "gbp_url",
  googlemapurl: "gbp_url",

  // Business name
  business_name: "business_name",
  businessname: "business_name",
  name: "business_name",
  company: "business_name",
  company_name: "business_name",
  companyname: "business_name",
  business: "business_name",
  listing_name: "business_name",
  listingname: "business_name",
  title: "business_name",
  store_name: "business_name",
  storename: "business_name",

  // Description
  description: "description_raw",
  description_raw: "description_raw",
  desc: "description_raw",
  about: "description_raw",
  business_description: "description_raw",
  summary: "description_raw",
  bio: "description_raw",
  overview: "description_raw",

  // Phone
  phone: "phone",
  mobile: "phone",
  cell: "phone",
  telephone: "phone",
  tel: "phone",
  phone_number: "phone",
  phonenumber: "phone",
  contact_phone: "phone",
  business_phone: "phone",
  mobile_number: "phone",
  mobilenumber: "phone",

  email: "email",
  business_email: "email",
  contact_email: "email",
  mail: "email",

  website: "website",
  web: "website",
  site: "website",
  url: "website",
  homepage: "website",
  web_site: "website",

  address: "address",
  street: "address",
  street_address: "address",
  full_address: "address",
  location: "address",

  category: "category",
  type: "category",
  business_type: "category",
  industry: "category",

  city: "city",
  town: "city",

  state: "state",
  province: "state",
  region: "state",

  rating: "rating",
  google_rating: "rating",
  stars: "rating",
  star_rating: "rating",

  review_count: "review_count",
  reviews: "review_count",
  reviewcount: "review_count",
  google_reviews_count: "review_count",
  number_of_reviews: "review_count",

  business_hours: "business_hours",
  hours: "business_hours",
  hours_status: "business_hours",
  open_hours: "business_hours",
  opening_hours: "business_hours",

  weekly_hours: "weekly_hours",
  schedule: "weekly_hours",
  hours_by_day: "weekly_hours",

  logo: "logo_url",
  logo_url: "logo_url",
  logourl: "logo_url",
  brand_logo: "logo_url",

  founded_year: "founded_year",
  foundedyear: "founded_year",
  year_founded: "founded_year",
  established: "founded_year",
  established_year: "founded_year",

  founded_year_confidence: "founded_year_confidence",
  foundedyearconfidence: "founded_year_confidence",

  facebook: "facebook",
  fb: "facebook",
  instagram: "instagram",
  ig: "instagram",
  linkedin: "linkedin",
  youtube: "youtube",
  yt: "youtube",
  twitter: "twitter",
  x: "twitter",

  top_review_1: "top_review_1",
  top_review_2: "top_review_2",
  top_review_3: "top_review_3",
  review_1: "top_review_1",
  review_2: "top_review_2",
  review_3: "top_review_3",

  image_1: "image_1",
  image_2: "image_2",
  image_3: "image_3",
  image_4: "image_4",
  image_5: "image_5",
  photo_1: "image_1",
  photo_2: "image_2",
  photo_3: "image_3",
  gallery_1: "image_1",
  gallery_2: "image_2",
  gallery_3: "image_3",

  id: "id",
  business_id: "id",
  listing_id: "id",
};

/** All canonical fields we recognize — unknown spreadsheet columns are skipped. */
export const KNOWN_CANONICAL_FIELDS = new Set<string>(
  Object.values(DIRECT_ALIASES),
);

export function isKnownCanonicalField(field: string): boolean {
  return KNOWN_CANONICAL_FIELDS.has(field);
}

export function normalizeCsvHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Fuzzy match: "gbp_urls", "GBP URL", etc. → gbp_url */
export function mapHeaderToCanonical(rawHeader: string): CanonicalCsvField | string {
  const normalized = normalizeCsvHeader(rawHeader);
  if (!normalized) return normalized;

  const direct = DIRECT_ALIASES[normalized];
  if (direct) return direct;

  // GBP variants: gbp_anything_with_url, google_maps_*, etc.
  if (
    normalized === "gbp" ||
    normalized.startsWith("gbp_") ||
    normalized.endsWith("_gbp") ||
    (normalized.includes("gbp") && (normalized.includes("url") || normalized.includes("link")))
  ) {
    return "gbp_url";
  }
  if (normalized.includes("google") && (normalized.includes("map") || normalized.includes("place"))) {
    return "gbp_url";
  }

  if (normalized.includes("mobile") || normalized.includes("cell") || normalized.includes("telephone")) {
    return "phone";
  }
  if (normalized.includes("description") || normalized.includes("about")) {
    return "description_raw";
  }
  if (
    normalized.includes("business") &&
    (normalized.includes("name") || normalized === "business" || normalized.includes("company"))
  ) {
    return "business_name";
  }
  if (normalized.includes("company") && normalized.includes("name")) {
    return "business_name";
  }

  return normalized;
}

export type HeaderMapping = {
  original: string;
  normalized: string;
  canonical: string;
};

export function buildHeaderMappings(rawHeaders: string[]): HeaderMapping[] {
  return rawHeaders.map((original) => {
    const normalized = normalizeCsvHeader(original);
    const canonical = mapHeaderToCanonical(original);
    return { original, normalized, canonical };
  });
}

export function getRowValue(row: Record<string, string>, field: CanonicalCsvField | string): string {
  return (row[field] ?? "").trim().replace(/^\uFEFF/, "");
}
