import { AdminDataPendingClient } from "@/components/admin/AdminDataPendingClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminDataPendingPage() {
  return (
    <AdminShell
      title="Data pending"
      description="See which listings are missing info. Copy GBP URLs, scrape in Google Sheets, and bulk-update each field with CSV."
    >
      <AdminDataPendingClient />
    </AdminShell>
  );
}
