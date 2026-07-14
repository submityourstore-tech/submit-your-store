import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolFramework } from "@/components/tools/ToolFramework";
import { SEO_TOOLS, getTool } from "@/lib/tools/registry";
import { getAllUtilityTools, getUtilityTool } from "@/lib/tools/utility-registry";
import {
  toolBreadcrumbSchema,
  toolFaqSchema,
  toolPageMetadata,
  toolWebApplicationSchema,
} from "@/lib/tools/seo-metadata";
import { UtilityToolClient } from "./UtilityToolClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const scannerSlugs = SEO_TOOLS.map((t) => ({ slug: t.slug }));
  const utilitySlugs = getAllUtilityTools().map((t) => ({ slug: t.slug }));
  return [...scannerSlugs, ...utilitySlugs];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const scannerTool = getTool(slug);
  if (scannerTool) return toolPageMetadata(scannerTool);

  const utilityTool = getUtilityTool(slug);
  if (utilityTool) {
    const title = utilityTool.seoTitle ?? `${utilityTool.name} — Free Online Tool | Submit Your Store`;
    const description = utilityTool.seoDescription ?? utilityTool.description;
    const url = `https://www.submityourstore.com/tools/${utilityTool.slug}`;
    return {
      title,
      description,
      keywords: utilityTool.keywords,
      alternates: { canonical: url },
      openGraph: { title, description, url, type: "website", siteName: "Submit Your Store" },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  return { title: "Tool not found" };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;

  const scannerTool = getTool(slug);
  if (scannerTool) {
    const schemas = [
      toolBreadcrumbSchema(scannerTool),
      toolWebApplicationSchema(scannerTool),
      toolFaqSchema(scannerTool),
    ].filter(Boolean);

    return (
      <>
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <ToolFramework tool={scannerTool} />
      </>
    );
  }

  const utilityTool = getUtilityTool(slug);
  if (!utilityTool) notFound();

  return <UtilityToolClient slug={slug} />;
}
