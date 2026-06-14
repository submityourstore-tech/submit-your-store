import Link from "next/link";
import { getActiveVerticalStats } from "@/lib/categories.server";
import { SiteHeaderAuth } from "@/components/SiteHeaderAuth";

export function SiteHeaderNav() {
  const verticals = getActiveVerticalStats();

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium text-[#333] md:flex">
      {verticals.map((vertical) => (
        <Link key={vertical.slug} href={vertical.href} className="hover:text-[#1274c0]">
          {vertical.navLabel}
        </Link>
      ))}
      <Link href="/list-your-business" className="hover:text-[#1274c0]">
        Free Listing
      </Link>
      <SiteHeaderAuth />
    </nav>
  );
}
