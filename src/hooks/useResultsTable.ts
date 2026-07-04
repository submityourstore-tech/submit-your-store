"use client";

import { useCallback, useMemo, useState } from "react";
import type { SeoToolDefinition, SortDirection, ToolColumnDef, ToolResultRow } from "@/types/tools";
import { DEFAULT_PAGE_SIZE } from "@/constants/tools";
import {
  filterResults,
  getVisibleColumns,
  paginateResults,
  sortResults,
} from "@/lib/result-engine";

type UseResultsTableOptions = {
  resultProfile?: SeoToolDefinition["resultProfile"];
  defaultSortKey?: string;
};

export function useResultsTable(
  results: ToolResultRow[],
  columns: ToolColumnDef[],
  options: UseResultsTableOptions = {},
) {
  const { resultProfile = "default", defaultSortKey = "url" } = options;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.visible !== false])),
  );

  const visibleColumns = useMemo(
    () => getVisibleColumns(columns, columnVisibility),
    [columns, columnVisibility],
  );

  const filtered = useMemo(
    () => filterResults(results, search, statusFilter, resultProfile),
    [results, search, statusFilter, resultProfile],
  );

  const sorted = useMemo(
    () => sortResults(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(
    () => paginateResults(sorted, page, pageSize),
    [sorted, page, pageSize],
  );

  const toggleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
    },
    [sortKey],
  );

  const toggleColumn = useCallback((key: string) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleRow = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === paginated.length) return new Set();
      return new Set(paginated.map((_, i) => i));
    });
  }, [paginated]);

  const selectedRows = useMemo(
    () => paginated.filter((_, i) => selected.has(i)),
    [paginated, selected],
  );

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // Reset page when filters change
  const setSearchSafe = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const setStatusFilterSafe = useCallback((f: string) => {
    setStatusFilter(f);
    setPage(1);
  }, []);

  return {
    search,
    setSearch: setSearchSafe,
    statusFilter,
    setStatusFilter: setStatusFilterSafe,
    sortKey,
    sortDirection,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    paginated,
    filtered,
    sorted,
    visibleColumns,
    columnVisibility,
    toggleColumn,
    selected,
    selectedRows,
    toggleRow,
    toggleAll,
    clearSelection,
    allSelected: paginated.length > 0 && selected.size === paginated.length,
  };
}
