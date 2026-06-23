import type { Metadata } from "next";
import { AdminEditListingClient } from "@/components/admin/AdminEditListingClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { noIndexMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return noIndexMetadata(`Admin — Edit ${id}`, "Edit a business listing.");
}

export default async function AdminEditListingPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AdminShell title="Edit listing" description={`Editing /business/${id}`}>
      <AdminEditListingClient businessId={id} />
    </AdminShell>
  );
}
