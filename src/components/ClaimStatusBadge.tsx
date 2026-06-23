import {
  CLAIM_STATUS_LABELS,
  claimBadgeStyles,
  isClaimableListing,
  resolveClaimStatus,
} from "@/lib/claim-status";
import type { Business } from "@/types/business";

type ClaimStatusBadgeProps = {
  business: Pick<Business, "claimStatus">;
  className?: string;
  showClaimButton?: boolean;
  onClaimClick?: () => void;
};

export function ClaimStatusBadge({
  business,
  className = "",
  showClaimButton = false,
  onClaimClick,
}: ClaimStatusBadgeProps) {
  const status = resolveClaimStatus(business);
  const styles = claimBadgeStyles(status);
  const label = CLAIM_STATUS_LABELS[status];

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${styles.border} ${styles.bg} ${styles.text}`}
        title={label}
      >
        <span aria-hidden>{styles.dot}</span>
        {label}
      </span>
      {showClaimButton && isClaimableListing(business) && onClaimClick && (
        <button
          type="button"
          onClick={onClaimClick}
          className="rounded bg-[#1274c0] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0d5a94]"
        >
          Claim Now
        </button>
      )}
    </span>
  );
}
