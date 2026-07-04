import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[var(--jd-border)] bg-white px-3 py-2 text-sm text-[var(--jd-text)] placeholder:text-[var(--jd-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jd-blue)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--jd-surface)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-[var(--jd-border)] bg-white px-3 py-2 text-sm font-mono text-[var(--jd-text)] placeholder:text-[var(--jd-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jd-blue)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--jd-surface)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
