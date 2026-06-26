import {
  formatLocationLabel,
  resolveBusinessCityState,
  toLocationSlug,
} from "@/lib/location-utils";
import type { Business } from "@/types/business";

export type CityGroup = {
  city: string;
  state: string;
  label: string;
  slug: string;
  businesses: Business[];
};

export type SortOption = "name-asc" | "name-desc" | "category" | "top-rated";

export type FilterOption = "all" | "top-rated" | "rated" | "quick-response";

export type ReviewSummaryMap = Record<string, { average: number; count: number }>;

export function matchesQuery(business: Business, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    business.name,
    business.category,
    business.description,
    business.address ?? "",
    business.city,
    business.state,
    business.phone,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function matchesFilter(
  business: Business,
  filter: FilterOption,
  reviews: ReviewSummaryMap,
): boolean {
  const summary = reviews[business.id];
  switch (filter) {
    case "top-rated":
      return summary !== undefined && summary.average >= 4;
    case "rated":
      return summary !== undefined;
    case "quick-response":
      return Boolean(business.email);
    default:
      return true;
  }
}

export function sortBusinesses(
  list: Business[],
  sort: SortOption,
  reviews: ReviewSummaryMap,
): Business[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (sort) {
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "category":
        return (
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        );
      case "top-rated": {
        const ra = reviews[a.id]?.average ?? -1;
        const rb = reviews[b.id]?.average ?? -1;
        if (rb !== ra) return rb - ra;
        return a.name.localeCompare(b.name);
      }
      case "name-asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });
  return sorted;
}

export function filterBusinesses(
  businesses: Business[],
  options: {
    query: string;
    sort: SortOption;
    filter: FilterOption;
    category?: string;
    categorySlug?: string;
  },
  reviews: ReviewSummaryMap,
): Business[] {
  let list = businesses.filter(
    (b) =>
      matchesQuery(b, options.query) &&
      matchesFilter(b, options.filter, reviews) &&
      (!options.categorySlug || b.categorySlug === options.categorySlug) &&
      (!options.category || b.category === options.category),
  );
  return sortBusinesses(list, options.sort, reviews);
}

export const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  category: "Category",
  "top-rated": "Top Rated",
};

export const FILTER_LABELS: Record<FilterOption, string> = {
  all: "All",
  "top-rated": "Top Rated",
  rated: "Ratings",
  "quick-response": "Quick Response",
};

export function getCategoryOptions(businesses: Business[]): string[] {
  return [...new Set(businesses.map((b) => b.category))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function groupBusinessesByCity(businesses: Business[]): CityGroup[] {
  const map = new Map<string, CityGroup>();

  for (const b of businesses) {
    const { city, state } = resolveBusinessCityState(b);
    const key = `${city}|${state}`;
    const existing = map.get(key);
    if (existing) {
      existing.businesses.push(b);
    } else {
      map.set(key, {
        city,
        state,
        label: formatLocationLabel(city, state),
        slug: toLocationSlug(city, state),
        businesses: [b],
      });
    }
  }

  return [...map.values()].sort(
    (a, b) =>
      b.businesses.length - a.businesses.length || a.city.localeCompare(b.city),
  );
}
