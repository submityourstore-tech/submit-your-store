export const SITE_NAME = "Submit Your Store";

export const SITE_TAGLINE =
  "A worldwide local business directory with verified member reviews and free business listings.";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const authUrl = process.env.AUTH_URL?.trim().replace(/\/$/, "");
  if (authUrl) return authUrl;

  if (process.env.NODE_ENV === "production") {
    return "https://www.submityourstore.com";
  }

  const vercelHost = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, "");
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}

export const SUPPORT_EMAIL = "support@submityourstore.com";

/** Default Brevo outreach sender — must be verified in Brevo dashboard */
export const OUTREACH_SENDER_EMAIL = "submityourstore@gmail.com";
export const OUTREACH_REPLY_TO_EMAIL = "submityourstore@gmail.com";

/** Site-wide WhatsApp support */
export const SITE_WHATSAPP_DISPLAY = "+91 62837 33278";
export const SITE_WHATSAPP_NUMBER = "916283733278";
export const SITE_WHATSAPP_LINK = "https://wa.me/916283733278";

/** WhatsApp shown in unclaimed outreach emails */
export const OUTREACH_WHATSAPP_DISPLAY = SITE_WHATSAPP_DISPLAY;
export const OUTREACH_WHATSAPP_LINK = SITE_WHATSAPP_LINK;

export const LEGAL_ENTITY = "Submit Your Store";

export const LAST_UPDATED_LEGAL = "June 14, 2026";

/** Editorial author for blog guides (E-E-A-T). */
export const SITE_AUTHOR = {
  name: "Navjeet Kamboj",
  role: "Founder & Local SEO Editor",
  bio: "Navjeet Kamboj builds and edits local business guides on Submit Your Store. He focuses on helpful, accurate city rankings backed by real listings, Google ratings, and community votes — not paid placements.",
  image:
    "https://media.licdn.com/dms/image/v2/D5603AQFU53xqpal5og/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1707375061524?e=2147483647&v=beta&t=bNfsBWWDsVU5NlGIEeVMHCjqsKP9uGPbTMn6LsdG_bo",
  linkedin: "https://www.linkedin.com/in/navjeet-kamboj",
} as const;
