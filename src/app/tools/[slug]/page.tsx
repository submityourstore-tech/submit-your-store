import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolFramework } from "@/components/tools/ToolFramework";
import { SEO_TOOLS, getTool } from "@/lib/tools/registry";
import {
  toolBreadcrumbSchema,
  toolFaqSchema,
  toolPageMetadata,
  toolWebApplicationSchema,
} from "@/lib/tools/seo-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return SEO_TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return toolPageMetadata(tool);
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const schemas = [
    toolBreadcrumbSchema(tool),
    toolWebApplicationSchema(tool),
    toolFaqSchema(tool),
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
      <ToolFramework tool={tool} />
    </>
  );
}
