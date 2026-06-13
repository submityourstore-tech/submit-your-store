import { readBusinesses } from "@/lib/businesses-data";
import type { Business } from "@/types/business";
import {
  VERTICALS,
  getBusinessVertical,
  getSubcategoryPath,
  getSubcategorySlugs,
  getVerticalPath,
  isActiveBusiness,
  isValidForVertical,
  type CategoryStat,
  type PublicBusinessQuery,
  type VerticalStat,
} from "@/lib/categories-config";

function allBusinesses(): Business[] {
  return readBusinesses();
}

export function matchesPublicQuery(business: Business, query: PublicBusinessQuery): boolean {
  if (!isActiveBusiness(business)) return false;
  if (query.vertical && !isValidForVertical(business, query.vertical)) return false;
  if (query.categorySlug && business.categorySlug !== query.categorySlug) return false;
  if (query.city && business.city !== query.city) return false;
  if (query.state && business.state !== query.state) return false;
  return true;
}

export function getPublicBusinesses(query: PublicBusinessQuery = {}): Business[] {
  return allBusinesses().filter((business) => matchesPublicQuery(business, query));
}

export function getActiveVerticalStats(): VerticalStat[] {
  const counts = new Map<string, number>();

  for (const business of allBusinesses()) {
    if (!isActiveBusiness(business)) continue;
    const vertical = getBusinessVertical(business);
    if (!isValidForVertical(business, vertical)) continue;
    counts.set(vertical, (counts.get(vertical) ?? 0) + 1);
  }

  return VERTICALS.filter((vertical) => (counts.get(vertical.slug) ?? 0) > 0)
    .map((vertical) => ({
      slug: vertical.slug,
      label: vertical.label,
      navLabel: vertical.navLabel,
      count: counts.get(vertical.slug) ?? 0,
      href: getVerticalPath(vertical.slug),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getActiveSubcategoryStats(verticalSlug: string): CategoryStat[] {
  const vertical = VERTICALS.find((v) => v.slug === verticalSlug);
  if (!vertical) return [];

  const counts = new Map<string, number>();
  const allowed = getSubcategorySlugs(verticalSlug);

  for (const business of allBusinesses()) {
    if (!isValidForVertical(business, verticalSlug)) continue;
    if (!allowed.has(business.categorySlug)) continue;
    counts.set(business.categorySlug, (counts.get(business.categorySlug) ?? 0) + 1);
  }

  return vertical.subcategories
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
    const vertical = VERTICALS.find((v) => v.slug === verticalStat.slug);
    if (!vertical) continue;
    for (const tag of vertical.searchTags) {
      tags.push({
        slug: vertical.slug,
        label: tag,
        count: verticalStat.count,
        href: getVerticalPath(vertical.slug),
      });
    }
  }

  return tags.slice(0, limit);
}
