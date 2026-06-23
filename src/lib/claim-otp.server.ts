import { getBusinessById } from "@/lib/businesses";
import {
  domainFromWebsite,
  emailMatchesBusinessDomain,
  emailMatchesDomain,
  isBusinessEmail,
  isValidEmail,
} from "@/lib/gbp";
import { isClaimableListing } from "@/lib/claim-status";
import type { Business } from "@/types/business";

export function validateClaimBusinessEmail(
  business: Business,
  emailRaw: string,
): { ok: true; email: string } | { ok: false; error: string } {
  const email = emailRaw.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid business email address." };
  }

  if (!isBusinessEmail(email)) {
    return {
      ok: false,
      error: "Use your company domain email (not Gmail, Yahoo, etc.).",
    };
  }

  if (!isClaimableListing(business)) {
    return { ok: false, error: "This listing is already claimed by the owner." };
  }

  if (!business.email?.trim()) {
    const webDomain = domainFromWebsite(business.website);
    if (!webDomain) {
      return {
        ok: false,
        error: "Enter an email on your business website domain to verify ownership.",
      };
    }
    if (!emailMatchesDomain(email, webDomain)) {
      return {
        ok: false,
        error: `Use a business email on @${webDomain} to claim this listing.`,
      };
    }
  } else if (!emailMatchesBusinessDomain(email, business.email)) {
    const domain = business.email.split("@")[1];
    return {
      ok: false,
      error: `Use a business email on @${domain} to claim this listing.`,
    };
  }

  return { ok: true, email };
}

export async function getClaimableBusiness(
  businessId: string,
): Promise<{ ok: true; business: Business } | { ok: false; error: string }> {
  const business = await getBusinessById(businessId);
  if (!business || business.status === "hidden") {
    return { ok: false, error: "Business not found." };
  }
  if (!isClaimableListing(business)) {
    return { ok: false, error: "This listing is already claimed by the owner." };
  }
  return { ok: true, business };
}

export function requiredEmailDomainForBusiness(business: Business): string | undefined {
  if (business.email?.includes("@")) {
    return business.email.split("@")[1]?.toLowerCase();
  }
  return domainFromWebsite(business.website) ?? undefined;
}
