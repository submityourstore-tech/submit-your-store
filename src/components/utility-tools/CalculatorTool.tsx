"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UtilityToolField } from "./GeneratorTool";

type CalculatorResult = { label: string; value: string };

type CalculatorToolProps = {
  fields: UtilityToolField[];
  calculateFn: (values: Record<string, string>) => CalculatorResult[];
  resultLabel?: string;
};

export function CalculatorTool({
  fields,
  calculateFn,
  resultLabel = "Results",
}: CalculatorToolProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") {
        defaults[f.key] = f.defaultValue === true ? "true" : "false";
      } else {
        defaults[f.key] = String(f.defaultValue ?? "");
      }
    });
    return defaults;
  });
  const [results, setResults] = useState<CalculatorResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculate = useCallback(
    (vals: Record<string, string>) => {
      try {
        setResults(calculateFn(vals));
      } catch {
        setResults([]);
      }
    },
    [calculateFn]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      calculate(values);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values, calculate]);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    const defaults: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") {
        defaults[f.key] = f.defaultValue === true ? "true" : "false";
      } else {
        defaults[f.key] = String(f.defaultValue ?? "");
      }
    });
    setValues(defaults);
    setResults([]);
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            {field.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm text-[var(--jd-text)]">
                <input
                  type="checkbox"
                  checked={values[field.key] === "true"}
                  onChange={(e) => handleChange(field.key, e.target.checked ? "true" : "false")}
                  className="h-4 w-4 rounded border-[var(--jd-border)]"
                />
                {field.label}
              </label>
            ) : (
              <>
                <label className="mb-1 block text-sm font-medium text-[var(--jd-text)]">
                  {field.label}
                  {field.required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    className="w-full rounded-md border border-[var(--jd-border)] bg-white p-2.5 text-sm focus:border-[var(--jd-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--jd-blue)]"
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  >
                    <option value="">Select…</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="w-full rounded-md border border-[var(--jd-border)] bg-white p-2.5 text-sm focus:border-[var(--jd-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--jd-blue)]"
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => calculate(values)}
          className="rounded-md bg-[var(--jd-blue)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-[var(--jd-border)] px-5 py-2.5 text-sm font-medium text-[var(--jd-text)] transition hover:bg-[var(--jd-surface)]"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--jd-text)]">{resultLabel}</h3>
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
        </div>
      )}
    </div>
  );
}
