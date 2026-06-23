import { AdminDataPendingClient } from "@/components/admin/AdminDataPendingClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminDataPendingPage() {
  return (
    <AdminShell
      title="Data pending"
      description="Per-field batch workflow — copy GBP URLs, upload scraped CSV, verified listings won't reappear."
    >
      <AdminDataPendingClient />
    </AdminShell>
  );
}
