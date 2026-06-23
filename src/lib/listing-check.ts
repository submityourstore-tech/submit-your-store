import { getAllBusinesses } from "@/lib/businesses";
import { domainFromWebsite, findBusinessByGbp } from "@/lib/gbp";
import type { ListingCheckResult } from "@/types/listing";

export async function checkListingAvailability(gbpUrl: string): Promise<ListingCheckResult> {
  const existing = findBusinessByGbp(gbpUrl, await getAllBusinesses());
  if (!existing) return { status: "available" };

  if (!existing.email) {
    const webDomain = domainFromWebsite(existing.website);
    if (webDomain) {
      return {
        status: "claimable",
        businessId: existing.id,
        businessName: existing.name,
        requiredEmailDomain: webDomain,
      };
    }
    return {
      status: "published",
      businessId: existing.id,
      businessName: existing.name,
    };
  }

  const domain = existing.email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return {
      status: "published",
      businessId: existing.id,
      businessName: existing.name,
    };
  }

  return {
    status: "claimable",
    businessId: existing.id,
    businessName: existing.name,
    requiredEmailDomain: domain,
  };
}
