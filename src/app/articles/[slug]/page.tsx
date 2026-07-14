import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles, getArticle, getRelatedArticles } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-config";
import { sitePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };

  const canonical = `${getSiteUrl()}/articles/${article.slug}`;

  return {
    ...sitePageMetadata(article.title, article.description),
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: canonical,
    },
  };
}

function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const regex = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]+>/g, "");
    headings.push({ id: match[2], text, level: parseInt(match[1]) });
  }
  return headings;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const headings = extractHeadings(article.content);
  const related = getRelatedArticles(slug, 3);

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
            { label: "Articles", href: "/articles" },
            { label: article.title },
          ]}
        />

        <div className="mt-6 flex gap-10">
          {/* Main content */}
          <article className="min-w-0 flex-1">
            <header className="border-b border-[#e0e0e0] pb-6">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[article.category] ?? "bg-[#f3f4f6] text-[#374151]"}`}
              >
                {article.category}
              </span>

              <h1 className="mt-3 text-2xl font-bold leading-tight text-[#111] sm:text-3xl">
                {article.title}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-[#555]">
                {article.description}
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-[#717171]">
                <span>
                  By <strong className="text-[#333]">{article.author.name}</strong>
                </span>
                <span>·</span>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>·</span>
                <span>{article.readingTime}</span>
              </div>
            </header>

            <div
              className="content-page mt-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Author bio */}
            <div className="mt-12 rounded-lg border border-[#e0e0e0] bg-[#f9fafb] p-5">
              <p className="text-sm font-semibold text-[#333]">
                About the Author
              </p>
              <p className="mt-2 text-sm text-[#555]">
                <strong>{article.author.name}</strong> — {article.author.role}.
                Navjeet builds and edits local business guides on Submit Your Store,
                focusing on helpful, accurate content backed by real data — not paid placements.
              </p>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-bold text-[#111]">
                  Related Articles
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/articles/${r.slug}`}
                      className="group rounded-lg border border-[#e0e0e0] p-4 transition hover:shadow-md"
                    >
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColors[r.category] ?? "bg-[#f3f4f6] text-[#374151]"}`}
                      >
                        {r.category}
                      </span>
                      <h3 className="mt-2 text-sm font-bold leading-snug text-[#111] group-hover:text-[#1274c0]">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#999]">
                        {r.readingTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back to articles */}
            <div className="mt-8 border-t border-[#e0e0e0] pt-6">
              <Link
                href="/articles"
                className="text-sm font-semibold text-[#1274c0] hover:underline"
              >
                ← Back to all articles
              </Link>
            </div>
          </article>

          {/* Table of Contents sidebar (desktop) */}
          {headings.length > 0 && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <nav className="sticky top-24 rounded-lg border border-[#e0e0e0] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#717171]">
                  Table of Contents
                </p>
                <ul className="mt-3 space-y-1.5">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={`block text-sm leading-snug hover:text-[#1274c0] ${
                          h.level === 3
                            ? "pl-3 text-[#777]"
                            : "font-medium text-[#444]"
                        }`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-[#e0e0e0] pt-3">
                  <a
                    href="#"
                    className="text-xs font-medium text-[#1274c0] hover:underline"
                  >
                    ↑ Back to top
                  </a>
                </div>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
