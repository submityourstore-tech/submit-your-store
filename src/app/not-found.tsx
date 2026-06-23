import Link from "next/link";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e0e0e0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-[#1274c0]">
            Submit Your Store
          </Link>
          <SiteHeaderNav />
        </div>
      </header>

      <main className="mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-6xl font-bold text-[#1274c0]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-[#111]">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-[#717171]">
          This page may have moved or the link is outdated. Try browsing listings or go back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="jd-btn-primary rounded px-6 py-2.5 text-sm font-semibold"
          >
            Go to homepage
          </Link>
          <Link
            href="/listings"
            className="rounded border border-[#1274c0] bg-white px-6 py-2.5 text-sm font-semibold text-[#1274c0] hover:bg-[#f0f7fd]"
          >
            Browse all listings
          </Link>
          <Link
            href="/hvac/texas"
            className="rounded border border-[#ccc] bg-white px-6 py-2.5 text-sm font-semibold text-[#333] hover:bg-[#fafafa]"
          >
            HVAC Texas
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
