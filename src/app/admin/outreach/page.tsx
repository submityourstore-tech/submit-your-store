import { AdminOutreachClient } from "@/components/admin/AdminOutreachClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminOutreachPage() {
  return (
    <AdminShell
      title="Outreach"
      description="Email unclaimed business owners via Brevo. Edit templates, choose batch size, and track sends."
    >
      <AdminOutreachClient />
    </AdminShell>
  );
}
