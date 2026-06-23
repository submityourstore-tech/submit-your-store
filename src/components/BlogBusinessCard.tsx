"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BusinessAvatar } from "@/components/BusinessMedia";
import { RatingBadge } from "@/components/RatingBadge";
import { VoteSignInModal } from "@/components/VoteSignInModal";
import { ArrowDownIcon, ArrowUpIcon, VoteStatsDisplay } from "@/components/VoteStatsDisplay";
import { useAuth } from "@/components/AuthProvider";
import { formatRatingCount } from "@/lib/display-rating";
import {
  clearPendingVote,
  loadPendingVote,
  savePendingVote,
} from "@/lib/pending-vote-client";
import type { VoteChoice } from "@/lib/business-votes.server";
import type { Business } from "@/types/business";

const DESC_LIMIT = 420;

type BlogBusinessCardProps = {
  business: Business;
  rank: number;
  city: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: VoteChoice | null;
};

export function BlogBusinessCard({
  business,
  rank,
  city,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
}: BlogBusinessCardProps) {
  const { user, refresh } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteChoice | null>(initialUserVote);
  const [pending, setPending] = useState<VoteChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const hasVoted = !!userVote;
  const selected = hasVoted ? userVote : pending;
  const profileHref = `/business/${business.id}`;
  const truncated = business.description.length > DESC_LIMIT;
  const preview = truncated
    ? business.description.slice(0, DESC_LIMIT).trimEnd()
    : business.description;

  const submitVote = useCallback(
    async (choice: VoteChoice) => {
      if (!user || hasVoted) return false;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/business-votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: business.id, choice }),
        });
        const data = (await res.json()) as {
          error?: string;
          upvotes?: number;
          downvotes?: number;
        };
        if (!res.ok) {
          setError(data.error ?? "Could not record your vote.");
          return false;
        }
        setUpvotes(data.upvotes ?? upvotes);
        setDownvotes(data.downvotes ?? downvotes);
        setUserVote(choice);
        setPending(null);
        clearPendingVote();
        return true;
      } catch {
        setError("Could not record your vote. Try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [business.id, hasVoted, upvotes, downvotes, user],
  );

  useEffect(() => {
    if (!user || hasVoted) return;
    const stored = loadPendingVote(business.id);
    if (!stored) return;
    setPending(stored.choice);
    void (async () => {
      const ok = await submitVote(stored.choice);
      if (ok) clearPendingVote();
    })();
  }, [user, hasVoted, business.id, submitVote]);

  function requireAuth(choice: VoteChoice) {
    if (hasVoted || loading) return;
    if (!user) {
      setPending(choice);
      savePendingVote(business.id, choice);
      setSignInOpen(true);
      return;
    }
    setPending(choice);
    setError(null);
  }

  function handleSubmitClick() {
    if (hasVoted) return;
    if (!pending) {
      setError("Select upvote or downvote on the left first.");
      return;
    }
    if (!user) {
      savePendingVote(business.id, pending);
      setSignInOpen(true);
      return;
    }
    void submitVote(pending);
  }

  async function handleSignedIn() {
    await refresh();
    setSignInOpen(false);
  }

  const upSelected = selected === "up";
  const downSelected = selected === "down";

  return (
    <>
      <li className="flex overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-sm">
        {/* Left: rank + vote counts only */}
        <div className="flex w-[100px] shrink-0 flex-col border-r border-[#e8e8e8] bg-gradient-to-b from-[#f5f9fd] to-white px-2 py-3 sm:w-[110px]">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#999]">Rank</span>
            <span
              className="mt-0.5 select-none text-5xl font-black leading-none text-[#1274c0] sm:text-[3.25rem]"
              aria-label={`Rank ${rank}`}
            >
              {rank}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-[#e0e0e0] pt-3">
            <button
              type="button"
              disabled={loading || hasVoted}
              onClick={() => requireAuth("up")}
              className={`flex w-full flex-col items-center rounded-lg border-2 px-1 py-2 transition disabled:cursor-not-allowed ${
                upSelected
                  ? "border-[#25a244] bg-[#e8f8ec] text-[#25a244] shadow-sm"
                  : "border-[#c8ecd4] bg-[#f0fdf4] text-[#25a244] hover:border-[#25a244] hover:bg-[#dcfce7]"
              } ${hasVoted && !upSelected ? "opacity-45" : ""}`}
              aria-pressed={upSelected}
            >
              <ArrowUpIcon className="h-5 w-5" />
              <span className="mt-0.5 text-[11px] font-bold tabular-nums">{upvotes.toLocaleString()}</span>
              <span className="text-[9px] font-semibold">Upvote</span>
            </button>

            <button
              type="button"
              disabled={loading || hasVoted}
              onClick={() => requireAuth("down")}
              className={`flex w-full flex-col items-center rounded-lg border-2 px-1 py-2 transition disabled:cursor-not-allowed ${
                downSelected
                  ? "border-[#c0392b] bg-[#fdf0ef] text-[#c0392b] shadow-sm"
                  : "border-[#f5c6c2] bg-[#fff5f5] text-[#c0392b] hover:border-[#c0392b] hover:bg-[#fee2e2]"
              } ${hasVoted && !downSelected ? "opacity-45" : ""}`}
              aria-pressed={downSelected}
            >
              <ArrowDownIcon className="h-5 w-5" />
              <span className="mt-0.5 text-[11px] font-bold tabular-nums">{downvotes.toLocaleString()}</span>
              <span className="text-[9px] font-semibold">Downvote</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 p-4">
          <div className="flex gap-3">
            <BusinessAvatar name={business.name} logo={business.logo} size="blog" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                Top pick in {city}
              </p>
              <h2 className="mt-0.5 text-base font-bold leading-snug text-[#111] sm:text-lg">
                <Link href={profileHref} className="text-[#1274c0] hover:underline">
                  {business.name}
                </Link>
              </h2>
              <p className="mt-0.5 text-xs text-[#717171] sm:text-sm">
                {business.category} · {business.city}, {business.state}
              </p>
            </div>
            {business.googleRating != null && (business.googleReviewCount ?? 0) > 0 && (
              <div className="hidden shrink-0 text-right sm:block">
                <RatingBadge
                  rating={business.googleRating}
                  count={business.googleReviewCount}
                  countLabel={`${formatRatingCount(business.googleReviewCount ?? 0)} Ratings`}
                />
                <p className="mt-1 text-[10px] text-[#717171]">Overall rating across the web</p>
              </div>
            )}
          </div>

          {business.googleRating != null && (business.googleReviewCount ?? 0) > 0 && (
            <div className="mt-2 sm:hidden">
              <RatingBadge
                rating={business.googleRating}
                count={business.googleReviewCount}
                countLabel={`${formatRatingCount(business.googleReviewCount ?? 0)} Ratings`}
              />
            </div>
          )}

          <p className="mt-3 text-sm leading-relaxed text-[#555]">
            {preview}
            {truncated && (
              <>
                …{" "}
                <Link href={profileHref} className="font-semibold text-[#1274c0] hover:underline">
                  View Full Profile →
                </Link>
              </>
            )}
          </p>

          <div className="mt-3">
            <VoteStatsDisplay
              upvotes={upvotes}
              downvotes={downvotes}
              userVote={userVote}
              layout="triple"
              onSubmitVote={handleSubmitClick}
              submitLoading={loading}
              hasVoted={hasVoted}
            />
          </div>

          {error && <p className="mt-2 text-xs text-[#c0392b]">{error}</p>}
        </div>
      </li>

      <VoteSignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        businessId={business.id}
        businessName={business.name}
        pendingChoice={pending}
        onSignedIn={handleSignedIn}
      />
    </>
  );
}
