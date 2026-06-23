import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDataIssuesClient } from "@/components/admin/AdminDataIssuesClient";

export default function AdminDataIssuesPage() {
  return (
    <AdminShell
      title="Data issues"
      description="Auto-detected problems that need earliest attention — name mismatches, 404 websites, invalid GBP."
    >
      <AdminDataIssuesClient />
    </AdminShell>
  );
}
