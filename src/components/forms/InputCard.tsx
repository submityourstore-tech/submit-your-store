"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { UploadArea } from "@/components/forms/UploadArea";
import { UrlCounter } from "@/components/forms/UrlCounter";
import { useUrlInput } from "@/hooks/useUrlInput";
import { Sparkles, Trash2 } from "lucide-react";

type InputCardProps = {
  urlInput: ReturnType<typeof useUrlInput>;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
  disabled?: boolean;
};

export function InputCard({
  urlInput,
  onSubmit,
  loading = false,
  submitLabel = "Start Scan",
  disabled = false,
}: InputCardProps) {
  const {
    text,
    setText,
    urls,
    total,
    invalidCount,
    duplicateRemoved,
    autoDedupe,
    setAutoDedupe,
    handleFileUpload,
    loadSample,
    clear,
    maxUrls,
  } = urlInput;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter URLs</CardTitle>
        <CardDescription>
          Paste URLs, upload a CSV/TXT file, or drag & drop. Up to {maxUrls} URLs per scan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com&#10;https://another-site.com&#10;domain.com/page"
          rows={8}
          disabled={loading}
        />

        <UploadArea onFile={handleFileUpload} disabled={loading} />

        <UrlCounter
          total={urls.length}
          max={maxUrls}
          invalidCount={invalidCount}
          duplicateRemoved={duplicateRemoved}
        />

        <label className="flex items-center gap-2 text-sm text-[var(--jd-text)]">
          <input
            type="checkbox"
            checked={autoDedupe}
            onChange={(e) => setAutoDedupe(e.target.checked)}
            className="rounded border-[var(--jd-border)]"
          />
          Auto remove duplicate URLs
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onSubmit}
            disabled={loading || disabled || urls.length === 0}
            className="min-w-[140px]"
          >
            {loading ? "Scanning…" : submitLabel}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={loadSample} disabled={loading}>
            <Sparkles className="h-4 w-4" />
            Sample Input
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clear} disabled={loading || !text}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
