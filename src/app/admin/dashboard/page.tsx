import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Admin — All Listings",
  "Manage and edit all business listings on Submit Your Store.",
);

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="All listings"
      description="WordPress-style dashboard — search, edit, hide, or delete any published listing."
    >
      <AdminDashboardClient />
    </AdminShell>
  );
}
