import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { LAST_UPDATED_LEGAL, LEGAL_ENTITY, SITE_NAME, SUPPORT_EMAIL, getSiteUrl } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "Privacy Policy",
  "Privacy Policy for Submit Your Store — how we collect, use, store, and protect personal information on our local business directory.",
);

export default function PrivacyPolicyPage() {
  const siteUrl = getSiteUrl();

  return (
    <ContentPageLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${LAST_UPDATED_LEGAL}. This policy describes how ${LEGAL_ENTITY} ("we", "us") collects and uses information when you use ${SITE_NAME} at ${siteUrl}.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Privacy Policy" },
      ]}
    >
      <ContentSection title="1. Who we are">
        <p>
          {LEGAL_ENTITY} operates {SITE_NAME}, a web-based local business directory that allows users to browse
          listings, publish reviews, and submit or manage business profiles. This Privacy Policy applies to all
          visitors and registered users of the website and related services.
        </p>
      </ContentSection>

      <ContentSection title="2. Information we collect">
        <p>Depending on how you use the site, we may collect the following categories of information:</p>
        <h3>Information you provide directly</h3>
        <ul>
          <li>Account registration details such as name, email address, and password (stored in hashed form).</li>
          <li>Business listing information including business name, address, phone, website, category, and description.</li>
          <li>Google Business Profile URLs and business-domain email addresses used for listing verification.</li>
          <li>Reviews, ratings, and other content you submit on business profile pages.</li>
          <li>Messages you send through our contact form or to {SUPPORT_EMAIL}.</li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>Device and browser type, operating system, and general technical identifiers.</li>
          <li>IP address, approximate location derived from IP, and referral URLs.</li>
          <li>Pages viewed, links clicked, and time spent on the site.</li>
          <li>Cookies and similar technologies as described in our Cookie Policy.</li>
        </ul>
        <h3>Information from third parties</h3>
        <ul>
          <li>Public business data associated with Google Business Profile links you submit.</li>
          <li>Authentication and email-delivery services that help us verify accounts and listing ownership.</li>
        </ul>
      </ContentSection>

      <ContentSection title="3. How we use information">
        <p>We use collected information to:</p>
        <ul>
          <li>Operate, maintain, and improve {SITE_NAME} and its browse, search, and listing features.</li>
          <li>Create and display business profiles, category pages, and location-based directory pages.</li>
          <li>Verify listing submissions and protect against spam, fraud, and impersonation.</li>
          <li>Authenticate users, manage accounts, and respond to support requests.</li>
          <li>Moderate user-generated content in line with our Terms of Service.</li>
          <li>Analyze aggregated usage trends to improve navigation and content quality.</li>
          <li>Display advertising through partners such as Google AdSense, where enabled.</li>
          <li>Comply with legal obligations and enforce our policies.</li>
        </ul>
        <p>
          We do not sell your personal information to data brokers. We may share information with service providers
          who process data on our behalf under contractual confidentiality obligations.
        </p>
      </ContentSection>

      <ContentSection title="4. Legal bases (where applicable)">
        <p>
          If you are located in a region that requires a legal basis for processing (such as the European Economic
          Area or United Kingdom), we rely on: (a) performance of a contract when providing account and listing
          services you request; (b) legitimate interests in operating and securing the directory; (c) consent where
          required for non-essential cookies or marketing; and (d) legal compliance when responding to lawful
          requests.
        </p>
      </ContentSection>

      <ContentSection title="5. Cookies and advertising">
        <p>
          We use cookies and similar technologies for essential site functionality, analytics, and advertising. Third
          parties, including Google, may use cookies to serve ads based on your prior visits to this or other
          websites. You can learn more and manage preferences in our{" "}
          <ContentLink href="/cookie-policy">Cookie Policy</ContentLink>.
        </p>
        <p>
          Where required, we will present a consent mechanism before loading non-essential advertising or analytics
          cookies. You may also opt out of personalized advertising through your browser settings or industry opt-out
          tools provided by ad networks.
        </p>
      </ContentSection>

      <ContentSection title="6. Data retention">
        <p>
          We retain account and listing data for as long as your account or listing remains active, plus a reasonable
          period afterward for backups, dispute resolution, and legal compliance. Review content may remain visible
          after account deletion where anonymization is not technically feasible, unless removal is required by law or
          our moderation policies.
        </p>
      </ContentSection>

      <ContentSection title="7. Security">
        <p>
          We implement administrative, technical, and organizational measures designed to protect personal
          information against unauthorized access, alteration, disclosure, or destruction. No online service can
          guarantee absolute security; please use a strong, unique password and notify us promptly if you suspect
          unauthorized access to your account.
        </p>
      </ContentSection>

      <ContentSection title="8. Your rights and choices">
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete personal information we hold about you.</li>
          <li>Object to or restrict certain processing activities.</li>
          <li>Withdraw consent where processing is consent-based.</li>
          <li>Request a portable copy of information you provided.</li>
          <li>Lodge a complaint with a supervisory authority.</li>
        </ul>
        <p>
          To exercise these rights, contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#1274c0] hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . We may need to verify your identity before fulfilling a request.
        </p>
      </ContentSection>

      <ContentSection title="9. Children">
        <p>
          {SITE_NAME} is not directed to children under 13 (or the minimum age required in your jurisdiction). We
          do not knowingly collect personal information from children. If you believe a child has provided us
          personal data, contact us and we will take appropriate steps to delete it.
        </p>
      </ContentSection>

      <ContentSection title="10. International transfers">
        <p>
          Our servers and service providers may be located in the United States or other countries. By using the
          site, you understand that your information may be transferred to jurisdictions that may have different data
          protection laws than your home country, subject to appropriate safeguards where required.
        </p>
      </ContentSection>

      <ContentSection title="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the most
          recent revision. Material changes will be posted on this page. Continued use of the site after changes
          become effective constitutes acceptance of the updated policy.
        </p>
      </ContentSection>

      <ContentSection title="12. Contact">
        <p>
          Privacy questions or requests:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#1274c0] hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . You may also use our <ContentLink href="/contact">Contact</ContentLink> page.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
