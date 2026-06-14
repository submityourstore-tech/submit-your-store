import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "FAQ",
  "Frequently asked questions about Submit Your Store — listings, verification, reviews, categories, and account help.",
);

type FaqItem = { q: string; a: React.ReactNode };

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is it really free to list my business?",
    a: (
      <>
        Yes. Standard directory listings on {SITE_NAME} are free. We may display advertising on the site to support
        operating costs, but there is no pay-to-rank fee for basic inclusion after verification.
      </>
    ),
  },
  {
    q: "Why do you require a Google Business Profile link?",
    a: (
      <>
        A Google Business Profile helps us confirm the business exists at a real location and auto-fill accurate
        address details. It also gives visitors a trusted reference point alongside your {SITE_NAME} profile.
      </>
    ),
  },
  {
    q: "Why must I use a business-domain email?",
    a: (
      <>
        We send verification links only to addresses like you@yourcompany.com — not personal Gmail or Yahoo accounts
        — so random users cannot claim your brand. If you do not have a domain email, set one up with your registrar
        or Google Workspace before submitting.
      </>
    ),
  },
  {
    q: "How long until my listing appears?",
    a: (
      <>
        After you click the verification link in your email, the listing publishes immediately. If you do not see it
        within a few minutes, check spam folders or contact {SUPPORT_EMAIL}.
      </>
    ),
  },
  {
    q: "Can I edit my listing after it is live?",
    a: (
      <>
        Yes. Sign in with the account linked to your verified business email and use the manage listing tools. Keep
        hours, phone, and description current so customers reach you with accurate information.
      </>
    ),
  },
  {
    q: "A listing for my business already exists. What should I do?",
    a: (
      <>
        Use the claim flow on the <ContentLink href="/list-your-business">Free Listing</ContentLink> page with your
        business email. Once verified, ownership transfers to your account so you can update details.
      </>
    ),
  },
  {
    q: "How do reviews work?",
    a: (
      <>
        Registered members can leave reviews on business profile pages. Reviews should describe a genuine customer
        experience. We moderate content that violates our <ContentLink href="/terms-of-service">Terms</ContentLink>{" "}
        but do not remove honest negative feedback solely at a business owner&apos;s request.
      </>
    ),
  },
  {
    q: "Why are some categories missing from the homepage?",
    a: (
      <>
        We only show category and location browse links when at least one active listing exists. This avoids empty
        pages and keeps browse results useful. The listing form still lists all categories so new businesses can
        pioneer a vertical in their city.
      </>
    ),
  },
  {
    q: "Do you accept listings outside the United States?",
    a: (
      <>
        Yes. {SITE_NAME} is a worldwide directory. Businesses from any country can submit a free listing with email
        verification and a Google Business Profile link. Location pages appear wherever active listings exist.
      </>
    ),
  },
  {
    q: "How do I request removal of my listing or personal data?",
    a: (
      <>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your business name and profile URL. See
        our <ContentLink href="/privacy-policy">Privacy Policy</ContentLink> for data rights and retention details.
      </>
    ),
  },
  {
    q: "Does Submit Your Store endorse listed businesses?",
    a: (
      <>
        No. Directory inclusion is not an endorsement. Read our <ContentLink href="/disclaimer">Disclaimer</ContentLink>{" "}
        and verify licenses, insurance, and pricing directly with any business you hire.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <ContentPageLayout
      title="Frequently asked questions"
      subtitle={`Quick answers about using ${SITE_NAME}, submitting listings, and writing reviews.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "FAQ" },
      ]}
    >
      <ContentSection title="Listing & verification">
        {FAQ_ITEMS.slice(0, 6).map((item) => (
          <div key={item.q} className="mb-5 border-b border-[#eee] pb-5 last:border-0">
            <h3 className="font-semibold text-[#111]">{item.q}</h3>
            <p className="mt-2">{item.a}</p>
          </div>
        ))}
      </ContentSection>

      <ContentSection title="Reviews, browse & policies">
        {FAQ_ITEMS.slice(6).map((item) => (
          <div key={item.q} className="mb-5 border-b border-[#eee] pb-5 last:border-0">
            <h3 className="font-semibold text-[#111]">{item.q}</h3>
            <p className="mt-2">{item.a}</p>
          </div>
        ))}
      </ContentSection>

      <ContentSection title="Still have questions?">
        <p>
          Read <ContentLink href="/how-it-works">How it works</ContentLink> for a step-by-step walkthrough, or{" "}
          <ContentLink href="/contact">contact us</ContentLink> and we will get back to you as soon as we can.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
