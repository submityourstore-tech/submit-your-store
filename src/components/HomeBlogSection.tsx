import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts, getTopBusinessesForBlog } from "@/lib/blogs.server";

export async function HomeBlogSection() {
  const posts = getAllBlogPosts();
  const postsWithCounts = await Promise.all(
    posts.map(async (post) => ({
      post,
      count: (await getTopBusinessesForBlog(post.city, post.state, 50)).length,
    })),
  );

  return (
    <section className="border-t border-[#e0e0e0] bg-[#f7f7f7]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#111]">HVAC city guides 2026</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Best-of lists with logos, ratings, and community votes — updated as new listings are added.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[#1274c0] hover:underline">
            All guides →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {postsWithCounts.map(({ post, count }) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#eee]">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#1274c0] group-hover:underline">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#555]">{post.intro}</p>
                <p className="mt-2 text-xs font-medium text-[#717171]">
                  📍 {post.city} · {count} companies
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
