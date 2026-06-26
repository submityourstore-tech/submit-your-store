import type { AdminBusinessInput } from "@/lib/businesses-write";
import { ADMIN_CSV_FORMAT } from "@/lib/admin-csv-format";
import {
  getRowValue,
  mapHeaderToCanonical,
  normalizeCsvHeader,
  isKnownCanonicalField,
  type HeaderMapping,
} from "@/lib/admin-csv-header-mapping";
import { isPlausibleCityName, parseCityStateFromAddress } from "@/lib/location-utils";
import { resolveCategoryKey, resolveCategoryLabel } from "@/lib/categories-config";
import type { SocialLinks, WeeklyHoursEntry } from "@/types/business";

export { ADMIN_CSV_FORMAT };

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^\uFEFF/, "");
}

function isMissing(value: string): boolean {
  const v = value.toLowerCase();
  return !v || v === "n/a" || v === "na" || v === "none" || v === "-";
}

function parseFloatSafe(value: string): number | undefined {
  const n = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function parseIntSafe(value: string): number | undefined {
  const n = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Parse one CSV/TSV line, respecting double-quoted fields. */
function parseDelimitedLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  fields.push(current);
  return fields.map((field) => field.trim());
}

function detectDelimiter(headerLine: string): string {
  const tabCount = (headerLine.match(/\t/g) ?? []).length;
  const commaCount = (headerLine.match(/,/g) ?? []).length;

  if (tabCount >= 5) return "\t";
  if (commaCount >= 5) return ",";
  return headerLine.includes("\t") ? "\t" : ",";
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.includes("google.com/maps") || value.includes("!8m2");
}

function isValidBusinessName(name: string): boolean {
  if (name.length < 2) return false;
  if (looksLikeUrl(name)) return false;
  if (name.includes("!8m2") || name.includes("/maps/")) return false;
  if (/^-?\d+(\.\d+)?$/.test(name.replace(/\s/g, ""))) return false;
  return true;
}

function resolveAdminCategory(rawCategory: string): { category?: string; categoryKey?: string } {
  const label = clean(rawCategory);
  if (
    isMissing(label) ||
    label.length > 80 ||
    looksLikeUrl(label) ||
    label.includes("!8m2") ||
    label.includes("0x")
  ) {
    return { categoryKey: "home-services:hvac" };
  }

  if (label.includes(":")) {
    const resolved = resolveCategoryKey(label);
    if (resolved) return { categoryKey: label };
  }

  const resolved = resolveCategoryLabel(label);
  if (resolved.categorySlug && resolved.categorySlug.length <= 60) {
    return { category: label };
  }

  return { categoryKey: "home-services:hvac" };
}

function parseAddressParts(address: string): { address: string; city: string; state: string } {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const statePart = parts[parts.length - 1] ?? "";
    const city = parts[parts.length - 2] ?? "Dallas";
    const state = statePart.match(/\b([A-Z]{2})\b/i)?.[1]?.toUpperCase() ?? "TX";
    return { address: parts.slice(0, -2).join(", "), city, state };
  }
  if (parts.length === 2) {
    const state = parts[1].match(/\b([A-Z]{2})\b/i)?.[1]?.toUpperCase() ?? "TX";
    return { address: parts[0], city: parts[0], state };
  }
  return { address, city: "Dallas", state: "TX" };
}

function parseWeeklyHours(raw: string): WeeklyHoursEntry[] {
  if (isMissing(raw)) return [];
  const chunks = raw.split(/\||\n/).map((s) => s.trim()).filter(Boolean);
  return chunks.map((chunk) => {
    const idx = chunk.indexOf(":");
    if (idx === -1) return { day: chunk, hours: "Hours vary" };
    return {
      day: chunk.slice(0, idx).trim(),
      hours: chunk.slice(idx + 1).trim() || "Hours vary",
    };
  });
}

