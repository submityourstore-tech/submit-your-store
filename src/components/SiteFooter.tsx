import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_NAME, SITE_WHATSAPP_LINK } from "@/lib/site-config";

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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M17.5 14.4l-2-1c-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.3.3-.6.1s-1.2-.4-2.3-1.4c-.9-.8-1.4-1.7-1.6-2s0-.5.1-.6l.4-.5.3-.4c.1-.1.1-.3 0-.4l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4S7 8.7 7 10.3s1.2 3.2 1.4 3.4 2.4 3.6 5.8 5.1c.8.3 1.5.5 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6s.3-1.5.2-1.6-.3-.2-.6-.3zM12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A9.9 9.9 0 0 1 2 12 10 10 0 0 1 12 2a10 10 0 0 1 0 19.8zM12 0a12 12 0 0 0-10.2 18.1L0 24l6.2-1.6A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const EXPLORE_LINKS: FooterLink[] = [
  { href: "/listings", label: "Listings" },
  { href: "/tools", label: "Free Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/articles", label: "Articles" },
  { href: "/how-it-works", label: "How It Works" },
];

const POPULAR_TOOLS_LINKS: FooterLink[] = [
  { href: "/tools/image-compressor", label: "Image Compressor" },
  { href: "/tools/qr-code-generator", label: "QR Code Generator" },
  { href: "/tools/meta-title-generator", label: "Meta Title Generator" },
  { href: "/tools/word-counter", label: "Word Counter" },
  { href: "/tools/json-formatter", label: "JSON Formatter" },
  { href: "/tools/business-name-generator", label: "Business Name Generator" },
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

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/submityourstore/", label: "Instagram", icon: InstagramIcon },
  { href: "https://www.youtube.com/@SubmitYourStore", label: "YouTube", icon: YouTubeIcon },
  { href: SITE_WHATSAPP_LINK, label: "WhatsApp", icon: WhatsAppIcon },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#e0e0e0] bg-[#f7f7f7]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Column 1: Logo + Description + Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo href="/" size="footer" />
            <p className="mt-3 text-sm leading-relaxed text-[#717171]">
              Find local businesses worldwide, read community reviews, and list your business for free by category
              and city.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#717171] transition-colors hover:text-[#1274c0]"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Popular Tools" links={POPULAR_TOOLS_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e0e0e0] px-4 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs text-[#999] sm:flex-row sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#999] transition-colors hover:text-[#1274c0]"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
