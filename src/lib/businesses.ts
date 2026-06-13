import { readBusinesses } from "@/lib/businesses-data";
import type { Business } from "@/types/business";
import type { PublicBusinessQuery } from "@/lib/categories-config";
import {
  getActiveSubcategoryStats,
  getPublicBusinesses,
} from "@/lib/categories.server";

export function getAllBusinesses(): Business[] {
  return readBusinesses();
}

export function getBusinessById(id: string): Business | undefined {
  return readBusinesses().find((b) => b.id === id);
}

export function getPublicBusinessList(query: PublicBusinessQuery = {}) {
  return getPublicBusinesses(query);
}

export function getBusinessesByVertical(vertical: string): Business[] {
  return getPublicBusinesses({ vertical });
}

export function getBusinessesByCategorySlug(slug: string, vertical = "hvac"): Business[] {
  return getPublicBusinesses({ vertical, categorySlug: slug });
}

/** @deprecated Use getActiveSubcategoryStats from @/lib/categories */
export function getCategoryStats(vertical = "hvac") {
  return getActiveSubcategoryStats(vertical).map(({ slug, label, count }) => ({
    slug,
    label,
    count,
  }));
}

export function getFeaturedBusinesses(limit = 6, vertical = "hvac"): Business[] {
  return getPublicBusinesses({ vertical })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getPublicBusinessCount(vertical?: string): number {
  return getPublicBusinesses(vertical ? { vertical } : {}).length;
}
