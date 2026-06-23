import type { Metadata } from "next";
import { Suspense } from "react";
import { ManageListingEditor } from "@/components/ManageListingEditor";
import { getBusinessById } from "@/lib/businesses";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusinessById(id);
  return { title: business ? `Manage ${business.name}` : "Manage listing" };
}

export default async function ManageListingPage({ params }: PageProps) {
  const { id } = await params;
  if (!(await getBusinessById(id))) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#111]">Manage your listing</h1>
      <p className="mt-2 text-sm text-[#717171]">
        Edit access is granted only after business email verification.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-[#717171]">Loading…</p>}>
          <ManageListingEditor businessId={id} />
        </Suspense>
      </div>
    </div>
  );
}
