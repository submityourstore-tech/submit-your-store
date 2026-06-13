import type { Business } from "@/types/business";

/** Strip redundant country suffix and normalize spacing for display. */
export function formatDisplayAddress(business: Pick<Business, "address" | "city" | "state">): string {
  const raw = business.address?.trim();
  if (raw) {
    return raw
      .replace(/,\s*United States\s*$/i, "")
      .replace(/,\s*USA\s*$/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  return `${business.city}, ${business.state}`;
}
