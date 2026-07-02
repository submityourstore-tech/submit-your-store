"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BusinessCard } from "@/components/BusinessCard";
import { SearchBar } from "@/components/SearchBar";
import type { Business } from "@/types/business";
import type { ReviewSummaryMap } from "@/lib/listing";
import { filterBusinesses } from "@/lib/listing";

type GlobalSearchResultsProps = {
  businesses: Business[];
  reviewSummaries: ReviewSummaryMap;
};

export function GlobalSearchResults({ businesses, reviewSummaries }: GlobalSearchResultsProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const results = useMemo(
    () =>
      query
        ? filterBusinesses(
            businesses,
            { query, sort: "name-asc", filter: "all" },
            reviewSummaries,
          )
        : [],
    [businesses, query, reviewSummaries],
  );

  return (
    <div>
      <div className="max-w-2xl">
        <SearchBar query={query} action="/search" />
      </div>

      {!query && (
        <p className="mt-6 text-sm text-[#717171]">
          Type a business name, city, or category above. Suggestions appear as you type.
        </p>
      )}

      {query && (
        <div className="mt-6">
          <p className="text-sm text-[#555]">
            {results.length === 0 ? (
              <>
                No results for <strong className="text-[#111]">“{query}”</strong>. Try a different
                spelling or browse by location.
              </>
            ) : (
              <>
                {results.length} result{results.length === 1 ? "" : "s"} for{" "}
                <strong className="text-[#111]">“{query}”</strong>
              </>
            )}
          </p>

          <div className="mt-4 space-y-3">
            {results.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                layout="list"
                reviewSummary={reviewSummaries[business.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
