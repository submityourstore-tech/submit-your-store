"use client";

import type { VoteChoice } from "@/lib/business-votes.server";
import { votePercentages } from "@/lib/vote-stats";

export function ArrowUpIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 5.5 5 14h4.5V20h5v-6H19l-7-8.5z" />
    </svg>
  );
}

export function ArrowDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 18.5 19 10h-4.5V4h-5v6H5l7 8.5z" />
    </svg>
  );
}

type VoteStatsProps = {
  upvotes: number;
  downvotes: number;
  userVote?: VoteChoice | null;
  layout?: "stacked" | "horizontal" | "bar" | "triple";
  onSubmitVote?: () => void;
  submitLoading?: boolean;
  hasVoted?: boolean;
};

export function VoteStatsDisplay({
  upvotes,
  downvotes,
  userVote,
  layout = "stacked",
  onSubmitVote,
  submitLoading = false,
  hasVoted = false,
}: VoteStatsProps) {
  const { upPct, downPct, total } = votePercentages(upvotes, downvotes);
  if (total === 0) return null;

  if (layout === "triple") {
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#c8ecd4] bg-[#f0fdf4] px-2 py-2.5 text-center">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#25a244]">
            <ArrowUpIcon className="h-4 w-4" />
            {upPct}%
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-[#25a244]">Upvote</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#f5c6c2] bg-[#fff5f5] px-2 py-2.5 text-center">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#c0392b]">
            <ArrowDownIcon className="h-4 w-4" />
            {downPct}%
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-[#c0392b]">Downvote</span>
        </div>
        {hasVoted ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#c8ecd4] bg-[#f0fdf4] px-2 py-2.5 text-center">
            <span className="text-lg leading-none text-[#25a244]">✓</span>
            <span className="mt-1 text-[10px] font-bold text-[#25a244]">Vote submitted</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={submitLoading}
            onClick={onSubmitVote}
            className="jd-btn-orange flex flex-col items-center justify-center rounded-lg px-2 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {submitLoading ? "Submitting…" : "Submit Your Vote"}
            {!submitLoading && <span className="mt-0.5 text-[10px] font-semibold opacity-90">→</span>}
          </button>
        )}
      </div>
    );
  }

  if (layout === "bar") {
    return (
      <div className="w-full">
        {userVote && (
          <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-[#1274c0]">
            {userVote === "up" ? "✓ You upvoted" : "✓ You downvoted"}
          </p>
        )}
        <div className="flex h-2.5 overflow-hidden rounded-full bg-[#eee]">
          <div className="bg-[#25a244] transition-all" style={{ width: `${upPct}%` }} />
          <div className="bg-[#c0392b] transition-all" style={{ width: `${downPct}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-semibold sm:text-xs">
          <span className="inline-flex items-center gap-0.5 text-[#25a244]">
            <ArrowUpIcon className="h-3 w-3" />
            {upPct}% · {upvotes.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[#c0392b]">
            <ArrowDownIcon className="h-3 w-3" />
            {downPct}% · {downvotes.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  if (layout === "horizontal") {
    return (
      <div className="w-full">
        {userVote && (
          <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#1274c0]">
            {userVote === "up" ? "You upvoted" : "You downvoted"}
          </p>
        )}
        <div className="flex items-stretch gap-1.5">
          <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-[#c8ecd4] bg-[#f0fdf4] px-1 py-1.5">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#25a244]">
              <ArrowUpIcon className="h-3 w-3" />
              {upPct}%
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-[#f5c6c2] bg-[#fdf0ef] px-1 py-1.5">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#c0392b]">
              <ArrowDownIcon className="h-3 w-3" />
              {downPct}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1 text-center">
      {userVote && (
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#1274c0]">
          {userVote === "up" ? "You upvoted" : "You downvoted"}
        </p>
      )}
      <p className="text-xs text-[#555]">
        <span className="inline-flex items-center gap-0.5 font-semibold text-[#25a244]">
          <ArrowUpIcon className="h-3 w-3" />
          {upPct}% up
        </span>
        <span className="text-[#999]"> · </span>
        {upvotes.toLocaleString()} votes
      </p>
      <p className="text-xs text-[#555]">
        <span className="inline-flex items-center gap-0.5 font-semibold text-[#c0392b]">
          <ArrowDownIcon className="h-3 w-3" />
          {downPct}% down
        </span>
        <span className="text-[#999]"> · </span>
        {downvotes.toLocaleString()} votes
      </p>
    </div>
  );
}
