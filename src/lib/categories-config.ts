import type { Business } from "@/types/business";
import {
  CATEGORY_REGISTRY,
  HIDDEN_LEGACY_VERTICALS,
  HVAC_CATEGORY_SLUGS,
  LEGACY_HVAC_VERTICAL,
  type SubcategoryDef,
  type VerticalDef,
} from "@/lib/category-registry";

export type { SubcategoryDef, VerticalDef };
export { LEGACY_HVAC_VERTICAL, HVAC_CATEGORY_SLUGS } from "@/lib/category-registry";

export const VERTICALS: VerticalDef[] = [...CATEGORY_REGISTRY, ...HIDDEN_LEGACY_VERTICALS];

export type CategoryStat = {
  slug: string;
  label: string;
  count: number;
  href: string;
};

export type VerticalStat = CategoryStat & {
  navLabel: string;
  href: string;
};

export type PublicBusinessQuery = {
  vertical?: string;
  categorySlug?: string;
  city?: string;
  state?: string;
};

export type ListingCategoryGroup = {
  verticalSlug: string;
  verticalLabel: string;
  options: { value: string; label: string }[];
};

const CATEGORY_INDEX = new Map<string, { vertical: VerticalDef; sub: SubcategoryDef }>();

for (const vertical of VERTICALS) {
  for (const sub of vertical.subcategories) {
    CATEGORY_INDEX.set(`${vertical.slug}:${sub.slug}`, { vertical, sub });
  }
}

function getVerticalDef(slug: string): VerticalDef | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}

export function normalizeVerticalSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  if (slug === LEGACY_HVAC_VERTICAL) return "home-services";
  return slug;
}

export function getSubcategorySlugs(verticalSlug: string): Set<string> {
  const normalized = normalizeVerticalSlug(verticalSlug) ?? verticalSlug;
  const vertical = getVerticalDef(normalized);
  return new Set(vertical?.subcategories.map((s) => s.slug) ?? []);
}

export function isActiveBusiness(business: Pick<Business, "status">): boolean {
  return (business.status ?? "active") === "active";
}

export function getBusinessVertical(business: Pick<Business, "vertical" | "categorySlug">): string {
  const raw = business.vertical ?? inferVerticalFromCategorySlug(business.categorySlug);
  return normalizeVerticalSlug(raw) ?? raw;
}

export function inferVerticalFromCategorySlug(categorySlug: string): string {
  for (const vertical of VERTICALS) {
    if (vertical.subcategories.some((s) => s.slug === categorySlug)) {
      return normalizeVerticalSlug(vertical.slug) ?? vertical.slug;
    }
  }
  return "home-services";
}

export function isHvacCategorySlug(categorySlug: string): boolean {
  return HVAC_CATEGORY_SLUGS.has(categorySlug);
}

export function matchesVerticalFilter(
  business: Pick<Business, "vertical" | "categorySlug" | "status">,
  verticalSlug: string,
): boolean {
  if (!isActiveBusiness(business)) return false;

  const query = verticalSlug.trim();
  const businessVertical = getBusinessVertical(business);

  if (query === LEGACY_HVAC_VERTICAL) {
    return (
      businessVertical === "home-services" &&
      isHvacCategorySlug(business.categorySlug) &&
      getSubcategorySlugs("home-services").has(business.categorySlug)
    );
  }

  if (businessVertical !== normalizeVerticalSlug(query)) return false;
  return getSubcategorySlugs(query).has(business.categorySlug);
}

export function isValidForVertical(
  business: Pick<Business, "vertical" | "categorySlug" | "status">,
  verticalSlug: string,
): boolean {
  return matchesVerticalFilter(business, verticalSlug);
}

export function getVerticalPath(verticalSlug: string): string {
  if (verticalSlug === LEGACY_HVAC_VERTICAL || verticalSlug === "home-services") {
    return `/${LEGACY_HVAC_VERTICAL}/texas`;
  }
  return `/${verticalSlug}/texas`;
}

export function getSubcategoryPath(verticalSlug: string, categorySlug: string): string {
  return `${getVerticalPath(verticalSlug)}?category=${encodeURIComponent(categorySlug)}`;
}

export function slugifyCategoryLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function resolveCategoryKey(categoryKey: string): {
  vertical: string;
  category: string;
  categorySlug: string;
} | null {
  const trimmed = categoryKey.trim();
  const hit = CATEGORY_INDEX.get(trimmed);
  if (hit) {
    return {
      vertical: normalizeVerticalSlug(hit.vertical.slug) ?? hit.vertical.slug,
      category: hit.sub.label,
      categorySlug: hit.sub.slug,
    };
  }

  const [verticalPart, slugPart] = trimmed.split(":");
  if (!verticalPart || !slugPart) return null;

  const vertical = getVerticalDef(verticalPart);
  const sub = vertical?.subcategories.find((s) => s.slug === slugPart);
  if (!vertical || !sub) return null;

  return {
    vertical: normalizeVerticalSlug(vertical.slug) ?? vertical.slug,
    category: sub.label,
    categorySlug: sub.slug,
  };
}

export function resolveCategoryLabel(
  categoryLabel: string,
  businessName = "",
): { vertical: string; category: string; categorySlug: string } {
  const label = categoryLabel.trim();
  for (const vertical of VERTICALS) {
    const sub = vertical.subcategories.find((s) => s.label.toLowerCase() === label.toLowerCase());
    if (sub) {
      return {
        vertical: normalizeVerticalSlug(vertical.slug) ?? vertical.slug,
        category: sub.label,
        categorySlug: sub.slug,
      };
    }
  }

  const slug = slugifyCategoryLabel(label);
  const vertical = inferVerticalFromCategorySlug(slug);
  return { vertical, category: label || "HVAC Contractor", categorySlug: slug };
}

/** All categories for the listing form (grouped by vertical). */
export function getListingCategoryGroups(): ListingCategoryGroup[] {
  return CATEGORY_REGISTRY.map((vertical) => ({
    verticalSlug: vertical.slug,
    verticalLabel: vertical.label,
    options: vertical.subcategories
      .filter((sub) => !sub.legacy)
      .map((sub) => ({
        value: `${vertical.slug}:${sub.slug}`,
        label: sub.label,
      })),
  }));
}

export function getDefaultListingCategoryKey(): string {
  return "home-services:hvac";
}

export function subcategoryStatsFromBusinesses(
  businesses: Business[],
  verticalSlug: string,
): CategoryStat[] {
  const vertical = getVerticalDef(normalizeVerticalSlug(verticalSlug) ?? verticalSlug);
  if (!vertical) return [];

  const allowed = getSubcategorySlugs(verticalSlug);
  const counts = new Map<string, number>();

  for (const business of businesses) {
    if (!matchesVerticalFilter(business, verticalSlug)) continue;
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
