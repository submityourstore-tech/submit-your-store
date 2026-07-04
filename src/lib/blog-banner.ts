import type { BlogCity } from "@/lib/blog-cities";
import { getSiteUrl } from "@/lib/site-config";

export function blogBannerPath(city: BlogCity): string {
  const params = new URLSearchParams({
    city: city.city,
    state: city.state,
    slug: city.slug,
  });
  return `/api/blog-banner?${params.toString()}`;
}

export function blogBannerUrl(city: BlogCity): string {
  return `${getSiteUrl()}${blogBannerPath(city)}`;
}
