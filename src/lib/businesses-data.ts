import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { mapRowToBusiness, type BusinessRow } from "@/lib/businesses-supabase.server";
import type { Business } from "@/types/business";

async function fetchBusinessesFromSupabase(): Promise<Business[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from("businesses").select("*").order("name");

  if (error) {
    throw new Error(`Failed to fetch businesses from Supabase: ${error.message}`);
  }

  return ((data ?? []) as BusinessRow[]).map(mapRowToBusiness);
}

const getCachedBusinesses = unstable_cache(fetchBusinessesFromSupabase, ["businesses-all"], {
  revalidate: 300,
  tags: ["businesses"],
});

/** Server-only: loads all listings from Supabase (cached, no JSON/Blob reads). */
export const readBusinesses = cache(async (): Promise<Business[]> => {
  return getCachedBusinesses();
});
