import type { MetadataRoute } from "next";
import { getActiveVerticalStats } from "@/lib/categories.server";
import { getVerticalCityPath, getVerticalPath } from "@/lib/categories-config";
import { readBusinesses } from "@/lib/businesses-data";
import { isActiveBusiness } from "@/lib/categories-config";
import { getLocationStats } from "@/lib/locations";
import { getSiteUrl } from "@/lib/site-config";
import { getAllBlogPosts } from "@/lib/blogs.server";
import { SEO_TOOLS } from "@/lib/tools/registry";

const STATIC_PATHS = [
  "",
  "/listings",
  "/search",
  "/list-your-business",
  "/about",
  "/contact",
  "/how-it-works",
  "/faq",
  "/blog",
  "/tools",
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
  "/disclaimer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/listings" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/listings" ? 0.9 : 0.6,
  }));

  const businesses = await readBusinesses();
  const businessEntries: MetadataRoute.Sitemap = businesses
    .filter(isActiveBusiness)
    .map((business) => ({
      url: `${base}/business/${business.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const verticalEntries: MetadataRoute.Sitemap = [];
  for (const vertical of await getActiveVerticalStats()) {
    verticalEntries.push({
      url: `${base}${getVerticalPath(vertical.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const loc of await getLocationStats("TX", vertical.slug)) {
      verticalEntries.push({
        url: `${base}${getVerticalCityPath(vertical.slug, loc.slug)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  }

  const blogEntries: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  const toolEntries: MetadataRoute.Sitemap = SEO_TOOLS.map((tool) => ({
    url: `${base}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [...staticEntries, ...businessEntries, ...verticalEntries, ...blogEntries, ...toolEntries];
}
