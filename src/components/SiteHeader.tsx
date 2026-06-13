import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { SiteHeaderAuth } from "@/components/SiteHeaderAuth";

export function SiteHeader() {
  return (
    <header className="border-b border-[#e0e0e0] bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <SiteLogo size="header" />

        <nav className="hidden items-center gap-5 text-sm font-medium text-[#333] md:flex">
          <Link href="/hvac/texas" className="hover:text-[#1274c0]">
            HVAC Texas
          </Link>
          <Link href="/list-your-business" className="hover:text-[#1274c0]">
            Free Listing
          </Link>
          <SiteHeaderAuth />
        </nav>

        <Link
          href="/list-your-business"
          className="jd-btn-orange rounded px-3 py-1.5 text-sm font-semibold md:hidden"
        >
          Free Listing
        </Link>
      </div>
    </header>
  );
}
