import type { Metadata } from "next";
import { ContentLink, ContentPageLayout, ContentSection } from "@/components/ContentPageLayout";
import { sitePageMetadata } from "@/lib/seo";
import { LAST_UPDATED_LEGAL, LEGAL_ENTITY, SITE_NAME, getSiteUrl } from "@/lib/site-config";

export const metadata: Metadata = sitePageMetadata(
  "Cookie Policy",
  "Cookie Policy for Submit Your Store — how we use cookies, similar technologies, and advertising partners including Google.",
);

export default function CookiePolicyPage() {
  const siteUrl = getSiteUrl();

  return (
    <ContentPageLayout
      title="Cookie Policy"
      subtitle={`Last updated: ${LAST_UPDATED_LEGAL}. This policy explains how ${LEGAL_ENTITY} uses cookies on ${siteUrl}.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Cookie Policy" },
      ]}
    >
      <ContentSection title="1. What are cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website. They help sites remember
          preferences, keep you signed in, measure traffic, and — where enabled — show relevant advertising. Similar
          technologies include local storage, session storage, and pixel tags.
        </p>
      </ContentSection>

      <ContentSection title="2. How we use cookies">
        <p>{SITE_NAME} uses cookies and similar tools for the following purposes:</p>
        <h3>Strictly necessary cookies</h3>
        <p>
          Required for core functionality such as authentication sessions, security protections, and remembering
          basic preferences. These cannot be disabled without breaking essential features of the site.
        </p>
        <h3>Performance and analytics cookies</h3>
        <p>
          Help us understand how visitors use pages, which categories and cities are popular, and where users
          encounter errors. Data is typically aggregated and used to improve navigation and content quality.
        </p>
        <h3>Advertising cookies</h3>
        <p>
          Where we display advertising (including through Google AdSense or similar programs), third-party ad
          partners may set cookies to deliver ads, limit repeat impressions, measure campaign performance, and
          personalize ads based on your browsing history across participating sites.
        </p>
      </ContentSection>

      <ContentSection title="3. Third-party cookies">
        <p>Third parties that may place cookies when you use {SITE_NAME} include:</p>
        <ul>
          <li>Google (AdSense, Analytics, or related advertising and measurement products).</li>
          <li>Authentication and hosting providers that support secure login and site delivery.</li>
          <li>Embedded content providers when their widgets or maps are displayed on a page.</li>
        </ul>
        <p>
          These third parties have their own privacy and cookie policies. We encourage you to review Google&apos;s
          advertising policies and opt-out resources if you wish to limit personalized ads.
        </p>
      </ContentSection>

      <ContentSection title="4. Managing cookie preferences">
        <p>You can control cookies in several ways:</p>
        <ul>
          <li>Browser settings: most browsers let you block or delete cookies. See your browser&apos;s help section for instructions.</li>
          <li>Industry opt-outs: Google and other ad networks provide tools to opt out of personalized advertising.</li>
          <li>Do Not Track: if your browser sends a DNT signal, we treat it as a preference indicator where technically supported.</li>
        </ul>
        <p>
          Blocking all cookies may prevent you from signing in, submitting listings, or using features that depend
          on session state.
        </p>
      </ContentSection>

      <ContentSection title="5. Relationship to Privacy Policy">
        <p>
          Information collected through cookies may constitute personal data under applicable privacy laws. For details
          on how we process personal information, retention, and your rights, read our{" "}
          <ContentLink href="/privacy-policy">Privacy Policy</ContentLink>.
        </p>
      </ContentSection>

      <ContentSection title="6. Updates">
        <p>
          We may revise this Cookie Policy when we add new features, analytics tools, or advertising partners. Changes
          will be posted on this page with an updated date.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
