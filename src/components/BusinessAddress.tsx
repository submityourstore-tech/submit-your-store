import { formatDisplayAddress } from "@/lib/address";
import type { Business } from "@/types/business";

type BusinessAddressProps = {
  business: Pick<Business, "address" | "city" | "state">;
  className?: string;
};

export function BusinessAddress({ business, className = "" }: BusinessAddressProps) {
  const line = formatDisplayAddress(business);

  return (
    <p className={`flex items-start gap-1.5 break-words text-sm text-[#333] ${className}`}>
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-[#1274c0]"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
      <span>{line}</span>
    </p>
  );
}
