import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type Crumb = { label: string; href?: string };

type ContentPageLayoutProps = {
  title: string;
  subtitle?: string;
  breadcrumbs: Crumb[];
  children: React.ReactNode;
};

export function ContentPageLayout({ title, subtitle, breadcrumbs, children }: ContentPageLayoutProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-12">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-4 border-b border-[#e0e0e0] pb-6">
          <h1 className="text-2xl font-bold text-[#111] sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-base leading-relaxed text-[#555]">{subtitle}</p> : null}
        </header>
        <article className="content-page mt-8">{children}</article>
      </div>
    </div>
  );
}

export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#111]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#555] sm:text-base">{children}</div>
    </section>
  );
}

export function ContentLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-[#1274c0] hover:underline">
      {children}
    </Link>
  );
}
