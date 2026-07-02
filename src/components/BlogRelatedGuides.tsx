import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blogs.server";
import { getVerticalCityPath } from "@/lib/categories-config";
import { cityLocationSlug } from "@/lib/blog-cities";
import type { BlogCity } from "@/lib/blog-cities";

type BlogRelatedGuidesProps = {
  city: string;
  state: string;
  relatedPosts: BlogPostMeta[];
  cityConfig?: BlogCity;
};

export function BlogRelatedGuides({
  city,
  state,
  relatedPosts,
  cityConfig,
}: BlogRelatedGuidesProps) {
  const browseHref = cityConfig
    ? getVerticalCityPath("hvac", cityLocationSlug(cityConfig))
    : `/search?q=${encodeURIComponent(`${city}, ${state}`)}`;

  return (
    <section className="mt-10 rounded border border-[#e0e0e0] bg-[#fafafa] p-5">
      <h2 className="text-lg font-bold text-[#1274c0]">More HVAC city guides</h2>
      <p className="mt-1 text-sm text-[#717171]">
        One comprehensive guide per city — repair, replacement, residential, and commercial topics in a
        single page (better for readers and search engines).
      </p>

      {relatedPosts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {relatedPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-medium text-[#555] hover:text-[#1274c0] hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/blog" className="font-semibold text-[#1274c0] hover:underline">
          ← All guides
        </Link>
        <Link href={browseHref} className="font-semibold text-[#1274c0] hover:underline">
          Browse {city} listings →
        </Link>
      </div>
    </section>
  );
}
