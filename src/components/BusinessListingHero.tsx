"use client";

import { useEffect, useRef, useState } from "react";
import type { Business } from "@/types/business";
import { BusinessAddress } from "@/components/BusinessAddress";
import { BusinessAvatar } from "@/components/BusinessMedia";
import { OverallRatingNote } from "@/components/OverallRatingNote";
import { ReviewFlowModal, loadPendingReview, clearPendingReview } from "@/components/ReviewFlowModal";
import { useAuth } from "@/components/AuthProvider";
import { ClaimBusinessModal } from "@/components/ClaimBusinessModal";
import { ClaimStatusBadge } from "@/components/ClaimStatusBadge";
import { hasValidPhone, whatsAppUrl } from "@/lib/city-timezone";
import { isClaimableListing } from "@/lib/claim-status";
import { domainFromWebsite } from "@/lib/gbp";
import type { DisplayRating } from "@/lib/display-rating";

type BusinessListingHeroProps = {
  business: Business;
  displayRating: DisplayRating | null;
  requiredEmailDomain?: string;
};

function ClickToRateStars({ onRate }: { onRate: (stars: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="hidden shrink-0 text-center sm:block">
      <p className="text-xs font-medium text-[#717171]">Click to Rate</p>
      <div className="mt-1 flex gap-0.5" role="group" aria-label="Click to rate">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRate(star)}
            className={`text-2xl leading-none transition hover:scale-110 ${
              star <= hover ? "text-[#ff6c00]" : "text-[#ddd]"
            }`}
            aria-label={`Rate ${star} stars`}
          >
            ☆
          </button>
        ))}
      </div>
    </div>
  );
}

export function BusinessListingHero({
  business,
  displayRating,
  requiredEmailDomain,
}: BusinessListingHeroProps) {
  const { user, refresh } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [initialRating, setInitialRating] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const pendingHandled = useRef(false);

  const emailDomain =
    requiredEmailDomain ??
    (business.email?.includes("@") ? business.email.split("@")[1]?.toLowerCase() : undefined) ??
    domainFromWebsite(business.website) ??
    undefined;

  useEffect(() => {
    if (pendingHandled.current || !user?.emailVerified) return;
    const pending = loadPendingReview(business.id);
    if (!pending || pending.rating < 1) return;
    pendingHandled.current = true;
    setInitialRating(pending.rating);
    setModalOpen(true);
    void (async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: pending.businessId,
          rating: pending.rating,
          body: pending.body.trim() || undefined,
        }),
      });
      if (res.ok) {
        clearPendingReview();
        await refresh();
      }
    })();
  }, [business.id, user?.emailVerified, refresh]);

  function openReview(stars: number) {
    setInitialRating(stars);
    setModalOpen(true);
  }

  const hoursOpen =
    business.hoursStatus?.toLowerCase().includes("open 24") ||
    business.hoursStatus?.toLowerCase().startsWith("open");

  return (
    <>
      <header className="rounded border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <BusinessAvatar name={business.name} logo={business.logo} size="detail" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-3">
                  {displayRating && displayRating.count > 0 && (
                    <OverallRatingNote displayRating={displayRating} compact />
                  )}
                  <span className="rounded border border-[#e8e8e8] bg-[#fafafa] px-2 py-0.5 text-xs font-medium text-[#555]">
                    {business.category}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl font-bold text-[#111] sm:text-2xl">{business.name}</h1>
                <ClaimStatusBadge
                  business={business}
                  className="mt-2"
                  showClaimButton={isClaimableListing(business)}
                  onClaimClick={() => setClaimOpen(true)}
                />
                <BusinessAddress business={business} className="mt-1 text-sm" />
                {business.hoursStatus && (
                  <p
                    className={`mt-1.5 text-sm font-semibold ${
                      hoursOpen ? "text-[#25a244]" : "text-[#717171]"
                    }`}
                  >
                    {business.hoursStatus}
                  </p>
                )}
              </div>
              <ClickToRateStars onRate={openReview} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eee] pt-4">
          {hasValidPhone(business.phone) &&
            (showPhone ? (
              <a
                href={`tel:${business.phone}`}
                className="jd-btn-call inline-flex items-center gap-1.5 rounded px-5 py-2.5 text-sm font-semibold"
              >
                📞 {business.phone}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhone(true)}
                className="jd-btn-call inline-flex items-center gap-1.5 rounded px-5 py-2.5 text-sm font-semibold"
              >
                📞 Show Number
              </button>
            ))}
          {hasValidPhone(business.phone) && (
            <a
              href={whatsAppUrl(business.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded border border-[#25a244] px-4 py-2.5 text-sm font-semibold text-[#25a244] hover:bg-[#f0fdf4]"
            >
              💬 WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => openReview(0)}
            className="jd-btn-orange inline-flex items-center rounded px-5 py-2.5 text-sm font-semibold sm:hidden"
          >
            Rate & Review
          </button>
          <button
            type="button"
            onClick={() => openReview(0)}
            className="hidden items-center rounded border border-[#1274c0] px-4 py-2.5 text-sm font-semibold text-[#1274c0] hover:bg-[#f0f7fd] sm:inline-flex"
          >
            Write a Review
          </button>
          {isClaimableListing(business) && (
            <button
              type="button"
              onClick={() => setClaimOpen(true)}
              className="inline-flex items-center rounded border border-[#f59e0b] bg-[#fffbeb] px-4 py-2.5 text-sm font-semibold text-[#b45309] hover:bg-[#fef3c7]"
            >
              Claim Now
            </button>
          )}
        </div>
      </header>

      <ClaimBusinessModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        business={business}
        requiredEmailDomain={emailDomain}
      />

      <ReviewFlowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        businessId={business.id}
        businessName={business.name}
        businessCity={business.city}
        businessLogo={business.logo}
        initialRating={initialRating}
      />
    </>
  );
}
