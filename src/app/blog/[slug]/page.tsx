import type { Metadata } from "next";
import Link from "next/link";
import { BlogBannerImage } from "@/components/BlogBannerImage";
import { notFound } from "next/navigation";
import { BlogArticleJsonLd } from "@/components/BlogArticleJsonLd";
import { BlogAuthorBio } from "@/components/BlogAuthorBio";
import { BlogCommentSection } from "@/components/BlogCommentSection";
import { BlogRankedBusinessCard } from "@/components/BlogRankedBusinessCard";
import { BlogRelatedGuides } from "@/components/BlogRelatedGuides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCommentsForBlog } from "@/lib/blog-comments.server";
import { getBlogCity } from "@/lib/blog-cities";
import { getVoteStatsForBusinesses, getVotesStore } from "@/lib/business-votes.server";
import {
  cityLocationSlug,
  getAllBlogPosts,
  getBlogPost,
  getRelatedBlogPosts,
  getTopBusinessesForBlog,
} from "@/lib/blogs.server";
import { getCurrentUser } from "@/lib/user-auth.server";
import { getSiteUrl } from "@/lib/site-config";
import { blogBannerUrl } from "@/lib/blog-banner";
import { sitePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article not found" };

  const canonical = `${getSiteUrl()}/blog/${post.slug}`;
  const cityConfig = getBlogCity(post.city, post.state);
  const ogImage = cityConfig ? blogBannerUrl(cityConfig) : `${getSiteUrl()}${post.featuredImage}`;

  return {
    ...sitePageMetadata(post.title, post.description),
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const cityConfig = getBlogCity(post.city, post.state);
  const relatedPosts = getRelatedBlogPosts(post.slug);
  const businesses = await getTopBusinessesForBlog(post.city, post.state);
  const [comments, user, voteStatsMap, voteStore] = await Promise.all([
    getCommentsForBlog(slug),
    getCurrentUser(),
    getVoteStatsForBusinesses(businesses.map((b) => b.id)),
    getVotesStore(),
  ]);

  return (
    <div className="bg-white">
      <BlogArticleJsonLd post={post} />

      <div className="mx-auto max-w-3xl px-4 py-8 pb-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            {
              label: `${post.city}, ${post.state}`,
              href: cityConfig ? `/blog#${cityLocationSlug(cityConfig)}` : "/blog",
            },
            { label: post.city },
          ]}
        />

        <header className="mt-4 border-b border-[#e0e0e0] pb-6">
          <div className="overflow-hidden rounded-lg border border-[#e0e0e0] shadow-sm">
            <BlogBannerImage
              src={post.featuredImage}
              alt={post.title}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#111] sm:text-3xl">{post.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-[#555]">{post.description}</p>
          <p className="mt-2 text-xs font-medium text-[#717171]">
            📍 {post.city}, {post.state} · Updated {post.updatedAt} · By Navjeet Kamboj
          </p>
        </header>

        <article className="content-page mt-8">
          <section>
            <h2 className="text-lg font-bold text-[#1274c0]">Introduction</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#555] sm:text-base">{post.intro}</p>
          </section>

          {post.sections.map((section) => (
            <section key={section.id} className="mt-8" id={section.id}>
              <h2 className="text-lg font-bold text-[#1274c0]">{section.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#555] sm:text-base">{section.body}</p>
            </section>
          ))}

          <p className="mt-8 text-xs text-[#717171]">
            ⭐ Rankings combine community upvotes with Google ratings and review volume. Each company
            links to its full profile with logo, hours, and customer reviews.
          </p>

          {businesses.length === 0 ? (
            <p className="mt-6 text-sm text-[#717171]">
              We are still adding HVAC listings in {post.city}. Check back soon or{" "}
              <Link href="/listings" className="text-[#1274c0] hover:underline">
                browse all listings
              </Link>
              .
            </p>
          ) : (
            <>
              <h2 className="mt-8 text-lg font-bold text-[#1274c0]">{post.rankingHeading}</h2>
              <ol className="mt-4 space-y-4">
                {businesses.map((business, index) => {
                  const stats = voteStatsMap[business.id]!;
                  const userVote = user ? (voteStore.votes[business.id]?.voters[user.id] ?? null) : null;
                  return (
                    <BlogRankedBusinessCard
                      key={business.id}
                      business={business}
                      rank={index + 1}
                      city={post.city}
                      upvotes={stats.upvotes}
                      downvotes={stats.downvotes}
                      userVote={userVote}
                    />
                  );
                })}
              </ol>
            </>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-bold text-[#1274c0]">Conclusion</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#555] sm:text-base">{post.conclusion}</p>
          </section>

          <BlogAuthorBio />

          <BlogRelatedGuides
            city={post.city}
            state={post.state}
            relatedPosts={relatedPosts}
            cityConfig={cityConfig}
          />

          <p className="mt-6 text-sm text-[#717171]">
            Own an HVAC company in {post.city}?{" "}
            <Link href="/list-your-business" className="font-semibold text-[#1274c0] hover:underline">
              Add a free listing
            </Link>{" "}
            to appear in future updates to this guide.
          </p>

          <BlogCommentSection blogSlug={slug} blogTitle={post.title} initialComments={comments} />
        </article>
      </div>
    </div>
  );
}
