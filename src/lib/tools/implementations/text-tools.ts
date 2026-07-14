// ---------------------------------------------------------------------------
// Text & Content tool implementations
// ---------------------------------------------------------------------------

type AnalyzeResult = { label: string; value: string | number }[];
type AnalyzeFn = (text: string) => AnalyzeResult;
type TransformFn = (input: string, options?: Record<string, string>) => string;

// ── helpers ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "because", "but", "and", "or", "if", "while", "about", "up", "this",
  "that", "these", "those", "it", "its", "i", "me", "my", "we", "our",
  "you", "your", "he", "him", "his", "she", "her", "they", "them", "their",
  "what", "which", "who", "whom", "am",
]);

function getWords(text: string): string[] {
  return text.match(/[\w'']+/g) ?? [];
}

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function getLines(text: string): string[] {
  return text.split(/\r?\n/);
}

function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  const matches = w.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

function formatTime(minutes: number): string {
  if (minutes < 1) return `${Math.ceil(minutes * 60)} sec`;
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
}

// ── 1. word-counter ────────────────────────────────────────────────────────

export const wordCounter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const words = getWords(text);
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = getSentences(text).length;
    const paragraphs = getParagraphs(text).length;
    const readingMin = words.length / 200;
    const speakingMin = words.length / 130;

    return [
      { label: "Words", value: words.length },
      { label: "Characters", value: chars },
      { label: "Characters (no spaces)", value: charsNoSpaces },
      { label: "Sentences", value: sentences },
      { label: "Paragraphs", value: paragraphs },
      { label: "Reading Time", value: formatTime(readingMin) },
      { label: "Speaking Time", value: formatTime(speakingMin) },
    ];
  },
};

// ── 2. character-counter ───────────────────────────────────────────────────

export const characterCounter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = getWords(text).length;
    const lines = getLines(text).length;
    const bytes = new TextEncoder().encode(text).length;

    return [
      { label: "Total Characters", value: chars },
      { label: "Characters (no spaces)", value: charsNoSpaces },
      { label: "Words", value: words },
      { label: "Lines", value: lines },
      { label: "Bytes (UTF-8)", value: bytes },
    ];
  },
};

// ── 3. keyword-density-checker ─────────────────────────────────────────────

function nGrams(words: string[], n: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n).join(" ");
    map.set(gram, (map.get(gram) ?? 0) + 1);
  }
  return map;
}

function topEntries(map: Map<string, number>, limit: number, total: number) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({
      word,
      count,
      pct: ((count / total) * 100).toFixed(2),
    }));
}

export const keywordDensityChecker: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const raw = getWords(text).map((w) => w.toLowerCase());
    const filtered = raw.filter((w) => !STOP_WORDS.has(w) && w.length > 1);
    const total = raw.length;
    if (total === 0) return [{ label: "Result", value: "No words found" }];

    const uni = nGrams(filtered, 1);
    const bi = nGrams(filtered, 2);
    const tri = nGrams(filtered, 3);

    const results: AnalyzeResult = [];
    results.push({ label: "── Single Words (top 20)", value: "" });
    for (const e of topEntries(uni, 20, total)) {
      results.push({ label: e.word, value: `${e.count}× (${e.pct}%)` });
    }
    results.push({ label: "── Two-Word Phrases (top 10)", value: "" });
    for (const e of topEntries(bi, 10, total)) {
      results.push({ label: e.word, value: `${e.count}× (${e.pct}%)` });
    }
    results.push({ label: "── Three-Word Phrases (top 10)", value: "" });
    for (const e of topEntries(tri, 10, total)) {
      results.push({ label: e.word, value: `${e.count}× (${e.pct}%)` });
    }
    return results;
  },
};

// ── 4. reading-time-calculator ─────────────────────────────────────────────

