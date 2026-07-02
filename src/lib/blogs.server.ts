import { BLOG_CITIES } from "@/lib/blog-cities";
import { getBlogCityBusinesses } from "@/lib/blog-businesses.server";
import { BLOG_TOPICS, blogSlugFor, type BlogTopic } from "@/lib/blog-topics";
import { getBusinessVoteStats, getVotesStore, voteScoreFromStore } from "@/lib/business-votes.server";
import type { BlogCity } from "@/lib/blog-cities";
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
  topicId: string;
  rankingHeading: string;
};

/** Legacy slugs kept for existing indexed URLs. */
const LEGACY_SLUG_ALIASES: Record<string, string> = {
  "best-hvac-companies-dallas": "best-hvac-companies-in-dallas-tx",
  "best-hvac-companies-houston": "best-hvac-companies-in-houston-tx",
  "best-hvac-companies-austin": "best-hvac-companies-in-austin-tx",
};

function buildBlogPost(city: BlogCity, topic: BlogTopic): BlogPostMeta {
  return {
    slug: blogSlugFor(city, topic),
    title: topic.title(city.city, city.state),
    description: topic.description(city.city, city.state),
    intro: topic.intro(city),
    conclusion: topic.conclusion(city),
    featuredImage: city.featuredImage,
    city: city.city,
    state: city.state,
    topicId: topic.id,
    rankingHeading: topic.rankingHeading(city.city, city.state),
  };
}

function buildAllDefinitions(): BlogPostMeta[] {
  const posts: BlogPostMeta[] = [];
  for (const city of BLOG_CITIES) {
    for (const topic of BLOG_TOPICS) {
      posts.push(buildBlogPost(city, topic));
    }
  }
  return posts;
}

const BLOG_DEFINITIONS = buildAllDefinitions();

export function getAllBlogPosts(): BlogPostMeta[] {
  return BLOG_DEFINITIONS;
}

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  const resolved = LEGACY_SLUG_ALIASES[slug] ?? slug;
  return BLOG_DEFINITIONS.find((b) => b.slug === resolved);
}

export function getBlogPostsByCity(city: string, state: string): BlogPostMeta[] {
  return BLOG_DEFINITIONS.filter(
    (p) => p.city.toLowerCase() === city.trim().toLowerCase() && p.state === state.trim().toUpperCase(),
  );
}

export function getRelatedBlogPosts(slug: string, limit = 6): BlogPostMeta[] {
  const post = getBlogPost(slug);
  if (!post) return [];

  const sameCity = getBlogPostsByCity(post.city, post.state).filter((p) => p.slug !== post.slug);

  const cityConfig = BLOG_CITIES.find(
    (c) => c.city.toLowerCase() === post.city.toLowerCase() && c.state === post.state,
  );

  const metroPosts =
    cityConfig?.metroHub && cityConfig.metro
      ? getBlogPostsByCity(cityConfig.metroHub.city, cityConfig.metroHub.state)
          .filter((p) => p.topicId === post.topicId)
          .slice(0, 2)
      : [];

  const combined = [...sameCity, ...metroPosts];
  const seen = new Set<string>();
  const unique: BlogPostMeta[] = [];
  for (const p of combined) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    unique.push(p);
  }
  return unique.slice(0, limit);
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

export { getBusinessVoteStats };
