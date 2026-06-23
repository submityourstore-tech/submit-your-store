import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BusinessAboutBlocks } from "@/components/BusinessAboutBlocks";
import { BusinessContactSection } from "@/components/BusinessContactSection";
import { BusinessGallery } from "@/components/BusinessMedia";
import { BusinessHoursTable } from "@/components/BusinessHoursTable";
import { BusinessListingHero } from "@/components/BusinessListingHero";
import { WhatCustomersSay } from "@/components/WhatCustomersSay";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { SiteReviews } from "@/components/SiteReviews";
import { WriteReviewForm } from "@/components/WriteReviewForm";
import { getBusinessById, getPublicBusinessList } from "@/lib/businesses";
import {
  getVerticalPath,
  isActiveBusiness,
  LEGACY_HVAC_VERTICAL,
  matchesVerticalFilter,
  resolveBusinessBrowseVertical,
} from "@/lib/categories-config";
import { getDisplayRating } from "@/lib/display-rating";
import { getReviewSummary, getReviewsForBusiness } from "@/lib/reviews.server";
import { getValidSocialLinks } from "@/lib/social";
import { formatDisplayAddress } from "@/lib/address";
import { getLocationFromBusiness, getStateLabel } from "@/lib/locations";
import { getActiveVerticalBrowse, verticalBreadcrumbLabel } from "@/lib/vertical-pages.server";
import { BusinessVoteButtons } from "@/components/BusinessVoteButtons";
import { getBusinessVoteStats, getUserVote } from "@/lib/business-votes.server";
import { requiredEmailDomainForBusiness } from "@/lib/claim-otp.server";
import { getCurrentUser } from "@/lib/user-auth.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const listings = await getPublicBusinessList();
  return listings.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) return { title: "Business not found" };
  if (!isActiveBusiness(business)) return { title: "Business not found" };
  return {
    title: business.name,
    description: business.description.slice(0, 160),
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business || !isActiveBusiness(business)) {
    notFound();
  }

  let browseVertical = resolveBusinessBrowseVertical(business);
  const verticalStat = browseVertical ? await getActiveVerticalBrowse(browseVertical) : undefined;
  if (!verticalStat || !matchesVerticalFilter(business, browseVertical)) {
    browseVertical = LEGACY_HVAC_VERTICAL;
  }

  const user = await getCurrentUser();
  const [reviews, reviewSummary, voteStats, userVote, verticalLabel] = await Promise.all([
    getReviewsForBusiness(id),
    getReviewSummary(id),
    getBusinessVoteStats(id),
    user ? getUserVote(id, user.id) : Promise.resolve(null),
    verticalBreadcrumbLabel(browseVertical),
  ]);

  const displayRating = getDisplayRating(business, reviewSummary);
  const socialLinks = getValidSocialLinks(business.social);
  const displayAddress = formatDisplayAddress(business);
  const location = getLocationFromBusiness(business);
  const stateLabel = getStateLabel(business.state);
  const verticalHref = getVerticalPath(browseVertical);

  const requiredEmailDomain = requiredEmailDomainForBusiness(business);

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
        <BusinessListingHero
          business={business}
          displayRating={displayRating}
          requiredEmailDomain={requiredEmailDomain}
        />

        <section className="mt-4 overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-sm">
          <div className="border-b border-[#eee] bg-gradient-to-r from-[#f5f9fd] to-white px-5 py-4">
            <h2 className="text-base font-bold text-[#1274c0]">🗳️ Community Vote</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Pick up or down, then submit your vote — helps rank {business.name} across our directory.
            </p>
          </div>
          <div className="px-5 py-4 sm:px-6">
            <BusinessVoteButtons
              businessId={business.id}
              businessName={business.name}
              initialUpvotes={voteStats.upvotes}
              initialDownvotes={voteStats.downvotes}
              initialUserVote={userVote}
            />
          </div>
        </section>

        {business.aboutBlocks && business.aboutBlocks.length > 0 ? (
          <BusinessAboutBlocks blocks={business.aboutBlocks} />
        ) : (
          <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#1274c0]">About</h2>
            <p className="mt-2 leading-relaxed text-[#555]">{business.description}</p>
          </section>
        )}

        {business.googleReviews && business.googleReviews.length > 0 && (
          <WhatCustomersSay reviews={business.googleReviews} />
        )}

        <BusinessHoursTable business={business} />

        <BusinessContactSection
          business={business}
          displayAddress={displayAddress}
          socialLinks={business.social}
          hasSocial={socialLinks.length > 0}
        />

        <BusinessGallery business={business} />

        {reviews.length > 0 && reviewSummary && (
          <div className="mt-4">
            <SiteReviews reviews={reviews} average={reviewSummary.average} />
          </div>
        )}

        <WriteReviewForm
          businessId={business.id}
          businessName={business.name}
          businessCity={business.city}
          businessLogo={business.logo}
        />
      </div>
    </div>
  );
}
