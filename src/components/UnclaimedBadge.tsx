import Link from "next/link";

type UnclaimedBadgeProps = {
  className?: string;
  showClaimLink?: boolean;
  businessId?: string;
};

export function UnclaimedBadge({ className = "", showClaimLink = false, businessId }: UnclaimedBadgeProps) {
  const claimHref = businessId ? `/claim/${businessId}` : "/list-your-business";
  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span
        className="inline-flex items-center rounded border border-[#f59e0b] bg-[#fffbeb] px-2 py-0.5 text-xs font-semibold text-[#b45309]"
        title="This listing has not been verified by the business owner yet"
      >
        Unclaimed
      </span>
      {showClaimLink && (
        <Link href={claimHref} className="text-xs font-semibold text-[#1274c0] hover:underline">
          Claim this business
        </Link>
      )}
    </span>
  );
}
