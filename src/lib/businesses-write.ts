import { revalidateTag } from "next/cache";
import { resolveCategoryKey, resolveCategoryLabel } from "@/lib/categories-config";
import { readBusinesses } from "@/lib/businesses-data";
import { businessToRow } from "@/lib/businesses-supabase.server";
import { DuplicateGbpError, findDuplicateGbpListing } from "@/lib/gbp";
import { resolveListingMediaUrls } from "@/lib/listing-media-cloudinary.server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { Business, ClaimStatus, SocialLinks } from "@/types/business";
import type { NewListingPayload } from "@/types/listing";

function slugifyName(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueBusinessId(name: string, used: Set<string>, city?: string, state?: string): string {
  const base = slugifyName(name) || "business";
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  if (city) {
    const withCity = `${base}-${slugifyName(city)}`;
    if (!used.has(withCity)) {
      used.add(withCity);
      return withCity;
    }
    if (state) {
      const withCityState = `${base}-${slugifyName(city)}-${slugifyName(state)}`;
      if (!used.has(withCityState)) {
        used.add(withCityState);
        return withCityState;
      }
    }
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

function resolveCategory(payload: NewListingPayload) {
  if (payload.categoryKey) {
    const resolved = resolveCategoryKey(payload.categoryKey);
    if (resolved) return resolved;
  }

  if (payload.category?.includes(":")) {
    const resolved = resolveCategoryKey(payload.category);
    if (resolved) return resolved;
  }

  return resolveCategoryLabel(payload.category ?? "", payload.businessName);
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

async function persistBusiness(business: Business): Promise<Business> {
  const supabase = createSupabaseAdmin();
  const { data: existingRow } = await supabase
    .from("businesses")
    .select("metadata")
    .eq("id", business.id)
    .maybeSingle();

  const row = businessToRow(
    business,
    (existingRow?.metadata as Record<string, unknown> | null) ?? null,
  );

  const { error } = await supabase.from("businesses").upsert(row, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to save business to Supabase: ${error.message}`);
  }

  revalidateTag("businesses");
  return business;
}

export async function appendBusiness(business: Business): Promise<Business> {
  return persistBusiness(business);
}

export async function publishNewListing(payload: NewListingPayload): Promise<Business> {
  const rows = await readBusinesses();
  const usedIds = new Set(rows.map((b) => b.id));
  const id = uniqueBusinessId(payload.businessName, usedIds, payload.city, payload.state);
  const { vertical, category, categorySlug } = resolveCategory(payload);

  const media = await resolveListingMediaUrls(
    id,
    payload.uploadSessionId,
    payload.logo,
    payload.gallery,
  );

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
    description: payload.description?.trim() || buildDescription(payload, category),
    claimStatus: "unclaimed",
  };

  if (media.logo) business.logo = media.logo;
  if (media.gallery.length > 0) business.gallery = media.gallery;

  return appendBusiness(business);
}

export async function updateBusiness(id: string, patch: Partial<Business>): Promise<Business | null> {
  const existing = (await readBusinesses()).find((b) => b.id === id);
  if (!existing) return null;

  const merged: Business = { ...existing, id };
  for (const [key, value] of Object.entries(patch) as [keyof Business, Business[keyof Business]][]) {
    if (value === undefined) {
      delete (merged as Record<string, unknown>)[key as string];
    } else {
      (merged as Record<string, unknown>)[key as string] = value;
    }
  }

  return persistBusiness(merged);
}

export type AdminBusinessInput = {
  businessName: string;
  gbpUrl?: string;
  category?: string;
  categoryKey?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleReviews?: string[];
  hoursStatus?: string;
  weeklyHours?: import("@/types/business").WeeklyHoursEntry[];
  social?: SocialLinks;
  logoUrl?: string;
  galleryUrls?: string[];
  claimStatus?: ClaimStatus;
};

export async function publishAdminBusiness(input: AdminBusinessInput): Promise<Business> {
  const rows = await readBusinesses();

  const duplicate = findDuplicateGbpListing(input.gbpUrl, rows);
  if (duplicate) {
    throw new DuplicateGbpError(duplicate.gbpUrl, duplicate.existing);
  }

  const city = input.city?.trim() || "Dallas";
  const state = input.state?.trim() || "TX";

  const usedIds = new Set(rows.map((b) => b.id));
  const id = uniqueBusinessId(input.businessName, usedIds, city, state);

  const { vertical, category, categorySlug } = resolveCategory({
    businessName: input.businessName,
    categoryKey: input.categoryKey ?? "home-services:hvac",
    category: input.category,
    gbpUrl: input.gbpUrl ?? "",
    businessEmail: input.email ?? "admin@submityourstore.com",
    phone: input.phone ?? "0000000000",
    address: input.address ?? "",
  } as NewListingPayload);

  const { uploadBusinessMediaFromUrls } = await import("@/lib/remote-media.server");
  const media = await uploadBusinessMediaFromUrls(id, input.logoUrl, input.galleryUrls ?? []);
  const phoneRaw = input.phone?.trim() || "(000) 000-0000";

  const business: Business = {
    id,
    name: input.businessName.trim(),
    vertical,
    status: "active",
    category,
    categorySlug,
    address: input.address?.trim() || null,
    city,
    state,
    website: normalizeWebsite(input.website),
    email: input.email?.trim().toLowerCase() || null,
    phone: normalizePhone(phoneRaw),
    googleMapsUrl: input.gbpUrl?.trim() || null,
    social: defaultSocial(input.social),
    description:
      input.description?.trim() ||
      `${input.businessName.trim()} is a ${category.toLowerCase()} serving ${city}, ${state}.`,
    claimStatus: input.claimStatus ?? "verified",
  };

  if (input.googleRating != null) business.googleRating = input.googleRating;
  if (input.googleReviewCount != null) business.googleReviewCount = input.googleReviewCount;
  if (input.googleReviews?.length) business.googleReviews = input.googleReviews;
  if (input.hoursStatus) business.hoursStatus = input.hoursStatus;
  if (input.weeklyHours?.length) business.weeklyHours = input.weeklyHours;
  if (media.logo) business.logo = media.logo;
  if (media.gallery.length > 0) business.gallery = media.gallery;

  return appendBusiness(business);
}

export type AdminBusinessUpdateInput = {
  name?: string;
  status?: "active" | "hidden";
  categoryKey?: string;
  category?: string;
  gbpUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  googleReviews?: string[];
  hoursStatus?: string;
  weeklyHours?: import("@/types/business").WeeklyHoursEntry[];
  social?: SocialLinks;
  logoUrl?: string;
  galleryUrls?: string[];
  aboutBlocks?: import("@/types/business").AboutBlock[];
  faqs?: import("@/types/business").BusinessFaq[];
  foundedYear?: number | null;
  foundedYearConfidence?: string | null;
  claimStatus?: ClaimStatus;
};

export async function updateAdminBusiness(
  id: string,
  input: AdminBusinessUpdateInput,
): Promise<Business> {
  const rows = await readBusinesses();
  const existing = rows.find((b) => b.id === id);
  if (!existing) {
    throw new Error("Business not found.");
  }

  if (input.gbpUrl?.trim()) {
    const duplicate = findDuplicateGbpListing(
      input.gbpUrl,
      rows.filter((b) => b.id !== id),
    );
    if (duplicate) {
      throw new DuplicateGbpError(duplicate.gbpUrl, duplicate.existing);
    }
  }

  const patch: Partial<Business> = {};

  if (input.name?.trim()) patch.name = input.name.trim();
  if (input.status) patch.status = input.status;
  if (input.city?.trim()) patch.city = input.city.trim();
  if (input.state?.trim()) patch.state = input.state.trim();
  if (input.address !== undefined) patch.address = input.address?.trim() || null;
  if (input.website !== undefined) patch.website = normalizeWebsite(input.website ?? undefined);
  if (input.email !== undefined) patch.email = input.email?.trim().toLowerCase() || null;
  if (input.phone?.trim()) patch.phone = normalizePhone(input.phone);
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.gbpUrl !== undefined) patch.googleMapsUrl = input.gbpUrl?.trim() || null;
  if (input.social) patch.social = defaultSocial(input.social);
  if (input.googleRating !== undefined) {
    patch.googleRating = input.googleRating ?? undefined;
  }
  if (input.googleReviewCount !== undefined) {
    patch.googleReviewCount = input.googleReviewCount ?? undefined;
  }
  if (input.googleReviews !== undefined) patch.googleReviews = input.googleReviews;
  if (input.hoursStatus !== undefined) patch.hoursStatus = input.hoursStatus || undefined;
  if (input.weeklyHours !== undefined) {
    patch.weeklyHours = input.weeklyHours.length ? input.weeklyHours : undefined;
  }
  if (input.aboutBlocks !== undefined) {
    patch.aboutBlocks = input.aboutBlocks.length ? input.aboutBlocks : undefined;
  }
  if (input.faqs !== undefined) {
    patch.faqs = input.faqs.length ? input.faqs : undefined;
  }
  if (input.foundedYear !== undefined) {
    patch.foundedYear = input.foundedYear ?? undefined;
  }
  if (input.foundedYearConfidence !== undefined) {
    patch.foundedYearConfidence = input.foundedYearConfidence?.trim() || undefined;
  }
  if (input.claimStatus) patch.claimStatus = input.claimStatus;

  if (input.categoryKey || input.category) {
    const resolved = resolveCategory({
      businessName: input.name ?? existing.name,
      categoryKey: input.categoryKey ?? "home-services:hvac",
      category: input.category,
      gbpUrl: input.gbpUrl ?? existing.googleMapsUrl ?? "",
      businessEmail: input.email ?? existing.email ?? "admin@submityourstore.com",
      phone: input.phone ?? existing.phone,
      address: input.address ?? existing.address ?? "",
    } as NewListingPayload);
    patch.vertical = resolved.vertical;
    patch.category = resolved.category;
    patch.categorySlug = resolved.categorySlug;
  }

  const remoteLogo = input.logoUrl?.trim().startsWith("http") ? input.logoUrl.trim() : null;
  const remoteGallery = (input.galleryUrls ?? []).filter((u) => u.trim().startsWith("http"));

  if (remoteLogo || remoteGallery.length > 0) {
    const { uploadBusinessMediaFromUrls } = await import("@/lib/remote-media.server");
    const media = await uploadBusinessMediaFromUrls(id, remoteLogo, remoteGallery);
    if (media.logo) patch.logo = media.logo;
    if (media.gallery.length > 0) {
      const kept = (input.galleryUrls ?? []).filter((u) => u.trim() && !u.trim().startsWith("http"));
      patch.gallery = [...kept, ...media.gallery];
    }
  } else {
    if (input.logoUrl !== undefined) patch.logo = input.logoUrl.trim() || undefined;
    if (input.galleryUrls !== undefined) {
      patch.gallery = input.galleryUrls.map((u) => u.trim()).filter(Boolean);
    }
  }

  const updated = await updateBusiness(id, patch);
  if (!updated) throw new Error("Business not found.");
  return updated;
}

export async function deleteAdminBusiness(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete business: ${error.message}`);
  revalidateTag("businesses");
}
