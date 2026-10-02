import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { getAuditLogsAction } from "@/app/(dashboard)/actions/system-actions";
import { AuditClient } from "./audit-client";

export const metadata = {
  title: "Audit Trail & System Logs — KhelPediA Admin",
  description: "Tamper-evident audit log of administrative actions, entity modifications, and system events.",
};

export default async function AuditLogsPage() {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.AUDIT_VIEW);
  const data = await getAuditLogsAction({ category: "ALL", limit: 100 });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <AuditClient initialLogs={data.logs || []} totalCount={data.totalCount || 0} userRole={adminUser.role} />
    </div>
  );
}
