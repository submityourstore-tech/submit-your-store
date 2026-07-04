/**
 * Parse TXT content into URL strings.
 * Splits on newlines, commas, semicolons, tabs, and pipes.
 */
export function parseTXT(content: string): string[] {
  return content
    .replace(/^\uFEFF/, "")
    .split(/[\n\r,;|\t]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