function rowSocial(row: Record<string, string>): SocialLinks {
  return {
    facebook: isMissing(getRowValue(row, "facebook")) ? null : clean(getRowValue(row, "facebook")),
    instagram: isMissing(getRowValue(row, "instagram")) ? null : clean(getRowValue(row, "instagram")),
    linkedin: isMissing(getRowValue(row, "linkedin")) ? null : clean(getRowValue(row, "linkedin")),
    youtube: isMissing(getRowValue(row, "youtube")) ? null : clean(getRowValue(row, "youtube")),
    twitter: isMissing(getRowValue(row, "twitter")) ? null : clean(getRowValue(row, "twitter")),
  };
}

export type CsvParseResult = {
  rows: Record<string, string>[];
  headerMappings: HeaderMapping[];
  skippedHeaders: string[];
  delimiter: string;
};

export type CsvUploadValidation = {
  ok: boolean;
  error?: string;
  hint?: string;
};

/** Reject Excel/binary uploads before parsing garbage as CSV. */
export function validateCsvUploadContent(content: string, filename?: string): CsvUploadValidation {
  const name = filename?.toLowerCase() ?? "";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return {
      ok: false,
      error: "Excel (.xlsx) files cannot be uploaded directly.",
      hint: "Google Sheets: File → Download → Comma Separated Values (.csv). Then upload the .csv file here.",
    };
  }

  const head = content.slice(0, 800);
  if (head.startsWith("PK") && (head.includes("xl/") || head.includes("[Content_Types]"))) {
    return {
      ok: false,
      error: "This file looks like Excel, not CSV/TSV.",
      hint: "Save your spreadsheet as .csv or tab-separated .tsv before uploading.",
    };
  }

  const nonPrintable = (head.match(/[\x00-\x08\x0E-\x1F]/g) ?? []).length;
  if (nonPrintable > 8) {
    return {
      ok: false,
      error: "File is not plain-text CSV/TSV.",
      hint: "Export from Google Sheets as CSV (.csv) or TSV (.tsv), not .xlsx.",
    };
  }

  return { ok: true };
}

export function parseCsvWithMeta(text: string): CsvParseResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return { rows: [], headerMappings: [], skippedHeaders: [], delimiter: "," };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseDelimitedLine(lines[0], delimiter);
  const skippedHeaders: string[] = [];
  const headerMappings: HeaderMapping[] = [];

  for (const original of rawHeaders) {
    const canonical = mapHeaderToCanonical(original);
    if (!isKnownCanonicalField(canonical)) {
      if (original.trim()) skippedHeaders.push(original.trim());
      continue;
    }
    headerMappings.push({
      original,
      normalized: normalizeCsvHeader(original),
      canonical,
    });
  }

  const rows: Record<string, string>[] = [];
  for (const line of lines.slice(1)) {
    const values = parseDelimitedLine(line, delimiter);
    const row: Record<string, string> = {};

    rawHeaders.forEach((rawHeader, i) => {
      const canonical = mapHeaderToCanonical(rawHeader);
      if (!isKnownCanonicalField(canonical)) return;

      const value = clean(values[i]);
      if (!value) return;

      const existing = row[canonical];
      if (!existing || isMissing(existing)) {
        row[canonical] = value;
      }
    });

    if (Object.values(row).some(Boolean)) rows.push(row);
  }

  return { rows, headerMappings, skippedHeaders, delimiter };
}

export function parseCsvRows(text: string): Record<string, string>[] {
  return parseCsvWithMeta(text).rows;
}

export type CsvPublishValidation = {
  ok: boolean;
  error?: string;
  missingFields?: string[];
};

/** Minimum to publish: GBP URL + business name + description */
export function validateCsvPublishRow(row: Record<string, string>): CsvPublishValidation {
  const gbpUrl = getRowValue(row, "gbp_url");
  const businessName = getRowValue(row, "business_name");
  const description = getRowValue(row, "description_raw");

  const missingFields: string[] = [];
  if (isMissing(gbpUrl) || !looksLikeUrl(gbpUrl)) missingFields.push("gbp_url");
  if (!isValidBusinessName(businessName)) missingFields.push("business_name");
  if (isMissing(description)) missingFields.push("description");

  if (missingFields.length) {
    const labels: Record<string, string> = {
      gbp_url: "GBP URL",
      business_name: "Business name",
      description: "Description",
    };
    return {
      ok: false,
      missingFields,
      error: `Missing required: ${missingFields.map((f) => labels[f] ?? f).join(", ")}`,
    };
  }

  return { ok: true };
}

