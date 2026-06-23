"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ReviewFlowModal } from "@/components/ReviewFlowModal";

type WriteReviewFormProps = {
  businessId: string;
  businessName: string;
  businessCity: string;
  businessLogo?: string;
};

export function WriteReviewForm({
  businessId,
  businessName,
  businessCity,
  businessLogo,
}: WriteReviewFormProps) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <section
        id="write-review"
        className="mt-4 rounded border border-[#25a244] bg-[#f0fdf4] p-5 shadow-sm"
      >
        <h2 className="text-base font-bold text-[#166534]">Thank you!</h2>
        <p className="mt-2 text-sm text-[#555]">
          Your review for <strong>{businessName}</strong> has been published.
        </p>
      </section>
    );
  }

  return (
    <>
      <section
        id="write-review"
        className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-bold text-[#111]">Rate this business</h2>
        <p className="mt-1 text-sm text-[#717171]">
          Share your experience. Sign in with Google or verify your email to publish your review.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="jd-btn-orange mt-4 rounded px-5 py-2.5 text-sm font-semibold"
        >
          Write a Review
        </button>
      </section>

      <ReviewFlowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        businessId={businessId}
        businessName={businessName}
        businessCity={businessCity}
        businessLogo={businessLogo}
        onSuccess={() => {
          setSuccess(true);
          void refresh();
          router.refresh();
        }}
      />
    </>
  );
}