export const readingTimeCalculator: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const words = getWords(text);
    const count = words.length;
    const readingMin = count / 200;
    const speakingMin = count / 130;
    const avgLen =
      count > 0
        ? (words.reduce((s, w) => s + w.length, 0) / count).toFixed(1)
        : "0";
    const longest =
      count > 0
        ? words.reduce((a, b) => (a.length >= b.length ? a : b), "")
        : "—";

    return [
      { label: "Words", value: count },
      { label: "Reading Time", value: formatTime(readingMin) },
      { label: "Speaking Time", value: formatTime(speakingMin) },
      { label: "Average Word Length", value: `${avgLen} chars` },
      { label: "Longest Word", value: longest },
    ];
  },
};

// ── 5. readability-checker ─────────────────────────────────────────────────

export const readabilityChecker: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const words = getWords(text);
    const sentences = getSentences(text);
    const wordCount = words.length;
    const sentCount = sentences.length || 1;
    const totalSyllables = words.reduce((s, w) => s + syllableCount(w), 0);

    const avgSentLen = wordCount / sentCount;
    const avgSylPerWord = totalSyllables / (wordCount || 1);

    const fleschEase =
      206.835 - 1.015 * avgSentLen - 84.6 * avgSylPerWord;
    const fkGrade =
      0.39 * avgSentLen + 11.8 * avgSylPerWord - 15.59;

    const ease = Math.round(fleschEase * 10) / 10;
    const grade = Math.round(fkGrade * 10) / 10;

    let interpretation: string;
    if (ease >= 80) interpretation = "Easy to read";
    else if (ease >= 60) interpretation = "Standard / Plain English";
    else if (ease >= 40) interpretation = "Fairly difficult";
    else if (ease >= 20) interpretation = "College level";
    else interpretation = "Very difficult / Academic";

    const avgWordLen =
      wordCount > 0
        ? (words.reduce((s, w) => s + w.length, 0) / wordCount).toFixed(1)
        : "0";

    return [
      { label: "Flesch-Kincaid Grade Level", value: grade },
      { label: "Flesch Reading Ease", value: ease },
      { label: "Average Sentence Length", value: `${avgSentLen.toFixed(1)} words` },
      { label: "Average Word Length", value: `${avgWordLen} chars` },
      { label: "Interpretation", value: interpretation },
    ];
  },
};

// ── 6. line-counter ────────────────────────────────────────────────────────

export const lineCounter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const lines = getLines(text);
    const nonEmpty = lines.filter((l) => l.trim().length > 0);
    const emptyCount = lines.length - nonEmpty.length;
    const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b), "");
    const avgLen =
      lines.length > 0
        ? (lines.reduce((s, l) => s + l.length, 0) / lines.length).toFixed(1)
        : "0";

    return [
      { label: "Total Lines", value: lines.length },
      { label: "Non-Empty Lines", value: nonEmpty.length },
      { label: "Empty Lines", value: emptyCount },
      { label: "Longest Line Length", value: `${longest.length} chars` },
      { label: "Average Line Length", value: `${avgLen} chars` },
    ];
  },
};

// ── 7. sentence-counter ────────────────────────────────────────────────────

export const sentenceCounter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const sentences = getSentences(text);
    const count = sentences.length;
    if (count === 0) return [{ label: "Total Sentences", value: 0 }];

    const lengths = sentences.map((s) => getWords(s).length);
    const avg = (lengths.reduce((a, b) => a + b, 0) / count).toFixed(1);
    const longestIdx = lengths.indexOf(Math.max(...lengths));
    const shortestIdx = lengths.indexOf(Math.min(...lengths));

    return [
      { label: "Total Sentences", value: count },
      { label: "Average Sentence Length", value: `${avg} words` },
      { label: "Longest Sentence", value: sentences[longestIdx] },
      { label: "Shortest Sentence", value: sentences[shortestIdx] },
    ];
  },
};

// ── 8. paragraph-counter ───────────────────────────────────────────────────

export const paragraphCounter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const paragraphs = getParagraphs(text);
    const words = getWords(text);
    const sentences = getSentences(text);
    const avgParaLen =
      paragraphs.length > 0
        ? (words.length / paragraphs.length).toFixed(1)
        : "0";

    return [
      { label: "Total Paragraphs", value: paragraphs.length },
      { label: "Average Paragraph Length", value: `${avgParaLen} words` },
      { label: "Total Words", value: words.length },
      { label: "Total Sentences", value: sentences.length },
    ];
  },
};

