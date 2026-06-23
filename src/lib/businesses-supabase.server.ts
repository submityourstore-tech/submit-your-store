import type {
  AboutBlock,
  Business,
  BusinessFaq,
  SocialLinks,
  WeeklyHoursEntry,
} from "@/types/business";
import { applyBusinessMetadata, businessMetadata } from "@/lib/business-metadata";import { resolveGalleryUrls, resolveMediaUrl } from "@/lib/business-media-urls.server";

export type BusinessRow = {
  id: string;
  name: string;
  vertical: string | null;
  status: string | null;
  category: string;
  category_slug: string;
  address: string | null;
  city: string;
  state: string;
  timezone: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  google_maps_url: string | null;
  description: string;
  logo_url: string | null;
  gallery_urls: string[] | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_reviews: string[] | null;
  hours_status: string | null;
  weekly_hours: WeeklyHoursEntry[] | null;
  social: SocialLinks | null;
  about_blocks: AboutBlock[] | null;
  faqs: BusinessFaq[] | null;
  metadata: Record<string, unknown> | null;
};

export function mapRowToBusiness(row: BusinessRow): Business {
  const business: Business = {
    id: row.id,
    name: row.name,
    category: row.category,
    categorySlug: row.category_slug,
    address: row.address,
    city: row.city,
    state: row.state,
    phone: row.phone,
    email: row.email,
    website: row.website,
    googleMapsUrl: row.google_maps_url,
    social: row.social ?? {
      facebook: null,
      instagram: null,
      linkedin: null,
      youtube: null,
      twitter: null,
    },
    description: row.description,
  };

  if (row.vertical) business.vertical = row.vertical;
  if (row.status === "active" || row.status === "hidden") business.status = row.status;
  if (row.timezone) business.timezone = row.timezone;
  if (row.logo_url) business.logo = resolveMediaUrl(row.id, row.logo_url);
  if (row.gallery_urls?.length) business.gallery = resolveGalleryUrls(row.id, row.gallery_urls);
  if (row.google_rating != null) business.googleRating = row.google_rating;
  if (row.google_review_count != null) business.googleReviewCount = row.google_review_count;
  if (row.google_reviews?.length) business.googleReviews = row.google_reviews;
  if (row.hours_status) business.hoursStatus = row.hours_status;
  if (row.weekly_hours?.length) business.weeklyHours = row.weekly_hours;
  if (row.about_blocks?.length) business.aboutBlocks = row.about_blocks;
  if (row.faqs?.length) business.faqs = row.faqs;
  applyBusinessMetadata(business, row.metadata);

  return business;
}

export type BusinessUpsertRow = {
  id: string;
  name: string;
  vertical: string;
  status: "active" | "hidden";
  category: string;
  category_slug: string;
  address: string | null;
  city: string;
  state: string;
  timezone: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  google_maps_url: string | null;
  description: string;
  logo_url: string | null;
  gallery_urls: string[];
  google_rating: number | null;
  google_review_count: number | null;
  google_reviews: string[];
  hours_status: string | null;
  weekly_hours: WeeklyHoursEntry[];
  social: SocialLinks;
  about_blocks: AboutBlock[];
  faqs: BusinessFaq[];
  metadata: Record<string, unknown>;
};

export function businessToRow(business: Business, existingMetadata?: Record<string, unknown> | null): BusinessUpsertRow {
  return {
    id: business.id,
    name: business.name,
    vertical: business.vertical ?? "home-services",
    status: business.status ?? "active",
    category: business.category,
    category_slug: business.categorySlug,
    address: business.address ?? null,
    city: business.city,
    state: business.state,
    timezone: business.timezone ?? null,
    phone: business.phone,
    email: business.email ?? null,
    website: business.website ?? null,
    google_maps_url: business.googleMapsUrl ?? null,
    description: business.description,
    logo_url: business.logo ?? null,
    gallery_urls: business.gallery ?? [],
    google_rating: business.googleRating ?? null,
    google_review_count: business.googleReviewCount ?? null,
    google_reviews: business.googleReviews ?? [],
    hours_status: business.hoursStatus ?? null,
    weekly_hours: business.weeklyHours ?? [],
    social: business.social,
    about_blocks: business.aboutBlocks ?? [],
    faqs: business.faqs ?? [],
    metadata: businessMetadata(existingMetadata, business),
  };
}
