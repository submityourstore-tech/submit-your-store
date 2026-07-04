"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScanProgress, ToolResultRow } from "@/types/tools";
import { ScanQueue } from "@/lib/fetch/queue";
import { computeProgress } from "@/lib/result-engine";
import { DEFAULT_CONCURRENCY } from "@/constants/tools";

type UseToolScanOptions = {
  toolSlug: string;
  concurrency?: number;
  onResult?: (result: ToolResultRow) => void;
};

async function fetchCheck(
  toolSlug: string,
  url: string,
  signal: AbortSignal,
): Promise<ToolResultRow> {
  const res = await fetch("/api/tools/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: toolSlug, url }),
    signal,
  });

  const data = (await res.json()) as { result?: ToolResultRow; error?: string };

  if (!res.ok) {
    return {
      url,
      normalizedUrl: url,
      status: "failed",
      error: { code: "unknown", message: data.error ?? "Check failed" },
    };
  }

  return (
    data.result ?? {
      url,
      normalizedUrl: url,
      status: "failed",
      error: { code: "unknown", message: "No result returned" },
    }
  );
}

const IDLE_PROGRESS: ScanProgress = {
  status: "idle",
  total: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  warnings: 0,
  currentUrl: null,
  startedAt: null,
  finishedAt: null,
  estimatedRemainingMs: null,
};

export function useToolScan({ toolSlug, concurrency = DEFAULT_CONCURRENCY, onResult }: UseToolScanOptions) {
  const [results, setResults] = useState<ToolResultRow[]>([]);
  const [progress, setProgress] = useState<ScanProgress>(IDLE_PROGRESS);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const queueRef = useRef<ScanQueue | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const urlsRef = useRef<string[]>([]);
  const resultsRef = useRef<ToolResultRow[]>([]);

  const syncProgress = useCallback(
    (partialResults: ToolResultRow[], status: ScanProgress["status"], url: string | null, finishedAt: number | null) => {
      setProgress(
        computeProgress(
          partialResults,
          urlsRef.current.length,
          url,
          status,
          startedAtRef.current,
          finishedAt,
        ),
      );
    },
    [],
  );

  const startScan = useCallback(
    (urls: string[]) => {
      urlsRef.current = urls;
      startedAtRef.current = Date.now();
      resultsRef.current = [];
      setResults([]);
      setCurrentUrl(urls[0] ?? null);

      const queue = new ScanQueue(
        (url, signal) => fetchCheck(toolSlug, url, signal),
        {
          onProgress: (result) => {
            setCurrentUrl(result.url);
            resultsRef.current = [...resultsRef.current, result];
            const next = resultsRef.current;
            setResults(next);
            syncProgress(next, "running", result.url, null);
            onResult?.(result);
          },
          onComplete: () => {
            setCurrentUrl(null);
            const finishedAt = Date.now();
            syncProgress(resultsRef.current, "completed", null, finishedAt);
            setProgress((p) => ({ ...p, status: "completed", finishedAt }));
          },
        },
        concurrency,
      );

      queueRef.current = queue;
      setProgress({
        status: "running",
        total: urls.length,
        processed: 0,
        successful: 0,
        failed: 0,
        warnings: 0,
        currentUrl: urls[0] ?? null,
        startedAt: startedAtRef.current,
        finishedAt: null,
        estimatedRemainingMs: null,
      });
      queue.start(urls);
    },
    [toolSlug, concurrency, onResult, syncProgress],
  );

  const pause = useCallback(() => {
    queueRef.current?.pause();
    setProgress((p) => ({ ...p, status: "paused" }));
  }, []);

  const resume = useCallback(() => {
    queueRef.current?.resume();
    setProgress((p) => ({ ...p, status: "running" }));
  }, []);

  const cancel = useCallback(() => {
    queueRef.current?.cancel();
    const finishedAt = Date.now();
    syncProgress(resultsRef.current, "cancelled", null, finishedAt);
    setProgress((p) => ({ ...p, status: "cancelled", finishedAt }));
    setCurrentUrl(null);
  }, [syncProgress]);

  const retryFailed = useCallback(() => {
    const failed = resultsRef.current.filter((r) => r.status === "failed").map((r) => r.url);
    if (failed.length > 0) startScan(failed);
  }, [startScan]);

  const reset = useCallback(() => {
    queueRef.current?.cancel();
    resultsRef.current = [];
    setResults([]);
    setCurrentUrl(null);
    startedAtRef.current = null;
    setProgress(IDLE_PROGRESS);
  }, []);

  // Live elapsed time ticker while running
  const [, setTick] = useState(0);
  useEffect(() => {
    if (progress.status !== "running") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [progress.status]);

  const isScanning = progress.status === "running" || progress.status === "paused";

  return {
    results,
    progress,
    currentUrl,
    isScanning,
    startScan,
    pause,
    resume,
    cancel,
    retryFailed,
    reset,
  };
}
