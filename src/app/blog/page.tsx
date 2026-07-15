import type { Metadata } from "next";
import Link from "next/link";
import { ArticleBanner } from "@/components/ArticleBanner";
import { ContentPageLayout } from "@/components/ContentPageLayout";
import { BlogCityBannerFromConfig } from "@/components/BlogCityBanner";
import { BlogAuthorBio } from "@/components/BlogAuthorBio";
import { getBlogCityGroups } from "@/lib/blogs.server";
import { getAllArticles } from "@/lib/articles";
import { sitePageMetadata } from "@/lib/seo";
import { getVerticalCityPath } from "@/lib/categories-config";
import { cityLocationSlug } from "@/lib/blog-cities";

export const metadata: Metadata = sitePageMetadata(
  "Blog — HVAC Guides, SEO Tips & Business Articles",
  "Expert HVAC city guides, local SEO strategies, schema markup tutorials, and business growth articles — all in one place.",
);

const categoryColors: Record<string, string> = {
  "Local SEO": "bg-[#e8f4fd] text-[#1274c0]",
  SEO: "bg-[#e8f4fd] text-[#1274c0]",
  "Content Marketing": "bg-[#fef3c7] text-[#92400e]",
  "Technical SEO": "bg-[#ede9fe] text-[#5b21b6]",
};

export default async function BlogIndexPage() {
  const cityGroups = await getBlogCityGroups();
  const articles = getAllArticles();

  return (
    <ContentPageLayout
      title="Blog & Articles"
      subtitle="Expert HVAC city guides, local SEO strategies, and practical business growth articles."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog" },
      ]}
    >
      {/* Articles Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-[#1274c0]" />
          <h2 className="text-xl font-bold text-[#111]">Articles &amp; Guides</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-sm transition hover:shadow-md"
            >
              <ArticleBanner
                title={article.title}
                category={article.category}
                className="aspect-[16/9] w-full object-cover transition group-hover:scale-[1.02]"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[article.category] ?? "bg-[#f3f4f6] text-[#374151]"}`}>
                    {article.category}
                  </span>
                  <span className="text-xs text-[#999]">{article.readingTime}</span>
                </div>
                <h3 className="text-lg font-bold leading-snug text-[#111] group-hover:text-[#1274c0]">
                  {article.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#555]">
                  {article.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                  <span className="text-xs text-[#999]">
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-semibold text-[#1274c0] group-hover:underline">
                    Read article &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* City Guides Section */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-[#059669]" />
          <h2 className="text-xl font-bold text-[#111]">HVAC City Guides</h2>
        </div>

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
                      <BlogCityBannerFromConfig
                        city={city}
                        title={post.title}
                        className="h-full w-full transition group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-[#1274c0] group-hover:underline">{post.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#555]">{post.description}</p>
                      <p className="mt-3 text-xs font-medium text-[#717171]">
                        {listingCount} HVAC listings &middot; Covers repair, replacement, residential &amp; commercial
                        {city.metro ? ` \u00B7 ${city.metro} metro` : ""}
                      </p>
                    </div>
                  </Link>
                  <div className="border-t border-[#eee] px-5 py-3">
                    <Link
                      href={getVerticalCityPath("hvac", cityLocationSlug(city))}
                      className="text-sm font-semibold text-[#1274c0] hover:underline"
                    >
                      Browse all {city.city} listings &rarr;
                    </Link>
                  </div>
                </article>
              </section>
            );
          })}
        </div>
      </section>

      <div className="mt-10">
        <BlogAuthorBio />
      </div>
    </ContentPageLayout>
  );
}
