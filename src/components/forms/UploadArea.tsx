"use client";

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

type UploadAreaProps = {
  onFile: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

export function UploadArea({
  onFile,
  accept = ".csv,.txt",
  disabled = false,
  className,
}: UploadAreaProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [disabled, onFile],
  );

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
        dragOver
          ? "border-[var(--jd-blue)] bg-[var(--jd-blue)]/5"
          : "border-[var(--jd-border)] hover:border-[var(--jd-blue)]/50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="mb-2 h-8 w-8 text-[var(--jd-muted)]" />
      <span className="text-sm font-medium text-[var(--jd-text)]">
        Drag & drop CSV or TXT file
      </span>
      <span className="mt-1 text-xs text-[var(--jd-muted)]">or click to browse</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
