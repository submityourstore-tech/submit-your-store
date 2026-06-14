import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BusinessAddress } from "@/components/BusinessAddress";
import { BusinessAvatar, BusinessGallery } from "@/components/BusinessMedia";
import { RatingBadge } from "@/components/RatingBadge";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { SiteReviews } from "@/components/SiteReviews";
import { WriteReviewForm } from "@/components/WriteReviewForm";
import { SocialIconLinks } from "@/components/SocialIcons";
import { getBusinessById, getPublicBusinessList } from "@/lib/businesses";
import {
  getVerticalPath,
  isActiveBusiness,
  matchesVerticalFilter,
  resolveBusinessBrowseVertical,
} from "@/lib/categories-config";
import { getReviewSummary, getReviewsForBusiness } from "@/lib/reviews.server";
import { getValidSocialLinks } from "@/lib/social";
import { formatDisplayAddress } from "@/lib/address";
import { getLocationFromBusiness, getStateLabel } from "@/lib/locations";
import { getActiveVerticalBrowse, verticalBreadcrumbLabel } from "@/lib/vertical-pages.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return getPublicBusinessList().map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = getBusinessById(id);
  if (!business) return { title: "Business not found" };
  if (!isActiveBusiness(business)) return { title: "Business not found" };
  return {
    title: business.name,
    description: business.description.slice(0, 160),
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { id } = await params;
  const business = getBusinessById(id);
  const browseVertical = business ? resolveBusinessBrowseVertical(business) : null;
  if (
    !business ||
    !isActiveBusiness(business) ||
    !browseVertical ||
    !getActiveVerticalBrowse(browseVertical) ||
    !matchesVerticalFilter(business, browseVertical)
  ) {
    notFound();
  }

  const reviews = getReviewsForBusiness(id);
  const reviewSummary = getReviewSummary(id);
  const socialLinks = getValidSocialLinks(business.social);
  const displayAddress = formatDisplayAddress(business);
  const location = getLocationFromBusiness(business);
  const stateLabel = getStateLabel(business.state);
  const verticalLabel = verticalBreadcrumbLabel(browseVertical);
  const verticalHref = getVerticalPath(browseVertical);

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: verticalLabel, href: verticalHref },
              { label: stateLabel, href: verticalHref },
              { label: location.label, href: location.href },
              { label: business.name },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <BusinessAvatar name={business.name} logo={business.logo} size="detail" />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded border border-[#e8e8e8] bg-[#fafafa] px-2 py-0.5 text-xs font-medium text-[#555]">
                {business.category}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-[#111] sm:text-3xl">{business.name}</h1>
              <BusinessAddress business={business} className="mt-1" />
              {reviewSummary && (
                <div className="mt-3">
                  <RatingBadge rating={reviewSummary.average} count={reviewSummary.count} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eee] pt-4">
            <a
              href={`tel:${business.phone}`}
              className="jd-btn-call inline-flex items-center gap-1.5 rounded px-5 py-2.5 text-sm font-semibold"
            >
              📞 {business.phone}
            </a>
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="jd-btn-primary inline-flex items-center rounded px-5 py-2.5 text-sm font-semibold"
              >
                Visit Website
              </a>
            )}
            {business.googleMapsUrl && (
              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-[#1274c0] px-5 py-2.5 text-sm font-semibold text-[#1274c0] hover:bg-[#f0f7fd]"
              >
                Get Directions
              </a>
            )}
            <a
              href="#write-review"
              className="jd-btn-orange inline-flex items-center rounded px-5 py-2.5 text-sm font-semibold"
            >
              Rate & Review
            </a>
          </div>
        </header>

        <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#1274c0]">About</h2>
          <p className="mt-2 leading-relaxed text-[#555]">{business.description}</p>
        </section>

        <BusinessGallery business={business} />

        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#1274c0]">Contact Details</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <span className="text-xs font-medium uppercase text-[#999]">Phone</span>
                <a href={`tel:${business.phone}`} className="mt-0.5 block font-semibold text-[#25a244] hover:underline">
                  {business.phone}
                </a>
              </li>
              {business.email && (
                <li>
                  <span className="text-xs font-medium uppercase text-[#999]">Email</span>
                  <a href={`mailto:${business.email}`} className="mt-0.5 block font-semibold text-[#1274c0] hover:underline">
                    {business.email}
                  </a>
                </li>
              )}
              {business.address && (
                <li>
                  <span className="text-xs font-medium uppercase text-[#999]">Address</span>
                  <span className="mt-0.5 block text-[#333]">{displayAddress}</span>
                </li>
              )}
              {!business.address && (
                <li>
                  <span className="text-xs font-medium uppercase text-[#999]">Location</span>
                  <span className="mt-0.5 block text-[#333]">{displayAddress}</span>
                </li>
              )}
            </ul>
          </div>

          {socialLinks.length > 0 && (
            <div className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#1274c0]">Follow Us</h2>
              <SocialIconLinks social={business.social} className="mt-4" />
            </div>
          )}
        </section>

        {reviews.length > 0 && reviewSummary && (
          <div className="mt-4">
            <SiteReviews reviews={reviews} average={reviewSummary.average} />
          </div>
        )}

        <WriteReviewForm businessId={business.id} businessName={business.name} />
      </div>
    </div>
  );
}