// ── 9. url-slug-generator ──────────────────────────────────────────────────

export const urlSlugGenerator: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    const sep = options.separator === "underscore" ? "_" : "-";
    let slug = input.trim();

    if (options.lowercase !== "no") slug = slug.toLowerCase();

    slug = slug
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/[\s]+/g, sep)
      .replace(new RegExp(`[${sep}]{2,}`, "g"), sep)
      .replace(new RegExp(`^${sep}|${sep}$`, "g"), "");

    return slug;
  },
};

// ── 10. remove-duplicate-lines ─────────────────────────────────────────────

export const removeDuplicateLines: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    const lines = getLines(input);
    const seen = new Set<string>();
    const unique: string[] = [];
    let dupes = 0;

    for (const line of lines) {
      if (seen.has(line)) {
        dupes++;
        continue;
      }
      seen.add(line);
      unique.push(line);
    }

    let result = options.sort === "yes" ? unique.sort() : unique;
    return result.join("\n") + `\n\n[${dupes} duplicate line(s) removed]`;
  },
};

// ── 11. remove-extra-spaces ────────────────────────────────────────────────

export const removeExtraSpaces: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    let result = input
      .split("\n")
      .map((line) => line.trim().replace(/ {2,}/g, " "))
      .join("\n");

    if (options.removeEmptyLines === "yes") {
      result = result
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .join("\n");
    }

    return result;
  },
};

// ── 12. text-sorter ────────────────────────────────────────────────────────

export const textSorter: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    let lines = getLines(input).filter((l) => l.trim().length > 0);

    const numeric = options.numeric === "yes";
    const caseSensitive = options.caseSensitive === "yes";

    lines.sort((a, b) => {
      if (numeric) {
        const na = parseFloat(a) || 0;
        const nb = parseFloat(b) || 0;
        return na - nb;
      }
      const la = caseSensitive ? a : a.toLowerCase();
      const lb = caseSensitive ? b : b.toLowerCase();
      return la.localeCompare(lb);
    });

    if (options.order === "descending" || options.reverse === "yes") {
      lines.reverse();
    }

    return lines.join("\n");
  },
};

// ── 13. text-reverser ──────────────────────────────────────────────────────

export const textReverser: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    const mode = options.mode ?? "text";

    switch (mode) {
      case "lines":
        return getLines(input).reverse().join("\n");
      case "words":
        return getLines(input)
          .map((line) => line.split(/\s+/).reverse().join(" "))
          .join("\n");
      case "text":
      default:
        return Array.from(input).reverse().join("");
    }
  },
};

// ── 14. case-converter ─────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}

function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\s*|[.!?]\s+)(\w)/g, (_, pre, ch) => pre + ch.toUpperCase());
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
    .replace(/^[A-Z]/, (ch) => ch.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s\-]+/g, "_")
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

function toDotCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .replace(/[\s_\-]+/g, ".")
    .toLowerCase();
}

function toToggleCase(str: string): string {
  return Array.from(str)
    .map((ch) =>
      ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase(),
    )
    .join("");
}

export const caseConverter: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    const mode = options.case ?? "lowercase";

    switch (mode) {
      case "UPPERCASE":
        return input.toUpperCase();
      case "lowercase":
        return input.toLowerCase();
      case "Title Case":
        return toTitleCase(input);
      case "Sentence case":
        return toSentenceCase(input);
      case "camelCase":
        return toCamelCase(input);
      case "PascalCase":
        return toPascalCase(input);
      case "snake_case":
        return toSnakeCase(input);
      case "kebab-case":
        return toKebabCase(input);
      case "CONSTANT_CASE":
        return toConstantCase(input);
      case "dot.case":
        return toDotCase(input);
      case "Toggle cAsE":
        return toToggleCase(input);
      default:
        return input;
    }
  },
};

// ── 15. text-to-html ──────────────────────────────────────────────────────

