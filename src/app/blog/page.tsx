import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPageLayout } from "@/components/ContentPageLayout";
import { getAllBlogPosts, getTopBusinessesForBlog } from "@/lib/blogs.server";
import { sitePageMetadata } from "@/lib/seo";

export const metadata: Metadata = sitePageMetadata(
  "HVAC Guides & Local Rankings 2026",
  "City guides to the best HVAC companies in Texas — updated as new listings and ratings are added to Submit Your Store.",
);

export default async function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const postsWithCounts = await Promise.all(
    posts.map(async (post) => ({
      post,
      count: (await getTopBusinessesForBlog(post.city, post.state)).length,
    })),
  );

  return (
    <ContentPageLayout
      title="HVAC Guides & Local Rankings 2026"
      subtitle="Curated city guides with logos, community votes, and links to full business profiles — refreshed as new listings are uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog" },
      ]}
    >
      <ul className="space-y-4">
        {postsWithCounts.map(({ post, count }) => (
          <li
            key={post.slug}
            className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-sm"
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#f0f0f0]">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 720px"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-[#1274c0] group-hover:underline">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#555]">{post.description}</p>
                <p className="mt-2 text-xs font-medium text-[#717171]">
                  📍 {post.city}, {post.state} · {count} companies featured
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </ContentPageLayout>
  );
}
