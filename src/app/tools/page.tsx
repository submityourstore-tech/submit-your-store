import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/tools/ToolHeader";
import { SEO_TOOLS } from "@/lib/tools/registry";
import { UTILITY_TOOL_CATEGORIES, getUtilityToolsByCategory, getAllUtilityTools } from "@/lib/tools/utility-registry";
import { sitePageMetadata } from "@/lib/seo";

export const metadata: Metadata = sitePageMetadata(
  "100+ Free Online Tools — SEO, Schema, Text, Image, Business & More",
  "Free online tools for SEO meta tags, schema markup, text analysis, image processing, business generators, calculators, and developer utilities. No signup required.",
);

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "website-analysis": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "seo-meta":         { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  "schema-markup":    { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  "text-content":     { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  "business-tools":   { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  "link-generators":  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  "image-tools":      { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  "dev-utilities":    { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
  "calculators":      { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
};

function getCategoryColor(id: string) {
  return CATEGORY_COLORS[id] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" };
}

export default function ToolsIndexPage() {
  const allUtilityTools = getAllUtilityTools();
  const totalTools = SEO_TOOLS.length + allUtilityTools.length;

  const allCategories = [
    { id: "website-analysis", label: "Website Analysis", icon: "🌐", description: "Bulk URL scanners — check up to 500 URLs at once" },
    ...UTILITY_TOOL_CATEGORIES,
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-[#e0e0e0] bg-gradient-to-br from-[#f0f7ff] to-[#f7f7f7]">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <PageHeader
            title="Free Online Tools"
            subtitle="No signup. No limits on most tools."
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Tools" },
            ]}
          />
          <div className="mx-auto mt-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#1274c0] px-4 py-1.5 text-sm font-bold text-white">
              {totalTools}+ Tools
            </span>
            <span className="text-sm text-[#717171]">
              across SEO, schema, text, image, business &amp; dev categories
            </span>
          </div>
        </div>
      </section>

      {/* Sticky category navigation */}
      <nav className="sticky top-0 z-30 border-b border-[#e0e0e0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {allCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-[#f7f7f7] px-3.5 py-1.5 text-xs font-semibold text-[#333] transition-colors hover:border-[#1274c0] hover:bg-blue-50 hover:text-[#1274c0]"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Website Analysis (SEO Tools) */}
        <section className="mb-12" id="website-analysis">
          <CategoryBanner
            id="website-analysis"
            icon="🌐"
            label="Website Analysis"
            description="Bulk URL scanners — check up to 500 URLs at once"
            count={SEO_TOOLS.length}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SEO_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm transition hover:border-[#1274c0] hover:shadow-md"
              >
                <span className="mt-0.5 flex-shrink-0 text-xl">{tool.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-[#111] group-hover:text-[#1274c0]">
                      {tool.name}
                    </h3>
                    <svg className="h-4 w-4 flex-shrink-0 text-[#ccc] transition-colors group-hover:text-[#1274c0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#717171]">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Utility Tool Categories */}
        {UTILITY_TOOL_CATEGORIES.map((cat) => {
          const tools = getUtilityToolsByCategory(cat.id);
          if (tools.length === 0) return null;

          return (
            <section key={cat.id} className="mb-12" id={cat.id}>
              <CategoryBanner
                id={cat.id}
                icon={cat.icon}
                label={cat.label}
                description={cat.description}
                count={tools.length}
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-start gap-3 rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm transition hover:border-[#1274c0] hover:shadow-md"
                  >
                    <span className="mt-0.5 flex-shrink-0 text-xl">{tool.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-[#111] group-hover:text-[#1274c0]">
                          {tool.name}
                        </h3>
                        <svg className="h-4 w-4 flex-shrink-0 text-[#ccc] transition-colors group-hover:text-[#1274c0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#717171]">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBanner({
  id,
  icon,
  label,
  description,
  count,
}: {
  id: string;
  icon: string;
  label: string;
  description: string;
  count: number;
}) {
  const colors = getCategoryColor(id);

  return (
    <div className={`flex items-center gap-4 rounded-xl border ${colors.border} ${colors.bg} px-5 py-4`}>
      <span className="text-3xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className={`text-lg font-bold ${colors.text}`}>{label}</h2>
          <span className={`rounded-full border ${colors.border} px-2 py-0.5 text-[11px] font-semibold ${colors.text}`}>
            {count} {count === 1 ? "tool" : "tools"}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-[#717171]">{description}</p>
      </div>
    </div>
  );
}
