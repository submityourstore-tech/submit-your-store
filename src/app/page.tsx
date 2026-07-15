import Image from "next/image";
import Link from "next/link";
import { BusinessCard } from "@/components/BusinessCard";
import { HomeBlogSection } from "@/components/HomeBlogSection";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { LocationBrowsePanel } from "@/components/LocationBrowsePanel";
import { SearchHero } from "@/components/SearchHero";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getActiveSubcategoryStats, getActiveVerticalStats } from "@/lib/categories.server";
import { getFeaturedBusinesses, getPublicBusinessCount } from "@/lib/businesses";
import { getAllArticles } from "@/lib/articles";
import { getLocationStats } from "@/lib/locations";
import { getReviewSummariesForBusinesses } from "@/lib/reviews.server";
import { getUtilityTool } from "@/lib/tools/utility-registry";

const FEATURED_TOOL_SLUGS = [
  "image-compressor",
  "qr-code-generator",
  "meta-title-generator",
  "word-counter",
  "password-generator",
  "business-name-generator",
  "json-formatter",
  "webp-to-png",
] as const;

const WHY_FEATURES = [
  {
    image: "/brand/free-listing.png",
    title: "Free Business Listing",
    description: "Get listed in our directory for free. No hidden fees, no pay-to-rank — just submit and get discovered.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    image: "/brand/community-reviews.png",
    title: "Community Reviews",
    description: "Real reviews from verified members. Businesses cannot pay to remove legitimate feedback.",
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    image: "/brand/seo-optimized.png",
    title: "SEO Optimized",
    description: "Your listing is optimized for local search with structured data, clean URLs, and fast performance.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    image: "/brand/free-tools.png",
    title: "100+ Free Tools",
    description: "Access our full suite of free online tools for SEO, images, text, business documents, and more.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
];

export default async function HomePage() {
  const verticals = await getActiveVerticalStats();
  const primaryVertical = verticals[0];
  const browseVertical = primaryVertical?.slug ?? "hvac";
  const featured = await getFeaturedBusinesses(6, browseVertical);
  const categories = await getActiveSubcategoryStats(browseVertical);
  const locations = await getLocationStats("TX", browseVertical);
  const total = await getPublicBusinessCount();
  const reviewSummaries = await getReviewSummariesForBusinesses(featured.map((b) => b.id));

  const featuredTools = FEATURED_TOOL_SLUGS.map((slug) => getUtilityTool(slug)).filter(Boolean);
  const articles = getAllArticles();

  return (
    <div className="bg-white">
      <SidePromoTabs />
      <SearchHero searchAction="/listings" />

      {/* Popular Listings */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#111]">
              Popular <span className="text-[#1274c0]">listings</span>
            </h2>
            <p className="mt-0.5 text-sm text-[#717171]">{total} businesses listed</p>
          </div>
          {primaryVertical && (
            <Link
              href="/listings"
              className="text-sm font-semibold text-[#1274c0] hover:underline"
            >
              Browse all listings →
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              layout="grid"
              reviewSummary={reviewSummaries[b.id] ?? null}
            />
          ))}
        </div>
      </section>

      {/* Why Submit Your Store? */}
      <section className="border-t border-[#e0e0e0] bg-gradient-to-br from-[#f0f7ff] to-[#f7f7f7]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#111] sm:text-2xl">
              Why <span className="text-[#1274c0]">Submit Your Store</span>?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#717171]">
              Everything you need to grow your local business — free listings, real reviews, SEO optimization, and powerful tools.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_FEATURES.map((feature) => {
              const [bgColor, borderColor, textColor] = feature.color.split(" ");
              return (
                <div
                  key={feature.title}
                  className={`overflow-hidden rounded-xl border ${borderColor} bg-white shadow-sm transition hover:shadow-md`}
                >
                  <div className={`flex items-center justify-center ${bgColor} p-6`}>
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={140}
                      height={140}
                      className="h-28 w-28 object-contain drop-shadow-md"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className={`font-bold ${textColor}`}>{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#555]">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse by Location */}
      {verticals.length > 0 && (
        <section className="border-t border-[#e0e0e0] bg-[#f7f7f7]">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="text-lg font-bold text-[#111]">Browse by location</h2>
            <p className="mt-1 text-sm text-[#717171]">
              {primaryVertical?.label ?? "Local"} businesses worldwide
            </p>
            <div className="mt-4">
              <LocationBrowsePanel
                locations={locations}
                verticalSlug={browseVertical}
                variant="compact"
                totalListings={total}
              />
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section className="border-t border-[#e0e0e0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="text-lg font-bold text-[#111]">Browse by category</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Categories appear here as listings are added.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className="rounded border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#333] shadow-sm hover:border-[#1274c0] hover:text-[#1274c0]"
                >
                  {c.label}
                  <span className="ml-1.5 text-[#999]">({c.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free Online Tools Showcase */}
      <section className="border-t border-[#e0e0e0] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#111]">
                Free Online <span className="text-[#1274c0]">Tools</span>
              </h2>
              <p className="mt-1 text-sm text-[#717171]">
                SEO, image processing, business generators, dev utilities &amp; more — all free.
              </p>
            </div>
            <Link href="/tools" className="text-sm font-semibold text-[#1274c0] hover:underline">
              View all 100+ tools →
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool) => (
              <Link
                key={tool!.slug}
                href={`/tools/${tool!.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-[#e0e0e0] bg-[#f7f7f7] p-4 shadow-sm transition hover:border-[#1274c0] hover:bg-white hover:shadow-md"
              >
                <span className="mt-0.5 flex-shrink-0 text-xl">{tool!.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-[#111] group-hover:text-[#1274c0]">
                      {tool!.name}
                    </h3>
                    <svg className="h-4 w-4 flex-shrink-0 text-[#ccc] transition-colors group-hover:text-[#1274c0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#717171]">
                    {tool!.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <HomeBlogSection />

      {/* Latest Articles */}
      <section className="border-t border-[#e0e0e0] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#111]">Latest Articles</h2>
              <p className="mt-1 text-sm text-[#717171]">
                Tips, guides, and insights for local businesses.
              </p>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-[#1274c0] hover:underline">
              See all articles →
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="group flex flex-col rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="mb-2 inline-block self-start rounded-full bg-[#e8f4fd] px-2.5 py-0.5 text-xs font-semibold text-[#1274c0]">
                  {a.category}
                </span>
                <h3 className="font-bold text-[#111] group-hover:text-[#1274c0]">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm text-[#555] line-clamp-2">{a.description}</p>
                <span className="mt-3 text-xs font-semibold text-[#1274c0]">Read article &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (moved to bottom before CTA) */}
      <HomeFaqSection />

      {/* Free Listing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded border border-[#e0e0e0] bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#111]">List your business for free</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#717171]">
            Get discovered by local customers. Reviews on Submit Your Store come from our members only.
          </p>
          <Link
            href="/list-your-business"
            className="jd-btn-orange mt-4 inline-block rounded px-6 py-2.5 text-sm font-semibold"
          >
            Free Listing
          </Link>
        </div>
      </section>
    </div>
  );
}
