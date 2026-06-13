import { reverseGeocodeNominatim } from "@/lib/geocode";
import { scrapeGbpAddressWithPlaywright } from "@/lib/gbp-playwright";

export type GbpAddressResult = {
  businessName?: string;
  address: string;
  addressLabel: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  source: "gbp-places" | "gbp-playwright" | "gbp-scrape" | "gbp-coords";
};

/** Extract Google Place ID (ChIJ…) from a Maps / GBP URL. */
export function extractGooglePlaceId(url: string): string | null {
  const decoded = decodeURIComponent(url.trim());
  const fromMarker = decoded.match(/19s(ChI[A-Za-z0-9_-]+)/)?.[1];
  if (fromMarker) return fromMarker;
  const fromParam = decoded.match(/[?&]place_id=([^&]+)/i)?.[1];
  if (fromParam) return decodeURIComponent(fromParam);
  return null;
}

function parseStateCode(state: string): string {
  const map: Record<string, string> = {
    texas: "TX",
    california: "CA",
    florida: "FL",
  };
  const low = state.trim().toLowerCase();
  if (low.length === 2) return low.toUpperCase();
  return map[low] ?? state;
}

/** Official Google Places API — exact address shown on GBP (needs API key, free tier available). */
export async function fetchGbpAddressFromPlacesApi(
  placeId: string,
): Promise<GbpAddressResult | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "formattedAddress,location,displayName,addressComponents",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    console.error("Google Places API error", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    formattedAddress?: string;
    displayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
    addressComponents?: { longText?: string; shortText?: string; types?: string[] }[];
  };

  if (!data.formattedAddress || !data.location?.latitude || !data.location?.longitude) {
    return null;
  }

  let city = "Dallas";
  let state = "TX";
  for (const c of data.addressComponents ?? []) {
    if (c.types?.includes("locality") && c.longText) city = c.longText;
    if (c.types?.includes("administrative_area_level_1") && c.shortText) {
      state = c.shortText;
    }
  }

  const address = data.formattedAddress.replace(/, USA$/, ", United States");

  return {
    businessName: data.displayName?.text,
    address,
    addressLabel: address.replace(/, United States$/, ""),
    city,
    state: parseStateCode(state),
    lat: data.location.latitude,
    lon: data.location.longitude,
    source: "gbp-places",
  };
}

const ADDRESS_IN_HTML = /\d{3,6}\s+[A-Za-z0-9\s\.#-]{2,60},\s*[A-Za-z\s\.'-]{2,40},\s*[A-Z]{2}\s*\d{5}(?:,\s*(?:USA|United States))?/g;

/** Best-effort scrape from Maps HTML (Google often omits address in server HTML). */
export async function scrapeGbpAddressFromPage(gbpUrl: string): Promise<GbpAddressResult | null> {
  try {
    const res = await fetch(gbpUrl.trim(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const matches = html.match(ADDRESS_IN_HTML) ?? [];
    const best = matches.find((m) => /,\s*TX\s*/i.test(m)) ?? matches[0];
    if (!best) return null;

    const address = best.includes("United States")
      ? best
      : best.replace(/, USA$/, ", United States");
    const parts = address.replace(/, United States$/, "").split(",").map((p) => p.trim());
    const cityStateZip = parts[parts.length - 1] ?? "";
    const cityStateMatch = cityStateZip.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5})$/);

    return {
      address,
      addressLabel: address.replace(/, United States$/, ""),
      city: cityStateMatch?.[1] ?? "Dallas",
      state: cityStateMatch?.[2] ?? "TX",
      lat: 0,
      lon: 0,
      source: "gbp-scrape",
    };
  } catch {
    return null;
  }
}

export async function fetchGbpAddress(
  gbpUrl: string,
  parsed: { lat: number | null; lon: number | null; name: string | null },
  options?: { skipPlaywright?: boolean },
): Promise<GbpAddressResult | null> {
  const placeId = extractGooglePlaceId(gbpUrl);
  if (placeId) {
    const fromPlaces = await fetchGbpAddressFromPlacesApi(placeId);
    if (fromPlaces) return fromPlaces;
  }

  // Fast path: coords embedded in the Maps URL → reverse geocode (no Playwright wait).
  if (parsed.lat != null && parsed.lon != null) {
    const nominatim = await reverseGeocodeNominatim(parsed.lat, parsed.lon);
    if (nominatim) {
      return {
        businessName: parsed.name ?? undefined,
        address: nominatim.address,
        addressLabel: nominatim.label,
        city: nominatim.city,
        state: nominatim.state,
        lat: nominatim.lat,
        lon: nominatim.lon,
        source: "gbp-coords",
      };
    }
  }

  const scraped = await scrapeGbpAddressFromPage(gbpUrl);
  if (scraped && scraped.lat === 0 && parsed.lat != null && parsed.lon != null) {
    scraped.lat = parsed.lat;
    scraped.lon = parsed.lon;
  }
  if (scraped?.address) return scraped;

  if (!options?.skipPlaywright) {
    const playwright = await scrapeGbpAddressWithPlaywright(gbpUrl);
    if (playwright?.address) {
      if ((playwright.lat === 0 || playwright.lon === 0) && parsed.lat != null && parsed.lon != null) {
        playwright.lat = parsed.lat;
        playwright.lon = parsed.lon;
      }
      return playwright;
    }
  }

  return null;
}
