import { getPublicBusinessList } from "@/lib/businesses";
import { getBusinessVoteScore, getBusinessVoteStats } from "@/lib/business-votes.server";
import { isActiveBusiness } from "@/lib/categories-config";
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
};

const BLOG_DEFINITIONS: BlogPostMeta[] = [
  {
    slug: "best-hvac-companies-dallas",
    title: "Best HVAC Companies in Dallas 2026",
    description:
      "Compare top-rated HVAC contractors in Dallas, TX — ratings from across the web, community votes, and links to full business profiles.",
    intro:
      "Dallas summers are brutal on air conditioning systems, and winter cold snaps can push furnaces to their limit. Whether you need emergency AC repair in Uptown, a full system replacement in Plano, or routine maintenance before peak season, choosing the right HVAC contractor matters. This 2026 guide ranks the best HVAC companies in Dallas using overall web ratings, review volume, and community upvotes from Submit Your Store members — each listing links to a full profile with hours, phone, and verified customer reviews.",
    conclusion:
      "The best HVAC company for your home depends on your neighborhood, budget, and whether you need same-day emergency service or a planned installation. Use the upvote buttons to support contractors you've worked with — rankings update automatically. Always confirm licensing, insurance, and written estimates before major work, and check each company's full profile for current hours and contact details.",
    featuredImage: "/blog/dallas.webp",
    city: "Dallas",
    state: "TX",
  },
  {
    slug: "best-hvac-companies-houston",
    title: "Best HVAC Companies in Houston 2026",
    description:
      "Find the best HVAC companies in Houston, TX with verified Google ratings, community votes, and direct links to each listing profile.",
    intro:
      "Houston's Gulf Coast humidity makes reliable cooling and dehumidification essential year-round. From Katy to The Woodlands, homeowners and businesses depend on HVAC contractors who respond fast during heat emergencies and understand corrosion, coil maintenance, and high-load cooling demands. Our 2026 Houston guide lists top-rated HVAC companies sorted by community votes, overall web ratings, and review counts — with logos and profile links so you can compare before you call.",
    conclusion:
      "Houston's sprawling metro means travel time and service area coverage vary by contractor. Vote for companies you've had great experiences with to help other homeowners find trustworthy pros. For urgent no-cool situations, check each profile's business hours and 24/7 availability before calling. New listings are added regularly as we upload fresh data across the directory.",
    featuredImage: "/blog/houston.webp",
    city: "Houston",
    state: "TX",
  },
  {
    slug: "best-hvac-companies-austin",
    title: "Best HVAC Companies in Austin 2026",
    description:
      "Explore top HVAC contractors in Austin, TX — sorted by community votes, overall web ratings, and review volume with profile links for each business.",
    intro:
      "Austin's rapid growth and mixed climate — scorching summers, occasional freezes, and heavy pollen seasons — keep HVAC companies busy across Travis County and surrounding areas. This 2026 roundup highlights the best HVAC companies in Austin based on member upvotes, Google ratings aggregated across the web, and verified listing data on Submit Your Store. Each entry includes the company logo and a direct link to its full business profile.",
    conclusion:
      "Central Texas homeowners often prioritize energy efficiency, smart thermostats, and contractors who explain options clearly before recommending replacements. Use upvotes to recognize standout service and help rankings reflect real community preferences. Browse each profile for service areas, weekly hours in Central Time, and customer reviews before scheduling your next tune-up or repair.",
    featuredImage: "/blog/austin.webp",
    city: "Austin",
    state: "TX",
  },
];

export function getAllBlogPosts(): BlogPostMeta[] {
  return BLOG_DEFINITIONS;
}

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return BLOG_DEFINITIONS.find((b) => b.slug === slug);
}

export function getTopBusinessesForBlog(city: string, state = "TX", limit = 20): Business[] {
  return getPublicBusinessList({ vertical: "home-services" })
    .filter(
      (b) =>
        isActiveBusiness(b) &&
        b.city.toLowerCase() === city.toLowerCase() &&
        b.state.toUpperCase() === state.toUpperCase(),
    )
    .sort((a, b) => {
      const scoreA = getBusinessVoteScore(a.id);
      const scoreB = getBusinessVoteScore(b.id);
      if (scoreB !== scoreA) return scoreB - scoreA;

      const ratingA = a.googleRating ?? 0;
      const ratingB = b.googleRating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;

      return (b.googleReviewCount ?? 0) - (a.googleReviewCount ?? 0);
    })
    .slice(0, limit);
}

export { getBusinessVoteStats };
