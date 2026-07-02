import type { BlogCity } from "@/lib/blog-cities";

export type BlogContentSection = {
  id: string;
  heading: string;
  body: string;
};

const YEAR = "2026";

export function buildCityGuideContent(city: BlogCity): {
  title: string;
  description: string;
  intro: string;
  conclusion: string;
  rankingHeading: string;
  sections: BlogContentSection[];
} {
  const { city: name, state } = city;

  return {
    title: `Best HVAC Companies in ${name}, ${state} (${YEAR}): Repair, Replacement & Commercial`,
    description: `Compare the best HVAC companies in ${name}, ${state} for AC repair, system replacement, residential service, and commercial emergency HVAC — ranked by ratings, reviews, and community votes.`,
    intro: `${name} homeowners and businesses face ${city.climateNote}. This ${YEAR} guide is a single, updated resource for finding trusted HVAC contractors in ${name}, ${state} — whether you need same-day AC repair, a full system replacement, residential maintenance, or commercial emergency service. Rankings below use community votes on Submit Your Store, Google ratings, and review volume. Each company links to a full profile with phone, hours, and customer reviews.`,
    rankingHeading: `Top-rated HVAC companies in ${name}, ${state}`,
    sections: [
      {
        id: "how-we-rank",
        heading: `How we rank HVAC companies in ${name}`,
        body: `Listings are sorted by community upvotes first, then overall Google rating, then review count. We do not accept payment for placement. Contractors must have an active profile in ${name}, ${state} with verifiable contact details. Rankings refresh as new listings are added and members vote.`,
      },
      {
        id: "hvac-repair",
        heading: `HVAC repair in ${name}, ${state}`,
        body: `When your AC stops cooling or your furnace fails in ${name}, look for licensed contractors who offer clear diagnostic fees, same-day availability where possible, and written repair estimates. Common jobs include refrigerant leaks, capacitor and compressor issues, thermostat problems, and airflow restrictions. The ranked list below includes ${name} repair specialists — check each profile for hours, service area, and recent customer feedback before you call.`,
      },
      {
        id: "system-replacement",
        heading: `AC and furnace system replacement in ${name}`,
        body: `Replacing an aging system in ${name} is a major investment. Ask for a Manual J load calculation, permit compliance, SEER2 efficiency options, and a written warranty. Get at least two in-home estimates and compare financing terms. The contractors ranked below serve ${name} homeowners and businesses for full system installs — use their profiles to compare experience and reviews before signing.`,
      },
      {
        id: "residential",
        heading: `Residential HVAC service in ${name}`,
        body: `Homeowners in ${name} should prioritize contractors who explain repair-versus-replace options honestly, offer annual maintenance plans, and show up within the promised window. Residential work includes tune-ups, filter changes, duct issues, and indoor air quality add-ons. Use the rankings below to find residential HVAC pros with strong local reviews in ${name}, ${state}.`,
      },
      {
        id: "commercial",
        heading: `Commercial HVAC and emergency service in ${name}`,
        body: `Businesses in ${name} need contractors who handle rooftop units, after-hours emergencies, and preventive maintenance contracts. Commercial jobs often require higher liability coverage and faster response SLAs. If you manage an office, retail, or light industrial property in ${name}, confirm 24/7 availability and commercial licensing before an outage happens — the ranked companies below include profiles you can compare in advance.`,
      },
      {
        id: "choosing",
        heading: `How to choose an HVAC contractor in ${name}`,
        body: `Verify Texas licensing and insurance, get written estimates, and read recent reviews on each company's profile. Avoid pressure to replace when a repair is sufficient. For local service, browse listings by neighborhood on Submit Your Store — you do not need a separate "near me" page; profiles show phone, address, and service area so you can contact a nearby contractor directly.`,
      },
    ],
    conclusion: `The best HVAC company in ${name} depends on your situation — emergency repair, planned replacement, residential maintenance, or commercial service. Use the rankings below, read full profiles, and vote for contractors you've worked with so other ${name} residents benefit. Always confirm licensing, insurance, and written estimates before major work.`,
  };
}

/** Old per-keyword slugs that now redirect to the main city guide (Google: avoid thin duplicate pages). */
export const REMOVED_TOPIC_SLUG_PARTS = [
  "best-hvac-companies-for-system-replacement",
  "commercial-hvac-emergency-service-company",
  "commercial-hvac-service-company-near-me",
  "hvac-repair-service-company",
  "residential-hvac-service-companies",
  "residential-hvac-service-companies-near-me",
] as const;
