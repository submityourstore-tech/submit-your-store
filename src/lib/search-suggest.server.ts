import { getPublicBusinesses } from "@/lib/categories.server";
import { formatLocationLabel, resolveBusinessCityState } from "@/lib/location-utils";
import { matchesQuery } from "@/lib/listing";
import type { Business } from "@/types/business";

export type SearchSuggestion = {
  id: string;
  type: "business" | "city" | "category" | "all";
  label: string;
  sublabel?: string;
  href: string;
};

const MAX_SUGGESTIONS = 8;

function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function scoreBusiness(business: Business, q: string): number {
  const query = q.trim().toLowerCase();
  const name = business.name.toLowerCase();
  if (name.startsWith(query)) return 100;
  if (name.includes(query)) return 80;
  const { city } = resolveBusinessCityState(business);
  if (city.toLowerCase().includes(query)) return 60;
  if (business.category.toLowerCase().includes(query)) return 50;
  return 10;
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const businesses = await getPublicBusinesses();
  const matched = businesses
    .filter((b) => matchesQuery(b, q))
    .sort((a, b) => scoreBusiness(b, q) - scoreBusiness(a, q))
    .slice(0, 6);

  const suggestions: SearchSuggestion[] = matched.map((b) => {
    const { city, state } = resolveBusinessCityState(b);
    return {
      id: `business-${b.id}`,
      type: "business",
      label: b.name,
      sublabel: `${b.category} · ${formatLocationLabel(city, state)}`,
      href: `/business/${b.id}`,
    };
  });

  const cityMatches = uniqueBy(
    businesses
      .filter((b) => {
        const { city, state } = resolveBusinessCityState(b);
        const label = formatLocationLabel(city, state).toLowerCase();
        return label.includes(q.toLowerCase()) || city.toLowerCase().includes(q.toLowerCase());
      })
      .map((b) => {
        const { city, state } = resolveBusinessCityState(b);
        return { city, state, label: formatLocationLabel(city, state) };
      }),
    (item) => `${item.city}|${item.state}`,
  )
    .slice(0, 2)
    .map((loc) => ({
      id: `city-${loc.city}-${loc.state}`,
      type: "city" as const,
      label: loc.label,
      sublabel: "Browse businesses in this city",
      href: `/search?q=${encodeURIComponent(loc.label)}`,
    }));

  const categoryMatches = uniqueBy(
    businesses
      .filter((b) => b.category.toLowerCase().includes(q.toLowerCase()))
      .map((b) => ({ category: b.category, slug: b.categorySlug })),
    (item) => item.slug,
  )
    .slice(0, 2)
    .map((cat) => ({
      id: `category-${cat.slug}`,
      type: "category" as const,
      label: cat.category,
      sublabel: "Browse this category",
      href: `/search?q=${encodeURIComponent(cat.category)}`,
    }));

  const combined = [...suggestions, ...cityMatches, ...categoryMatches].slice(0, MAX_SUGGESTIONS);

  if (combined.length > 0) {
    combined.push({
      id: "all-results",
      type: "all",
      label: `Search all results for “${q}”`,
      href: `/search?q=${encodeURIComponent(q)}`,
    });
  }

  return combined;
}
