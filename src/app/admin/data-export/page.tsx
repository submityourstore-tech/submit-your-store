import { AdminDataExportClient } from "@/components/admin/AdminDataExportClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminDataExportPage() {
  return (
    <AdminShell
      title="Data export"
      description="All uploaded listings in one table — live from database. Download CSV/TSV anytime; new uploads appear automatically."
    >
      <AdminDataExportClient />
    </AdminShell>
  );
}
