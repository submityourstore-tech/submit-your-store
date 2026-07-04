"use client";

import { InputCard } from "@/components/forms/InputCard";
import { ProgressCard } from "@/components/results/ProgressCard";
import { ResultEngine } from "@/components/results/ResultEngine";
import { EmptyState, NoResultsState } from "@/components/results/state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToolScan } from "@/hooks/useToolScan";
import { useUrlInput } from "@/hooks/useUrlInput";
import { isToolAvailable } from "@/lib/tools/registry";
import type { SeoToolDefinition } from "@/types/tools";
import { toast, Toaster } from "sonner";
import { useState } from "react";

type ToolFrameworkProps = {
  tool: SeoToolDefinition;
};

/**
 * Main orchestrator for every SEO tool page.
 * Wires input, scan queue, progress, and result engine together.
 */
export function ToolFramework({ tool }: ToolFrameworkProps) {
  const urlInput = useUrlInput(tool.maxUrls, tool.sampleUrls);
  const checkerReady = isToolAvailable(tool.slug);
  const [cancelOpen, setCancelOpen] = useState(false);

  const {
    results,
    progress,
    isScanning,
    startScan,
    pause,
    resume,
    cancel,
    retryFailed,
  } = useToolScan({ toolSlug: tool.slug, concurrency: tool.concurrency });

  function handleSubmit() {
    if (!checkerReady) {
      toast.error("This tool's checker is not registered yet.");
      return;
    }
    if (urlInput.urls.length === 0) {
      toast.error("Enter at least one URL.");
      return;
    }
    if (urlInput.invalidCount > 0) {
      toast.error(`Fix ${urlInput.invalidCount} invalid URL(s) before scanning.`);
      return;
    }
    startScan(urlInput.urls);
  }

  const showResults = results.length > 0;
  const scanDone = progress.status === "completed" || progress.status === "cancelled";

  return (
    <div className="tools-framework mx-auto max-w-6xl px-4 py-8">
      <Toaster position="top-right" richColors closeButton />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <ToolHeader title={tool.name} description={tool.description} icon={tool.icon}>
            {!checkerReady && (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                Framework ready — register a checker in{" "}
                <code className="font-mono">lib/checkers/checkers/{tool.slug}.ts</code> to enable
                scanning.
              </p>
            )}
          </ToolHeader>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-6 space-y-6">
        <InputCard
          urlInput={urlInput}
          onSubmit={handleSubmit}
          loading={isScanning}
          submitLabel={tool.submitLabel ?? "Start Scan"}
          disabled={!checkerReady}
        />

        <ProgressCard
          progress={progress}
          onPause={pause}
          onResume={resume}
          onCancel={() => setCancelOpen(true)}
          onRetryFailed={retryFailed}
        />

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Cancel scan?"
          description="Progress for unprocessed URLs will be lost. Completed results will be kept."
          confirmLabel="Cancel Scan"
          variant="destructive"
          onConfirm={cancel}
        />

        {isScanning && results.length === 0 && <TableSkeleton rows={6} cols={tool.columns.length} />}

        {showResults && (
          <ResultEngine
            results={results}
            columns={tool.columns}
            filename={tool.slug}
            startedAt={progress.startedAt}
            finishedAt={scanDone ? progress.finishedAt : null}
            resultProfile={tool.resultProfile}
            searchPlaceholder={tool.searchPlaceholder}
          />
        )}

        {!isScanning && !showResults && urlInput.urls.length === 0 && <EmptyState />}

        {!isScanning && !showResults && urlInput.urls.length > 0 && progress.status === "idle" && (
          <NoResultsState description="Click Start Scan to analyze your URLs." />
        )}
      </div>
    </div>
  );
}
