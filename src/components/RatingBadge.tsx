type RatingBadgeProps = {
  rating: number;
  count?: number;
  countLabel?: string;
};

/** JustDial-style green rating badge */
export function RatingBadge({ rating, count, countLabel }: RatingBadgeProps) {
  const label =
    countLabel ?? (count !== undefined && count > 0 ? `${count.toLocaleString("en-US")} Ratings` : undefined);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="jd-rating-badge inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-sm font-bold">
        {rating.toFixed(1)}
        <span aria-hidden>★</span>
      </span>
      {label && <span className="text-sm text-[#717171]">{label}</span>}
    </span>
  );
}
