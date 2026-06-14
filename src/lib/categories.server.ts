import { readBusinesses } from "@/lib/businesses-data";
import type { Business } from "@/types/business";
import { CATEGORY_REGISTRY } from "@/lib/category-registry";
import {
  LEGACY_HVAC_VERTICAL,
  getBusinessVertical,
  getSubcategoryPath,
  getSubcategorySlugs,
  getVerticalPath,
  isActiveBusiness,
  isHvacCategorySlug,
  matchesVerticalFilter,
  type CategoryStat,
  type PublicBusinessQuery,
  type VerticalStat,
} from "@/lib/categories-config";

function allBusinesses(): Business[] {
  return readBusinesses();
}

export function matchesPublicQuery(business: Business, query: PublicBusinessQuery): boolean {
  if (!isActiveBusiness(business)) return false;
  if (query.vertical && !matchesVerticalFilter(business, query.vertical)) return false;
  if (query.categorySlug && business.categorySlug !== query.categorySlug) return false;
  if (query.city && business.city !== query.city) return false;
  if (query.state && business.state !== query.state) return false;
  return true;
}

export function getPublicBusinesses(query: PublicBusinessQuery = {}): Business[] {
  return allBusinesses().filter((business) => matchesPublicQuery(business, query));
}

function verticalNavLabel(verticalSlug: string, businesses: Business[]): string {
  const vertical = CATEGORY_REGISTRY.find((v) => v.slug === verticalSlug);
  if (!vertical) return verticalSlug;

  if (verticalSlug !== "home-services") return vertical.navLabel;

  const homeListings = businesses.filter((b) => matchesVerticalFilter(b, verticalSlug));
  if (homeListings.length === 0) return vertical.navLabel;

  const hvacOnly = homeListings.every((b) => isHvacCategorySlug(b.categorySlug));
  return hvacOnly ? "HVAC Texas" : vertical.navLabel;
}

export function getActiveVerticalStats(): VerticalStat[] {
  const businesses = allBusinesses().filter(isActiveBusiness);
  const stats: VerticalStat[] = [];

  for (const vertical of CATEGORY_REGISTRY) {
    const count = businesses.filter((b) => matchesVerticalFilter(b, vertical.slug)).length;
    if (count === 0) continue;

    const navSlug = vertical.slug === "home-services" && verticalNavLabel(vertical.slug, businesses) === "HVAC Texas"
      ? LEGACY_HVAC_VERTICAL
      : vertical.slug;

    stats.push({
      slug: navSlug,
      label: vertical.label,
      navLabel: verticalNavLabel(vertical.slug, businesses),
      count,
      href: getVerticalPath(navSlug),
    });
  }

  return stats.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getActiveSubcategoryStats(verticalSlug: string): CategoryStat[] {
  const registryVertical =
    verticalSlug === LEGACY_HVAC_VERTICAL
      ? CATEGORY_REGISTRY.find((v) => v.slug === "home-services")
      : CATEGORY_REGISTRY.find((v) => v.slug === verticalSlug);

  if (!registryVertical) return [];

  const counts = new Map<string, number>();

  for (const business of allBusinesses()) {
    if (!matchesVerticalFilter(business, verticalSlug)) continue;
    if (!getSubcategorySlugs(registryVertical.slug).has(business.categorySlug)) continue;
    counts.set(business.categorySlug, (counts.get(business.categorySlug) ?? 0) + 1);
  }

  return registryVertical.subcategories
    .filter((sub) => (counts.get(sub.slug) ?? 0) > 0)
    .map((sub) => ({
      slug: sub.slug,
      label: sub.label,
      count: counts.get(sub.slug) ?? 0,
      href: getSubcategoryPath(verticalSlug, sub.slug),
    }));
}

export function getActiveSearchTags(limit = 6): CategoryStat[] {
  const activeVerticals = getActiveVerticalStats();
  const tags: CategoryStat[] = [];

  for (const verticalStat of activeVerticals) {
    const registrySlug =
      verticalStat.slug === LEGACY_HVAC_VERTICAL ? "home-services" : verticalStat.slug;
    const vertical = CATEGORY_REGISTRY.find((v) => v.slug === registrySlug);
    if (!vertical) continue;
    for (const tag of vertical.searchTags) {
      tags.push({
        slug: verticalStat.slug,
        label: tag,
        count: verticalStat.count,
        href: getVerticalPath(verticalStat.slug),
      });
    }
  }

  return tags.slice(0, limit);
}

/** @deprecated Prefer matchesVerticalFilter via getPublicBusinesses */
export function isValidForVertical(
  business: Pick<Business, "vertical" | "categorySlug" | "status">,
  verticalSlug: string,
): boolean {
  return matchesVerticalFilter(business, verticalSlug);
}

/** @deprecated Prefer getBusinessVertical from categories-config */
export { getBusinessVertical };