export const textToHtml: { transformFn: TransformFn } = {
  transformFn(input) {
    if (!input.trim()) return "";

    const escaped = input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const paragraphs = escaped.split(/\n\s*\n/);
    return paragraphs
      .map((p) => {
        const withBr = p.trim().replace(/\n/g, "<br>\n");
        return `<p>${withBr}</p>`;
      })
      .join("\n\n");
  },
};

// ── 16. html-to-text ──────────────────────────────────────────────────────

export const htmlToText: { transformFn: TransformFn } = {
  transformFn(input) {
    if (!input.trim()) return "";

    let text = input;
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
    text = text.replace(/<\/div>\s*<div[^>]*>/gi, "\n");
    text = text.replace(/<\/h[1-6]>/gi, "\n\n");
    text = text.replace(/<li[^>]*>/gi, "• ");
    text = text.replace(/<\/li>/gi, "\n");
    text = text.replace(/<[^>]+>/g, "");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/\n{3,}/g, "\n\n");
    return text.trim();
  },
};

// ── 17. word-frequency-counter ────────────────────────────────────────────

export const wordFrequencyCounter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const words = getWords(text).map((w) => w.toLowerCase());
    if (words.length === 0) return [{ label: "Result", value: "No words found" }];

    const freq = new Map<string, number>();
    for (const w of words) {
      if (w.length < 2) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }

    const sorted = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const results: AnalyzeResult = [
      { label: "Total Words", value: words.length },
      { label: "Unique Words", value: freq.size },
      { label: "── Top 20 Words ──", value: "" },
    ];

    for (const [word, count] of sorted) {
      const pct = ((count / words.length) * 100).toFixed(1);
      results.push({ label: word, value: `${count}× (${pct}%)` });
    }

    return results;
  },
};

// ── 18. text-diff-checker ─────────────────────────────────────────────────

export const textDiffChecker: { fields: GenFields; generate: GenerateFn } = {
  fields: [
    { key: "text1", label: "Original Text", type: "textarea", placeholder: "Paste the original text here…", required: true, rows: 8 },
    { key: "text2", label: "Modified Text", type: "textarea", placeholder: "Paste the modified text here…", required: true, rows: 8 },
  ],
  generate(v) {
    const lines1 = (v.text1 || "").split("\n");
    const lines2 = (v.text2 || "").split("\n");
    const maxLen = Math.max(lines1.length, lines2.length);

    if (!v.text1?.trim() && !v.text2?.trim()) {
      return "<p>Please enter text in both fields to compare.</p>";
    }

    const rows: string[] = [];
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    for (let i = 0; i < maxLen; i++) {
      const l1 = i < lines1.length ? lines1[i] : undefined;
      const l2 = i < lines2.length ? lines2[i] : undefined;

      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      if (l1 === l2) {
        unchanged++;
        rows.push(`<div style="padding:2px 8px;font-family:monospace;font-size:13px;white-space:pre-wrap;color:#333;background:#fff;border-bottom:1px solid #f0f0f0;"><span style="color:#999;margin-right:8px;">${i + 1}</span>${esc(l1 ?? "")}</div>`);
      } else {
        if (l1 !== undefined) {
          deletions++;
          rows.push(`<div style="padding:2px 8px;font-family:monospace;font-size:13px;white-space:pre-wrap;color:#b31d28;background:#ffeef0;border-bottom:1px solid #f0f0f0;"><span style="color:#999;margin-right:8px;">${i + 1}</span><strong>−</strong> ${esc(l1)}</div>`);
        }
        if (l2 !== undefined) {
          additions++;
          rows.push(`<div style="padding:2px 8px;font-family:monospace;font-size:13px;white-space:pre-wrap;color:#22863a;background:#e6ffec;border-bottom:1px solid #f0f0f0;"><span style="color:#999;margin-right:8px;">${i + 1}</span><strong>+</strong> ${esc(l2)}</div>`);
        }
      }
    }

    return `<div style="font-family:system-ui,sans-serif;max-width:800px;">
  <div style="display:flex;gap:16px;margin-bottom:16px;font-size:13px;">
    <span style="color:#22863a;font-weight:600;">+${additions} additions</span>
    <span style="color:#b31d28;font-weight:600;">−${deletions} deletions</span>
    <span style="color:#666;">${unchanged} unchanged</span>
  </div>
  <div style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">${rows.join("")}</div>
</div>`;
  },
};

