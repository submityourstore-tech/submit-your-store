import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { LEGAL_ENTITY, SITE_NAME, SITE_TAGLINE } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "About Us",
  "Learn about Submit Your Store — a worldwide local business directory with free listings, verified reviews, and community-driven discovery.",
);

export default function AboutPage() {
  return (
    <ContentPageLayout
      title={`About ${SITE_NAME}`}
      subtitle={SITE_TAGLINE}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About" },
      ]}
    >
      <ContentSection title="Our mission">
        <p>
          {SITE_NAME} helps people worldwide discover trustworthy local businesses without wading through
          spammy directories or pay-to-rank schemes. We believe every legitimate business deserves a visible online
          presence, and every consumer deserves honest, community-written feedback before they hire a contractor,
          visit a clinic, or choose a restaurant.
        </p>
        <p>
          We built this platform as a practical alternative to closed ecosystems: open browsing, clear business
          profiles, and a straightforward path for owners to claim or add their listing at no cost. Our editorial
          focus is local relevance — categories, cities, and services that real neighborhoods search for every day.
        </p>
      </ContentSection>

      <ContentSection title="What we offer">
        <p>Visitors to {SITE_NAME} can:</p>
        <ul>
          <li>Browse businesses by category and location in cities and regions around the world.</li>
          <li>Read member reviews and rating summaries on individual business profile pages.</li>
          <li>Compare contact details, service areas, and business descriptions before reaching out.</li>
          <li>Submit a free listing or claim an existing profile using a verified business email.</li>
        </ul>
        <p>
          Business owners benefit from increased discoverability in category and city pages, a dedicated profile URL
          they can share, and tools to manage listing details after email verification. We do not charge listing
          fees for standard directory inclusion.
        </p>
      </ContentSection>

      <ContentSection title="How listings are created">
        <p>
          Listings on {SITE_NAME} are submitted by business owners or community members through our{" "}
          <ContentLink href="/list-your-business">free listing form</ContentLink>. We require a Google Business
          Profile link and a business-domain email address so we can confirm the person submitting the listing has a
          legitimate connection to the business. After one-time email verification, approved listings appear in
          search and browse pages across the site.
        </p>
        <p>
          We also support claiming an existing listing when the business is already published but not yet linked to
          an owner account. This helps prevent duplicate entries and keeps contact information accurate over time.
        </p>
      </ContentSection>

      <ContentSection title="Reviews and community trust">
        <p>
          Reviews on {SITE_NAME} are written by registered members of the community. We encourage detailed,
          experience-based feedback rather than one-line ratings. Business owners cannot pay to remove legitimate
          reviews, and we apply moderation where content violates our{" "}
          <ContentLink href="/terms-of-service">Terms of Service</ContentLink>.
        </p>
        <p>
          Because we aggregate user-generated content, we publish a clear{" "}
          <ContentLink href="/disclaimer">Disclaimer</ContentLink> explaining the limits of our verification and
          the responsibility of readers to confirm details directly with businesses.
        </p>
      </ContentSection>

      <ContentSection title="Worldwide reach, local focus">
        <p>
          {SITE_NAME} accepts listings from businesses anywhere in the world. Our catalog spans home services,
          healthcare, retail, food, professional services, and many other categories. Category and location pages
          only appear when we have businesses to show, which keeps browse experiences useful rather than empty
          placeholders.
        </p>
        <p>
          As more verified listings are added, new vertical and city pages are generated automatically so visitors
          always land on pages with real businesses, phone numbers, and review data.
        </p>
      </ContentSection>

      <ContentSection title="Transparency and policies">
        <p>
          {LEGAL_ENTITY} operates {SITE_NAME} with published policies that explain how we handle personal data,
          cookies, and advertising. Please read our{" "}
          <ContentLink href="/privacy-policy">Privacy Policy</ContentLink>,{" "}
          <ContentLink href="/cookie-policy">Cookie Policy</ContentLink>, and{" "}
          <ContentLink href="/terms-of-service">Terms of Service</ContentLink> for full details.
        </p>
        <p>
          Questions about the platform? Visit our <ContentLink href="/contact">Contact</ContentLink> page or browse
          the <ContentLink href="/faq">FAQ</ContentLink> for common answers about listings, reviews, and account
          access.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
