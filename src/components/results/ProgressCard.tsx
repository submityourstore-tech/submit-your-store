"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { ScanProgress } from "@/types/tools";
import { formatMilliseconds, formatTimestamp } from "@/utils/format";
import { Pause, Play, Square, RotateCcw } from "lucide-react";

type ProgressCardProps = {
  progress: ScanProgress;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetryFailed?: () => void;
};

export function ProgressCard({
  progress,
  onPause,
  onResume,
  onCancel,
  onRetryFailed,
}: ProgressCardProps) {
  const {
    status,
    total,
    processed,
    successful,
    failed,
    currentUrl,
    startedAt,
    estimatedRemainingMs,
  } = progress;

  if (status === "idle") return null;

  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const elapsed = startedAt ? Date.now() - startedAt : 0;
  const isActive = status === "running" || status === "paused";

  return (
    <Card className="border-[var(--jd-blue)]/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {status === "running" && "Scanning…"}
          {status === "paused" && "Paused"}
          {status === "completed" && "Scan Complete"}
          {status === "cancelled" && "Scan Cancelled"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive && (
          <Progress value={pct} className="h-3" indicatorClassName="bg-[var(--jd-blue)]" />
        )}

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Processed" value={`${processed} / ${total}`} />
          <Stat label="Successful" value={String(successful)} className="text-green-600" />
          <Stat label="Failed" value={String(failed)} className="text-red-600" />
          <Stat label="Remaining" value={String(Math.max(0, total - processed))} />
        </div>

        {currentUrl && isActive && (
          <p className="truncate text-xs text-[var(--jd-muted)]">
            Current: <span className="font-mono text-[var(--jd-text)]">{currentUrl}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-[var(--jd-muted)]">
          {startedAt && <span>Elapsed: {formatMilliseconds(elapsed)}</span>}
          {estimatedRemainingMs != null && status === "running" && (
            <span>Est. remaining: {formatMilliseconds(estimatedRemainingMs)}</span>
          )}
          {startedAt && <span>Started: {formatTimestamp(startedAt)}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {status === "running" && (
            <Button variant="secondary" size="sm" onClick={onPause}>
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          {status === "paused" && (
            <Button variant="default" size="sm" onClick={onResume}>
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          {isActive && (
            <Button variant="destructive" size="sm" onClick={onCancel}>
              <Square className="h-4 w-4" />
              Cancel
            </Button>
          )}
          {(status === "completed" || status === "cancelled") && failed > 0 && onRetryFailed && (
            <Button variant="outline" size="sm" onClick={onRetryFailed}>
              <RotateCcw className="h-4 w-4" />
              Retry Failed ({failed})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-[var(--jd-muted)]">{label}</p>
      <p className={`font-semibold ${className ?? ""}`}>{value}</p>
    </div>
  );
}
