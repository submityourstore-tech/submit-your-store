import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/tools/ToolHeader";
import { SEO_TOOLS } from "@/lib/tools/registry";
import { sitePageMetadata } from "@/lib/seo";

export const metadata: Metadata = sitePageMetadata(
  "Free SEO Tools — Website Analysis & Bulk URL Checkers",
  "Professional SEO tools for bulk URL analysis: HTTP status, redirects, SSL, WHOIS, meta tags, robots.txt, sitemaps, and page speed. Up to 500 URLs per scan.",
);

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="SEO & Website Analysis Tools"
        subtitle="Bulk URL checkers built for agencies and marketers. Paste, upload, or drag & drop up to 500 URLs. Export to CSV, Excel, or JSON."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "SEO Tools" },
        ]}
      />

      <div className="mb-8 rounded-lg border border-[var(--jd-border)] bg-[var(--jd-surface)] p-4 text-sm">
        <strong>Platform:</strong> Each tool shares the same input, progress tracking, results table,
        and export engine. Add new tools by registering a checker — no duplicate UI code.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SEO_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-lg border border-[var(--jd-border)] bg-white p-5 shadow-sm transition hover:border-[var(--jd-blue)] hover:shadow-md dark:bg-[var(--jd-bg)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-hidden>
                {tool.icon}
              </span>
              {tool.available ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700 dark:bg-green-950 dark:text-green-300">
                  Live
                </span>
              ) : (
                <span className="rounded-full bg-[var(--jd-surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--jd-muted)]">
                  Coming soon
                </span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-bold text-[var(--jd-blue)] group-hover:underline">
              {tool.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--jd-muted)]">{tool.description}</p>
            <p className="mt-3 text-xs text-[var(--jd-muted)]">{tool.keywords.slice(0, 3).join(" · ")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
