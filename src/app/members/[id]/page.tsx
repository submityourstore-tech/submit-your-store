import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RatingBadge } from "@/components/RatingBadge";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { UserAvatar } from "@/components/UserAvatar";
import { getBusinessById } from "@/lib/businesses";
import { getMemberPublicProfile } from "@/lib/member-profile.server";
import { getMemberIdsWithReviews } from "@/lib/reviews.server";
import { noIndexMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getMemberIdsWithReviews().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = getMemberPublicProfile(id);
  if (!profile) {
    return noIndexMetadata("Member not found");
  }

  return noIndexMetadata(
    `${profile.name} — Member Profile`,
    `Community reviews by ${profile.name} on Submit Your Store.`,
  );
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = getMemberPublicProfile(id);
  if (!profile) notFound();

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Member profile" },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="flex items-center gap-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            verified={profile.emailVerified}
            size="md"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#111]">{profile.name}</h1>
            {profile.emailVerified ? (
              <p className="mt-1 text-sm font-medium text-[#25a244]">Verified member</p>
            ) : null}
            <p className="mt-1 text-sm text-[#717171]">
              {profile.reviews.length} review{profile.reviews.length === 1 ? "" : "s"} on Submit Your Store
            </p>
          </div>
        </header>

        <section className="mt-6 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#111]">Reviews</h2>
          {profile.reviews.length === 0 ? (
            <p className="mt-3 text-sm text-[#717171]">No reviews yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {profile.reviews.map((review) => {
                const business = getBusinessById(review.businessId);
                return (
                  <li key={review.id} className="border-t border-[#eee] pt-4 first:border-0 first:pt-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {business ? (
                          <Link
                            href={`/business/${business.id}`}
                            className="font-semibold text-[#1274c0] hover:underline"
                          >
                            {business.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-[#333]">Business</span>
                        )}
                        <p className="mt-0.5 text-xs text-[#999]">{formatReviewDate(review.createdAt)}</p>
                      </div>
                      <RatingBadge rating={review.rating} />
                    </div>
                    {review.title ? <p className="mt-2 font-medium text-[#333]">{review.title}</p> : null}
                    {review.body ? (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#555]">{review.body}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