// ── 19. SERP Snippet Preview ──────────────────────────────────────────────

type GenFields = { key: string; label: string; type: string; placeholder?: string; defaultValue?: string | number | boolean; options?: { value: string; label: string }[]; required?: boolean; rows?: number }[];
type GenerateFn = (values: Record<string, string>) => string;

export const serpSnippetPreview: { fields: GenFields; generate: GenerateFn } = {
  fields: [
    { key: "title", label: "Page Title", type: "text", placeholder: "e.g. Best Coffee Shop in New York", required: true },
    { key: "url", label: "Page URL", type: "url", placeholder: "https://example.com/page" },
    { key: "description", label: "Meta Description", type: "textarea", placeholder: "Enter your meta description here…", rows: 3 },
  ],
  generate(v) {
    const title = v.title || "Page Title";
    const url = v.url || "https://example.com";
    const desc = v.description || "No description provided.";
    const titleTrunc = title.length > 60 ? title.slice(0, 57) + "…" : title;
    const descTrunc = desc.length > 160 ? desc.slice(0, 157) + "…" : desc;

    return `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 16px;">
  <div style="margin-bottom: 4px;">
    <span style="font-size: 14px; color: #202124;">${url}</span>
  </div>
  <div style="margin-bottom: 4px;">
    <a href="#" style="font-size: 20px; color: #1a0dab; text-decoration: none; line-height: 1.3;">${titleTrunc}</a>
  </div>
  <div style="font-size: 14px; color: #4d5156; line-height: 1.58;">
    ${descTrunc}
  </div>
</div>
<hr style="margin-top: 20px; border: none; border-top: 1px solid #e0e0e0;" />
<p style="font-size: 13px; color: #666; margin-top: 12px;">
  <strong>Title length:</strong> ${title.length}/60 characters ${title.length > 60 ? "⚠️ Too long" : "✅ Good"}<br/>
  <strong>Description length:</strong> ${desc.length}/160 characters ${desc.length > 160 ? "⚠️ Too long" : desc.length < 120 ? "⚠️ Consider adding more" : "✅ Good"}
</p>`;
  },
};

// ── 16. Random Text Generator ─────────────────────────────────────────────

