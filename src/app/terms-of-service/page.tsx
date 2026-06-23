import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { LAST_UPDATED_LEGAL, LEGAL_ENTITY, SITE_NAME, SUPPORT_EMAIL, getSiteUrl } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "Terms of Service",
  "Terms of Service for Submit Your Store — rules for using our local business directory, posting listings, and publishing reviews.",
);

export default function TermsOfServicePage() {
  const siteUrl = getSiteUrl();

  return (
    <ContentPageLayout
      title="Terms of Service"
      subtitle={`Last updated: ${LAST_UPDATED_LEGAL}. By accessing ${siteUrl}, you agree to these terms with ${LEGAL_ENTITY}.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Terms of Service" },
      ]}
    >
      <ContentSection title="1. Acceptance of terms">
        <p>
          These Terms of Service ("Terms") govern your access to and use of {SITE_NAME}, operated by {LEGAL_ENTITY}.
          If you do not agree, do not use the website. We may update these Terms periodically; the date above
          indicates the latest version.
        </p>
      </ContentSection>

      <ContentSection title="2. Description of service">
        <p>
          {SITE_NAME} provides an online directory where users can discover local businesses, read reviews, and
          where business representatives can submit or claim listings. Features may change over time. We do not
          guarantee uninterrupted availability and may modify or discontinue features with reasonable notice where
          practicable.
        </p>
      </ContentSection>

      <ContentSection title="3. Eligibility and accounts">
        <p>
          You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account or
          submit a business listing on behalf of a company. You are responsible for maintaining the confidentiality
          of your login credentials and for all activity under your account. Notify us immediately if you suspect
          unauthorized use.
        </p>
      </ContentSection>

      <ContentSection title="4. Business listings">
        <p>When submitting or managing a listing, you represent that:</p>
        <ul>
          <li>You are authorized to act on behalf of the business described in the listing.</li>
          <li>Information provided is accurate, current, and not misleading.</li>
          <li>You will use a valid business-domain email and legitimate Google Business Profile link as required.</li>
          <li>You will not create duplicate listings for the same location or impersonate another business.</li>
        </ul>
        <p>
          We may reject, edit, suspend, or remove listings that violate these Terms, appear fraudulent, or harm user
          trust. Free listing inclusion does not create a partnership, agency, or endorsement relationship between
          {SITE_NAME} and any listed business.
        </p>
      </ContentSection>

      <ContentSection title="5. User-generated content">
        <p>
          Reviews, ratings, comments, and other content you post ("User Content") must be based on genuine
          experience, comply with applicable law, and must not:
        </p>
        <ul>
          <li>Contain hate speech, harassment, threats, or discriminatory language.</li>
          <li>Include false statements presented as fact, defamation, or knowingly misleading claims.</li>
          <li>Disclose private personal information of others without consent.</li>
          <li>Promote illegal activity, spam, malware, or unrelated advertising.</li>
          <li>Include content you do not have the right to publish.</li>
        </ul>
        <p>
          You retain ownership of your User Content but grant {LEGAL_ENTITY} a non-exclusive, worldwide, royalty-free
          license to host, display, reproduce, and distribute it in connection with operating {SITE_NAME}. We may
          remove User Content that violates these Terms or applicable law.
        </p>
      </ContentSection>

      <ContentSection title="6. Prohibited conduct">
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, crawl, or harvest data from the site in bulk without written permission.</li>
          <li>Attempt to bypass security, authentication, or rate limits.</li>
          <li>Use automated means to post reviews or listings.</li>
          <li>Misrepresent your identity or affiliation.</li>
          <li>Interfere with other users&apos; enjoyment of the service.</li>
        </ul>
      </ContentSection>

      <ContentSection title="7. Intellectual property">
        <p>
          The {SITE_NAME} name, logo, site design, and original editorial content are owned by {LEGAL_ENTITY} or
          its licensors and protected by intellectual property laws. Business names, logos, and trademarks displayed
          in listings belong to their respective owners and are shown for identification purposes only.
        </p>
      </ContentSection>

      <ContentSection title="8. Third-party links and services">
        <p>
          Listings may link to external websites, including Google Business Profile pages. We do not control third-
          party sites and are not responsible for their content, privacy practices, or availability. Your use of third-
          party services is at your own risk.
        </p>
      </ContentSection>

      <ContentSection title="9. Disclaimers">
        <p>
          THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS
          OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. See our{" "}
          <ContentLink href="/disclaimer">Disclaimer</ContentLink> for additional limitations regarding listings
          and reviews.
        </p>
      </ContentSection>

      <ContentSection title="10. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {LEGAL_ENTITY.toUpperCase()} AND ITS OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SITE. OUR TOTAL LIABILITY
          FOR ANY CLAIM RELATING TO THE SERVICE SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS (USD $100) OR THE AMOUNT
          YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM, WHICHEVER IS GREATER.
        </p>
      </ContentSection>

      <ContentSection title="11. Indemnification">
        <p>
          You agree to indemnify and hold harmless {LEGAL_ENTITY} from claims, damages, and expenses (including
          reasonable attorneys&apos; fees) arising from your User Content, your listings, your violation of these
          Terms, or your violation of any third-party rights.
        </p>
      </ContentSection>

      <ContentSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of the State of Texas, United States, without regard to conflict-of-
          law principles. Disputes shall be brought in the state or federal courts located in Texas, and you consent
          to their jurisdiction.
        </p>
      </ContentSection>

      <ContentSection title="13. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#1274c0] hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          or our <ContentLink href="/contact">Contact</ContentLink> page.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
