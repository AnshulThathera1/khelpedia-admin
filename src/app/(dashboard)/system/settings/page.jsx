import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { getSystemSettings } from "@/app/(dashboard)/actions/system-actions";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "System Settings — KhelPediA Admin",
  description: "Platform metadata, maintenance mode, feature flags, and environment variables inspector.",
};

export default async function SystemSettingsPage() {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_VIEW);
  const data = await getSystemSettings();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <SettingsClient initialData={data} userRole={adminUser.role} />
    </div>
  );
}