export function csvRowToAdminInput(row: Record<string, string>): AdminBusinessInput | null {
  let businessName = getRowValue(row, "business_name");
  if (!isValidBusinessName(businessName)) return null;

  const validation = validateCsvPublishRow(row);
  if (!validation.ok) return null;

  const addressRaw = getRowValue(row, "address");
  const parsedAddress = addressRaw
    ? parseAddressParts(addressRaw)
    : {
        address: "",
        city: getRowValue(row, "city") || "Dallas",
        state: getRowValue(row, "state") || "TX",
      };

  let city = getRowValue(row, "city") || parsedAddress.city;
  let state = getRowValue(row, "state") || parsedAddress.state;
  if (!isPlausibleCityName(city) && addressRaw) {
    const fromAddress = parseCityStateFromAddress(addressRaw);
    if (fromAddress) {
      city = fromAddress.city;
      state = fromAddress.state;
    } else {
      city = parsedAddress.city;
      state = parsedAddress.state;
    }
  }

  const reviews = ["top_review_1", "top_review_2", "top_review_3"]
    .map((key) => getRowValue(row, key))
    .filter((r) => !isMissing(r));

  const galleryUrls = ["image_1", "image_2", "image_3", "image_4", "image_5"]
    .map((key) => getRowValue(row, key))
    .filter((url) => !isMissing(url) && url.startsWith("http"));

  const description = getRowValue(row, "description_raw");
  const weeklyHours = parseWeeklyHours(getRowValue(row, "weekly_hours"));
  const hoursStatus = getRowValue(row, "business_hours");
  const category = resolveAdminCategory(getRowValue(row, "category"));
  const gbpUrl = getRowValue(row, "gbp_url");

  return {
    businessName,
    gbpUrl,
    ...category,
    address: parsedAddress.address || addressRaw || undefined,
    city,
    state,
    website: isMissing(getRowValue(row, "website")) ? undefined : getRowValue(row, "website"),
    email: isMissing(getRowValue(row, "email")) ? undefined : getRowValue(row, "email"),
    phone: isMissing(getRowValue(row, "phone")) ? undefined : getRowValue(row, "phone"),
    description,
    googleRating: parseFloatSafe(getRowValue(row, "rating")),
    googleReviewCount: parseIntSafe(getRowValue(row, "review_count")),
    googleReviews: reviews.length ? reviews : undefined,
    hoursStatus: isMissing(hoursStatus) ? undefined : hoursStatus,
    weeklyHours: weeklyHours.length ? weeklyHours : undefined,
    social: rowSocial(row),
    logoUrl: isMissing(getRowValue(row, "logo_url")) ? undefined : getRowValue(row, "logo_url"),
    galleryUrls,
  };
}

/** Extract business name slug from GBP place URL path when available. */
export function extractPlaceNameFromGbpUrl(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@]+)/i);
    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
    }
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeNameToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/** True when uploaded name and GBP place name clearly differ. */
export function detectNameGbpMismatch(uploadedName: string, gbpUrl: string): {
  mismatch: boolean;
  gbpPlaceName: string | null;
} {
  const gbpPlaceName = extractPlaceNameFromGbpUrl(gbpUrl);
  if (!gbpPlaceName) return { mismatch: false, gbpPlaceName: null };

  const a = normalizeNameToken(uploadedName);
  const b = normalizeNameToken(gbpPlaceName);
  if (!a || !b) return { mismatch: false, gbpPlaceName };

  if (a === b || a.includes(b) || b.includes(a)) {
    return { mismatch: false, gbpPlaceName };
  }

  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  let matches = 0;
  for (let i = 0; i < shorter.length; i += 1) {
    if (shorter[i] === longer[i]) matches += 1;
  }
  const similarity = matches / longer.length;
  return { mismatch: similarity < 0.55, gbpPlaceName };
}

export { normalizeCsvHeader };
