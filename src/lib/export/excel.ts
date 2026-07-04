import * as XLSX from "xlsx";
import type { ToolColumnDef, ToolResultRow } from "@/types/tools";
import { formatCellValue } from "@/utils/format";
import { triggerDownload } from "@/lib/export/csv";

export function downloadExcel(
  rows: ToolResultRow[],
  columns: ToolColumnDef[],
  filename: string,
): void {
  const headers = columns.map((c) => c.label);
  const data = rows.map((row) => columns.map((c) => formatCellValue(row[c.key])));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Auto column width
  ws["!cols"] = columns.map((col, i) => {
    const maxLen = Math.max(
      col.label.length,
      ...data.map((row) => (row[i] ?? "").length),
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });

  // Freeze header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
