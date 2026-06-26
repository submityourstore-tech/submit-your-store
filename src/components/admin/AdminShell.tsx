"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const MAIN_NAV = [
  { href: "/admin/dashboard", label: "All listings", icon: "📋" },
  { href: "/admin/data-pending", label: "Data pending", icon: "📊" },
  { href: "/admin/outreach", label: "Outreach", icon: "📧" },
  { href: "/admin/listings", label: "Publish new", icon: "➕" },
] as const;

const DATA_TOOLS_NAV = [
  { href: "/admin/data-export", label: "Data export", icon: "📥" },
  { href: "/admin/data-issues", label: "Data issues", icon: "⚠️" },
] as const;

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-[#1274c0] text-white" : "text-[#333] hover:bg-[#eef4fb]"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </Link>
  );
}

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();
  const onEditPage = pathname.startsWith("/admin/edit/");

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-[#f0f0f1]">
        <header className="border-b border-[#c3c4c7] bg-[#1d2327] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-tight">Submit Your Store</span>
              <span className="hidden text-xs text-[#c3c4c7] sm:inline">Admin</span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#72aee6] hover:underline"
            >
              View site →
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-5">
            <h1 className="text-2xl font-normal text-[#1d2327]">{title}</h1>
            {description && <p className="mt-1 text-sm text-[#646970]">{description}</p>}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="lg:w-56 lg:shrink-0">
              <nav className="space-y-1 rounded border border-[#c3c4c7] bg-white p-2 shadow-sm">
                {MAIN_NAV.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}

                <p className="mt-3 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#646970]">
                  Data tools
                </p>
                {DATA_TOOLS_NAV.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}

                {onEditPage && (
                  <p className="px-3 py-2 text-xs text-[#646970]">Editing a listing</p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void fetch("/api/admin/logout", { method: "POST" }).then(() => {
                      window.location.href = "/admin";
                    })
                  }
                  className="mt-2 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-[#646970] hover:bg-[#f6f7f7]"
                >
                  <span aria-hidden>🚪</span>
                  Log out
                </button>
              </nav>
            </aside>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </AdminAuthGate>
  );
}
