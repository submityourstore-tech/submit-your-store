"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForms } from "@/components/AuthForms";
import { BusinessAvatar } from "@/components/BusinessMedia";
import { useAuth } from "@/components/AuthProvider";

const PENDING_REVIEW_KEY = "sys_pending_review";

export type PendingReview = {
  businessId: string;
  rating: number;
  title: string;
  body: string;
};

type ReviewFlowModalProps = {
  open: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  businessCity: string;
  businessLogo?: string;
  initialRating?: number;
  onSuccess?: () => void;
};

type Step = "review" | "account";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const RATING_EMOJI = ["", "😞", "😐", "🙂", "😊", "😍"];

export function savePendingReview(data: PendingReview) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_REVIEW_KEY, JSON.stringify(data));
}

export function loadPendingReview(businessId: string): PendingReview | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_REVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingReview;
    return parsed.businessId === businessId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingReview() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_REVIEW_KEY);
}

function ModalShell({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-2xl leading-none text-[#999] hover:text-[#333]"
          aria-label="Close dialog"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function ReviewFlowModal({
  open,
  onClose,
  businessId,
  businessName,
  businessCity,
  businessLogo,
  initialRating = 0,
  onSuccess,
}: ReviewFlowModalProps) {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState<Step>("review");
  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("review");
      setRating(initialRating > 0 ? initialRating : 0);
      setError("");
    }
  }, [open, initialRating]);

  const submitReview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          rating,
          body: body.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; requiresAuth?: boolean; requiresVerified?: boolean };

      if (res.status === 401 || res.status === 403 || data.requiresAuth || data.requiresVerified) {
        savePendingReview({ businessId, rating, title: "", body });
        setStep("account");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Could not submit review.");
        return;
      }

      clearPendingReview();
      onSuccess?.();
      await refresh();
      router.refresh();
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [businessId, rating, body, onClose, onSuccess, refresh, router]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Select a rating from 1 to 5 stars.");
      return;
    }
    savePendingReview({ businessId, rating, title: "", body });

    if (user?.emailVerified) {
      await submitReview();
      return;
    }

    setStep("account");
  }

  async function handleSignedIn() {
    await refresh();
    await submitReview();
  }

  if (step === "review") {
    return (
      <ModalShell open={open} onClose={onClose} wide>
        <div className="border-b border-[#eee] px-6 py-4">
          <h2 className="text-xl font-bold text-[#111]">Write Review</h2>
        </div>
        <form onSubmit={handleReviewSubmit} className="grid gap-0 md:grid-cols-[220px_1fr]">
          <div className="border-b border-[#eee] bg-[#fafafa] p-6 md:border-b-0 md:border-r">
            <BusinessAvatar name={businessName} logo={businessLogo} size="detail" />
            <p className="mt-3 font-bold text-[#111]">{businessName}</p>
            <p className="text-sm text-[#717171]">{businessCity}</p>
            <p className="mt-4 text-sm font-medium text-[#333]">How would you rate your experience?</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md text-lg transition ${
                    star <= rating
                      ? "bg-[#ff6c00] text-white shadow-sm"
                      : "bg-[#f0f0f0] text-[#ccc]"
                  }`}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="jd-rating-pill mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold">
                {RATING_LABELS[rating]} {RATING_EMOJI[rating]}
              </span>
            )}
          </div>
          <div className="p-6">
            <label className="block text-sm font-semibold text-[#333]">
              Tell us about your experience
              <textarea
                rows={5}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Please share your experience with the business. Things you can talk about: service, product and price."
                className="mt-2 w-full rounded-lg border border-[#ddd] px-3 py-2.5 text-sm"
              />
            </label>
            <div className="mt-4">
              <span className="text-sm font-semibold text-[#333]">Upload Photos</span>
              <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-[#1274c0] text-2xl text-[#1274c0]">
                📷+
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="jd-btn-primary rounded-lg px-8 py-2.5 text-sm font-bold disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        </form>
      </ModalShell>
    );
  }

  if (step === "account") {
    return (
      <ModalShell open={open} onClose={onClose}>
        <div className="p-6 pt-8">
          <div className="flex items-center gap-3 border-b border-[#eee] pb-4">
            <span className="text-lg font-bold text-[#1274c0]">Submit Your Store</span>
            <span className="h-6 w-px bg-[#ddd]" />
            <div>
              <p className="font-bold text-[#111]">Welcome</p>
              <p className="text-xs text-[#717171]">Login for a seamless experience</p>
            </div>
          </div>

          <div className="mt-5">
            <AuthForms
              callbackUrl={
                typeof window !== "undefined"
                  ? `${window.location.pathname}${window.location.hash || ""}`
                  : "/"
              }
              onBeforeSocialRedirect={() => savePendingReview({ businessId, rating, title: "", body })}
              onSuccess={() => void handleSignedIn()}
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="button" onClick={onClose} className="mt-4 w-full text-center text-sm text-[#717171]">
            Maybe Later
          </button>
        </div>
      </ModalShell>
    );
  }

  return null;
}
