import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { getIngestionOverview } from "@/app/(dashboard)/actions/ingestion-actions";
import { IngestionClient } from "./ingestion-client";

export const metadata = {
  title: "Ingestion & AI Automation — KhelPediA Admin",
  description: "Monitor PandaScore API feeds, Riot API, Gemini AI editorial generator, and background cron jobs.",
};

export default async function IngestionPage() {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.INGESTION_VIEW);
  const initialData = await getIngestionOverview();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <IngestionClient initialData={initialData} userRole={adminUser.role} />
    </div>
  );
}
