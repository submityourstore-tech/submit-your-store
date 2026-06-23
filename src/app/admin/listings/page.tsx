import type { Metadata } from "next";
import { AdminListingsClient } from "@/components/AdminListingsClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Admin — Publish Listings",
  "Admin-only listing publisher for Submit Your Store.",
);

export default function AdminListingsPage() {
  return (
    <AdminShell
      title="Publish new listing"
      description="Add single listings or bulk CSV directly to the live site. Images from URLs are converted to WebP on Cloudinary."
    >
      <AdminListingsClient />
    </AdminShell>
  );
}
