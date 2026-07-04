"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ToolColumnDef, ToolResultRow } from "@/types/tools";
import { copyTable } from "@/lib/export/copy";
import { downloadCSV } from "@/lib/export/csv";
import { downloadExcel } from "@/lib/export/excel";
import { downloadJSON } from "@/lib/export/json";
import { toPrettyJSON } from "@/lib/export/json";
import { copyText } from "@/lib/export/copy";
import { Download, Copy, Printer, Share2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type ExportMenuProps = {
  rows: ToolResultRow[];
  selectedRows: ToolResultRow[];
  columns: ToolColumnDef[];
  filename: string;
};

export function ExportMenu({ rows, selectedRows, columns, filename }: ExportMenuProps) {
  const exportRows = selectedRows.length > 0 ? selectedRows : rows;

  async function handleCopy(all: boolean) {
    const data = all ? rows : selectedRows;
    const ok = await copyTable(data, columns);
    toast[ok ? "success" : "error"](ok ? "Copied to clipboard" : "Copy failed");
  }

  function handleDownload(format: "csv" | "xlsx" | "json", selected: boolean) {
    const data = selected ? selectedRows : rows;
    const name = `${filename}${selected ? "-selected" : ""}`;
    if (format === "csv") downloadCSV(data, columns, name);
    else if (format === "xlsx") downloadExcel(data, columns, name);
    else downloadJSON(data, name);
    toast.success(`Downloaded ${format.toUpperCase()}`);
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const json = toPrettyJSON(rows);
    const ok = await copyText(json);
    toast[ok ? "success" : "info"](
      ok ? "Results JSON copied — paste to share" : "Share link coming soon",
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4" />
          Export
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => handleDownload("csv", false)}>
          Download CSV (All)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("xlsx", false)}>
          Download Excel (All)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("json", false)}>
          Download JSON (All)
        </DropdownMenuItem>
        {selectedRows.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDownload("csv", true)}>
              Download Selected CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("xlsx", true)}>
              Download Selected Excel
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleCopy(true)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Entire Table
        </DropdownMenuItem>
        {selectedRows.length > 0 && (
          <DropdownMenuItem onClick={() => void handleCopy(false)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Selected Rows
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Results
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleShare()}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
