"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LocationStat } from "@/lib/location-utils";
import { getStateLabel } from "@/lib/location-utils";

type LocationBrowsePanelProps = {
  locations: LocationStat[];
  verticalSlug: string;
  variant?: "compact" | "full";
  totalListings?: number;
};

export function LocationBrowsePanel({
  locations,
  verticalSlug,
  variant = "full",
  totalListings,
}: LocationBrowsePanelProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(variant === "full");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) =>
        loc.label.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q),
    );
  }, [locations, query]);

  const topCities = locations.slice(0, 3);

  if (variant === "compact") {
    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#555]">
              {locations.length} {locations.length === 1 ? "city" : "cities"} with listings
              {typeof totalListings === "number" ? ` · ${totalListings} listings` : ""}
            </p>
            {topCities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topCities.map((loc) => (
                  <Link
                    key={loc.slug}
                    href={`/${verticalSlug}/${loc.slug}`}
                    className="rounded-full border border-[#ddd] bg-[#fafafa] px-3 py-1 text-xs font-medium text-[#333] hover:border-[#1274c0] hover:text-[#1274c0]"
                  >
                    {loc.city} ({loc.count})
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/listings#locations"
            className="jd-btn-primary shrink-0 rounded px-5 py-2.5 text-sm font-semibold"
          >
            Browse by location
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="locations" className="scroll-mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block max-w-md flex-1 text-sm">
          <span className="font-medium text-[#333]">Filter by city</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city name…"
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="rounded border border-[#1274c0] px-4 py-2 text-sm font-semibold text-[#1274c0] hover:bg-[#f0f7fd]"
        >
          {expanded ? "Hide cities" : `Show all ${locations.length} cities`}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 max-h-[28rem] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="rounded border border-[#e0e0e0] bg-[#fafafa] p-6 text-center text-sm text-[#717171]">
              No cities match your search.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/${verticalSlug}/${loc.slug}`}
                  className="flex items-center justify-between rounded border border-[#e0e0e0] bg-white px-4 py-3 shadow-sm transition hover:border-[#1274c0] hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-[#111]">{loc.label}</p>
                    <p className="text-xs text-[#717171]">{getStateLabel(loc.state)}</p>
                  </div>
                  <span className="rounded-full bg-[#e8f4fc] px-2.5 py-0.5 text-sm font-semibold text-[#1274c0]">
                    {loc.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {!expanded && topCities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {topCities.map((loc) => (
            <Link
              key={loc.slug}
              href={`/${verticalSlug}/${loc.slug}`}
              className="rounded-full border border-[#ddd] bg-white px-3 py-1.5 text-sm font-medium text-[#333] shadow-sm hover:border-[#1274c0] hover:text-[#1274c0]"
            >
              {loc.label} ({loc.count})
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
