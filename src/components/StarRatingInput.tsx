"use client";

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
};

const LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  return (
    <div>
      <span className="block text-sm font-medium text-[#333]">Your rating *</span>
      <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rate 1 to 5 stars">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star === 1 ? "" : "s"} — ${LABELS[star - 1]}`}
              disabled={disabled}
              onClick={() => onChange(star)}
              className={`text-3xl leading-none transition hover:scale-110 disabled:opacity-50 ${
                filled ? "text-[#ff6c00]" : "text-[#ddd]"
              }`}
            >
              ★
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-[#555]">{LABELS[value - 1]}</span>
        )}
      </div>
    </div>
  );
}
