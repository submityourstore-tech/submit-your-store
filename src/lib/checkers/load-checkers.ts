/**
 * Side-effect module — registers all server-side tool checkers.
 * Import this once from API routes and server actions.
 *
 * To add a new tool checker:
 *   1. Create `lib/checkers/checkers/{slug}.ts` exporting a `check` function.
 *   2. Register it below.
 *   3. Set `available: true` on the matching tool in `lib/tools/registry.ts`.
 *
 * The `validateCheckerRegistry()` call below auto-detects any drift between the
 * shared metadata registry (`available` flags) and the actually-registered
 * checkers, so the two can never silently diverge.
 */
import { getRegisteredCheckerSlugs, registerChecker } from "@/lib/checkers/registry";
import { getAvailableToolSlugs, getTool } from "@/lib/tools/registry";
import { check as statusCodeCheck } from "@/lib/checkers/checkers/status-code-checker";
import { check as redirectCheck } from "@/lib/checkers/checkers/redirect-checker";

registerChecker("status-code-checker", statusCodeCheck);
registerChecker("redirect-checker", redirectCheck);

/**
 * Ensure every tool marked `available` has a registered checker and every
 * registered checker maps to a known tool marked `available`. Throws on drift
 * so problems surface immediately at startup rather than as a broken scan.
 */
function validateCheckerRegistry(): void {
  const available = new Set(getAvailableToolSlugs());
  const registered = new Set(getRegisteredCheckerSlugs());

  const missingChecker = [...available].filter((slug) => !registered.has(slug));
  const missingMetadata = [...registered].filter((slug) => {
    const tool = getTool(slug);
    return !tool || tool.available !== true;
  });

  const problems: string[] = [];
  if (missingChecker.length > 0) {
    problems.push(
      `Tools marked available with no registered checker: ${missingChecker.join(", ")}. ` +
        `Register them in lib/checkers/load-checkers.ts.`,
    );
  }
  if (missingMetadata.length > 0) {
    problems.push(
      `Registered checkers not marked available in the tool registry: ${missingMetadata.join(", ")}. ` +
        `Set \`available: true\` on the matching tool in lib/tools/registry.ts.`,
    );
  }

  if (problems.length > 0) {
    throw new Error(`[checkers] Registry mismatch:\n- ${problems.join("\n- ")}`);
  }
}

validateCheckerRegistry();
