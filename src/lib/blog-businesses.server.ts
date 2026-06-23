import { unstable_cache } from "next/cache";
import { matchesVerticalFilter } from "@/lib/categories-config";
import { mapRowToBusiness, type BusinessRow } from "@/lib/businesses-supabase.server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { Business } from "@/types/business";

async function fetchBlogCityBusinesses(city: string, state: string): Promise<Business[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "active")
    .ilike("city", city.trim())
    .eq("state", state.trim().toUpperCase())
    .order("name");

  if (error) {
    throw new Error(`Blog city businesses fetch failed: ${error.message}`);
  }

  return ((data ?? []) as BusinessRow[])
    .map(mapRowToBusiness)
    .filter((b) => matchesVerticalFilter(b, "home-services"));
}

/** Targeted Supabase query — avoids loading all 150 listings on every blog page. */
export function getBlogCityBusinesses(city: string, state = "TX"): Promise<Business[]> {
  const key = `${city.trim().toLowerCase()}|${state.trim().toUpperCase()}`;
  return unstable_cache(() => fetchBlogCityBusinesses(city, state), ["blog-city-businesses", key], {
    revalidate: 300,
    tags: ["businesses", `blog-city-${key}`],
  })();
}
