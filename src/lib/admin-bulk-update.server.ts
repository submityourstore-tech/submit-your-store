import { getRowValue } from "@/lib/admin-csv-header-mapping";
import type { AdminPendingFieldId } from "@/lib/admin-pending-fields";
import { REQUIRED_GALLERY_COUNT } from "@/lib/admin-pending-fields";
import type { AdminBusinessUpdateInput } from "@/lib/businesses-write";
import { findBusinessByGbp } from "@/lib/gbp";
import type { Business, SocialLinks, WeeklyHoursEntry } from "@/types/business";

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

function parseFoundedYear(value: string): number | undefined {
  const n = parseIntSafe(value);
  if (n == null) return undefined;
  if (n >= 1800 && n <= new Date().getFullYear()) return n;
  return undefined;
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

export function findBusinessForBulkRow(
  row: Record<string, string>,
  businesses: Business[],
): Business | undefined {
  const gbp = getRowValue(row, "gbp_url");
  if (gbp) {
    const byGbp = findBusinessByGbp(gbp, businesses);
    if (byGbp) return byGbp;
  }

  const id = getRowValue(row, "id");
  if (id) {
    const byId = businesses.find((b) => b.id === id);
    if (byId) return byId;
  }

  const name = getRowValue(row, "business_name");
  if (name) {
    const lower = name.toLowerCase();
    return businesses.find((b) => b.name.toLowerCase() === lower);
  }

  return undefined;
}

export type BulkUpdatePatch = AdminBusinessUpdateInput & {
  foundedYear?: number | null;
  foundedYearConfidence?: string | null;
};

export function rowToBulkUpdatePatch(
  fieldId: AdminPendingFieldId,
  row: Record<string, string>,
): BulkUpdatePatch | null {
  switch (fieldId) {
    case "gbp_url": {
      const gbpUrl = getRowValue(row, "gbp_url");
      if (isMissing(gbpUrl)) return null;
      return { gbpUrl };
    }
    case "founded_year": {
      const foundedYear = parseFoundedYear(
        getRowValue(row, "founded_year") || getRowValue(row, "foundedyear"),
      );
      if (foundedYear == null) return null;
      const confidence = getRowValue(row, "founded_year_confidence");
      return {
        foundedYear,
        foundedYearConfidence: isMissing(confidence) ? undefined : confidence,
      };
    }
    case "logo": {
      const logoUrl = getRowValue(row, "logo_url");
      if (isMissing(logoUrl) || !logoUrl.startsWith("http")) return null;
      return { logoUrl };
    }
    case "gallery": {
      const urls = ["image_1", "image_2", "image_3"]
        .map((key) => getRowValue(row, key))
        .filter((url) => !isMissing(url) && url.startsWith("http"));
      if (!urls.length) return null;
      return { galleryUrls: urls };
    }
    case "description": {
      const description = getRowValue(row, "description_raw");
      if (isMissing(description)) return null;
      return { description };
    }
    case "phone": {
      const phone = getRowValue(row, "phone");
      if (isMissing(phone)) return null;
      return { phone };
    }
    case "email": {
      const email = getRowValue(row, "email");
      if (isMissing(email)) return null;
      return { email };
    }
    case "website": {
      const website = getRowValue(row, "website");
      if (isMissing(website)) return null;
      return { website };
    }
    case "address": {
      const address = getRowValue(row, "address");
      if (isMissing(address)) return null;
      return { address };
    }
    case "business_hours": {
      const hoursStatus = getRowValue(row, "business_hours");
      if (isMissing(hoursStatus)) return null;
      return { hoursStatus };
    }
    case "weekly_hours": {
      const weeklyHours = parseWeeklyHours(getRowValue(row, "weekly_hours"));
      if (!weeklyHours.length) return null;
      return { weeklyHours };
    }
    case "rating": {
      const googleRating = parseFloatSafe(getRowValue(row, "rating"));
      const googleReviewCount = parseIntSafe(getRowValue(row, "review_count"));
      if (googleRating == null && googleReviewCount == null) return null;
      return {
        googleRating: googleRating ?? null,
        googleReviewCount: googleReviewCount ?? null,
      };
    }
    case "top_reviews": {
      const reviews = ["top_review_1", "top_review_2", "top_review_3"]
        .map((key) => getRowValue(row, key))
        .filter((r) => !isMissing(r));
      if (!reviews.length) return null;
      return { googleReviews: reviews };
    }
    case "social": {
      const social = rowSocial(row);
      if (!Object.values(social).some(Boolean)) return null;
      return { social };
    }
    default:
      return null;
  }
}

export function mergeGalleryUpdate(
  existing: Business,
  incomingUrls: string[],
): string[] {
  const existingUrls = existing.gallery ?? [];
  const remote = incomingUrls.filter((u) => u.startsWith("http"));
  const kept = existingUrls.filter((u) => u.trim() && !u.startsWith("http"));
  const merged = [...kept, ...remote];
  return merged.slice(0, Math.max(REQUIRED_GALLERY_COUNT, merged.length));
}
