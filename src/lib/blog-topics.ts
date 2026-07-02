import type { BlogCity } from "@/lib/blog-cities";
import { cityLocationSlug } from "@/lib/blog-cities";

export type BlogTopic = {
  id: string;
  slugPart: string;
  title: (city: string, state: string) => string;
  description: (city: string, state: string) => string;
  intro: (ctx: BlogCity) => string;
  conclusion: (ctx: BlogCity) => string;
  rankingHeading: (city: string, state: string) => string;
};

const YEAR = "2026";

export const BLOG_TOPICS: BlogTopic[] = [
  {
    id: "best-hvac-companies",
    slugPart: "best-hvac-companies",
    title: (city, state) => `Best HVAC Companies in ${city}, ${state} ${YEAR}`,
    description: (city, state) =>
      `Compare the best HVAC companies in ${city}, ${state} — ranked by community votes, Google ratings, and review volume with links to full profiles.`,
    intro: (ctx) =>
      `${ctx.city} homeowners and property managers deal with ${ctx.climateNote}. This ${YEAR} guide ranks the best HVAC companies in ${ctx.city}, ${ctx.state} using community upvotes on Submit Your Store, overall Google ratings, and review counts. Each listing links to a full profile with phone, hours, and customer reviews so you can compare contractors before you call.`,
    conclusion: (ctx) =>
      `The right HVAC company in ${ctx.city} depends on whether you need emergency repair, a planned replacement, or routine maintenance. Vote for contractors you've worked with to help rankings reflect real community experience. Always confirm licensing, insurance, and written estimates before major work.`,
    rankingHeading: (city, state) => `Top-rated HVAC companies in ${city}, ${state}`,
  },
  {
    id: "hvac-system-replacement",
    slugPart: "best-hvac-companies-for-system-replacement",
    title: (city, state) => `Best HVAC Companies for System Replacement in ${city}, ${state}`,
    description: (city, state) =>
      `Find the best HVAC companies for system replacement in ${city}, ${state} — AC and furnace install pros ranked by ratings, reviews, and community votes.`,
    intro: (ctx) =>
      `Replacing an aging AC unit or furnace in ${ctx.city} is a major investment — especially with ${ctx.climateNote}. This guide highlights the best HVAC companies for system replacement in ${ctx.city}, ${ctx.state}, ranked by community votes, Google ratings, and review volume. Compare load calculations, warranty terms, and financing options on each company's full profile before scheduling an in-home estimate.`,
    conclusion: (ctx) =>
      `System replacement in ${ctx.city} should include a proper Manual J load calculation, permit compliance, and a written warranty. Get at least two estimates, ask about SEER2 efficiency ratings, and check each contractor's profile for recent customer feedback before signing.`,
    rankingHeading: (city, state) => `Best HVAC companies for system replacement in ${city}, ${state}`,
  },
  {
    id: "commercial-hvac-emergency",
    slugPart: "commercial-hvac-emergency-service-company",
    title: (city, state) => `Commercial HVAC Emergency Service Company in ${city}, ${state}`,
    description: (city, state) =>
      `Need a commercial HVAC emergency service company in ${city}, ${state}? Compare top-rated contractors for urgent cooling and heating repairs.`,
    intro: (ctx) =>
      `When a rooftop unit fails or a building loses cooling in ${ctx.city}, every hour counts. This ${YEAR} list ranks commercial HVAC emergency service companies in ${ctx.city}, ${ctx.state} by community votes, Google ratings, and review volume. ${ctx.city} businesses face ${ctx.climateNote} — use the profiles below to find contractors who handle after-hours commercial calls, RTU repairs, and urgent no-cool situations.`,
    conclusion: (ctx) =>
      `For commercial HVAC emergencies in ${ctx.city}, confirm 24/7 availability, response time to your zip code, and whether the company carries commercial liability insurance. Keep a backup contractor on file before peak summer season hits.`,
    rankingHeading: (city, state) => `Top commercial HVAC emergency service companies in ${city}, ${state}`,
  },
  {
    id: "commercial-hvac-near-me",
    slugPart: "commercial-hvac-service-company-near-me",
    title: (city, state) => `Commercial HVAC Service Company Near Me in ${city}, ${state}`,
    description: (city, state) =>
      `Search commercial HVAC service companies near you in ${city}, ${state} — maintenance, repair, and install pros ranked by local ratings and votes.`,
    intro: (ctx) =>
      `Searching for a commercial HVAC service company near me in ${ctx.city}, ${ctx.state}? This local guide ranks contractors serving ${ctx.city} office buildings, retail spaces, and light industrial properties. Rankings combine Submit Your Store community votes with Google ratings and review counts — each company links to a profile with phone, service area, and hours.`,
    conclusion: (ctx) =>
      `Commercial HVAC maintenance contracts in ${ctx.city} can prevent costly downtime. Ask about preventive maintenance plans, filter schedules, and whether technicians are EPA-certified for commercial refrigerant work.`,
    rankingHeading: (city, state) => `Commercial HVAC service companies near you in ${city}, ${state}`,
  },
  {
    id: "hvac-repair",
    slugPart: "hvac-repair-service-company",
    title: (city, state) => `HVAC Repair Service Company in ${city}, ${state}`,
    description: (city, state) =>
      `Find a trusted HVAC repair service company in ${city}, ${state} — AC and heating repair pros ranked by ratings, reviews, and community votes.`,
    intro: (ctx) =>
      `A broken AC or furnace in ${ctx.city} cannot wait — especially with ${ctx.climateNote}. This guide lists the top HVAC repair service companies in ${ctx.city}, ${ctx.state}, sorted by community upvotes, Google ratings, and review volume. Whether you need same-day AC repair, refrigerant leak diagnosis, or thermostat troubleshooting, each profile below includes phone, hours, and customer reviews.`,
    conclusion: (ctx) =>
      `Before hiring an HVAC repair service company in ${ctx.city}, ask about diagnostic fees, same-day availability, and parts warranty. Vote for contractors who fixed your system right the first time — rankings update automatically.`,
    rankingHeading: (city, state) => `Top HVAC repair service companies in ${city}, ${state}`,
  },
  {
    id: "residential-hvac",
    slugPart: "residential-hvac-service-companies",
    title: (city, state) => `Residential HVAC Service Companies in ${city}, ${state}`,
    description: (city, state) =>
      `Compare residential HVAC service companies in ${city}, ${state} — home AC, heating, and maintenance pros ranked by local ratings and votes.`,
    intro: (ctx) =>
      `Homeowners in ${ctx.city} need residential HVAC contractors who show up on time, explain options clearly, and stand behind their work. This ${YEAR} roundup ranks residential HVAC service companies in ${ctx.city}, ${ctx.state} using community votes, Google ratings, and review counts from across the web. Each listing includes a logo and link to the full business profile.`,
    conclusion: (ctx) =>
      `Residential HVAC service in ${ctx.city} should include annual tune-ups, filter changes, and honest advice on repair vs. replace. Compare at least two companies and check each profile for service area coverage in your neighborhood.`,
    rankingHeading: (city, state) => `Best residential HVAC service companies in ${city}, ${state}`,
  },
  {
    id: "residential-hvac-near-me",
    slugPart: "residential-hvac-service-companies-near-me",
    title: (city, state) => `Residential HVAC Service Companies Near Me in ${city}, ${state}`,
    description: (city, state) =>
      `Find residential HVAC service companies near me in ${city}, ${state} — local home AC and heating pros ranked by ratings, reviews, and votes.`,
    intro: (ctx) =>
      `Looking for residential HVAC service companies near me in ${ctx.city}, ${ctx.state}? This local guide ranks contractors serving ${ctx.city} neighborhoods, sorted by Submit Your Store community votes, Google ratings, and review volume. ${ctx.city} residents face ${ctx.climateNote} — use the ranked list below to find a nearby pro with verified contact details and customer reviews.`,
    conclusion: (ctx) =>
      `When searching "residential HVAC near me" in ${ctx.city}, prioritize contractors with strong recent reviews, clear pricing, and fast response in your zip code. Upvote companies you've hired to help other homeowners find trustworthy service.`,
    rankingHeading: (city, state) => `Residential HVAC service companies near you in ${city}, ${state}`,
  },
];

export function blogSlugFor(city: BlogCity, topic: BlogTopic): string {
  return `${topic.slugPart}-in-${cityLocationSlug(city)}`;
}
