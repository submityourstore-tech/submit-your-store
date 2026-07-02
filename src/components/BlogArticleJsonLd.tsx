import { getSiteUrl, SITE_AUTHOR, SITE_NAME } from "@/lib/site-config";
import type { BlogPostMeta } from "@/lib/blogs.server";

type BlogArticleJsonLdProps = {
  post: BlogPostMeta;
};

export function BlogArticleJsonLd({ post }: BlogArticleJsonLdProps) {
  const url = `${getSiteUrl()}/blog/${post.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${getSiteUrl()}${post.featuredImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.linkedin,
      image: SITE_AUTHOR.image,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    about: {
      "@type": "Place",
      name: `${post.city}, ${post.state}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
