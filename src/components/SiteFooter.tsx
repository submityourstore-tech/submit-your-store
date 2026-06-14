import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_NAME } from "@/lib/site-config";

type FooterLink = { href: string; label: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-[#111]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-[#555]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-block hover:text-[#1274c0]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EXPLORE_LINKS: FooterLink[] = [
  { href: "/listings", label: "Listings" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/list-your-business", label: "Free Listing" },
];

const COMPANY_LINKS: FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/sign-in", label: "Login" },
  { href: "/auth/sign-up", label: "Sign Up" },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#e0e0e0] bg-[#f7f7f7]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo href="/" size="footer" />
            <p className="mt-3 text-sm leading-relaxed text-[#717171]">
              Find local businesses worldwide, read community reviews, and list your business for free by category
              and city.
            </p>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>
      </div>

      <div className="border-t border-[#e0e0e0] px-4 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-center text-xs text-[#999] sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p>
            <Link href="/privacy-policy" className="hover:text-[#1274c0]">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms-of-service" className="hover:text-[#1274c0]">
              Terms
            </Link>
            {" · "}
            <Link href="/contact" className="hover:text-[#1274c0]">
              Contact
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
