type RatingBadgeProps = {
  rating: number;
  count?: number;
};

/** JustDial-style green rating badge — only for Submit Your Store reviews */
export function RatingBadge({ rating, count }: RatingBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="jd-rating-badge inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-sm font-bold">
        {rating.toFixed(1)}
        <span aria-hidden>★</span>
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-sm text-[#717171]">{count} Ratings</span>
      )}
    </span>
  );
}
