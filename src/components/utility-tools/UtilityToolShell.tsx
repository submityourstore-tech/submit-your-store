"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type UtilityToolShellProps = {
  title: string;
  description: string;
  icon: string;
  category: string;
  children: ReactNode;
};

export function UtilityToolShell({
  title,
  description,
  icon,
  category,
  children,
}: UtilityToolShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-[var(--jd-muted)]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[var(--jd-blue)] hover:underline">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/tools" className="hover:text-[var(--jd-blue)] hover:underline">
          SEO Tools
        </Link>
        <span className="mx-1.5">›</span>
        <Link
          href={`/tools/${category.toLowerCase().replace(/\s+/g, "-")}`}
          className="hover:text-[var(--jd-blue)] hover:underline"
        >
          {category}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--jd-text)] font-medium">{title}</span>
      </nav>

      {/* Header */}
      <header className="border-b border-[var(--jd-border)] pb-6">
        <p className="text-3xl" aria-hidden>
          {icon}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--jd-text)] sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--jd-muted)] sm:text-base">
          {description}
        </p>
      </header>

      {/* Free tool notice */}
      <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <span>
          This is a <strong>100% free</strong> tool — no sign-up required. Use it as many times as
          you need.
        </span>
      </div>

      {/* Tool content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
