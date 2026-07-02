import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPageLayout } from "@/components/ContentPageLayout";
import { getBlogCityGroups } from "@/lib/blogs.server";
import { sitePageMetadata } from "@/lib/seo";
import { getVerticalCityPath } from "@/lib/categories-config";
import { cityLocationSlug } from "@/lib/blog-cities";

export const metadata: Metadata = sitePageMetadata(
  "HVAC Guides & Local Rankings 2026",
  "City-by-city HVAC guides for Texas — system replacement, repair, residential and commercial service companies ranked by ratings and community votes.",
);

export default async function BlogIndexPage() {
  const cityGroups = await getBlogCityGroups();
  const totalGuides = cityGroups.reduce((sum, g) => sum + g.posts.length, 0);

  return (
    <ContentPageLayout
      title="HVAC Guides & Local Rankings 2026"
      subtitle={`${totalGuides} keyword-targeted guides across ${cityGroups.length} Texas cities — each links to ranked local HVAC companies with full profiles, ratings, and community votes.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog" },
      ]}
    >
      <nav className="mb-8 rounded border border-[#e0e0e0] bg-[#f7f7f7] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Jump to city</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {cityGroups.map(({ city, listingCount }) => (
            <a
              key={`${city.city}-${city.state}`}
              href={`#${cityLocationSlug(city)}`}
              className="rounded border border-[#ddd] bg-white px-3 py-1.5 text-sm font-medium text-[#333] hover:border-[#1274c0] hover:text-[#1274c0]"
            >
              {city.city}, {city.state}
              <span className="ml-1 text-[#999]">({listingCount})</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-10">
        {cityGroups.map(({ city, posts, listingCount }) => (
          <section key={`${city.city}-${city.state}`} id={cityLocationSlug(city)}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e0e0e0] pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#111]">
                  {city.city}, {city.state}
                </h2>
                <p className="mt-1 text-sm text-[#717171]">
                  {listingCount} HVAC listings · {posts.length} guides
                  {city.metro ? ` · ${city.metro} metro` : ""}
                </p>
              </div>
              <Link
                href={getVerticalCityPath("hvac", cityLocationSlug(city))}
                className="text-sm font-semibold text-[#1274c0] hover:underline"
              >
                Browse all {city.city} listings →
              </Link>
            </div>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-sm"
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#f0f0f0]">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 360px"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-[#1274c0] group-hover:underline">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#555]">
                        {post.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ContentPageLayout>
  );
}
