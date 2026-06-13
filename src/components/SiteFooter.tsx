import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#e0e0e0] bg-[#f7f7f7]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <SiteLogo href={undefined} size="footer" />
          <p className="mt-2 text-sm text-[#717171]">
            Find local businesses, read community reviews, and list your business for free.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-[#111]">Quick Links</p>
          <ul className="mt-2 space-y-1.5 text-sm text-[#555]">
            <li>
              <Link href="/hvac/texas" className="hover:text-[#1274c0]">
                HVAC Texas
              </Link>
            </li>
            <li>
              <Link href="/hvac/dallas-tx" className="hover:text-[#1274c0]">
                Dallas, TX
              </Link>
            </li>
            <li>
              <Link href="/hvac/houston-tx" className="hover:text-[#1274c0]">
                Houston, TX
              </Link>
            </li>
            <li>
              <Link href="/list-your-business" className="hover:text-[#1274c0]">
                Free Listing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-[#111]">Account</p>
          <ul className="mt-2 space-y-1.5 text-sm text-[#555]">
            <li>
              <Link href="/auth/sign-in" className="hover:text-[#1274c0]">
                Login
              </Link>
            </li>
            <li>
              <Link href="/auth/sign-up" className="hover:text-[#1274c0]">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#e0e0e0] py-3 text-center text-xs text-[#999]">
        © {new Date().getFullYear()} Submit Your Store. All rights reserved.
      </div>
    </footer>
  );
}
