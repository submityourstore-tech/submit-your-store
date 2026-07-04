import type { RegisteredChecker, ToolCheckerFn } from "@/types/tools";

const checkers = new Map<string, ToolCheckerFn>();

/**
 * Register a tool checker. Each future tool adds one file and calls this.
 *
 * @example
 * // lib/checkers/checkers/my-tool.ts
 * registerChecker("my-tool", async (url, ctx) => ({ status: "success", score: 100 }));
 */
export function registerChecker(slug: string, check: ToolCheckerFn): void {
  checkers.set(slug, check);
}

export function getChecker(slug: string): ToolCheckerFn | undefined {
  return checkers.get(slug);
}

/**
 * Server-authoritative check for whether a checker implementation is registered.
 * Only meaningful after `lib/checkers/load-checkers.ts` has run. Client code
 * should use `isToolAvailable` from `lib/tools/registry.ts` instead.
 */
export function hasChecker(slug: string): boolean {
  return checkers.has(slug);
}

export function getRegisteredCheckerSlugs(): string[] {
  return Array.from(checkers.keys());
}

export function listCheckers(): RegisteredChecker[] {
  return Array.from(checkers.entries()).map(([slug, check]) => ({ slug, check }));
}

/** Re-export checker modules here as they are created. */
// Checkers are registered via lib/checkers/load-checkers.ts
