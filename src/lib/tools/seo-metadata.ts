import type { Metadata } from "next";
import type { SeoToolDefinition } from "@/types/tools";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://submityourstore.com";

export function toolPageMetadata(tool: SeoToolDefinition): Metadata {
  const title = tool.seoTitle ?? `${tool.name} — Free SEO Tool | Submit Your Store`;
  const description = tool.seoDescription ?? tool.description;
  const url = `${SITE_URL}/tools/${tool.slug}`;

  return {
    title,
    description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Submit Your Store",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function toolBreadcrumbSchema(tool: SeoToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "SEO Tools", item: `${SITE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: `${SITE_URL}/tools/${tool.slug}` },
    ],
  };
}

export function toolFaqSchema(tool: SeoToolDefinition) {
  if (!tool.faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function toolWebApplicationSchema(tool: SeoToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: "SEO Tool",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
