"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type OptionDef = {
  key: string;
  label: string;
  values: { value: string; label: string }[];
};

type TextTransformToolProps = {
  transformFn: (input: string, options?: Record<string, string>) => string;
  inputLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  options?: OptionDef[];
};

export function TextTransformTool({
  transformFn,
  inputLabel = "Input",
  outputLabel = "Output",
  placeholder = "Paste or type your text here…",
  options,
}: TextTransformToolProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    options?.forEach((opt) => {
      defaults[opt.key] = opt.values[0]?.value ?? "";
    });
    return defaults;
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runTransform = useCallback(
    (text: string, opts: Record<string, string>) => {
      try {
        setOutput(transformFn(text, opts));
      } catch {
        setOutput("Error transforming text.");
      }
    },
    [transformFn]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runTransform(input, selectedOptions);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, selectedOptions, runTransform]);

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    setInput("");
    setOutput("");
  }

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="space-y-4">
      {/* Options */}
      {options && options.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {options.map((opt) => (
            <label key={opt.key} className="text-sm font-medium text-[var(--jd-text)]">
              {opt.label}
              <select
                className="ml-2 rounded border border-[var(--jd-border)] bg-white px-2 py-1 text-sm"
                value={selectedOptions[opt.key] ?? ""}
                onChange={(e) =>
                  setSelectedOptions((prev) => ({ ...prev, [opt.key]: e.target.value }))
                }
              >
                {opt.values.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {/* Text areas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-[var(--jd-text)]">{inputLabel}</label>
          <textarea
            className="min-h-[220px] flex-1 resize-y rounded-md border border-[var(--jd-border)] bg-white p-3 text-sm leading-relaxed focus:border-[var(--jd-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--jd-blue)]"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--jd-muted)]">
            {charCount} characters · {wordCount} words
          </p>
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-[var(--jd-text)]">{outputLabel}</label>
          <textarea
            className="min-h-[220px] flex-1 resize-y rounded-md border border-[var(--jd-border)] bg-[var(--jd-surface)] p-3 text-sm leading-relaxed"
            readOnly
            value={output}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="rounded-md bg-[var(--jd-blue)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {copied ? "Copied!" : "Copy Output"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-[var(--jd-border)] px-4 py-2 text-sm font-medium text-[var(--jd-text)] transition hover:bg-[var(--jd-surface)]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
