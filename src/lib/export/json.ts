import type { ToolResultRow } from "@/types/tools";
import { triggerDownload } from "@/lib/export/csv";

export function downloadJSON(rows: ToolResultRow[], filename: string): void {
  const json = JSON.stringify(rows, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

export function toPrettyJSON(rows: ToolResultRow[]): string {
  return JSON.stringify(rows, null, 2);
}
