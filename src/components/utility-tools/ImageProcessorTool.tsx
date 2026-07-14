"use client";

import { useRef, useState } from "react";
import type { UtilityToolField } from "./GeneratorTool";

type ImageProcessorToolProps = {
  processFn: (file: File, options: Record<string, string>) => Promise<Blob>;
  outputFormat: string;
  options?: UtilityToolField[];
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageProcessorTool({
  processFn,
  outputFormat,
  options,
}: ImageProcessorToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [optionValues, setOptionValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    options?.forEach((f) => {
      defaults[f.key] = String(f.defaultValue ?? "");
    });
    return defaults;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(selectedFile: File) {
    setFile(selectedFile);
    setResultUrl(null);
    setResultBlob(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      handleFile(dropped);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  async function handleProcess() {
    if (!file) return;
    setProcessing(true);
    try {
      const blob = await processFn(file, optionValues);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch {
      setResultUrl(null);
      setResultBlob(null);
    } finally {
      setProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultUrl || !resultBlob) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const ext = outputFormat.startsWith(".") ? outputFormat : `.${outputFormat}`;
    a.download = `processed-image${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleOptionChange(key: string, value: string) {
    setOptionValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition ${
          dragOver
            ? "border-[var(--jd-blue)] bg-blue-50"
            : "border-[var(--jd-border)] bg-[var(--jd-surface)]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          className="mb-3 h-10 w-10 text-[var(--jd-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm font-medium text-[var(--jd-text)]">
          Drop an image here or click to upload
        </p>
        <p className="mt-1 text-xs text-[var(--jd-muted)]">PNG, JPG, GIF, WebP supported</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Options form */}
      {options && options.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-[var(--jd-text)]">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  className="w-full rounded-md border border-[var(--jd-border)] bg-white p-2.5 text-sm focus:border-[var(--jd-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--jd-blue)]"
                  value={optionValues[field.key] ?? ""}
                  onChange={(e) => handleOptionChange(field.key, e.target.value)}
                >
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
                  value={optionValues[field.key] ?? ""}
                  onChange={(e) => handleOptionChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image preview: before / after */}
      {(previewUrl || resultUrl) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--jd-text)]">Original</p>
              <div className="overflow-hidden rounded-md border border-[var(--jd-border)] bg-[var(--jd-surface)]">
                <img
                  src={previewUrl}
                  alt="Original"
                  className="mx-auto max-h-[300px] object-contain p-2"
                />
              </div>
              {file && (
                <p className="text-xs text-[var(--jd-muted)]">
                  Size: {formatFileSize(file.size)}
                </p>
              )}
            </div>
          )}
          {resultUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--jd-text)]">Processed</p>
              <div className="overflow-hidden rounded-md border border-[var(--jd-border)] bg-[var(--jd-surface)]">
                <img
                  src={resultUrl}
                  alt="Processed"
                  className="mx-auto max-h-[300px] object-contain p-2"
                />
              </div>
              {resultBlob && (
                <p className="text-xs text-[var(--jd-muted)]">
                  Size: {formatFileSize(resultBlob.size)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleProcess}
          disabled={!file || processing}
          className="rounded-md bg-[var(--jd-blue)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {processing ? "Processing…" : "Process Image"}
        </button>
        {resultUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md border border-[var(--jd-border)] px-5 py-2.5 text-sm font-medium text-[var(--jd-text)] transition hover:bg-[var(--jd-surface)]"
          >
            Download Result
          </button>
        )}
      </div>
    </div>
  );
}
