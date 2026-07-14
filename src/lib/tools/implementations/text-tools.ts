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
