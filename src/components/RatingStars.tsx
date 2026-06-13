type RatingStarsProps = {
  rating: number;
  count?: number;
  size?: "sm" | "md";
};

export function RatingStars({ rating, count, size = "md" }: RatingStarsProps) {
  const text = size === "sm" ? "text-sm" : "text-base";
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold text-orange-600 ${text}`}>
      <span aria-hidden className="text-orange-500">
        ★
      </span>
      {rating.toFixed(1)}
      {count !== undefined && (
        <span className="font-normal text-slate-500">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </span>
  );
}
