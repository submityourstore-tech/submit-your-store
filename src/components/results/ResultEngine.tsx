"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsTable } from "@/components/results/ResultsTable";
import {
  HttpStatusSummaryCards,
  RedirectSummaryCards,
  SummaryCards,
} from "@/components/results/SummaryCards";
import { useResultsTable } from "@/hooks/useResultsTable";
import {
  computeHttpStatusSummary,
  computeRedirectSummary,
  computeSummary,
} from "@/lib/result-engine";
import type { SeoToolDefinition, ToolColumnDef, ToolResultRow } from "@/types/tools";

type ResultEngineProps = {
  results: ToolResultRow[];
  columns: ToolColumnDef[];
  filename: string;
  startedAt?: number | null;
  finishedAt?: number | null;
  resultProfile?: SeoToolDefinition["resultProfile"];
  searchPlaceholder?: string;
};

function defaultSortKey(profile: SeoToolDefinition["resultProfile"]): string {
  if (profile === "http-status") return "httpStatus";
  if (profile === "redirect") return "redirectCount";
  return "url";
}

/**
 * Reusable Result Engine — pass an array of result rows and column defs;
 * automatically renders summary, table, export, search, filter, sort, pagination.
 */
export function ResultEngine({
  results,
  columns,
  filename,
  startedAt = null,
  finishedAt = null,
  resultProfile = "default",
  searchPlaceholder,
}: ResultEngineProps) {
  const table = useResultsTable(results, columns, {
    resultProfile,
    defaultSortKey: defaultSortKey(resultProfile),
  });

  if (results.length === 0) return null;

  const summaryNode =
    resultProfile === "http-status" ? (
      <HttpStatusSummaryCards
        summary={computeHttpStatusSummary(results, startedAt ?? null, finishedAt ?? null)}
      />
    ) : resultProfile === "redirect" ? (
      <RedirectSummaryCards
        summary={computeRedirectSummary(results, startedAt ?? null, finishedAt ?? null)}
      />
    ) : (
      <SummaryCards summary={computeSummary(results, startedAt ?? null, finishedAt ?? null)} />
    );

  return (
    <div className="space-y-4">
      {summaryNode}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable
            results={results}
            columns={columns}
            table={table}
            filename={filename}
            resultProfile={resultProfile}
            searchPlaceholder={searchPlaceholder}
          />
        </CardContent>
      </Card>
    </div>
  );
}
