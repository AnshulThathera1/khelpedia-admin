import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import {
  getAdSettings,
  getAdsterraEarningsAction,
  getAdsterraAccountAssetsAction,
} from "@/app/(dashboard)/actions/ad-actions";
import { AdClient } from "./ad-client";

export const metadata = {
  title: "Advertising & Adsterra — KhelPediA Admin",
  description: "Manage Adsterra ad units, site-wide master switch, placements, earnings, and CLS safety.",
};

export default async function AdvertisingPage() {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.ADS_VIEW);
  const settings = await getAdSettings();
  const hasApiKey = Boolean(process.env.ADSTERRA_API_KEY);

  let initialEarnings = null;
  let accountAssets = null;

  if (hasApiKey) {
    const [earningsRes, assetsRes] = await Promise.all([
      getAdsterraEarningsAction({ groupBy: "placement" }),
      getAdsterraAccountAssetsAction(),
    ]);
    if (earningsRes?.success) initialEarnings = earningsRes;
    if (assetsRes?.success) accountAssets = assetsRes;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <AdClient
        initialSettings={settings}
        userRole={adminUser.role}
        hasApiKey={hasApiKey}
        initialEarnings={initialEarnings}
        accountAssets={accountAssets}
      />
    </div>
  );
}
