"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AnalysisResult = { label: string; value: string | number };

type CounterToolProps = {
  analyzeFn: (text: string) => AnalysisResult[];
  placeholder?: string;
};

export function CounterTool({
  analyzeFn,
  placeholder = "Type or paste your text here to see real-time analysis…",
}: CounterToolProps) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analyze = useCallback(
    (input: string) => {
      try {
        setResults(analyzeFn(input));
      } catch {
        setResults([]);
      }
    },
    [analyzeFn]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      analyze(text);
    }, 100);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, analyze]);

  return (
    <div className="space-y-6">
      <textarea
        className="min-h-[200px] w-full resize-y rounded-md border border-[var(--jd-border)] bg-white p-4 text-sm leading-relaxed focus:border-[var(--jd-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--jd-blue)]"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Stats grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[var(--jd-border)] bg-white p-4 text-center"
            >
              <p className="text-2xl font-bold text-[var(--jd-blue)]">{item.value}</p>
              <p className="mt-1 text-xs text-[var(--jd-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
