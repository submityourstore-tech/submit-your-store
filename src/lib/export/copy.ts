import type { ToolColumnDef, ToolResultRow } from "@/types/tools";
import { formatCellValue } from "@/utils/format";

/**
 * Convert rows to tab-separated values suitable for Excel/Google Sheets paste.
 */
export function rowsToTsv(rows: ToolResultRow[], columns: ToolColumnDef[]): string {
  const header = columns.map((c) => c.label).join("\t");
  const body = rows
    .map((row) => columns.map((c) => formatCellValue(row[c.key])).join("\t"))
    .join("\n");
  return `${header}\n${body}`;
}

export async function copyTable(
  rows: ToolResultRow[],
  columns: ToolColumnDef[],
): Promise<boolean> {
  const tsv = rowsToTsv(rows, columns);
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = tsv;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
