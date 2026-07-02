import { BLOG_CITIES, cityLocationSlug } from "@/lib/blog-cities";
import { REMOVED_TOPIC_SLUG_PARTS } from "@/lib/blog-content";

export function mainCityGuideSlug(citySlug: string, state: string): string {
  return `best-hvac-companies-in-${citySlug}-${state.toLowerCase()}`;
}

/** Permanent redirects from removed thin keyword URLs → one guide per city. */
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

  for (const city of BLOG_CITIES) {
    const main = `/blog/${mainCityGuideSlug(city.slug, city.state)}`;
    for (const part of REMOVED_TOPIC_SLUG_PARTS) {
      redirects.push({
        source: `/blog/${part}-in-${cityLocationSlug(city)}`,
        destination: main,
        permanent: true,
      });
    }
  }

  return redirects;
}
