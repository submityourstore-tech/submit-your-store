import type { Metadata } from "next";
import Link from "next/link";
import { ContentPageLayout } from "@/components/ContentPageLayout";
import { BlogBannerImage } from "@/components/BlogBannerImage";
import { BlogAuthorBio } from "@/components/BlogAuthorBio";
import { getBlogCityGroups } from "@/lib/blogs.server";
import { sitePageMetadata } from "@/lib/seo";
import { getVerticalCityPath } from "@/lib/categories-config";
import { cityLocationSlug } from "@/lib/blog-cities";

export const metadata: Metadata = sitePageMetadata(
  "HVAC City Guides 2026",
  "One expert guide per Texas city — AC repair, system replacement, residential and commercial HVAC companies ranked by real ratings and community votes.",
);

export default async function BlogIndexPage() {
  const cityGroups = await getBlogCityGroups();

  return (
    <ContentPageLayout
      title="HVAC City Guides 2026"
      subtitle="One comprehensive, Google-friendly guide per city — repair, replacement, residential, and commercial HVAC in a single page. No thin duplicate posts or “near me” doorway pages."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog" },
      ]}
    >
      <nav className="mb-8 rounded border border-[#e0e0e0] bg-[#f7f7f7] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Cities with guides</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {cityGroups.map(({ city, listingCount }) => (
            <a
              key={`${city.city}-${city.state}`}
              href={`#${cityLocationSlug(city)}`}
              className="rounded border border-[#ddd] bg-white px-3 py-1.5 text-sm font-medium text-[#333] hover:border-[#1274c0] hover:text-[#1274c0]"
            >
              {city.city}, {city.state}
              <span className="ml-1 text-[#999]">({listingCount} listings)</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-8">
        {cityGroups.map(({ city, posts, listingCount }) => {
          const post = posts[0];
          if (!post) return null;

          return (
            <section key={`${city.city}-${city.state}`} id={cityLocationSlug(city)}>
              <article className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-sm">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#f0f0f0]">
                    <BlogBannerImage
                      src={post.featuredImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      priority
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-[#1274c0] group-hover:underline">{post.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#555]">{post.description}</p>
                    <p className="mt-3 text-xs font-medium text-[#717171]">
                      {listingCount} HVAC listings · Covers repair, replacement, residential &amp; commercial
                      {city.metro ? ` · ${city.metro} metro` : ""}
                    </p>
                  </div>
                </Link>
                <div className="border-t border-[#eee] px-5 py-3">
                  <Link
                    href={getVerticalCityPath("hvac", cityLocationSlug(city))}
                    className="text-sm font-semibold text-[#1274c0] hover:underline"
                  >
                    Browse all {city.city} listings →
                  </Link>
                </div>
              </article>
            </section>
          );
        })}
      </div>

      <div className="mt-10">
        <BlogAuthorBio />
      </div>
    </ContentPageLayout>
  );
}
