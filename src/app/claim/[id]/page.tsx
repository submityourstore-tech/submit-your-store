import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ClaimBusinessClient } from "@/components/ClaimBusinessClient";
import { getBusinessById } from "@/lib/businesses";
import { requiredEmailDomainForBusiness } from "@/lib/claim-otp.server";
import { isOwnerClaimed } from "@/lib/claim-status";
import { sitePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) {
    return sitePageMetadata(
      "Claim your business listing",
      "Verify ownership and claim your business on Submit Your Store.",
    );
  }
  return sitePageMetadata(
    `Claim ${business.name} — Verify Business Ownership`,
    `Verify your business email and claim ${business.name} on Submit Your Store. Check phone and domain details, then get owner access to your listing in ${business.city}, ${business.state}.`,
  );
}

export default async function ClaimBusinessPage({ params }: PageProps) {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business || business.status === "hidden") notFound();

  if (isOwnerClaimed(business)) {
    redirect(`/business/${business.id}`);
  }

  const requiredEmailDomain = requiredEmailDomainForBusiness(business);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: business.name, href: `/business/${business.id}` },
            { label: "Claim listing" },
          ]}
        />
        <h1 className="mt-4 text-2xl font-bold text-[#111]">
          Claim <span className="text-[#1274c0]">{business.name}</span>
        </h1>
        <p className="mt-2 text-sm text-[#555]">
          This page is for business owners. Verify your business domain email with a one-time code to
          claim your listing, edit your profile, and receive customer leads.
        </p>
        <div className="mt-6">
          <ClaimBusinessClient business={business} requiredEmailDomain={requiredEmailDomain} />
        </div>
      </div>
    </div>
  );
}
