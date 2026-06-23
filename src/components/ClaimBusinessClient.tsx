"use client";

import { useState } from "react";
import Link from "next/link";
import { BusinessAddress } from "@/components/BusinessAddress";
import { BusinessAvatar } from "@/components/BusinessMedia";
import { ClaimBusinessModal } from "@/components/ClaimBusinessModal";
import { ClaimStatusBadge } from "@/components/ClaimStatusBadge";
import { isClaimableListing } from "@/lib/claim-status";
import { OUTREACH_WHATSAPP_DISPLAY, OUTREACH_WHATSAPP_LINK } from "@/lib/site-config";
import type { Business } from "@/types/business";

type ClaimBusinessClientProps = {
  business: Business;
  requiredEmailDomain?: string;
};

export function ClaimBusinessClient({ business, requiredEmailDomain }: ClaimBusinessClientProps) {
  const [claimOpen, setClaimOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <BusinessAvatar name={business.name} logo={business.logo} size="detail" />
          <div className="min-w-0 flex-1">
            <ClaimStatusBadge
              business={business}
              className="mb-2"
              showClaimButton={isClaimableListing(business)}
              onClaimClick={() => setClaimOpen(true)}
            />
            <h1 className="text-xl font-bold text-[#111]">{business.name}</h1>
            <BusinessAddress business={business} className="mt-1 text-sm" />
            <p className="mt-2 text-sm text-[#555]">{business.category}</p>
            {business.phone && (
              <p className="mt-2 text-sm text-[#555]">
                Phone on listing: <strong>{business.phone}</strong>
              </p>
            )}
            <Link
              href={`/business/${business.id}`}
              className="mt-2 inline-block text-sm font-semibold text-[#1274c0] hover:underline"
            >
              View public listing →
            </Link>
          </div>
        </div>
      </div>

      {isClaimableListing(business) && (
        <div className="rounded border border-[#1274c0] bg-[#f0f7fd] p-5 text-sm text-[#0d5a94]">
          <p className="font-semibold text-[#111]">Verify ownership in 2 steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Enter your business domain email and receive a 6-digit OTP.</li>
            <li>Enter the OTP — your listing becomes Claimed by Owner with edit access.</li>
          </ol>
          <button
            type="button"
            onClick={() => setClaimOpen(true)}
            className="jd-btn-primary mt-4 rounded px-5 py-2.5 text-sm font-semibold"
          >
            Claim Now
          </button>
        </div>
      )}

      <div className="rounded border border-[#e8e8e8] bg-[#fafafa] p-4 text-sm text-[#555]">
        <p className="font-semibold text-[#111]">Need help?</p>
        <p className="mt-1">
          Message us on{" "}
          <a
            href={OUTREACH_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#25a244] hover:underline"
          >
            WhatsApp {OUTREACH_WHATSAPP_DISPLAY}
          </a>
        </p>
      </div>

      <ClaimBusinessModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        business={business}
        requiredEmailDomain={requiredEmailDomain}
      />
    </div>
  );
}
