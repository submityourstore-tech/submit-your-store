import type { Business } from "@/types/business";

export type SubcategoryDef = {
  slug: string;
  label: string;
};

export type VerticalDef = {
  slug: string;
  label: string;
  navLabel: string;
  searchTags: string[];
  subcategories: SubcategoryDef[];
};

export const VERTICALS: VerticalDef[] = [
  {
    slug: "hvac",
    label: "HVAC",
    navLabel: "HVAC Texas",
    searchTags: ["HVAC Contractors", "AC Repair", "Heating"],
    subcategories: [
      { slug: "hvac-contractor", label: "HVAC Contractor" },
      { slug: "heating-contractor", label: "Heating Contractor" },
      { slug: "ac-repair", label: "AC Repair" },
      { slug: "ac-contractor", label: "AC Contractor" },
      { slug: "plumbing-hvac", label: "Plumbing & HVAC" },
      { slug: "air-duct-cleaning", label: "Air Duct Cleaning" },
      { slug: "hvac-parts-supplier", label: "HVAC Parts Supplier" },
      { slug: "insulation-contractor", label: "Insulation Contractor" },
    ],
  },
  {
    slug: "plumbers",
    label: "Plumbers",
    navLabel: "Plumbers Texas",
    searchTags: ["Plumbers", "Drain Cleaning", "Water Heaters"],
    subcategories: [
      { slug: "plumber", label: "Plumber" },
      { slug: "drain-cleaning", label: "Drain Cleaning" },
      { slug: "water-heater", label: "Water Heater Repair" },
    ],
  },
  {
    slug: "electricians",
    label: "Electricians",
    navLabel: "Electricians Texas",
    searchTags: ["Electricians", "Electrical Repair", "Panel Upgrade"],
    subcategories: [
      { slug: "electrician", label: "Electrician" },
      { slug: "electrical-repair", label: "Electrical Repair" },
    ],
  },
];

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

function getVerticalDef(slug: string): VerticalDef | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}

export function getSubcategorySlugs(verticalSlug: string): Set<string> {
  const vertical = getVerticalDef(verticalSlug);
  return new Set(vertical?.subcategories.map((s) => s.slug) ?? []);
}

export function isActiveBusiness(business: Pick<Business, "status">): boolean {
  return (business.status ?? "active") === "active";
}

export function getBusinessVertical(business: Pick<Business, "vertical" | "categorySlug">): string {
  return business.vertical ?? inferVerticalFromCategorySlug(business.categorySlug);
}

export function inferVerticalFromCategorySlug(categorySlug: string): string {
  for (const vertical of VERTICALS) {
    if (vertical.subcategories.some((s) => s.slug === categorySlug)) {
      return vertical.slug;
    }
  }
  return "hvac";
}

export function isValidForVertical(
  business: Pick<Business, "vertical" | "categorySlug" | "status">,
  verticalSlug: string,
): boolean {
  if (!isActiveBusiness(business)) return false;
  if (getBusinessVertical(business) !== verticalSlug) return false;
  return getSubcategorySlugs(verticalSlug).has(business.categorySlug);
}

export function getVerticalPath(verticalSlug: string): string {
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

export function subcategoryStatsFromBusinesses(
  businesses: Business[],
  verticalSlug: string,
): CategoryStat[] {
  const vertical = getVerticalDef(verticalSlug);
  if (!vertical) return [];

  const allowed = getSubcategorySlugs(verticalSlug);
  const counts = new Map<string, number>();

  for (const business of businesses) {
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
