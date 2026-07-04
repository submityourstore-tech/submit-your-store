/** Cities with 20+ active HVAC listings — add here when a city crosses the threshold. */
export type BlogCity = {
  city: string;
  state: string;
  slug: string;
  /** Optional metro label for cross-linking (e.g. DFW suburbs → Dallas). */
  metro?: string;
  metroHub?: { city: string; state: string };
  climateNote: string;
};

export const BLOG_CITIES: BlogCity[] = [
  {
    city: "Dallas",
    state: "TX",
    slug: "dallas",
    climateNote:
      "brutal summers, sudden winter freezes, and heavy cooling load across the Dallas-Fort Worth metroplex",
  },
  {
    city: "Houston",
    state: "TX",
    slug: "houston",
    climateNote:
      "Gulf Coast humidity, year-round cooling demand, and salt-air wear on outdoor HVAC equipment",
  },
  {
    city: "Austin",
    state: "TX",
    slug: "austin",
    climateNote:
      "scorching Central Texas summers, occasional hard freezes, and rapid growth driving HVAC upgrades",
  },
  {
    city: "Irving",
    state: "TX",
    slug: "irving",
    metro: "DFW",
    metroHub: { city: "Dallas", state: "TX" },
    climateNote:
      "hot summers around DFW Airport and Las Colinas office corridors, with aging systems in mixed residential and commercial buildings",
  },
  {
    city: "Arlington",
    state: "TX",
    slug: "arlington",
    metro: "DFW",
    metroHub: { city: "Dallas", state: "TX" },
    climateNote:
      "high cooling demand near AT&T Stadium and Entertainment District properties, plus steady residential service across established neighborhoods",
  },
  {
    city: "Fort Worth",
    state: "TX",
    slug: "fort-worth",
    metro: "DFW",
    metroHub: { city: "Dallas", state: "TX" },
    climateNote:
      "wide service areas from downtown Fort Worth to west-side suburbs, with furnace and AC strain during Texas temperature swings",
  },
];

export function getBlogCity(city: string, state: string): BlogCity | undefined {
  return BLOG_CITIES.find(
    (c) => c.city.toLowerCase() === city.trim().toLowerCase() && c.state === state.trim().toUpperCase(),
  );
}

export function cityLocationSlug(city: BlogCity): string {
  return `${city.slug}-${city.state.toLowerCase()}`;
}
