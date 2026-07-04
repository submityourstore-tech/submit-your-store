"use client";

import Link from "next/link";
import { useState } from "react";
import { HeaderSearchBar } from "@/components/HeaderSearchBar";
import { SiteHeaderAuth } from "@/components/SiteHeaderAuth";

const NAV_LINKS = [
  { href: "/listings", label: "Listings" },
  { href: "/tools", label: "SEO Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded px-3 py-2 text-sm font-medium text-[#333] hover:bg-[#f5f9fd] hover:text-[#1274c0]"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/list-your-business"
          className="jd-btn-orange ml-2 rounded-lg px-4 py-2 text-sm font-bold shadow-sm"
        >
          Free Listing
        </Link>
        <div className="ml-2 border-l border-[#e0e0e0] pl-4">
          <SiteHeaderAuth />
        </div>
      </nav>

      <div className="flex items-center gap-2 lg:hidden">
        <Link
          href="/list-your-business"
          className="jd-btn-orange rounded-lg px-3 py-1.5 text-sm font-bold"
        >
          Free Listing
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-[#e0e0e0] px-3 py-1.5 text-sm font-semibold text-[#333]"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="absolute top-full right-0 left-0 z-40 border-b border-[#e0e0e0] bg-white shadow-md lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <HeaderSearchBar className="mb-2" />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2.5 text-sm font-medium text-[#333] hover:bg-[#f5f9fd] hover:text-[#1274c0]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[#eee] pt-3">
              <SiteHeaderAuth />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
