"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BusinessCard } from "@/components/BusinessCard";
import type { Business } from "@/types/business";
import {
  FILTER_LABELS,
  filterBusinesses,
  groupBusinessesByCity,
  type FilterOption,
  type ReviewSummaryMap,
  SORT_LABELS,
  type SortOption,
} from "@/lib/listing";
import { subcategoryStatsFromBusinesses } from "@/lib/categories-config";

type HvacListingProps = {
  businesses: Business[];
  reviewSummaries: ReviewSummaryMap;
  locationLabel?: string;
  basePath?: string;
  groupByCity?: boolean;
  vertical?: string;
};

function parseSort(value: string | null): SortOption {
  if (value && value in SORT_LABELS) return value as SortOption;
  return "name-asc";
}

function parseFilter(value: string | null): FilterOption {
  if (value && value in FILTER_LABELS) return value as FilterOption;
  return "all";
}

export function HvacListing({
  businesses,
  reviewSummaries,
  locationLabel = "Dallas, TX",
  basePath = "/hvac/dallas-tx",
  groupByCity = false,
  vertical = "hvac",
}: HvacListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const initialSort = parseSort(searchParams.get("sort"));
  const initialFilter = parseFilter(searchParams.get("filter"));
  const initialCategory = searchParams.get("category") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [filter, setFilter] = useState<FilterOption>(initialFilter);
  const [category, setCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(Boolean(initialCategory));

  const categories = useMemo(
    () => subcategoryStatsFromBusinesses(businesses, vertical),
    [businesses, vertical],
  );

  const results = useMemo(
    () =>
      filterBusinesses(
        businesses,
        { query, sort, filter, categorySlug: category || undefined },
        reviewSummaries,
      ),
    [businesses, query, sort, filter, category, reviewSummaries],
  );

  const cityGroups = useMemo(
    () => (groupByCity ? groupBusinessesByCity(results) : []),
    [groupByCity, results],
  );

  function pushState(next: {
    q?: string;
    sort?: SortOption;
    filter?: FilterOption;
    category?: string;
  }) {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const s = next.sort ?? sort;
    const f = next.filter ?? filter;
    const c = next.category ?? category;

    if (q.trim()) params.set("q", q.trim());
    if (s !== "name-asc") params.set("sort", s);
    if (f !== "all") params.set("filter", f);
    if (c) params.set("category", c);

    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    pushState({ q: query });
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    pushState({ sort: value });
  }

  function handleFilterChange(value: FilterOption) {
    const nextFilter = filter === value ? "all" : value;
    let nextSort = sort;
    if (nextFilter === "top-rated") {
      nextSort = "top-rated";
    } else if (sort === "top-rated") {
      nextSort = "name-asc";
    }
    setFilter(nextFilter);
    setSort(nextSort);
    pushState({ filter: nextFilter, sort: nextSort });
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    pushState({ category: value });
  }

  function clearFilters() {
    setQuery("");
    setSort("name-asc");
    setFilter("all");
    setCategory("");
    setShowFilters(false);
    router.replace(basePath, { scroll: false });
  }

  const hasActiveFilters =
    query.trim() !== "" || sort !== "name-asc" || filter !== "all" || category !== "";

  function renderCards(list: Business[]) {
    return list.map((b) => (
      <BusinessCard key={b.id} business={b} layout="list" reviewSummary={reviewSummaries[b.id]} />
    ));
  }

  return (
    <>
      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-3xl overflow-hidden rounded-md border border-[#ccc] bg-white shadow-sm"
          >
            <div className="flex min-w-[130px] items-center gap-1.5 border-r border-[#ccc] px-3 py-2.5 text-sm text-[#333]">
              <span className="text-[#1274c0]" aria-hidden>
                📍
              </span>
              <span className="truncate font-medium">{locationLabel}</span>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses, category, address..."
              className="min-w-0 flex-1 px-3 py-2.5 text-sm text-[#111] outline-none"
            />
            <button type="submit" className="jd-btn-primary px-5 text-sm font-semibold">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="relative shrink-0">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="appearance-none rounded-full border border-[#1274c0] bg-[#1274c0] py-1.5 pr-8 pl-4 text-sm font-medium text-white outline-none"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key} className="bg-white text-[#111]">
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-white"
                aria-hidden
              >
                ▾
              </span>
            </label>

            {(Object.keys(FILTER_LABELS) as FilterOption[])
              .filter((key) => key !== "all")
              .map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFilterChange(filter === key ? "all" : key)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                    filter === key
                      ? "border-[#1274c0] bg-[#1274c0] text-white"
                      : "border-[#ccc] bg-white text-[#333] hover:border-[#1274c0]"
                  }`}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                showFilters || category
                  ? "border-[#1274c0] bg-[#1274c0] text-white"
                  : "border-[#ccc] bg-white text-[#333] hover:border-[#1274c0]"
              }`}
            >
              All Filters
              <span className="ml-1 opacity-70" aria-hidden>
                ▾
              </span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-sm font-medium text-[#1274c0] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 rounded-md border border-[#e0e0e0] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#111]">Category</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("")}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    !category
                      ? "border-[#1274c0] bg-[#e8f4fc] text-[#1274c0]"
                      : "border-[#ddd] text-[#555] hover:border-[#1274c0]"
                  }`}
                >
                  All categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryChange(category === cat.slug ? "" : cat.slug)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      category === cat.slug
                        ? "border-[#1274c0] bg-[#e8f4fc] text-[#1274c0]"
                        : "border-[#ddd] text-[#555] hover:border-[#1274c0]"
                    }`}
                  >
                    {cat.label}
                    <span className="ml-1 text-[#999]">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-sm text-[#717171]">
            <span className="font-semibold text-[#111]">{results.length}</span> of{" "}
            {businesses.length} results
            {query.trim() ? ` for “${query.trim()}”` : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {results.length === 0 ? (
          <div className="rounded border border-[#e0e0e0] bg-[#fafafa] p-10 text-center">
            <p className="text-lg font-semibold text-[#111]">No businesses found</p>
            <p className="mt-2 text-sm text-[#717171]">
              Try a different search term or clear your filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="jd-btn-primary mt-4 rounded px-5 py-2 text-sm font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : groupByCity ? (
          <div className="flex flex-col gap-8">
            {cityGroups.map((group) => (
              <section key={group.slug}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e0e0e0] pb-2">
                  <h2 className="text-lg font-bold text-[#111]">
                    <span className="text-[#1274c0]">{group.label}</span>
                    <span className="ml-2 text-sm font-normal text-[#717171]">
                      ({group.businesses.length})
                    </span>
                  </h2>
                  <Link
                    href={`/hvac/${group.slug}`}
                    className="text-sm font-semibold text-[#1274c0] hover:underline"
                  >
                    View all in {group.city} →
                  </Link>
                </div>
                <div className="mt-4 flex flex-col gap-4">{renderCards(group.businesses)}</div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">{renderCards(results)}</div>
        )}
      </div>
    </>
  );
}
