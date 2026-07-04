"use client";

import { cn } from "@/lib/utils";

type UrlCounterProps = {
  total: number;
  max: number;
  invalidCount?: number;
  duplicateRemoved?: number;
  className?: string;
};

export function UrlCounter({
  total,
  max,
  invalidCount = 0,
  duplicateRemoved = 0,
  className,
}: UrlCounterProps) {
  const atLimit = total >= max;

  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs text-[var(--jd-muted)]", className)}>
      <span className={cn("font-medium", atLimit && "text-[var(--jd-orange)]")}>
        {total} / {max} URLs
      </span>
      {duplicateRemoved > 0 && (
        <span className="rounded bg-green-50 px-2 py-0.5 text-green-700 dark:bg-green-950 dark:text-green-300">
          {duplicateRemoved} duplicate{duplicateRemoved !== 1 ? "s" : ""} removed
        </span>
      )}
      {invalidCount > 0 && (
        <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 dark:bg-red-950 dark:text-red-300">
          {invalidCount} invalid
        </span>
      )}
    </div>
  );
}
