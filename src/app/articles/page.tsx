import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles } from "@/lib/articles";
import { sitePageMetadata } from "@/lib/seo";

export const metadata: Metadata = sitePageMetadata(
  "Articles — SEO Guides & Business Tips",
  "In-depth articles on local SEO, Google Business Profile optimization, schema markup, business citations, and content marketing for small businesses.",
);

export default function ArticlesPage() {
  const articles = getAllArticles();

  const categoryColors: Record<string, string> = {
    "Local SEO": "bg-[#e8f4fd] text-[#1274c0]",
    SEO: "bg-[#e8f4fd] text-[#1274c0]",
    "Content Marketing": "bg-[#fef3c7] text-[#92400e]",
    "Technical SEO": "bg-[#ede9fe] text-[#5b21b6]",
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 pb-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Articles" },
          ]}
        />

        <header className="mt-4 border-b border-[#e0e0e0] pb-6">
          <h1 className="text-2xl font-bold text-[#111] sm:text-3xl">
            Articles &amp; Guides
          </h1>
          <p className="mt-2 text-base leading-relaxed text-[#555]">
            Practical guides on local SEO, Google Business Profile optimization,
            schema markup, and growing your business online.
          </p>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[article.category] ?? "bg-[#f3f4f6] text-[#374151]"}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-[#999]">
                    {article.readingTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold leading-snug text-[#111] group-hover:text-[#1274c0]">
                  {article.title}
                </h2>

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
                    Read article →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