const RANDOM_WORDS = [
  "ability", "achieve", "adapt", "advance", "approach", "balance", "benefit",
  "build", "capable", "change", "clarity", "commit", "connect", "create",
  "decide", "deliver", "design", "develop", "discover", "drive", "effect",
  "enable", "engage", "enhance", "ensure", "evolve", "explore", "focus",
  "forward", "global", "growth", "guide", "impact", "improve", "include",
  "insight", "inspire", "invest", "journey", "knowledge", "launch", "lead",
  "manage", "method", "model", "nature", "network", "offer", "operate",
  "outcome", "partner", "perform", "plan", "potential", "power", "practice",
  "process", "product", "progress", "project", "provide", "purpose", "quality",
  "reach", "reason", "region", "report", "require", "resource", "respond",
  "result", "review", "scope", "secure", "service", "share", "simple",
  "solution", "source", "space", "standard", "strategy", "strength", "structure",
  "success", "support", "sustain", "target", "team", "together", "tools",
  "transform", "unique", "value", "vision", "welcome", "wonder", "yield",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSentence(minWords: number, maxWords: number): string {
  const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(pick(RANDOM_WORDS));
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

export const randomTextGenerator: { fields: GenFields; generate: GenerateFn } = {
  fields: [
    {
      key: "type", label: "Output Type", type: "select", defaultValue: "paragraphs",
      options: [
        { value: "paragraphs", label: "Paragraphs" },
        { value: "sentences", label: "Sentences" },
        { value: "words", label: "Words" },
      ],
    },
    { key: "count", label: "Count", type: "number", placeholder: "3", defaultValue: "3" },
  ],
  generate(v) {
    const count = Math.max(1, Math.min(50, parseInt(v.count || "3", 10)));
    const type = v.type || "paragraphs";

    if (type === "words") {
      const words: string[] = [];
      for (let i = 0; i < count; i++) words.push(pick(RANDOM_WORDS));
      return words.join(" ");
    }
    if (type === "sentences") {
      const out: string[] = [];
      for (let i = 0; i < count; i++) out.push(randomSentence(6, 14));
      return out.join(" ");
    }
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const sentCount = 3 + Math.floor(Math.random() * 4);
      const sents: string[] = [];
      for (let s = 0; s < sentCount; s++) sents.push(randomSentence(6, 14));
      paragraphs.push(sents.join(" "));
    }
    return paragraphs.join("\n\n");
  },
};

// ── 17. Lorem Ipsum Generator ─────────────────────────────────────────────

const LOREM_BASE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const LOREM_SENTENCES = [
  "Curabitur pretium tincidunt lacus, a gravida augue.",
  "Nulla facilisi. Etiam non diam ante.",
  "Donec eget efficitur mi, et fermentum quam.",
  "Vestibulum tortor quam, feugiat vitae, ultricies eget.",
  "Pellentesque habitant morbi tristique senectus et netus.",
  "Aenean ultricies mi vitae est mauris, sit amet ornare nibh.",
  "Phasellus blandit leo ut odio efficitur tincidunt.",
  "Integer nec odio praesent libero sed cursus ante dapibus diam.",
  "Maecenas tempus tellus eget condimentum rhoncus sem.",
  "Fusce dapibus tellus ac cursus commodo tortor mauris condimentum.",
  "Morbi in sem quis dui placerat ornare pellentesque.",
  "Praesent blandit dolor sed nunc vestibulum congue.",
  "Quisque volutpat condimentum velit class aptent taciti.",
  "Nam nec ante sed lacinia magna quam cumque sapien.",
  "Suspendisse in justo eu magna luctus suscipit nam nisi elit.",
  "Sed magna purus fermentum eu tristique vitae.",
  "Vivamus vestibulum nulla nec ante egestas rutrum.",
  "Mauris vel quam nunc praesent ut ligula non mi varius sagittis.",
];

function loremSentence(): string {
  return pick(LOREM_SENTENCES);
}

function loremParagraph(first: boolean): string {
  const sentCount = 4 + Math.floor(Math.random() * 4);
  const sents: string[] = [];
  if (first) {
    sents.push(LOREM_BASE.split(". ").slice(0, 2).join(". ") + ".");
  }
  while (sents.length < sentCount) sents.push(loremSentence());
  return sents.join(" ");
}

export const loremIpsumGenerator: { fields: GenFields; generate: GenerateFn } = {
  fields: [
    {
      key: "type", label: "Output Type", type: "select", defaultValue: "paragraphs",
      options: [
        { value: "paragraphs", label: "Paragraphs" },
        { value: "sentences", label: "Sentences" },
        { value: "words", label: "Words" },
      ],
    },
    { key: "count", label: "Count", type: "number", placeholder: "5", defaultValue: "5" },
    { key: "startWithLorem", label: "Start with 'Lorem ipsum…'", type: "checkbox", defaultValue: "true" },
  ],
  generate(v) {
    const count = Math.max(1, Math.min(100, parseInt(v.count || "5", 10)));
    const type = v.type || "paragraphs";
    const startClassic = v.startWithLorem !== "false";

    if (type === "words") {
      const allWords = LOREM_BASE.split(/\s+/);
      const extra = LOREM_SENTENCES.join(" ").split(/\s+/);
      const pool = [...allWords, ...extra];
      const out: string[] = [];
      if (startClassic) out.push("Lorem", "ipsum");
      while (out.length < count) out.push(pick(pool).toLowerCase().replace(/[.,]/g, ""));
      return out.slice(0, count).join(" ");
    }
    if (type === "sentences") {
      const out: string[] = [];
      if (startClassic) out.push(LOREM_BASE.split(". ")[0] + ".");
      while (out.length < count) out.push(loremSentence());
      return out.slice(0, count).join(" ");
    }
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) paragraphs.push(loremParagraph(startClassic && p === 0));
    return paragraphs.join("\n\n");
  },
};
