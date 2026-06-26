import { getPublicBusinesses } from "@/lib/categories.server";
import type { Business } from "@/types/business";
import {
  formatLocationLabel,
  getStateLabel,
  parseLocationSlug,
  resolveBusinessCityState,
  toLocationSlug,
  type LocationStat,
} from "@/lib/location-utils";
import { getVerticalCityPath, getVerticalPath, resolveBusinessBrowseVertical } from "@/lib/categories-config";

export type { LocationStat } from "@/lib/location-utils";

export {
  formatLocationLabel,
  getStateLabel,
  parseLocationSlug,
  toLocationSlug,
} from "@/lib/location-utils";

export async function getLocationStats(state?: string, vertical = "hvac"): Promise<LocationStat[]> {
  const counts = new Map<string, LocationStat>();

  for (const b of await getPublicBusinesses({ state, vertical })) {
    const { city, state: st } = resolveBusinessCityState(b);
    const key = `${city}|${st}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        city,
        state: st,
        label: formatLocationLabel(city, st),
        slug: toLocationSlug(city, st),
        count: 1,
      });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export async function getBusinessesByLocation(
  city: string,
  state: string,
  vertical = "hvac",
): Promise<Business[]> {
  const exact = await getPublicBusinesses({ city, state, vertical });
  if (exact.length > 0) return exact;

  const inState = await getPublicBusinesses({ state, vertical });
  const cityLower = city.trim().toLowerCase();
  const byCity = inState.filter((b) => b.city.trim().toLowerCase() === cityLower);
  if (byCity.length > 0) return byCity;

  const zipInCity = city.match(/\b(\d{5})\b/);
  if (zipInCity) {
    const zip = zipInCity[1]!;
    return inState.filter((b) => b.address?.includes(zip));
  }

  return [];
}

export async function getBusinessesByLocationSlug(
  locationSlug: string,
  vertical = "hvac",
): Promise<Business[]> {
  const parsed = parseLocationSlug(locationSlug);
  if (!parsed) return [];

  let businesses = await getBusinessesByLocation(parsed.city, parsed.state, vertical);
  if (businesses.length > 0) return businesses;

  const zipMatch = locationSlug.match(/(\d{5})/);
  if (zipMatch) {
    const zip = zipMatch[1]!;
    const inState = await getPublicBusinesses({ state: parsed.state, vertical });
    return inState.filter((b) => b.address?.includes(zip));
  }

  return [];
}

export async function getBusinessesByState(state: string, vertical = "hvac"): Promise<Business[]> {
  return getPublicBusinesses({ state, vertical });
}

export function getLocationFromBusiness(business: Pick<Business, "city" | "state" | "address" | "vertical" | "categorySlug" | "status">): {
  label: string;
  slug: string;
  href: string;
} {
  const { city, state } = resolveBusinessCityState(business);
  const slug = toLocationSlug(city, state);
  const verticalSlug = resolveBusinessBrowseVertical(business);
  return {
    label: formatLocationLabel(city, state),
    slug,
    href: getVerticalCityPath(verticalSlug, slug),
  };
}
