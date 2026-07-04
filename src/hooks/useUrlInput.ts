"use client";

import { useCallback, useMemo, useState } from "react";
import { MAX_URLS, SAMPLE_URLS } from "@/constants/tools";
import { extractUrlsFromCSV } from "@/lib/parser/csv";
import { parseTXT } from "@/lib/parser/txt";
import { normalizeUrl, parseUrlLines, removeDuplicates, validateUrl } from "@/utils/url";

export type UrlInputState = {
  text: string;
  urls: string[];
  invalidCount: number;
  duplicateRemoved: number;
};

export function useUrlInput(maxUrls = MAX_URLS, sampleUrls?: string[]) {
  const [text, setText] = useState("");
  const [autoDedupe, setAutoDedupe] = useState(true);

  const parsed = useMemo(() => {
    const raw = parseUrlLines(text);
    const beforeDedupe = raw.length;
    const urls = autoDedupe ? removeDuplicates(raw.map(normalizeUrl)) : raw.map(normalizeUrl).filter(Boolean);
    const duplicateRemoved = autoDedupe ? beforeDedupe - urls.length : 0;
    const invalidCount = urls.filter((u) => !validateUrl(u).valid).length;
    return {
      urls: urls.slice(0, maxUrls),
      invalidCount,
      duplicateRemoved,
      total: urls.length,
    };
  }, [text, autoDedupe, maxUrls]);

  const appendUrls = useCallback(
    (newUrls: string[]) => {
      setText((prev) => {
        const existing = parseUrlLines(prev);
        const combined = autoDedupe
          ? removeDuplicates([...existing, ...newUrls].map(normalizeUrl))
          : [...existing, ...newUrls];
        return combined.slice(0, maxUrls).join("\n");
      });
    },
    [autoDedupe, maxUrls],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const content = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase();
      const urls = ext === "csv" ? extractUrlsFromCSV(content) : parseTXT(content);
      appendUrls(urls);
    },
    [appendUrls],
  );

  const loadSample = useCallback(() => {
    setText((sampleUrls ?? SAMPLE_URLS).join("\n"));
  }, [sampleUrls]);

  const clear = useCallback(() => setText(""), []);

  const isValid = parsed.urls.length > 0 && parsed.invalidCount === 0;

  return {
    text,
    setText,
    urls: parsed.urls,
    total: parsed.total,
    invalidCount: parsed.invalidCount,
    duplicateRemoved: parsed.duplicateRemoved,
    autoDedupe,
    setAutoDedupe,
    appendUrls,
    handleFileUpload,
    loadSample,
    clear,
    isValid,
    maxUrls,
  };
}
