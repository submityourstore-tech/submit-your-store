import { RatingBadge } from "@/components/RatingBadge";
import { formatRatingCount, type DisplayRating } from "@/lib/display-rating";

type OverallRatingNoteProps = {
  displayRating: DisplayRating;
  compact?: boolean;
};

export function OverallRatingNote({ displayRating, compact }: OverallRatingNoteProps) {
  return (
    <div className={compact ? "" : "mt-1"}>
      <RatingBadge
        rating={displayRating.average}
        count={displayRating.count}
        countLabel={`${formatRatingCount(displayRating.count)} Ratings`}
      />
      <p className={`text-xs text-[#717171] ${compact ? "mt-1" : "mt-1.5"}`}>
        Overall rating across the web
        {displayRating.source === "google" ? " (aggregated from Google reviews)" : ""}
      </p>
    </div>
  );
}
