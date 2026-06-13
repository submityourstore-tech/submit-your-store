import { writeFileSync, cpSync, existsSync, readdirSync } from "fs";
import path from "path";
import { VERTICALS, slugifyCategoryLabel } from "@/lib/categories-config";
import { readBusinesses } from "@/lib/businesses-data";
import { businessMediaDir, pendingMediaDir } from "@/lib/listing-media";
import type { Business, SocialLinks } from "@/types/business";
import type { NewListingPayload } from "@/types/listing";

const JSON_PATH = path.join(process.cwd(), "data", "businesses.json");

const HVAC_NAME = /hvac|air(?:\s|-)?condition|heating|cooling|a\/c|\bac\b|furnace/i;
const PLUMBING_NAME = /plumb/i;

function slugifyName(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueBusinessId(name: string, used: Set<string>): string {
  const base = slugifyName(name) || "business";
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  const id = `${base}-${n}`;
  used.add(id);
  return id;
}

function normalizeWebsite(raw?: string): string | null {
  const url = raw?.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw.trim();
}

function resolveCategory(name: string, categoryLabel?: string) {
  const hvac = VERTICALS.find((v) => v.slug === "hvac");
  const label = categoryLabel?.trim() || "HVAC Contractor";
  let categorySlug =
    hvac?.subcategories.find((s) => s.label.toLowerCase() === label.toLowerCase())?.slug ??
    slugifyCategoryLabel(label);

  if (PLUMBING_NAME.test(name) && HVAC_NAME.test(name)) {
    categorySlug = "plumbing-hvac";
  }

  const allowed = new Set(hvac?.subcategories.map((s) => s.slug) ?? []);
  if (!allowed.has(categorySlug)) {
    categorySlug = "hvac-contractor";
  }

  const category =
    hvac?.subcategories.find((s) => s.slug === categorySlug)?.label ?? "HVAC Contractor";

  return { vertical: "hvac" as const, category, categorySlug };
}

function defaultSocial(social?: SocialLinks): SocialLinks {
  return {
    facebook: social?.facebook ?? null,
    instagram: social?.instagram ?? null,
    linkedin: social?.linkedin ?? null,
    youtube: social?.youtube ?? null,
    twitter: social?.twitter ?? null,
  };
}

function buildDescription(payload: NewListingPayload, category: string): string {
  const custom = payload.description?.trim();
  if (custom && custom.length >= 120) return custom;

  const city = payload.city?.trim() || "Dallas";
  const state = payload.state?.trim() || "TX";
  return `${payload.businessName} is a ${category.toLowerCase()} based in ${city}, ${state}. The business provides trusted local services for homeowners and commercial clients. Contact ${payload.businessName} for estimates, service calls, and seasonal maintenance. Call ${normalizePhone(payload.phone)} or visit the listing page for hours, service area details, and more information about available services in ${city}, ${state}.`;
}

function copyPendingMedia(sessionId: string | undefined, businessId: string): { logo?: string; gallery: string[] } {
  if (!sessionId) return { gallery: [] };

  const fromDir = pendingMediaDir(sessionId);
  const toDir = businessMediaDir(businessId);
  if (!existsSync(fromDir)) return { gallery: [] };

  cpSync(fromDir, toDir, { recursive: true, force: true });

  const prefix = `/businesses/${businessId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const logoPath = path.join(toDir, "logo.webp");
  const logo = existsSync(logoPath) ? `${prefix}/logo.webp` : undefined;
  const gallery = readdirSync(toDir)
    .filter((f) => f.startsWith("gallery-") && f.endsWith(".webp"))
    .sort()
    .map((f) => `${prefix}/${f}`);

  return { logo, gallery };
}

export function appendBusiness(business: Business): Business {
  const rows = readBusinesses();
  rows.push(business);
  writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2), "utf-8");
  return business;
}

export function publishNewListing(payload: NewListingPayload): Business {
  const rows = readBusinesses();
  const usedIds = new Set(rows.map((b) => b.id));
  const id = uniqueBusinessId(payload.businessName, usedIds);
  const { vertical, category, categorySlug } = resolveCategory(payload.businessName, payload.category);

  const moved = copyPendingMedia(payload.uploadSessionId, id);
  const logo = payload.logo?.trim() || moved.logo;
  const gallery =
    payload.gallery && payload.gallery.length > 0
      ? payload.gallery.map((url) =>
          url.includes("/uploads/pending/")
            ? url.replace(/\/uploads\/pending\/[^/]+/, `/businesses/${id}`)
            : url,
        )
      : moved.gallery;

  const business: Business = {
    id,
    name: payload.businessName.trim(),
    vertical,
    status: "active",
    category,
    categorySlug,
    address: payload.address.trim() || null,
    city: payload.city?.trim() || "Dallas",
    state: payload.state?.trim() || "TX",
    website: normalizeWebsite(payload.website),
    email: payload.businessEmail.trim().toLowerCase(),
    phone: normalizePhone(payload.phone),
    googleMapsUrl: payload.gbpUrl.trim(),
    social: defaultSocial(payload.social),
    description: buildDescription(payload, category),
  };

  if (logo) business.logo = logo;
  if (gallery.length > 0) business.gallery = gallery;

  return appendBusiness(business);
}

export function updateBusiness(id: string, patch: Partial<Business>): Business | null {
  const rows = readBusinesses();
  const index = rows.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const merged: Business = { ...rows[index]!, id };
  for (const [key, value] of Object.entries(patch) as [keyof Business, Business[keyof Business]][]) {
    if (value === undefined) {
      delete (merged as Record<string, unknown>)[key as string];
    } else {
      (merged as Record<string, unknown>)[key as string] = value;
    }
  }

  rows[index] = merged;
  writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2), "utf-8");
  return merged;
}
