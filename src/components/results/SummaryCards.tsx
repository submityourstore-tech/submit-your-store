"use client";

import type { HttpStatusSummary, RedirectSummary, ScanSummary } from "@/types/tools";
import { formatMilliseconds, formatTimestamp } from "@/utils/format";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Timer,
  Globe,
  ArrowRightLeft,
  WifiOff,
  Zap,
  Snail,
  Minus,
  Repeat,
  AlertOctagon,
  Hash,
} from "lucide-react";

type SummaryCardsProps = {
  summary: ScanSummary;
  className?: string;
};

export function SummaryCards({ summary, className }: SummaryCardsProps) {
  const cards = [
    { label: "Total URLs", value: summary.total, icon: Globe, color: "text-[var(--jd-blue)]" },
    { label: "Successful", value: summary.successful, icon: CheckCircle2, color: "text-green-600" },
    { label: "Failed", value: summary.failed, icon: XCircle, color: "text-red-600" },
    { label: "Warnings", value: summary.warnings, icon: AlertTriangle, color: "text-amber-600" },
    {
      label: "Avg Response",
      value: formatMilliseconds(summary.averageResponseTimeMs),
      icon: Timer,
      color: "text-[var(--jd-muted)]",
    },
    {
      label: "Duration",
      value: formatMilliseconds(summary.durationMs),
      icon: Clock,
      color: "text-[var(--jd-muted)]",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--jd-border)] bg-white p-3 dark:bg-[var(--jd-bg)]"
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", color)} />
              <span className="text-xs text-[var(--jd-muted)]">{label}</span>
            </div>
            <p className="mt-1 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
      {(summary.startedAt || summary.finishedAt) && (
        <p className="text-xs text-[var(--jd-muted)]">
          {summary.startedAt && <>Started: {formatTimestamp(summary.startedAt)}</>}
          {summary.startedAt && summary.finishedAt && " · "}
          {summary.finishedAt && <>Finished: {formatTimestamp(summary.finishedAt)}</>}
        </p>
      )}
    </div>
  );
}

type HttpStatusSummaryCardsProps = {
  summary: HttpStatusSummary;
  className?: string;
};

export function HttpStatusSummaryCards({ summary, className }: HttpStatusSummaryCardsProps) {
  const cards = [
    { label: "Total URLs", value: summary.total, icon: Globe, color: "text-[var(--jd-blue)]" },
    { label: "Successful", value: summary.successful, icon: CheckCircle2, color: "text-green-600" },
    { label: "Redirects", value: summary.redirects, icon: ArrowRightLeft, color: "text-blue-600" },
    { label: "Client Errors", value: summary.clientErrors, icon: AlertTriangle, color: "text-orange-600" },
    { label: "Server Errors", value: summary.serverErrors, icon: XCircle, color: "text-red-600" },
    { label: "Network Errors", value: summary.networkErrors, icon: WifiOff, color: "text-gray-500" },
    {
      label: "Avg Response",
      value: formatMilliseconds(summary.averageResponseTimeMs),
      icon: Timer,
      color: "text-[var(--jd-muted)]",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--jd-border)] bg-white p-3 dark:bg-[var(--jd-bg)]"
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4 shrink-0", color)} />
              <span className="text-xs text-[var(--jd-muted)]">{label}</span>
            </div>
            <p className="mt-1 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>

      {(summary.fastestUrl || summary.slowestUrl) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {summary.fastestUrl && (
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs dark:border-green-900 dark:bg-green-950">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div>
                <span className="font-semibold text-green-800 dark:text-green-300">Fastest: </span>
                <span className="break-all font-mono text-green-700 dark:text-green-400">{summary.fastestUrl}</span>
              </div>
            </div>
          )}
          {summary.slowestUrl && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs dark:border-orange-900 dark:bg-orange-950">
              <Snail className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
              <div>
                <span className="font-semibold text-orange-800 dark:text-orange-300">Slowest: </span>
                <span className="break-all font-mono text-orange-700 dark:text-orange-400">{summary.slowestUrl}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {(summary.startedAt || summary.finishedAt) && (
        <p className="text-xs text-[var(--jd-muted)]">
          {summary.startedAt && <>Started: {formatTimestamp(summary.startedAt)}</>}
          {summary.startedAt && summary.finishedAt && " · "}
          {summary.finishedAt && <>Finished: {formatTimestamp(summary.finishedAt)}</>}
          {summary.durationMs > 0 && <> · Duration: {formatMilliseconds(summary.durationMs)}</>}
        </p>
      )}
    </div>
  );
}

type RedirectSummaryCardsProps = {
  summary: RedirectSummary;
  className?: string;
};

export function RedirectSummaryCards({ summary, className }: RedirectSummaryCardsProps) {
  const cards = [
    { label: "Total URLs", value: summary.total, icon: Globe, color: "text-[var(--jd-blue)]" },
    { label: "No Redirect", value: summary.noRedirect, icon: Minus, color: "text-green-600" },
    { label: "Redirected", value: summary.redirected, icon: ArrowRightLeft, color: "text-blue-600" },
    { label: "301 Permanent", value: summary.permanent301, icon: Repeat, color: "text-indigo-600" },
    { label: "302/307/308", value: summary.temporary, icon: ArrowRightLeft, color: "text-amber-600" },
    { label: "Loops", value: summary.loops, icon: AlertOctagon, color: "text-red-600" },
    { label: "Broken", value: summary.broken, icon: XCircle, color: "text-orange-600" },
    { label: "Avg Redirects", value: summary.averageRedirectCount, icon: Hash, color: "text-[var(--jd-muted)]" },
    {
      label: "Avg Response",
      value: formatMilliseconds(summary.averageResponseTimeMs),
      icon: Timer,
      color: "text-[var(--jd-muted)]",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--jd-border)] bg-white p-3 dark:bg-[var(--jd-bg)]"
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4 shrink-0", color)} />
              <span className="text-xs text-[var(--jd-muted)]">{label}</span>
            </div>
            <p className="mt-1 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
      {(summary.startedAt || summary.finishedAt) && (
        <p className="text-xs text-[var(--jd-muted)]">
          {summary.startedAt && <>Started: {formatTimestamp(summary.startedAt)}</>}
          {summary.startedAt && summary.finishedAt && " · "}
          {summary.finishedAt && <>Finished: {formatTimestamp(summary.finishedAt)}</>}
          {summary.durationMs > 0 && <> · Duration: {formatMilliseconds(summary.durationMs)}</>}
        </p>
      )}
    </div>
  );
}
