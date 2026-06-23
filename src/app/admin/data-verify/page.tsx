import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDataVerifyClient } from "@/components/admin/AdminDataVerifyClient";

export default function AdminDataVerifyPage() {
  return (
    <AdminShell
      title="Data verification"
      description="Per-field batch workflow — copy GBP URLs, upload scraped data, track verified dates."
    >
      <AdminDataVerifyClient />
    </AdminShell>
  );
}
