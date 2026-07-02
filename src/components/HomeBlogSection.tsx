import Image from "next/image";
import Link from "next/link";
import { getBlogCityGroups } from "@/lib/blogs.server";
import { cityLocationSlug } from "@/lib/blog-cities";

export async function HomeBlogSection() {
  const cityGroups = await getBlogCityGroups();
  const featured = cityGroups.slice(0, 6);

  return (
    <section className="border-t border-[#e0e0e0] bg-[#f7f7f7]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#111]">HVAC city guides 2026</h2>
            <p className="mt-1 text-sm text-[#717171]">
              One expert guide per city — repair, replacement, residential &amp; commercial HVAC.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[#1274c0] hover:underline">
            All guides →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ city, posts, listingCount }) => {
            const post = posts[0];
            if (!post) return null;

            return (
              <Link
                key={`${city.city}-${city.state}`}
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
                  <h3 className="font-bold text-[#1274c0] group-hover:underline">
                    {city.city}, {city.state}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#555]">{post.description}</p>
                  <p className="mt-2 text-xs font-medium text-[#717171]">
                    {listingCount} listings · Full city guide
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {cityGroups.map(({ city, listingCount }) => (
            <Link
              key={`nav-${city.city}`}
              href={`/blog#${cityLocationSlug(city)}`}
              className="rounded border border-[#ddd] bg-white px-3 py-1 text-xs font-medium text-[#555] hover:border-[#1274c0] hover:text-[#1274c0]"
            >
              {city.city} ({listingCount})
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
