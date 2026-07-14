"use client";

import { useState } from "react";

export type UtilityToolField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "url" | "email" | "color";
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
  rows?: number;
};

type GeneratorToolProps = {
  fields: UtilityToolField[];
  generateFn: (values: Record<string, string>) => string;
  outputFormat: "text" | "html" | "json" | "code";
  outputLabel?: string;
};

export function GeneratorTool({
  fields,
  generateFn,
  outputFormat,
  outputLabel = "Output",
}: GeneratorToolProps) {
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
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    try {
      setOutput(generateFn(values));
    } catch {
      setOutput("Error generating output.");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Dynamic form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.type === "textarea" ? "sm:col-span-2" : ""}
          >
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
                {field.type === "textarea" ? (
                  <textarea
                    className="w-full rounded-md border border-[var(--jd-border)] bg-white p-2.5 text-sm focus:border-[var(--jd-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--jd-blue)]"
                    rows={field.rows ?? 4}
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                ) : field.type === "select" ? (
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

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        className="rounded-md bg-[var(--jd-blue)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Generate
      </button>

      {/* Output */}
      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--jd-text)]">{outputLabel}</h3>
            <div className="flex gap-2">
              {outputFormat === "html" && (
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="rounded border border-[var(--jd-border)] px-3 py-1 text-xs font-medium text-[var(--jd-text)] transition hover:bg-[var(--jd-surface)]"
                >
                  {showPreview ? "View Code" : "Preview"}
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="rounded border border-[var(--jd-border)] px-3 py-1 text-xs font-medium text-[var(--jd-text)] transition hover:bg-[var(--jd-surface)]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {outputFormat === "html" && showPreview ? (
            <div
              className="rounded-md border border-[var(--jd-border)] bg-white p-4"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          ) : (
            <pre className="max-h-[400px] overflow-auto rounded-md border border-[var(--jd-border)] bg-[var(--jd-surface)] p-4 text-sm leading-relaxed">
              <code>{output}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
