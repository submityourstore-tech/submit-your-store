/**
 * TEMPLATE — Copy this file to create a new SEO tool checker.
 *
 * 1. Copy to: lib/checkers/checkers/{your-tool-slug}.ts
 * 2. Implement the `check` function with your tool logic
 * 3. Register in lib/checkers/load-checkers.ts
 * 4. Add tool metadata to lib/tools/registry.ts
 *
 * That's it — the framework handles input, progress, results, export, and SEO.
 */

import { registerChecker } from "@/lib/checkers/registry";
import type { CheckerContext } from "@/types/tools";

async function check(url: string, ctx: CheckerContext) {
  // Your checking logic here.
  // Use ctx.signal for abort support.
  // Return tool-specific fields; framework adds url, normalizedUrl, status, responseTimeMs.

  void ctx;

  return {
    status: "success" as const,
    // exampleField: "value",
  };
}

// registerChecker("your-tool-slug", check);

export { check };
