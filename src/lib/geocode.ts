import type { AddressSuggestion } from "@/types/address-search";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id?: number;
    housenumber?: string;
    street?: string;
    name?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
  };
};

const CACHE = new Map<string, { at: number; data: AddressSuggestion[] }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function buildLabel(p: PhotonFeature["properties"]): string {
  const streetLine = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
  const parts = [streetLine, p.city, p.state, p.postcode].filter(Boolean);
  return parts.join(", ");
}

function featureToSuggestion(feature: PhotonFeature): AddressSuggestion | null {
  const p = feature.properties;
  if (p.countrycode && p.countrycode.toLowerCase() !== "us") return null;

  const [lon, lat] = feature.geometry.coordinates;
  const label = buildLabel(p);
  if (!label || label.length < 5) return null;

  const streetLine = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
  const address = [streetLine, p.city, p.state, p.postcode, "United States"].filter(Boolean).join(", ");

  return {
    id: String(p.osm_id ?? `${lat},${lon},${label}`),
    label,
    address,
    city: p.city ?? "Dallas",
    state: p.state ?? "TX",
    postcode: p.postcode ?? "",
    lat,
    lon,
  };
}

export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const cacheKey = q.toLowerCase();
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams({
    q,
    limit: "8",
    lang: "en",
    lat: "32.7767",
    lon: "-96.7970",
  });

  const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as { features?: PhotonFeature[] };
  const results: AddressSuggestion[] = [];
  const seen = new Set<string>();

  for (const feature of json.features ?? []) {
    const item = featureToSuggestion(feature);
    if (!item || seen.has(item.label)) continue;
    seen.add(item.label);
    results.push(item);
  }

  CACHE.set(cacheKey, { at: Date.now(), data: results });
  return results;
}

export async function reverseGeocodeNominatim(
  lat: number,
  lon: number,
): Promise<AddressSuggestion | null> {
  const cacheKey = `nom:${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data[0] ?? null;
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
    addressdetails: "1",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { "User-Agent": "SubmitYourStore/1.0 (listing-form)" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    display_name?: string;
    address?: {
      house_number?: string;
      road?: string;
      city?: string;
      town?: string;
      state?: string;
      postcode?: string;
    };
  };

  const a = data.address;
  if (!a?.road) return null;

  const streetLine = [a.house_number, a.road].filter(Boolean).join(" ");
  const city = a.city ?? a.town ?? "Dallas";
  const state = a.state?.length === 2 ? a.state : a.state === "Texas" ? "TX" : (a.state ?? "TX");
  const label = [streetLine, city, state, a.postcode].filter(Boolean).join(", ");
  const address = `${label}, United States`;

  const item: AddressSuggestion = {
    id: `nom-${lat}-${lon}`,
    label,
    address,
    city,
    state,
    postcode: a.postcode ?? "",
    lat,
    lon,
  };

  CACHE.set(cacheKey, { at: Date.now(), data: [item] });
  return item;
}

export async function reverseGeocode(lat: number, lon: number): Promise<AddressSuggestion | null> {
  const photon = await reverseGeocodePhoton(lat, lon);
  if (photon?.label.match(/^\d/)) return photon;
  const nominatim = await reverseGeocodeNominatim(lat, lon);
  return nominatim ?? photon;
}

async function reverseGeocodePhoton(lat: number, lon: number): Promise<AddressSuggestion | null> {
  const cacheKey = `rev:${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data[0] ?? null;
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    lang: "en",
  });

  const res = await fetch(`https://photon.komoot.io/reverse?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as { features?: PhotonFeature[] };
  for (const feature of json.features ?? []) {
    const item = featureToSuggestion(feature);
    if (item) {
      CACHE.set(cacheKey, { at: Date.now(), data: [item] });
      return item;
    }
  }
  return null;
}
