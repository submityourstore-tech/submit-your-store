import { getAllBusinesses } from "@/lib/businesses";
import {
  emailMatchesBusinessDomain,
  emailMatchesDomain,
  ensureResolvedGbpUrl,
  findBusinessByGbp,
  isBusinessEmail,
  isValidEmail,
  domainFromWebsite,
} from "@/lib/gbp";
import { emailDeliveryWarning, sendVerificationEmail } from "@/lib/email";
import { checkListingAvailability } from "@/lib/listing-check";
import { getSiteUrl } from "@/lib/site-config";
import { createVerificationToken, verifyVerificationToken } from "@/lib/verification-token";
import type { Business } from "@/types/business";
import type { NewListingPayload } from "@/types/listing";

function buildVerifyUrl(token: string): string {
  return `${getSiteUrl()}/verify-listing?token=${encodeURIComponent(token)}`;
}

type StartVerificationParams = {
  type: "new" | "claim";
  gbpUrl: string;
  businessEmail: string;
  payload?: NewListingPayload;
  businessId?: string;
  businessName: string;
};

export async function startVerification(params: StartVerificationParams) {
  const gbpResolved = await ensureResolvedGbpUrl(params.gbpUrl);
  if (!gbpResolved.ok) {
    return { ok: false as const, error: gbpResolved.error };
  }
  const gbpUrl = gbpResolved.url;
  const payload =
    params.payload && params.type === "new" ? { ...params.payload, gbpUrl } : params.payload;

  const businesses = await getAllBusinesses();

  if (params.type === "new") {
    const check = await checkListingAvailability(gbpUrl);
    if (check.status === "claimable" || check.status === "published") {
      return {
        ok: false as const,
        error:
          "This Google Business Profile is already on Submit Your Store. Use “Claim existing listing” instead.",
      };
    }
  }

  if (params.type === "claim") {
    const existing = findBusinessByGbp(gbpUrl, businesses);
    if (!existing) {
      return { ok: false as const, error: "No published listing found for this Google profile." };
    }
  }

  return startEmailVerification({
    ...params,
    gbpUrl,
    payload,
    businesses,
  });
}

async function startEmailVerification(params: {
  type: "new" | "claim";
  gbpUrl: string;
  businessEmail: string;
  payload?: NewListingPayload;
  businessId?: string;
  businessName: string;
  businesses: Business[];
}) {
  const email = params.businessEmail.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { ok: false as const, error: "Enter a valid business email address." };
  }

  if (params.type === "new") {
    if (!isBusinessEmail(email)) {
      return {
        ok: false as const,
        error: "Use your company domain email (not Gmail, Yahoo, etc.).",
      };
    }
  }

  if (params.type === "claim") {
    const existing = findBusinessByGbp(params.gbpUrl, params.businesses);
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

  const verificationId = await createVerificationToken({
    type: params.type,
    method: "email",
    businessEmail: email,
    gbpPhone: null,
    gbpUrl: params.gbpUrl,
    businessId: params.businessId ?? null,
    payload: params.payload ?? null,
    otpHash: null,
  });

  const verifyUrl = buildVerifyUrl(verificationId);

  const sent = await sendVerificationEmail({
    to: email,
    verifyUrl,
    businessName: params.businessName,
    purpose: params.type,
  });

  if (sent.ok) {
    return {
      ok: true as const,
      verificationId,
      email,
      verifyUrl: sent.devVerifyUrl ?? verifyUrl,
      devVerifyUrl: sent.devVerifyUrl ?? verifyUrl,
      emailDelivery: sent.delivery,
    };
  }

  // Email could not be delivered — user can still verify via the link on the next screen.
  return {
    ok: true as const,
    verificationId,
    email,
    verifyUrl,
    devVerifyUrl: verifyUrl,
    emailDelivery: "link" as const,
    emailWarning: emailDeliveryWarning(sent.error),
  };
}

async function businessNameForToken(
  record: {
    payload: NewListingPayload | null;
    businessId: string | null;
  },
  businesses: Business[],
): Promise<string> {
  return (
    record.payload?.businessName ??
    (record.businessId ? businesses.find((b) => b.id === record.businessId)?.name : null) ??
    "your business"
  );
}

export async function resendVerificationLink(verificationId: string) {
  const verified = await verifyVerificationToken(verificationId);
  if (!verified) {
    return {
      ok: false as const,
      error: "Verification expired or not found. Start again from the listing form.",
    };
  }

  if (verified.expired) {
    return { ok: false as const, error: "Verification expired. Submit the form again." };
  }

  const { payload: record } = verified;
  const businesses = await getAllBusinesses();
  const businessName = await businessNameForToken(record, businesses);

  const newVerificationId = await createVerificationToken({
    type: record.type,
    method: "email",
    businessEmail: record.businessEmail,
    gbpPhone: null,
    gbpUrl: record.gbpUrl,
    businessId: record.businessId,
    payload: record.payload,
    otpHash: null,
  });

  const verifyUrl = buildVerifyUrl(newVerificationId);

  const sent = await sendVerificationEmail({
    to: record.businessEmail,
    verifyUrl,
    businessName,
    purpose: record.type,
  });

  if (sent.ok) {
    return {
      ok: true as const,
      verificationId: newVerificationId,
      email: record.businessEmail,
      verifyUrl: sent.devVerifyUrl ?? verifyUrl,
      devVerifyUrl: sent.devVerifyUrl ?? verifyUrl,
      emailDelivery: sent.delivery,
    };
  }

  return {
    ok: true as const,
    verificationId: newVerificationId,
    email: record.businessEmail,
    verifyUrl,
    devVerifyUrl: verifyUrl,
    emailDelivery: "link" as const,
    emailWarning: emailDeliveryWarning(sent.error),
  };
}

export async function verifyListingToken(verificationId: string) {
  const verified = await verifyVerificationToken(verificationId);
  if (!verified) {
    return { ok: false as const, error: "Verification link is invalid or expired." };
  }

  if (verified.expired) {
    return {
      ok: false as const,
      error: "Verification link expired. Request a new one from the listing form.",
    };
  }

  return { ok: true as const, record: verified.payload };
}
