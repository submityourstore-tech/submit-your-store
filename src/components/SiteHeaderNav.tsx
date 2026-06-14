import Link from "next/link";
import { SiteHeaderAuth } from "@/components/SiteHeaderAuth";

export function SiteHeaderNav() {
  return (
    <nav className="hidden items-center gap-5 text-sm font-medium text-[#333] md:flex">
      <Link href="/listings" className="hover:text-[#1274c0]">
        Listings
      </Link>
      <Link href="/list-your-business" className="hover:text-[#1274c0]">
        Free Listing
      </Link>
      <SiteHeaderAuth />
    </nav>
  );
}
