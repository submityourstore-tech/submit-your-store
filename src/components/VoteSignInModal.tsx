"use client";

import { useEffect } from "react";
import { AuthForms } from "@/components/AuthForms";
import type { VoteChoice } from "@/lib/business-votes.server";
import { savePendingVote } from "@/lib/pending-vote-client";
import type { PublicUser } from "@/types/user";

type VoteSignInModalProps = {
  open: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  pendingChoice?: VoteChoice | null;
  onSignedIn?: () => void;
};

export function VoteSignInModal({
  open,
  onClose,
  businessId,
  businessName,
  pendingChoice,
  onSignedIn,
}: VoteSignInModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleBeforeSocialRedirect() {
    if (pendingChoice) savePendingVote(businessId, pendingChoice);
  }

  function handleSuccess(_user: PublicUser) {
    onSignedIn?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close sign in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vote-signin-title"
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-xl sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded p-1 text-[#999] hover:bg-[#f5f5f5] hover:text-[#333]"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 id="vote-signin-title" className="pr-8 text-lg font-bold text-[#111]">
          Sign in to vote
        </h2>
        <p className="mt-1 text-sm text-[#717171]">
          Vote for <span className="font-semibold text-[#333]">{businessName}</span> — sign in with Google or email.
        </p>
        <div className="mt-5">
          <AuthForms
            callbackUrl={typeof window !== "undefined" ? window.location.href : "/"}
            onBeforeSocialRedirect={handleBeforeSocialRedirect}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
