import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "How It Works",
  "Learn how Submit Your Store helps you find local businesses, read reviews, and list your company for free with email verification.",
);

export default function HowItWorksPage() {
  return (
    <ContentPageLayout
      title="How it works"
      subtitle={`${SITE_NAME} connects local customers with businesses through searchable listings, category browse pages, and community reviews. Here is how each part of the platform works.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "How it works" },
      ]}
    >
      <ContentSection title="For people looking for a business">
        <ol>
          <li>
            <strong>Start on the homepage or Listings hub.</strong> Browse featured categories and locations worldwide,
            or open the full <ContentLink href="/listings">Listings</ContentLink> page to search by city and
            vertical.
          </li>
          <li>
            <strong>Pick a category and location.</strong> Category pages such as home services, healthcare, or
            restaurants show only when we have active businesses in that vertical. City pages group listings by metro
            area so you can compare nearby options.
          </li>
          <li>
            <strong>Open a business profile.</strong> Each listing includes contact details, service description,
            map link, and aggregated review scores when available.
          </li>
          <li>
            <strong>Read reviews and decide.</strong> Member reviews describe real experiences. Sign in to leave your
            own review and help the next visitor make an informed choice.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="For business owners">
        <ol>
          <li>
            <strong>Go to Free Listing.</strong> Use the{" "}
            <ContentLink href="/list-your-business">List your business</ContentLink> form to add a new profile or
            claim one that already exists on the site.
          </li>
          <li>
            <strong>Provide verification details.</strong> We require a Google Business Profile URL and an email
            address on your company domain (for example, you@yourcompany.com). This reduces fake listings and protects
            your brand.
          </li>
          <li>
            <strong>Confirm via email.</strong> After you submit the form, check your inbox for a one-time
            verification message. Click the link to prove you control the business email.
          </li>
          <li>
            <strong>Go live automatically.</strong> Verified listings publish immediately and appear on relevant
            category, city, and business profile pages — no manual approval queue for standard submissions.
          </li>
          <li>
            <strong>Manage updates later.</strong> Sign in to edit hours, description, or contact information from
            your account when details change.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="Categories and locations">
        <p>
          {SITE_NAME} organizes businesses into verticals (such as home services, health, food, and retail) and
          subcategories (such as HVAC, plumbing, or dentists). Location browse pages combine a vertical with a
          city or region anywhere in the world. Empty combinations are hidden so you never land on a page with zero results.
        </p>
        <p>
          As our catalog grows, new browse URLs are added automatically when listings exist for that category-location
          pair. This keeps the directory scalable without thin placeholder pages.
        </p>
      </ContentSection>

      <ContentSection title="Reviews and accounts">
        <p>
          Creating a free member account lets you write reviews, track businesses you care about, and manage listing
          ownership. Reviews should follow our community guidelines in the{" "}
          <ContentLink href="/terms-of-service">Terms of Service</ContentLink>. We remove spam, hate speech, and
          clearly fraudulent content.
        </p>
        <p>
          Member profile pages are private-facing account views and are excluded from search engine indexing to
          protect personal information.
        </p>
      </ContentSection>

      <ContentSection title="Need help?">
        <p>
          Visit the <ContentLink href="/faq">FAQ</ContentLink> for quick answers, or{" "}
          <ContentLink href="/contact">contact us</ContentLink> if your listing verification email did not arrive or
          you need to report inaccurate information on a profile.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
