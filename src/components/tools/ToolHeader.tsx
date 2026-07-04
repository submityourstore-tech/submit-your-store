"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ToolHeaderProps = {
  title: string;
  description: string;
  icon: string;
  children?: ReactNode;
};

export function ToolHeader({ title, description, icon, children }: ToolHeaderProps) {
  return (
    <header className="border-b border-[var(--jd-border)] pb-6">
      <Link
        href="/tools"
        className="text-sm font-semibold text-[var(--jd-blue)] hover:underline"
      >
        ← All SEO tools
      </Link>
      <p className="mt-4 text-3xl" aria-hidden>
        {icon}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-[var(--jd-text)] sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--jd-muted)] sm:text-base">{description}</p>
      {children}
    </header>
  );
}

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
};

export function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 text-sm text-[var(--jd-muted)]" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label}>
              {i > 0 && " / "}
              {crumb.href ? (
                <Link href={crumb.href} className="text-[var(--jd-blue)] hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-2xl font-bold text-[var(--jd-text)] sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-[var(--jd-muted)]">{subtitle}</p>}
    </div>
  );
}
