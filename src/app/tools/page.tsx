import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/tools/ToolHeader";
import { SEO_TOOLS } from "@/lib/tools/registry";
import { UTILITY_TOOL_CATEGORIES, getUtilityToolsByCategory } from "@/lib/tools/utility-registry";
import { sitePageMetadata } from "@/lib/seo";

export const metadata: Metadata = sitePageMetadata(
  "100+ Free Online Tools — SEO, Schema, Text, Image, Business & More",
  "Free online tools for SEO meta tags, schema markup, text analysis, image processing, business generators, calculators, and developer utilities. No signup required.",
);

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Free Online Tools"
        subtitle="100+ free tools for SEO, schema markup, text analysis, image processing, business documents, and more. No signup. No limits on most tools."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tools" },
        ]}
      />

      {/* URL Scanner Tools */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <div>
            <h2 className="text-lg font-bold text-[#111]">Website Analysis</h2>
            <p className="text-sm text-[#717171]">Bulk URL scanners — check up to 500 URLs at once</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SEO_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm transition hover:border-[#1274c0] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{tool.icon}</span>
                {tool.available ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-700">
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-[#f7f7f7] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#717171]">
                    Soon
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-bold text-[#1274c0] group-hover:underline">{tool.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#717171]">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Utility Tool Categories */}
      {UTILITY_TOOL_CATEGORIES.map((cat) => {
        const tools = getUtilityToolsByCategory(cat.id);
        if (tools.length === 0) return null;

        return (
          <section key={cat.id} className="mb-10" id={cat.id}>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-[#111]">{cat.label}</h2>
                <p className="text-sm text-[#717171]">{cat.description}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm transition hover:border-[#1274c0] hover:shadow-md"
                >
                  <span className="text-xl">{tool.icon}</span>
                  <h3 className="mt-1.5 text-sm font-bold text-[#1274c0] group-hover:underline">
                    {tool.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#717171]">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Category jump nav */}
      <nav className="mt-8 rounded border border-[#e0e0e0] bg-[#f7f7f7] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Jump to category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {UTILITY_TOOL_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="rounded border border-[#ddd] bg-white px-3 py-1 text-xs font-medium text-[#333] hover:border-[#1274c0] hover:text-[#1274c0]"
            >
              {cat.icon} {cat.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
