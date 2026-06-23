import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ListYourBusinessForm } from "@/components/ListYourBusinessForm";

export const metadata: Metadata = {
  title: "List Your Business",
  description:
    "Sign in to add or claim your business on Submit Your Store. Google Business Profile link, phone, business email, and description required.",
};

export default function ListYourBusinessPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "List your business" },
          ]}
        />
        <h1 className="mt-4 text-2xl font-bold text-[#111] sm:text-3xl">
          List or claim your <span className="text-[#1274c0]">business</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#555] sm:text-base">
          Submit Your Store is a free worldwide business directory. Sign in to add your company so
          customers can find you in category and city browse pages, read reviews, and contact you
          directly. New listings go live immediately after you submit the form and show an{" "}
          <strong>Unclaimed</strong> badge until you verify your business email. Claiming an existing
          listing still uses email verification — see{" "}
          <a href="/how-it-works" className="font-medium text-[#1274c0] hover:underline">
            how it works
          </a>{" "}
          or our{" "}
          <a href="/faq" className="font-medium text-[#1274c0] hover:underline">
            FAQ
          </a>{" "}
          for details. By submitting, you agree to our{" "}
          <a href="/terms-of-service" className="font-medium text-[#1274c0] hover:underline">
            Terms of Service
          </a>
          .
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#555]">
          <li>✓ Sign in required — free listings for registered users only</li>
          <li>✓ Google Business Profile (GBP) link is mandatory</li>
          <li>✓ Phone, business email, and description (40+ characters) are required</li>
          <li>✓ New listings go live immediately with an Unclaimed badge</li>
          <li>✓ Already published? Claim with your @company email to edit the listing</li>
          <li>✓ Paste your GBP share link (Share → Copy link) — we auto-fetch name and address</li>
        </ul>
        <div className="mt-6">
          <ListYourBusinessForm />
        </div>
      </div>
    </div>
  );
}
