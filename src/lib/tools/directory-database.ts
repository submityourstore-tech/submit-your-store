/** Known business listing / directory domains — grows as users run tools. */
export type DirectoryProfileType =
  | "business_directory"
  | "local_listing"
  | "profile_backlink"
  | "guest_post"
  | "citation"
  | "unknown";

export type DirectoryProfile = {
  domain: string;
  name: string;
  type: DirectoryProfileType;
  niches: string[];
  notes?: string;
};

export const DIRECTORY_PROFILES: DirectoryProfile[] = [
  { domain: "submityourstore.com", name: "Submit Your Store", type: "business_directory", niches: ["hvac", "local", "general"] },
  { domain: "yelp.com", name: "Yelp", type: "local_listing", niches: ["general", "hvac", "restaurant"] },
  { domain: "yellowpages.com", name: "Yellow Pages", type: "local_listing", niches: ["general", "hvac"] },
  { domain: "bbb.org", name: "Better Business Bureau", type: "citation", niches: ["general"] },
  { domain: "foursquare.com", name: "Foursquare", type: "local_listing", niches: ["general"] },
  { domain: "manta.com", name: "Manta", type: "business_directory", niches: ["general", "hvac"] },
  { domain: "angi.com", name: "Angi", type: "local_listing", niches: ["hvac", "home-services"] },
  { domain: "homeadvisor.com", name: "HomeAdvisor", type: "local_listing", niches: ["hvac", "home-services"] },
  { domain: "thumbtack.com", name: "Thumbtack", type: "local_listing", niches: ["hvac", "home-services"] },
  { domain: "mapquest.com", name: "MapQuest", type: "citation", niches: ["general"] },
  { domain: "chamberofcommerce.com", name: "Chamber of Commerce", type: "business_directory", niches: ["general", "local"] },
  { domain: "hotfrog.com", name: "Hotfrog", type: "business_directory", niches: ["general"] },
  { domain: "brownbook.net", name: "Brownbook", type: "business_directory", niches: ["general"] },
  { domain: "cylex.us", name: "Cylex", type: "business_directory", niches: ["general", "local"] },
  { domain: "merchantcircle.com", name: "MerchantCircle", type: "local_listing", niches: ["general"] },
  { domain: "birdeye.com", name: "Birdeye", type: "profile_backlink", niches: ["general"] },
  { domain: "bark.com", name: "Bark", type: "local_listing", niches: ["hvac", "home-services"] },
  { domain: "houzz.com", name: "Houzz", type: "local_listing", niches: ["home-services"] },
  { domain: "nextdoor.com", name: "Nextdoor", type: "local_listing", niches: ["general", "local"] },
  { domain: "alignable.com", name: "Alignable", type: "business_directory", niches: ["general", "local"] },
  { domain: "medium.com", name: "Medium", type: "guest_post", niches: ["general", "tech", "marketing"] },
  { domain: "linkedin.com", name: "LinkedIn", type: "profile_backlink", niches: ["general", "b2b"] },
  { domain: "facebook.com", name: "Facebook", type: "profile_backlink", niches: ["general", "local"] },
  { domain: "instagram.com", name: "Instagram", type: "profile_backlink", niches: ["general", "local"] },
];

export function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? d;
  return d.replace(/\/$/, "");
}

export function lookupDirectoryProfile(domain: string): DirectoryProfile | undefined {
  const normalized = normalizeDomain(domain);
  return DIRECTORY_PROFILES.find((p) => normalized === p.domain || normalized.endsWith(`.${p.domain}`));
}

export function guestPostSitesForNiche(niche: string): DirectoryProfile[] {
  const n = niche.trim().toLowerCase();
  return DIRECTORY_PROFILES.filter(
    (p) => p.type === "guest_post" || (p.type === "business_directory" && p.niches.includes(n)),
  );
}

/** Deterministic demo metrics from domain string (free tier — replace with Moz/Ahrefs API later). */
export function demoDomainMetrics(domain: string): {
  da: number;
  pa: number;
  domainAgeYears: number;
  indexedPages: number;
  backlinkEstimate: number;
} {
  let hash = 0;
  const d = normalizeDomain(domain);
  for (let i = 0; i < d.length; i++) hash = (hash * 31 + d.charCodeAt(i)) >>> 0;
  const da = 15 + (hash % 66);
  const pa = 12 + ((hash >> 4) % 58);
  const domainAgeYears = 1 + (hash % 18);
  const indexedPages = 50 + (hash % 9500);
  const backlinkEstimate = 10 + (hash % 4900);
  return { da, pa, domainAgeYears, indexedPages, backlinkEstimate };
}

export const TOOL_DAILY_LIMIT = 20;
