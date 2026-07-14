import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import { BackToTop } from "@/components/BackToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";
import "@/styles/tools.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Submit Your Store — Local Business Listings",
    template: "%s | Submit Your Store",
  },
  description:
    "Discover trusted local businesses. Browse listings, read community reviews, and list your business on Submit Your Store.",
  verification: {
    google: "PCuwUHMqsnip3Li_cw7ihWONsR2I_q5F_8YsqN2QTYA",
  },
  icons: {
    icon: [{ url: "/brand/logo-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/brand/logo-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-C5J08Y05DG" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C5J08Y05DG');
          `}
        </Script>
        <AppProviders>
          <SiteHeader />
          <main className="min-h-[calc(100vh-8rem)]">{children}</main>
          <SiteFooter />
        </AppProviders>
        <BackToTop />
        <CookieConsent />
      </body>
    </html>
  );
}
