import { readBusinesses } from "@/lib/businesses-data";
import type { Business } from "@/types/business";
import type { PublicBusinessQuery } from "@/lib/categories-config";
import { getActiveSubcategoryStats, getPublicBusinesses } from "@/lib/categories.server";

export async function getAllBusinesses(): Promise<Business[]> {
  return readBusinesses();
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  const businesses = await readBusinesses();
  return businesses.find((b) => b.id === id);
}

export async function getPublicBusinessList(query: PublicBusinessQuery = {}) {
  return getPublicBusinesses(query);
}

export async function getBusinessesByVertical(vertical: string): Promise<Business[]> {
  return getPublicBusinesses({ vertical });
}

export async function getBusinessesByCategorySlug(slug: string, vertical = "hvac"): Promise<Business[]> {
  return getPublicBusinesses({ vertical, categorySlug: slug });
}

/** @deprecated Use getActiveSubcategoryStats from @/lib/categories */
export async function getCategoryStats(vertical = "hvac") {
  const stats = await getActiveSubcategoryStats(vertical);
  return stats.map(({ slug, label, count }) => ({
    slug,
    label,
    count,
  }));
}

export async function getFeaturedBusinesses(limit = 6, vertical = "hvac"): Promise<Business[]> {
  return (await getPublicBusinesses({ vertical }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function getPublicBusinessCount(vertical?: string): Promise<number> {
  return (await getPublicBusinesses(vertical ? { vertical } : {})).length;
}
