export type PrefillSource =
  | "existing"
  | "gbp-places"
  | "gbp-playwright"
  | "gbp-scrape"
  | "gbp-coords"
  | "gbp-name"
  | "gbp-name-only";

export function prefillSourceMessage(source?: PrefillSource): string {
  switch (source) {
    case "gbp-places":
      return "Address fetched from your Google Business Profile.";
    case "gbp-playwright":
      return "Address loaded from your Google Business Profile page.";
    case "gbp-scrape":
      return "Address scraped from your Google Business Profile link.";
    case "gbp-coords":
      return "Address estimated from your Google pin — please confirm street number if needed.";
    case "existing":
      return "Loaded from your existing listing on Submit Your Store.";
    case "gbp-name":
      return "Address matched from business name — please confirm.";
    default:
      return "";
  }
}
