import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { LAST_UPDATED_LEGAL, LEGAL_ENTITY, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "Disclaimer",
  "Disclaimer for Submit Your Store — important limitations regarding business listings, reviews, and directory information.",
);

export default function DisclaimerPage() {
  return (
    <ContentPageLayout
      title="Disclaimer"
      subtitle={`Last updated: ${LAST_UPDATED_LEGAL}. Please read this page carefully before relying on information found on ${SITE_NAME}.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Disclaimer" },
      ]}
    >
      <ContentSection title="General information only">
        <p>
          {SITE_NAME} is an informational directory published by {LEGAL_ENTITY}. Content on the site — including
          business names, addresses, phone numbers, hours, descriptions, categories, and review text — is provided
          for general discovery purposes. It is not professional, legal, medical, financial, or safety advice.
        </p>
      </ContentSection>

      <ContentSection title="No endorsement">
        <p>
          Inclusion of a business in our directory does not constitute an endorsement, recommendation, or guarantee
          of quality, licensing status, insurance coverage, or suitability for any particular job. Businesses listed
          on {SITE_NAME} are independent third parties, not employees or agents of {LEGAL_ENTITY}.
        </p>
      </ContentSection>

      <ContentSection title="Accuracy of listings">
        <p>
          Listing details are submitted by business owners, authorized representatives, or community members and may
          change without notice. While we use email verification and Google Business Profile links to reduce fraud,
          we cannot guarantee that every field on every profile is complete, current, or error-free. Always confirm
          critical details — pricing, licenses, availability, and service area — directly with the business before
          hiring or purchasing.
        </p>
      </ContentSection>

      <ContentSection title="User reviews">
        <p>
          Reviews and ratings reflect the opinions of individual site members at the time of posting. They are
          subjective and may not represent typical experiences. {LEGAL_ENTITY} does not verify every factual
          statement in a review. We moderate content that violates our{" "}
          <ContentLink href="/terms-of-service">Terms of Service</ContentLink>, but we do not independently audit
          each review for accuracy.
        </p>
        <p>
          Business owners who disagree with a review should contact us through the{" "}
          <ContentLink href="/contact">Contact</ContentLink> page if the content is false, abusive, or otherwise
          policy-violating. We do not remove legitimate negative feedback simply because it is unfavorable.
        </p>
      </ContentSection>

      <ContentSection title="External links">
        <p>
          Profiles and articles may link to third-party websites. We are not responsible for the content, security,
          or privacy practices of external sites. Following an outbound link is at your own risk.
        </p>
      </ContentSection>

      <ContentSection title="Advertising">
        <p>
          {SITE_NAME} may display third-party advertisements. Ads are labeled where required and are served by
          partners such as Google. Advertising revenue helps support free listing features. The presence of an ad
          does not imply endorsement of the advertised product or service.
        </p>
      </ContentSection>

      <ContentSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {LEGAL_ENTITY} disclaims liability for any loss or damage arising
          from reliance on directory information, reviews, or third-party links. Your use of the site is subject to
          the limitations described in our Terms of Service.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
