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
