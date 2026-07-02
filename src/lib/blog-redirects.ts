/**
 * Self-contained redirect list for next.config.ts (no @/ path aliases).
 * Keep city slugs in sync with src/lib/blog-cities.ts.
 */
const BLOG_CITY_SLUGS = [
  { slug: "dallas", state: "TX" },
  { slug: "houston", state: "TX" },
  { slug: "austin", state: "TX" },
  { slug: "irving", state: "TX" },
  { slug: "arlington", state: "TX" },
  { slug: "fort-worth", state: "TX" },
] as const;

const REMOVED_TOPIC_SLUG_PARTS = [
  "best-hvac-companies-for-system-replacement",
  "commercial-hvac-emergency-service-company",
  "commercial-hvac-service-company-near-me",
  "hvac-repair-service-company",
  "residential-hvac-service-companies",
  "residential-hvac-service-companies-near-me",
] as const;

function cityLocationSlug(citySlug: string, state: string): string {
  return `${citySlug}-${state.toLowerCase()}`;
}

export function mainCityGuideSlug(citySlug: string, state: string): string {
  return `best-hvac-companies-in-${citySlug}-${state.toLowerCase()}`;
}

export function blogRedirects(): { source: string; destination: string; permanent: true }[] {
  const redirects: { source: string; destination: string; permanent: true }[] = [
    {
      source: "/blog/best-hvac-companies-dallas",
      destination: "/blog/best-hvac-companies-in-dallas-tx",
      permanent: true,
    },
    {
      source: "/blog/best-hvac-companies-houston",
      destination: "/blog/best-hvac-companies-in-houston-tx",
      permanent: true,
    },
    {
      source: "/blog/best-hvac-companies-austin",
      destination: "/blog/best-hvac-companies-in-austin-tx",
      permanent: true,
    },
  ];

  for (const city of BLOG_CITY_SLUGS) {
    const main = `/blog/${mainCityGuideSlug(city.slug, city.state)}`;
    const loc = cityLocationSlug(city.slug, city.state);
    for (const part of REMOVED_TOPIC_SLUG_PARTS) {
      redirects.push({
        source: `/blog/${part}-in-${loc}`,
        destination: main,
        permanent: true,
      });
    }
  }

  return redirects;
}
