import type { ToolColumnDef, ToolResultRow } from "@/types/tools";
import { formatCellValue } from "@/utils/format";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function rowsToCsv(rows: ToolResultRow[], columns: ToolColumnDef[]): string {
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvField(formatCellValue(row[c.key]))).join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCSV(
  rows: ToolResultRow[],
  columns: ToolColumnDef[],
  filename: string,
): void {
  const csv = rowsToCsv(rows, columns);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { triggerDownload };
