import { randomUUID } from "crypto";
import { getAllBusinesses } from "@/lib/businesses";
import {
  emailMatchesBusinessDomain,
  emailMatchesDomain,
  findBusinessByGbp,
  generateVerificationCode,
  hashValue,
  isBusinessEmail,
  isValidEmail,
  isValidGbpUrl,
  domainFromWebsite,
} from "@/lib/gbp";
import { saveVerification, findPendingVerification, updateVerificationCode } from "@/lib/listing-verification-store";
import { sendVerificationEmail } from "@/lib/email";
import type { ListingCheckResult, NewListingPayload } from "@/types/listing";

export function checkListingAvailability(gbpUrl: string): ListingCheckResult {
  const existing = findBusinessByGbp(gbpUrl, getAllBusinesses());
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

export async function startVerification(params: {
  type: "new" | "claim";
  gbpUrl: string;
  businessEmail: string;
  payload?: NewListingPayload;
  businessId?: string;
  businessName: string;
}) {
  const email = params.businessEmail.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { ok: false as const, error: "Enter a valid business email address." };
  }
  if (!isValidGbpUrl(params.gbpUrl)) {
    return { ok: false as const, error: "Enter a valid Google Business Profile (Maps) link." };
  }

  if (params.type === "new") {
    if (!isBusinessEmail(email)) {
      return {
        ok: false as const,
        error: "Use your company domain email (not Gmail, Yahoo, etc.).",
      };
    }
    const check = checkListingAvailability(params.gbpUrl);
    if (check.status === "claimable" || check.status === "published") {
      return {
        ok: false as const,
        error: "This Google Business Profile is already on Submit Your Store. Use “Claim existing listing” instead.",
      };
    }
  }

  if (params.type === "claim") {
    const existing = findBusinessByGbp(params.gbpUrl, getAllBusinesses());
    if (!existing) {
      return { ok: false as const, error: "No published listing found for this Google profile." };
    }
    if (!existing.email) {
      const webDomain = domainFromWebsite(existing.website);
      if (!webDomain) {
        return {
          ok: false as const,
          error: "This listing has no business email on file. Contact support to claim it.",
        };
      }
      if (!emailMatchesDomain(email, webDomain)) {
        return {
          ok: false as const,
          error: `Use a business email on @${webDomain} to claim this listing.`,
        };
      }
    } else if (!emailMatchesBusinessDomain(email, existing.email)) {
      return {
        ok: false as const,
        error: `Use a business email on @${existing.email.split("@")[1]} to claim this listing.`,
      };
    }
  }

  const code = generateVerificationCode();
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  saveVerification({
    id,
    type: params.type,
    businessEmail: email,
    gbpUrl: params.gbpUrl.trim(),
    businessId: params.businessId ?? null,
    codeHash: hashValue(code),
    createdAt: new Date().toISOString(),
    expiresAt,
    verifiedAt: null,
    payload: params.payload ?? null,
  });

  const sent = await sendVerificationEmail({
    to: email,
    code,
    businessName: params.businessName,
    purpose: params.type,
  });

  if (!sent.ok) {
    return {
      ok: false as const,
      error: sent.error ?? "Could not send verification email. Try again later.",
    };
  }

  return {
    ok: true as const,
    verificationId: id,
    email,
    devCode: sent.devCode,
    emailDelivery: sent.delivery,
  };
}

export async function resendVerificationCode(verificationId: string) {
  const record = findPendingVerification(verificationId);
  if (!record) {
    return { ok: false as const, error: "Verification expired or not found. Start again from the listing form." };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { ok: false as const, error: "Verification expired. Submit the form again." };
  }

  const businessName =
    record.payload?.businessName ??
    (record.businessId ? getAllBusinesses().find((b) => b.id === record.businessId)?.name : null) ??
    "your business";

  const code = generateVerificationCode();
  updateVerificationCode(record.id, hashValue(code));

  const sent = await sendVerificationEmail({
    to: record.businessEmail,
    code,
    businessName,
    purpose: record.type,
  });

  if (!sent.ok) {
    return {
      ok: false as const,
      error: sent.error ?? "Could not resend verification email.",
    };
  }

  return {
    ok: true as const,
    email: record.businessEmail,
    devCode: sent.devCode,
    emailDelivery: sent.delivery,
  };
}
