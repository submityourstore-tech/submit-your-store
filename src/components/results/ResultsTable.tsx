"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportMenu } from "@/components/results/ExportMenu";
import type { SeoToolDefinition, ToolColumnDef, ToolResultRow } from "@/types/tools";
import type { useResultsTable } from "@/hooks/useResultsTable";
import { formatCellValue, formatMilliseconds } from "@/utils/format";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Search } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/constants/tools";

type ResultsTableProps = {
  results: ToolResultRow[];
  columns: ToolColumnDef[];
  table: ReturnType<typeof useResultsTable>;
  filename: string;
  resultProfile?: SeoToolDefinition["resultProfile"];
  searchPlaceholder?: string;
};

function formatValue(value: unknown, format?: ToolColumnDef["format"]): string {
  if (format === "duration" && typeof value === "number") return formatMilliseconds(value);
  if (format === "status") return String(value ?? "—").replace(/_/g, " ");
  if (format === "yesNo") {
    if (value === true || value === "Yes") return "Yes";
    if (value === false || value === "No") return "No";
    return String(value ?? "—");
  }
  return formatCellValue(value);
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    pending: "bg-gray-100 text-gray-600",
    skipped: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        colors[status] ?? colors.pending,
      )}
    >
      {status}
    </span>
  );
}

function HttpStatusBadge({ code }: { code: number }) {
  let colorClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  if (code >= 200 && code < 300) {
    colorClass = "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
  } else if (code >= 300 && code < 400) {
    colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
  } else if (code >= 400 && code < 500) {
    colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
  } else if (code >= 500) {
    colorClass = "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
  }

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums", colorClass)}>
      {code}
    </span>
  );
}

const HTTP_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "2xx", label: "2xx Success" },
  { value: "3xx", label: "3xx Redirects" },
  { value: "4xx", label: "4xx Client Errors" },
  { value: "5xx", label: "5xx Server Errors" },
  { value: "errors", label: "Errors Only" },
  { value: "redirects", label: "Redirects Only" },
] as const;

const REDIRECT_FILTERS = [
  { value: "all", label: "All" },
  { value: "none", label: "No Redirect" },
  { value: "301", label: "301 Permanent" },
  { value: "302", label: "302 Found" },
  { value: "307", label: "307 Temporary" },
  { value: "308", label: "308 Permanent" },
  { value: "loops", label: "Loops" },
  { value: "broken", label: "Broken" },
] as const;

const DEFAULT_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "warning", label: "Warning" },
] as const;

export function ResultsTable({
  results,
  columns,
  table,
  filename,
  resultProfile = "default",
  searchPlaceholder = "Search results…",
}: ResultsTableProps) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
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
    visibleColumns,
    columnVisibility,
    toggleColumn,
    selected,
    selectedRows,
    toggleRow,
    toggleAll,
    allSelected,
  } = table;

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--jd-muted)]" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-[var(--jd-border)] bg-white px-2 text-sm dark:bg-[var(--jd-bg)]"
          >
            {(resultProfile === "http-status"
              ? HTTP_STATUS_FILTERS
              : resultProfile === "redirect"
                ? REDIRECT_FILTERS
                : DEFAULT_FILTERS
            ).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={columnVisibility[col.key] !== false}
                  onCheckedChange={() => toggleColumn(col.key)}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ExportMenu
            rows={filtered}
            selectedRows={selectedRows}
            columns={visibleColumns}
            filename={filename}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--jd-border)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--jd-surface)]">
            <tr className="border-b border-[var(--jd-border)]">
              <th className="w-10 px-3 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 font-semibold text-[var(--jd-text)]"
                  style={{ minWidth: col.width }}
                >
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-[var(--jd-blue)]"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      <ArrowUpDown
                        className={cn(
                          "h-3 w-3",
                          sortKey === col.key ? "text-[var(--jd-blue)]" : "text-[var(--jd-muted)]",
                        )}
                      />
                      {sortKey === col.key && (
                        <span className="sr-only">{sortDirection === "asc" ? "ascending" : "descending"}</span>
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="px-3 py-8 text-center text-[var(--jd-muted)]"
                >
                  No results match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={`${row.url}-${i}`}
                  className={cn(
                    "border-b border-[var(--jd-border)] transition-colors hover:bg-[var(--jd-surface)]/50",
                    selected.has(i) && "bg-[var(--jd-blue)]/5",
                  )}
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selected.has(i)}
                      onCheckedChange={() => toggleRow(i)}
                      aria-label={`Select row ${i + 1}`}
                    />
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-[var(--jd-text)]">
                      {col.format === "httpStatus" && typeof row[col.key] === "number" ? (
                        <HttpStatusBadge code={row[col.key] as number} />
                      ) : col.key === "status" ? (
                        <StatusBadge status={String(row.status)} />
                      ) : col.format === "url" ? (
                        <span className="font-mono text-xs break-all">{formatValue(row[col.key], col.format)}</span>
                      ) : col.format === "chain" ? (
                        <span className="font-mono text-xs break-all leading-relaxed">
                          {formatValue(row[col.key], col.format)}
                        </span>
                      ) : col.format === "yesNo" && row[col.key] === "Yes" ? (
                        <span className="font-medium text-green-600">Yes</span>
                      ) : col.format === "yesNo" && row[col.key] === "No" ? (
                        <span className="text-[var(--jd-muted)]">No</span>
                      ) : row.status === "failed" && col.key === "httpStatus" && row.error ? (
                        <span className="text-xs text-gray-500">{row.error.message}</span>
                      ) : (
                        formatValue(row[col.key], col.format)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row print:hidden">
        <p className="text-xs text-[var(--jd-muted)]">
          Showing {paginated.length} of {filtered.length} results
          {selected.size > 0 && ` · ${selected.size} selected`}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-8 rounded-md border border-[var(--jd-border)] bg-white px-2 text-xs dark:bg-[var(--jd-bg)]"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
