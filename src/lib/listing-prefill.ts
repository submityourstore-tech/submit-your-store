import { getAllBusinesses } from "@/lib/businesses";
import { formatDisplayAddress } from "@/lib/address";
import { searchAddresses } from "@/lib/geocode";
import { fetchGbpAddress } from "@/lib/gbp-address";
import { findBusinessByGbp } from "@/lib/gbp";

export type ListingPrefill = {
  businessName?: string;
  address?: string;
  addressLabel?: string;
  city?: string;
  state?: string;
  lat?: number;
  lon?: number;
  phone?: string;
  website?: string;
  source?:
    | "existing"
    | "gbp-places"
    | "gbp-playwright"
    | "gbp-scrape"
    | "gbp-coords"
    | "gbp-name"
    | "gbp-name-only";
};

export type ParsedGbpUrl = {
  name: string | null;
  lat: number | null;
  lon: number | null;
};

export function parseGbpUrlDetails(url: string): ParsedGbpUrl {
  const decoded = decodeURIComponent(url.trim());
  let name: string | null = null;
  const placeMatch = decoded.match(/\/place\/([^/]+?)(?:\/|$|\?)/i);
  if (placeMatch?.[1]) {
    name = placeMatch[1].replace(/\+/g, " ").trim();
  }

  let lat: number | null = null;
  let lon: number | null = null;

  const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    lat = parseFloat(atMatch[1]!);
    lon = parseFloat(atMatch[2]!);
  }

  const dataMatch = decoded.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    lat = parseFloat(dataMatch[1]!);
    lon = parseFloat(dataMatch[2]!);
  }

  return { name, lat, lon };
}

function applyGbpAddress(
  prefill: ListingPrefill,
  result: NonNullable<Awaited<ReturnType<typeof fetchGbpAddress>>>,
) {
  if (result.businessName) prefill.businessName = result.businessName;
  prefill.address = result.address;
  prefill.addressLabel = result.addressLabel;
  prefill.city = result.city;
  prefill.state = result.state;
  if (result.lat != null && result.lon != null && !(result.lat === 0 && result.lon === 0)) {
    prefill.lat = result.lat;
    prefill.lon = result.lon;
  }
  prefill.source = result.source;
}

function ensurePrefillCoordinates(
  prefill: ListingPrefill,
  parsed: ParsedGbpUrl,
): ListingPrefill {
  const hasCoords =
    prefill.lat != null &&
    prefill.lon != null &&
    !(prefill.lat === 0 && prefill.lon === 0);

  if (!hasCoords && parsed.lat != null && parsed.lon != null) {
    prefill.lat = parsed.lat;
    prefill.lon = parsed.lon;
  }

  return prefill;
}

export async function resolveListingPrefill(gbpUrl: string): Promise<ListingPrefill> {
  const parsed = parseGbpUrlDetails(gbpUrl);
  const existing = findBusinessByGbp(gbpUrl, getAllBusinesses());

  if (existing) {
    const label = existing.address ? formatDisplayAddress(existing) : undefined;
    return ensurePrefillCoordinates(
      {
        businessName: existing.name,
        address: existing.address ?? undefined,
        addressLabel: label,
        city: existing.city,
        state: existing.state,
        phone: existing.phone,
        website: existing.website ?? undefined,
        source: "existing",
      },
      parsed,
    );
  }

  const prefill: ListingPrefill = {
    businessName: parsed.name ?? undefined,
    source: "gbp-name-only",
  };

  const gbpAddress = await fetchGbpAddress(gbpUrl, parsed);
  if (gbpAddress) {
    applyGbpAddress(prefill, gbpAddress);
    return ensurePrefillCoordinates(prefill, parsed);
  }

  if (parsed.name) {
    const query =
      parsed.lat != null && parsed.lon != null
        ? `${parsed.name}`
        : `${parsed.name}, Dallas, TX`;
    const results = await searchAddresses(query);
    const match =
      results.find((r) =>
        parsed.name!.toLowerCase().split(/\s+/).every((w) => r.label.toLowerCase().includes(w)),
      ) ?? results[0];

    if (match) {
      prefill.address = match.address;
      prefill.addressLabel = match.label;
      prefill.city = match.city;
      prefill.state = match.state;
      prefill.lat = match.lat;
      prefill.lon = match.lon;
      prefill.source = "gbp-name";
    }
  }

  return ensurePrefillCoordinates(prefill, parsed);
}
