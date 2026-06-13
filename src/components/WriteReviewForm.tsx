"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { StarRatingInput } from "@/components/StarRatingInput";
import { UserAvatar } from "@/components/UserAvatar";

const PENDING_REVIEW_KEY = "sys_pending_review";

type PendingReview = {
  businessId: string;
  rating: number;
  title: string;
  body: string;
};

type WriteReviewFormProps = {
  businessId: string;
  businessName: string;
};

function savePendingReview(data: PendingReview) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_REVIEW_KEY, JSON.stringify(data));
}

function loadPendingReview(businessId: string): PendingReview | null {
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

function clearPendingReview() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_REVIEW_KEY);
}

export function WriteReviewForm({ businessId, businessName }: WriteReviewFormProps) {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingHandled = useRef(false);

  const submitReview = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        requiresAuth?: boolean;
        requiresVerified?: boolean;
      };

      if (res.status === 401 || data.requiresAuth) {
        savePendingReview({ businessId, rating, title, body });
        setAuthOpen(true);
        return;
      }

      if (res.status === 403 || data.requiresVerified) {
        savePendingReview({ businessId, rating, title, body });
        setAuthOpen(true);
        setError(data.error ?? "Verified sign-in required.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Could not submit review.");
        return;
      }

      clearPendingReview();
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [businessId, rating, title, body, router]);

  useEffect(() => {
    if (authLoading || pendingHandled.current) return;
    const pending = loadPendingReview(businessId);
    if (!pending) return;

    setRating(pending.rating);
    setTitle(pending.title);
    setBody(pending.body);

    if (user?.emailVerified && pending.rating >= 1) {
      pendingHandled.current = true;
      void submitReview();
    }
  }, [authLoading, user?.emailVerified, user?.id, businessId, submitReview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Select a rating from 1 to 5 stars.");
      return;
    }

    if (!user) {
      savePendingReview({ businessId, rating, title, body });
      setAuthOpen(true);
      return;
    }

    if (!user.emailVerified) {
      savePendingReview({ businessId, rating, title, body });
      setAuthOpen(true);
      setError("Sign in with Google, Facebook, or X to verify your account.");
      return;
    }

    await submitReview();
  }

  function stashPending() {
    if (rating >= 1) {
      savePendingReview({ businessId, rating, title, body });
    }
  }

  if (success) {
    return (
      <section
        id="write-review"
        className="mt-4 rounded border border-[#25a244] bg-[#f0fdf4] p-5 shadow-sm"
      >
        <h2 className="text-base font-bold text-[#166534]">Thank you!</h2>
        <p className="mt-2 text-sm text-[#555]">
          Your verified {rating}-star rating for <strong>{businessName}</strong> is now published
          with your profile photo.
        </p>
      </section>
    );
  }

  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.hash || "#write-review"}`
      : undefined;

  return (
    <>
      <section
        id="write-review"
        className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-bold text-[#111]">Rate this business</h2>
        <p className="mt-1 text-sm text-[#717171]">
          Sign in with Google, Facebook, or X to post a verified review. Your profile photo will
          appear on the review.
        </p>

        {user && (
          <div className="mt-3 flex items-center gap-3 rounded border border-[#e8e8e8] bg-[#fafafa] px-3 py-2">
            <UserAvatar name={user.name} image={user.image} verified={user.emailVerified} />
            <div className="text-sm">
              <p className="font-semibold text-[#333]">{user.name}</p>
              <p className="text-xs text-[#717171]">
                {user.emailVerified ? "Verified account" : "Verify with Google, Facebook, or X"}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <StarRatingInput value={rating} onChange={setRating} disabled={loading} />

          <label className="block text-sm">
            <span className="font-medium text-[#333]">Review title</span>
            <input
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your visit (optional)"
              className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-[#333]">Your review</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you like or dislike? (optional)"
              className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="jd-btn-orange rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit rating"}
          </button>
        </form>
      </section>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => void refresh()}
        callbackUrl={callbackUrl}
        onBeforeSocialRedirect={stashPending}
        message="Create an account or sign in with Google, Facebook, or X. Your profile photo will show on reviews."
      />
    </>
  );
}
