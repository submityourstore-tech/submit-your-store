export function toLocationSlug(city: string, state: string): string {
  const cityPart = city
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  const statePart = state.trim().toLowerCase();
  return `${cityPart}-${statePart}`;
}

export function parseLocationSlug(slug: string): { city: string; state: string } | null {
  const match = slug.match(/^(.+)-([a-z]{2})$/i);
  if (!match) return null;

  const state = match[2]!.toUpperCase();
  const city = match[1]!
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return { city, state };
}

export function formatLocationLabel(city: string, state: string): string {
  return `${city}, ${state}`;
}

const ZIP_ONLY = /^\d{5}(-\d{4})?$/;

/** True when city looks like a real place name, not a zip or "TX 75247" garbage. */
export function isPlausibleCityName(city: string | null | undefined): boolean {
  const c = city?.trim() ?? "";
  if (c.length < 2) return false;
  if (ZIP_ONLY.test(c)) return false;
  if (/^(?:[a-z]{2}\s*)?\d{5}/i.test(c)) return false;
  if (/^\d+$/.test(c.replace(/\s/g, ""))) return false;
  const digitRatio = c.replace(/\D/g, "").length / c.length;
  if (digitRatio > 0.4) return false;
  return true;
}

/** Parse city + state from a US-style address string. */
export function parseCityStateFromAddress(
  address: string,
  defaultState = "TX",
): { city: string; state: string } | null {
  const cleaned = address
    .trim()
    .replace(/,\s*United States\s*$/i, "")
    .replace(/,\s*USA\s*$/i, "");

  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const last = parts[parts.length - 1]!;
  const stateFromLast = last.match(/\b([A-Z]{2})\b/i)?.[1]?.toUpperCase();

  if (parts.length >= 3 && stateFromLast) {
    return {
      city: parts[parts.length - 2]!,
      state: stateFromLast,
    };
  }

  if (parts.length === 2) {
    const second = parts[1]!;
    const stateZip = second.match(/\b([A-Z]{2})\b/i);
    if (stateZip && isPlausibleCityName(parts[0])) {
      return { city: parts[0]!, state: stateZip[1]!.toUpperCase() };
    }
    if (isPlausibleCityName(second)) {
      return { city: second, state: defaultState.toUpperCase() };
    }
  }

  return null;
}

export function resolveBusinessCityState(business: {
  city: string;
  state: string;
  address?: string | null;
}): { city: string; state: string } {
  const state = business.state?.trim().toUpperCase() || "TX";

  if (isPlausibleCityName(business.city)) {
    return { city: business.city.trim(), state };
  }

  if (business.address?.trim()) {
    const parsed = parseCityStateFromAddress(business.address, state);
    if (parsed && isPlausibleCityName(parsed.city)) {
      return { city: parsed.city, state: parsed.state };
    }
  }

  return { city: business.city?.trim() || "Dallas", state };
}

const STATE_LABELS: Record<string, string> = {
  TX: "Texas",
  CA: "California",
  FL: "Florida",
};

export function getStateLabel(state: string): string {
  const code = state.trim().toUpperCase();
  return STATE_LABELS[code] ?? state;
}

export type LocationStat = {
  city: string;
  state: string;
  label: string;
  slug: string;
  count: number;
};
