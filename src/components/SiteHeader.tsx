import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className="border-b border-[#e0e0e0] bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <SiteLogo size="header" />
        <SiteHeaderNav />
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/listings" className="text-sm font-medium text-[#333] hover:text-[#1274c0]">
            Listings
          </Link>
          <Link
            href="/list-your-business"
            className="jd-btn-orange rounded px-3 py-1.5 text-sm font-semibold"
          >
            Free Listing
          </Link>
        </div>
      </div>
    </header>
  );
}
