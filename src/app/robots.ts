import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/members/", "/api/", "/auth/", "/manage-listing/", "/verify-listing/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
