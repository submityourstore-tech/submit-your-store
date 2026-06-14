import Link from "next/link";
import type { LocationStat } from "@/lib/locations";

type LocationBrowseProps = {
  locations: LocationStat[];
  stateLabel?: string;
  verticalSlug?: string;
};

export function LocationBrowse({
  locations,
  stateLabel = "Texas",
  verticalSlug = "hvac",
}: LocationBrowseProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((loc) => (
        <Link
          key={loc.slug}
          href={`/${verticalSlug}/${loc.slug}`}
          className="flex items-center justify-between rounded border border-[#e0e0e0] bg-white px-4 py-3 shadow-sm transition hover:border-[#1274c0] hover:shadow-md"
        >
          <div>
            <p className="font-semibold text-[#111]">{loc.label}</p>
            <p className="text-xs text-[#717171]">{stateLabel}</p>
          </div>
          <span className="rounded-full bg-[#e8f4fc] px-2.5 py-0.5 text-sm font-semibold text-[#1274c0]">
            {loc.count}
          </span>
        </Link>
      ))}
    </div>
  );
}
