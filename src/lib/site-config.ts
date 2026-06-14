export const SITE_NAME = "Submit Your Store";

export const SITE_TAGLINE =
  "A worldwide local business directory with verified member reviews and free business listings.";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://submityourstore.com").replace(/\/$/, "");
}

export const SUPPORT_EMAIL = "support@submityourstore.com";

export const LEGAL_ENTITY = "Submit Your Store";

export const LAST_UPDATED_LEGAL = "June 14, 2026";
