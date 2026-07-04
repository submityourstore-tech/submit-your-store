import type { ToolResultRow } from "@/types/tools";
import { DEFAULT_CONCURRENCY } from "@/constants/tools";

export type QueueItem = {
  url: string;
  index: number;
};

export type QueueCallbacks = {
  onProgress: (result: ToolResultRow, index: number) => void;
  onComplete: () => void;
  onError?: (error: Error) => void;
};

export type QueueState = "idle" | "running" | "paused" | "cancelled";

/**
 * Client-side scan queue with concurrency control, pause/resume, and abort.
 */
export class ScanQueue {
  private items: QueueItem[] = [];
  private results: Map<number, ToolResultRow> = new Map();
  private state: QueueState = "idle";
  private concurrency: number;
  private activeCount = 0;
  private nextIndex = 0;
  private abortController: AbortController | null = null;
  private paused = false;
  private pauseResolve: (() => void) | null = null;
  private checkFn: (url: string, signal: AbortSignal) => Promise<ToolResultRow>;
  private callbacks: QueueCallbacks;

  constructor(
    checkFn: (url: string, signal: AbortSignal) => Promise<ToolResultRow>,
    callbacks: QueueCallbacks,
    concurrency = DEFAULT_CONCURRENCY,
  ) {
    this.checkFn = checkFn;
    this.callbacks = callbacks;
    this.concurrency = concurrency;
  }

  start(urls: string[]): void {
    this.reset();
    this.items = urls.map((url, index) => ({ url, index }));
    this.state = "running";
    this.abortController = new AbortController();
    this.pump();
  }

  pause(): void {
    if (this.state === "running") {
      this.paused = true;
      this.state = "paused";
    }
  }

  resume(): void {
    if (this.state === "paused") {
      this.paused = false;
      this.state = "running";
      if (this.pauseResolve) {
        this.pauseResolve();
        this.pauseResolve = null;
      }
      this.pump();
    }
  }

  cancel(): void {
    this.state = "cancelled";
    this.paused = false;
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
    this.abortController?.abort();
  }

  retryFailed(failedUrls: string[], allUrls: string[]): void {
    const urlSet = new Set(failedUrls);
    const toRetry = allUrls.filter((u) => urlSet.has(u));
    this.start(toRetry);
  }

  getState(): QueueState {
    return this.state;
  }

  private reset(): void {
    this.items = [];
    this.results.clear();
    this.activeCount = 0;
    this.nextIndex = 0;
    this.paused = false;
    this.pauseResolve = null;
    this.abortController?.abort();
    this.abortController = null;
  }

  private async waitIfPaused(): Promise<boolean> {
    if (!this.paused) return true;
    await new Promise<void>((resolve) => {
      this.pauseResolve = resolve;
    });
    return this.state !== "cancelled";
  }

  private pump(): void {
    if (this.state === "cancelled" || this.paused) return;

    while (this.activeCount < this.concurrency && this.nextIndex < this.items.length) {
      const item = this.items[this.nextIndex]!;
      this.nextIndex++;
      this.activeCount++;
      void this.processItem(item);
    }

    if (this.activeCount === 0 && this.nextIndex >= this.items.length && this.state === "running") {
      this.state = "idle";
      this.callbacks.onComplete();
    }
  }

  private async processItem(item: QueueItem): Promise<void> {
    try {
      const canContinue = await this.waitIfPaused();
      if (!canContinue || this.state === "cancelled") {
        this.activeCount--;
        return;
      }

      const signal = this.abortController?.signal ?? new AbortController().signal;
      const result = await this.checkFn(item.url, signal);
      this.results.set(item.index, result);
      this.callbacks.onProgress(result, item.index);
    } catch (err) {
      if (this.state !== "cancelled") {
        this.callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      this.activeCount--;
      this.pump();
    }
  }
}
