import { BLOG_CITIES, cityLocationSlug, type BlogCity } from "@/lib/blog-cities";
import { blogBannerPath } from "@/lib/blog-banner";
import { buildCityGuideContent, type BlogContentSection } from "@/lib/blog-content";
import { getBlogCityBusinesses } from "@/lib/blog-businesses.server";
import { mainCityGuideSlug } from "@/lib/blog-redirects";
import { getBusinessVoteStats, getVotesStore, voteScoreFromStore } from "@/lib/business-votes.server";
import type { Business } from "@/types/business";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  conclusion: string;
  featuredImage: string;
  city: string;
  state: string;
  rankingHeading: string;
  sections: BlogContentSection[];
  publishedAt: string;
  updatedAt: string;
};

const GUIDE_PUBLISHED = "2026-03-01";
const GUIDE_UPDATED = "2026-07-02";

function buildCityGuide(city: BlogCity): BlogPostMeta {
  const content = buildCityGuideContent(city);
  return {
    slug: mainCityGuideSlug(city.slug, city.state),
    title: content.title,
    description: content.description,
    intro: content.intro,
    conclusion: content.conclusion,
    rankingHeading: content.rankingHeading,
    sections: content.sections,
    featuredImage: blogBannerPath(city),
    city: city.city,
    state: city.state,
    publishedAt: GUIDE_PUBLISHED,
    updatedAt: GUIDE_UPDATED,
  };
}

const BLOG_DEFINITIONS: BlogPostMeta[] = BLOG_CITIES.map(buildCityGuide);

const SLUG_INDEX = new Map(BLOG_DEFINITIONS.map((p) => [p.slug, p]));

export function getAllBlogPosts(): BlogPostMeta[] {
  return BLOG_DEFINITIONS;
}

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return SLUG_INDEX.get(slug);
}

export function getBlogPostsByCity(city: string, state: string): BlogPostMeta[] {
  const post = BLOG_DEFINITIONS.find(
    (p) => p.city.toLowerCase() === city.trim().toLowerCase() && p.state === state.trim().toUpperCase(),
  );
  return post ? [post] : [];
}

/** Related guides: other cities in the same metro or top Texas markets. */
export function getRelatedBlogPosts(slug: string, limit = 5): BlogPostMeta[] {
  const post = getBlogPost(slug);
  if (!post) return [];

  const cityConfig = BLOG_CITIES.find(
    (c) => c.city.toLowerCase() === post.city.toLowerCase() && c.state === post.state,
  );

  const others = BLOG_DEFINITIONS.filter((p) => p.slug !== post.slug);

  if (cityConfig?.metroHub) {
    const metro = others.filter(
      (p) =>
        p.city === cityConfig.metroHub!.city ||
        BLOG_CITIES.find((c) => c.city === p.city)?.metroHub?.city === cityConfig.metroHub!.city,
    );
    const rest = others.filter((p) => !metro.includes(p));
    return [...metro, ...rest].slice(0, limit);
  }

  return others.slice(0, limit);
}

export type BlogCityGroup = {
  city: BlogCity;
  posts: BlogPostMeta[];
  listingCount: number;
};

export async function getBlogCityGroups(): Promise<BlogCityGroup[]> {
  const groups: BlogCityGroup[] = [];

  for (const city of BLOG_CITIES) {
    const posts = getBlogPostsByCity(city.city, city.state);
    const businesses = await getBlogCityBusinesses(city.city, city.state);
    groups.push({
      city,
      posts,
      listingCount: businesses.length,
    });
  }

  return groups.sort((a, b) => b.listingCount - a.listingCount);
}

export async function getTopBusinessesForBlog(city: string, state = "TX", limit = 20): Promise<Business[]> {
  const [businesses, voteStore] = await Promise.all([
    getBlogCityBusinesses(city, state),
    getVotesStore(),
  ]);

  return businesses
    .sort((a, b) => {
      const scoreA = voteScoreFromStore(voteStore, a.id);
      const scoreB = voteScoreFromStore(voteStore, b.id);
      if (scoreB !== scoreA) return scoreB - scoreA;

      const ratingA = a.googleRating ?? 0;
      const ratingB = b.googleRating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;

      return (b.googleReviewCount ?? 0) - (a.googleReviewCount ?? 0);
    })
    .slice(0, limit);
}

export { getBusinessVoteStats, cityLocationSlug };
