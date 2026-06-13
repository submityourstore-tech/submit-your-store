import { getPublicBusinesses } from "@/lib/categories.server";
import type { Business } from "@/types/business";
import {
  formatLocationLabel,
  getStateLabel,
  parseLocationSlug,
  toLocationSlug,
} from "@/lib/location-utils";

export type LocationStat = {
  city: string;
  state: string;
  label: string;
  slug: string;
  count: number;
};

export {
  formatLocationLabel,
  getStateLabel,
  parseLocationSlug,
  toLocationSlug,
} from "@/lib/location-utils";

export function getLocationStats(state?: string, vertical = "hvac"): LocationStat[] {
  const counts = new Map<string, LocationStat>();

  for (const b of getPublicBusinesses({ state, vertical })) {
    const key = `${b.city}|${b.state}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        city: b.city,
        state: b.state,
        label: formatLocationLabel(b.city, b.state),
        slug: toLocationSlug(b.city, b.state),
        count: 1,
      });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export function getBusinessesByLocation(city: string, state: string, vertical = "hvac"): Business[] {
  return getPublicBusinesses({ city, state, vertical });
}

export function getBusinessesByState(state: string, vertical = "hvac"): Business[] {
  return getPublicBusinesses({ state, vertical });
}

export function getLocationFromBusiness(business: Pick<Business, "city" | "state">): {
  label: string;
  slug: string;
  href: string;
} {
  const slug = toLocationSlug(business.city, business.state);
  return {
    label: formatLocationLabel(business.city, business.state),
    slug,
    href: `/hvac/${slug}`,
  };
}
