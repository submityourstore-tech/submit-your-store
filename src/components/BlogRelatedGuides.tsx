import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blogs.server";
import { getVerticalCityPath } from "@/lib/categories-config";
import { cityLocationSlug } from "@/lib/blog-cities";
import type { BlogCity } from "@/lib/blog-cities";

type BlogRelatedGuidesProps = {
  currentSlug: string;
  city: string;
  state: string;
  relatedPosts: BlogPostMeta[];
  cityConfig?: BlogCity;
};

export function BlogRelatedGuides({
  currentSlug,
  city,
  state,
  relatedPosts,
  cityConfig,
}: BlogRelatedGuidesProps) {
  const sameCityPosts = relatedPosts.filter((p) => p.city === city && p.state === state);
  const metroPosts = relatedPosts.filter((p) => p.city !== city || p.state !== state);

  const browseHref = cityConfig
    ? getVerticalCityPath("hvac", cityLocationSlug(cityConfig))
    : `/search?q=${encodeURIComponent(`${city}, ${state}`)}`;

  return (
    <section className="mt-10 rounded border border-[#e0e0e0] bg-[#fafafa] p-5">
      <h2 className="text-lg font-bold text-[#1274c0]">More HVAC guides</h2>

      {sameCityPosts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[#333]">Other guides in {city}, {state}</h3>
          <ul className="mt-2 space-y-2">
            {sameCityPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={`text-sm hover:text-[#1274c0] hover:underline ${
                    post.slug === currentSlug ? "font-semibold text-[#1274c0]" : "text-[#555]"
                  }`}
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {metroPosts.length > 0 && cityConfig?.metroHub && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[#333]">
            Same topic in {cityConfig.metroHub.city}, {cityConfig.metroHub.state}
          </h3>
          <ul className="mt-2 space-y-2">
            {metroPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-[#555] hover:text-[#1274c0] hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/blog" className="font-semibold text-[#1274c0] hover:underline">
          ← All HVAC guides
        </Link>
        <Link href={browseHref} className="font-semibold text-[#1274c0] hover:underline">
          Browse {city} listings →
        </Link>
      </div>
    </section>
  );
}
