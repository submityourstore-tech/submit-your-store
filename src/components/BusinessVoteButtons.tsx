"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { VoteSignInModal } from "@/components/VoteSignInModal";
import { ArrowDownIcon, ArrowUpIcon, VoteStatsDisplay } from "@/components/VoteStatsDisplay";
import {
  clearPendingVote,
  loadPendingVote,
  savePendingVote,
} from "@/lib/pending-vote-client";
import type { VoteChoice } from "@/lib/business-votes.server";

type BusinessVoteButtonsProps = {
  businessId: string;
  businessName: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: VoteChoice | null;
  variant?: "profile";
  profileUrl?: string;
};

export function BusinessVoteButtons({
  businessId,
  businessName,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
  profileUrl,
}: BusinessVoteButtonsProps) {
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

  const submitVote = useCallback(
    async (choice: VoteChoice) => {
      if (!user || hasVoted) return false;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/business-votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId, choice }),
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
    [businessId, hasVoted, upvotes, downvotes, user],
  );

  useEffect(() => {
    if (!user || hasVoted) return;
    const stored = loadPendingVote(businessId);
    if (!stored) return;
    setPending(stored.choice);
    void (async () => {
      const ok = await submitVote(stored.choice);
      if (ok) clearPendingVote();
    })();
  }, [user, hasVoted, businessId, submitVote]);

  function requireAuth(choice: VoteChoice) {
    if (hasVoted || loading) return;
    if (!user) {
      setPending(choice);
      savePendingVote(businessId, choice);
      setSignInOpen(true);
      return;
    }
    setPending(choice);
    setError(null);
  }

  function handleSubmitClick() {
    if (hasVoted) return;
    if (!pending) {
      setError("Select upvote or downvote first.");
      return;
    }
    if (!user) {
      savePendingVote(businessId, pending);
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
      <VoteStatsDisplay upvotes={upvotes} downvotes={downvotes} userVote={userVote} layout="bar" />

      <div className="mt-4 flex gap-3 sm:max-w-sm">
        <button
          type="button"
          disabled={loading || hasVoted}
          onClick={() => requireAuth("up")}
          className={`flex flex-1 flex-col items-center rounded-lg border-2 px-3 py-3 transition disabled:cursor-not-allowed ${
            upSelected
              ? "border-[#25a244] bg-[#e8f8ec] text-[#25a244] shadow-sm"
              : "border-[#c8ecd4] bg-[#f0fdf4] text-[#25a244] hover:border-[#25a244] hover:bg-[#dcfce7]"
          } ${hasVoted && !upSelected ? "opacity-45" : ""}`}
          aria-pressed={upSelected}
        >
          <ArrowUpIcon className="h-5 w-5" />
          <span className="mt-1 text-sm font-bold tabular-nums">{upvotes.toLocaleString()}</span>
          <span className="text-xs font-semibold">Upvote</span>
        </button>
        <button
          type="button"
          disabled={loading || hasVoted}
          onClick={() => requireAuth("down")}
          className={`flex flex-1 flex-col items-center rounded-lg border-2 px-3 py-3 transition disabled:cursor-not-allowed ${
            downSelected
              ? "border-[#c0392b] bg-[#fdf0ef] text-[#c0392b] shadow-sm"
              : "border-[#f5c6c2] bg-[#fff5f5] text-[#c0392b] hover:border-[#c0392b] hover:bg-[#fee2e2]"
          } ${hasVoted && !downSelected ? "opacity-45" : ""}`}
          aria-pressed={downSelected}
        >
          <ArrowDownIcon className="h-5 w-5" />
          <span className="mt-1 text-sm font-bold tabular-nums">{downvotes.toLocaleString()}</span>
          <span className="text-xs font-semibold">Downvote</span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!hasVoted && (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmitClick}
            className="jd-btn-orange inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95 sm:min-w-[180px]"
          >
            {loading ? "Submitting…" : "Submit Your Vote"}
            {!loading && <span aria-hidden>→</span>}
          </button>
        )}
        {profileUrl && (
          <Link
            href={profileUrl}
            className="jd-btn-primary inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95 sm:min-w-[180px]"
          >
            View Full Profile
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {hasVoted && (
        <p className="mt-3 text-sm font-medium text-[#25a244]">
          ✓ Thank you — your vote helps rank {businessName} in community listings.
        </p>
      )}
      {!user && !hasVoted && (
        <p className="mt-2 text-xs text-[#717171]">Select up or down, then submit your vote.</p>
      )}
      {error && <p className="mt-2 text-xs text-[#c0392b]">{error}</p>}

      <VoteSignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        businessId={businessId}
        businessName={businessName}
        pendingChoice={pending}
        onSignedIn={handleSignedIn}
      />
    </>
  );
}
