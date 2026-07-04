/**
 * Parse CSV content into rows of strings.
 * Handles quoted fields and UTF-8 BOM.
 */
export function parseCSV(content: string): string[][] {
  const text = content.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      current.push(field.trim());
      field = "";
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      current.push(field.trim());
      if (current.some((c) => c)) rows.push(current);
      current = [];
      field = "";
      if (char === "\r") i++;
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || current.length > 0) {
    current.push(field.trim());
    if (current.some((c) => c)) rows.push(current);
  }

  return rows;
}

/**
 * Extract URLs from CSV content.
 * Uses first column or column named url/domain/website.
 */
export function extractUrlsFromCSV(content: string): string[] {
  const rows = parseCSV(content);
  if (rows.length === 0) return [];

  const header = rows[0]!.map((h) => h.toLowerCase());
  const urlColIndex = header.findIndex((h) =>
    ["url", "urls", "domain", "domains", "website", "link", "links"].includes(h),
  );

  const dataRows = urlColIndex >= 0 ? rows.slice(1) : rows;
  const colIndex = urlColIndex >= 0 ? urlColIndex : 0;

  return dataRows.map((row) => row[colIndex] ?? "").filter(Boolean);
}
