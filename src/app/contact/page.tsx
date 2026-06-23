import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "Contact Us",
  "Get in touch with Submit Your Store for listing support, review concerns, privacy requests, or general questions about our local business directory.",
);

export default function ContactPage() {
  return (
    <ContentPageLayout
      title="Contact us"
      subtitle={`We are here to help with listings, account access, policy questions, and site feedback. Reach ${SITE_NAME} using the form below or email us directly.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Contact" },
      ]}
    >
      <ContentSection title="Email">
        <p>
          For the fastest response, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#1274c0] hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . Include your business name and listing URL when asking about a specific profile.
        </p>
      </ContentSection>

      <ContentSection title="What we can help with">
        <ul>
          <li>Listing verification, claims, and corrections to business details.</li>
          <li>Review disputes that involve policy violations or factual errors.</li>
          <li>Privacy-related requests described in our Privacy Policy.</li>
          <li>Accessibility issues, broken links, or suggestions to improve browse pages.</li>
          <li>Partnership or press inquiries related to {SITE_NAME}.</li>
        </ul>
        <p>
          Before writing in, check the <ContentLink href="/faq">FAQ</ContentLink> and{" "}
          <ContentLink href="/how-it-works">How it works</ContentLink> pages — many listing and review questions
          are answered there with step-by-step guidance.
        </p>
      </ContentSection>

      <ContentSection title="Response times">
        <p>
          We read every message. Most inquiries receive a reply within two business days. Complex listing ownership
          disputes or legal requests may take longer while we verify details. We do not provide phone support at this
          time; email ensures we can reference your listing or account accurately.
        </p>
      </ContentSection>

      <ContactForm />
    </ContentPageLayout>
  );
}
