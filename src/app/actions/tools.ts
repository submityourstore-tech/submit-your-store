"use server";

import { runChecker } from "@/lib/checkers/runner";
import { getTool } from "@/lib/tools/registry";
import type { ToolResultRow } from "@/types/tools";

import "@/lib/checkers/load-checkers";

/**
 * Server Action for scanning a single URL.
 * Alternative to POST /api/tools/scan for Server Components / forms.
 */
export async function scanUrlAction(
  toolSlug: string,
  url: string,
): Promise<{ result?: ToolResultRow; error?: string }> {
  const tool = getTool(toolSlug);
  if (!tool) return { error: "Unknown tool." };
  if (!url.trim()) return { error: "Missing URL." };

  try {
    const result = await runChecker(toolSlug, url);
    return { result };
  } catch (err) {
    console.error("scanUrlAction failed:", err);
    return { error: "Scan failed." };
  }
}
