/**
 * Import data/businesses.json → Supabase public.businesses
 * Uses Cloudinary URLs from data/cloudinary-media-map.json when available.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY
 * Optional: run apply-supabase-migration.mjs first (or apply SQL in dashboard)
 *
 * Usage: node scripts/import-businesses-to-supabase.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const JSON_PATH = path.join(process.cwd(), "data", "businesses.json");
const MAP_PATH = path.join(process.cwd(), "data", "cloudinary-media-map.json");

function toRow(business, mediaMap) {
  const media = mediaMap[business.id] ?? {};
  const logo = media.logo ?? business.logo ?? null;
  const gallery =
    media.gallery?.length > 0
      ? media.gallery
      : Array.isArray(business.gallery)
        ? business.gallery
        : [];

  return {
    id: business.id,
    name: business.name,
    vertical: business.vertical ?? "home-services",
    status: business.status ?? "active",
    category: business.category,
    category_slug: business.categorySlug,
    address: business.address ?? null,
    city: business.city,
    state: business.state ?? "TX",
    timezone: business.timezone ?? null,
    phone: business.phone,
    email: business.email ?? null,
    website: business.website ?? null,
    google_maps_url: business.googleMapsUrl ?? null,
    description: business.description,
    logo_url: logo,
    gallery_urls: gallery,
    google_rating: business.googleRating ?? null,
    google_review_count: business.googleReviewCount ?? null,
    google_reviews: business.googleReviews ?? [],
    hours_status: business.hoursStatus ?? null,
    weekly_hours: business.weeklyHours ?? [],
    social: business.social ?? {},
    about_blocks: business.aboutBlocks ?? [],
    faqs: business.faqs ?? [],
    metadata: { imported_from: "businesses.json", import_version: 1 },
  };
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const businesses = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  let mediaMap = {};
  if (existsSync(MAP_PATH)) {
    mediaMap = JSON.parse(readFileSync(MAP_PATH, "utf8"));
  }

  const rows = businesses.map((b) => toRow(b, mediaMap));
  const batchSize = 25;
  let imported = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("businesses").upsert(batch, { onConflict: "id" });
    if (error) {
      throw new Error(`Batch ${i / batchSize + 1} failed: ${error.message}`);
    }
    imported += batch.length;
    console.log(`Imported ${imported}/${rows.length}`);
  }

  const { count, error: countErr } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });
  if (countErr) throw new Error(countErr.message);

  console.log(`Done. ${imported} rows upserted. Table count: ${count}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
