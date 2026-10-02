"use server";

import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src", "config", "ad-settings.json");
const MAIN_SITE_CONFIG_DIR = path.resolve(process.cwd(), "..", "khelpedia", "src", "config");
const MAIN_SITE_CONFIG_PATH = path.join(MAIN_SITE_CONFIG_DIR, "ad-settings.json");
const MAIN_SITE_ENV_PATH = path.resolve(process.cwd(), "..", "khelpedia", ".env.local");

/**
 * Read the current ad settings from disk
 */
export async function getAdSettings() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading ad-settings.json:", err);
    return null;
  }
}

/**
 * Save updated ad settings to disk
 */
async function saveAdSettings(settings, userEmail = "admin@khelpedia.org") {
  settings.lastUpdated = new Date().toISOString();
  settings.updatedBy = userEmail;
  await fs.writeFile(CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");

  // Attempt to sync copy to main site directory if it exists
  try {
    await fs.mkdir(MAIN_SITE_CONFIG_DIR, { recursive: true });
    await fs.writeFile(MAIN_SITE_CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (syncErr) {
    // Non-fatal if main site config dir cannot be reached
    console.warn("Could not auto-mirror ad settings to main site config:", syncErr.message);
  }
}

/**
 * Toggle master ad switch site-wide
 */
export async function toggleMasterSwitchAction(enabled) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.ADS_EDIT);

  try {
    const settings = await getAdSettings();
    if (!settings) {
      return { success: false, error: "Ad settings file could not be read." };
    }

    settings.masterEnabled = Boolean(enabled);
    await saveAdSettings(settings, adminUser.user?.email);

    // Sync NEXT_PUBLIC_ADS_ENABLED in main site .env.local
    try {
      let envContent = await fs.readFile(MAIN_SITE_ENV_PATH, "utf-8");
      if (envContent.includes("NEXT_PUBLIC_ADS_ENABLED=")) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_ADS_ENABLED=(true|false)/,
          `NEXT_PUBLIC_ADS_ENABLED=${Boolean(enabled)}`
        );
        await fs.writeFile(MAIN_SITE_ENV_PATH, envContent, "utf-8");
      }
    } catch (envErr) {
      console.warn("Could not update .env.local on main site:", envErr.message);
    }

    revalidatePath("/advertising");
    return { success: true, masterEnabled: settings.masterEnabled };
  } catch (err) {
    console.error("Error in toggleMasterSwitchAction:", err);
    return { success: false, error: err.message || "Failed to update master switch." };
  }
}

/**
 * Toggle individual placement state
 */
export async function togglePlacementAction(placementId, enabled) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.ADS_EDIT);

  try {
    const settings = await getAdSettings();
    if (!settings || !settings.placements[placementId]) {
      return { success: false, error: `Placement '${placementId}' not found.` };
    }

    settings.placements[placementId].enabled = Boolean(enabled);
    await saveAdSettings(settings, adminUser.user?.email);

    revalidatePath("/advertising");
    return { success: true, placementId, enabled: settings.placements[placementId].enabled };
  } catch (err) {
    console.error("Error in togglePlacementAction:", err);
    return { success: false, error: err.message || "Failed to update placement." };
  }
}

/**
 * Update an individual ad unit
 */
export async function updateAdUnitAction(unitId, updateData) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.ADS_EDIT);

  try {
    const settings = await getAdSettings();
    if (!settings || !settings.adUnits[unitId]) {
      return { success: false, error: `Ad Unit '${unitId}' not found.` };
    }

    if (updateData.zoneKey !== undefined) {
      settings.adUnits[unitId].zoneKey = updateData.zoneKey.trim();
      settings.adUnits[unitId].scriptEndpoint = `https://www.highrevenueformat.com/${updateData.zoneKey.trim()}/invoke.js`;
    }
    if (updateData.scriptUrl !== undefined) {
      settings.adUnits[unitId].scriptUrl = updateData.scriptUrl.trim();
    }
    if (updateData.enabled !== undefined) {
      settings.adUnits[unitId].enabled = Boolean(updateData.enabled);
      settings.adUnits[unitId].status = updateData.enabled ? "active" : "paused";
    }

    await saveAdSettings(settings, adminUser.user?.email);

    revalidatePath("/advertising");
    return { success: true, unitId };
  } catch (err) {
    console.error("Error in updateAdUnitAction:", err);
    return { success: false, error: err.message || "Failed to update ad unit." };
  }
}

/**
 * Toggle policy/guard verification check
 */
export async function togglePolicyAction(policyKey, enabled) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.ADS_EDIT);

  try {
    const settings = await getAdSettings();
    if (!settings || settings.policySafety[policyKey] === undefined) {
      return { success: false, error: `Policy '${policyKey}' not found.` };
    }

    settings.policySafety[policyKey] = Boolean(enabled);
    await saveAdSettings(settings, adminUser.user?.email);

    revalidatePath("/advertising");
    return { success: true, policyKey, enabled: settings.policySafety[policyKey] };
  } catch (err) {
    console.error("Error in togglePolicyAction:", err);
    return { success: false, error: err.message || "Failed to update policy." };
  }
}

/**
 * Synchronize settings with main production site
 */
export async function syncAdSettingsToMainSiteAction() {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.ADS_EDIT);

  try {
    const settings = await getAdSettings();
    if (!settings) {
      return { success: false, error: "Settings file missing." };
    }

    await fs.mkdir(MAIN_SITE_CONFIG_DIR, { recursive: true });
    await fs.writeFile(MAIN_SITE_CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");

    // Also sync .env.local
    let envUpdated = false;
    try {
      let envContent = await fs.readFile(MAIN_SITE_ENV_PATH, "utf-8");
      envContent = envContent.replace(
        /NEXT_PUBLIC_ADS_ENABLED=(true|false)/,
        `NEXT_PUBLIC_ADS_ENABLED=${Boolean(settings.masterEnabled)}`
      );
      if (settings.adUnits?.banner_728x90?.zoneKey) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY=.*/,
          `NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY=${settings.adUnits.banner_728x90.zoneKey}`
        );
      }
      if (settings.adUnits?.banner_320x50?.zoneKey) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY=.*/,
          `NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY=${settings.adUnits.banner_320x50.zoneKey}`
        );
      }
      if (settings.adUnits?.banner_300x250?.zoneKey) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY=.*/,
          `NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY=${settings.adUnits.banner_300x250.zoneKey}`
        );
      }
      await fs.writeFile(MAIN_SITE_ENV_PATH, envContent, "utf-8");
      envUpdated = true;
    } catch (e) {
      console.warn("Main site .env.local update skipped:", e.message);
    }

    revalidatePath("/advertising");
    return {
      success: true,
      message: `Synchronized configuration to main site.${envUpdated ? " .env.local refreshed." : ""}`,
    };
  } catch (err) {
    console.error("Error in syncAdSettingsToMainSiteAction:", err);
    return { success: false, error: err.message || "Failed to sync ad settings." };
  }
}

const ADSTERRA_BASE_URL = "https://api3.adsterratools.com/publisher";

/**
 * Fetch Adsterra account domains and placements
 */
export async function getAdsterraAccountAssetsAction() {
  await requireAdmin(ADMIN_PERMISSIONS.ADS_VIEW);

  const apiKey = process.env.ADSTERRA_API_KEY;
  if (!apiKey) {
    return { success: false, error: "ADSTERRA_API_KEY is not configured in .env.local" };
  }

  try {
    const [domainsRes, placementsRes] = await Promise.all([
      fetch(`${ADSTERRA_BASE_URL}/domains.json`, {
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
        next: { revalidate: 300 },
      }),
      fetch(`${ADSTERRA_BASE_URL}/placements.json`, {
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
        next: { revalidate: 300 },
      }),
    ]);

    const domainsData = domainsRes.ok ? await domainsRes.json() : { items: [] };
    const placementsData = placementsRes.ok ? await placementsRes.json() : { items: [] };

    return {
      success: true,
      domains: domainsData.items || [],
      placements: placementsData.items || [],
    };
  } catch (err) {
    console.error("Error fetching Adsterra account assets:", err);
    return { success: false, error: err.message || "Failed to reach Adsterra API." };
  }
}

/**
 * Fetch real-time statistics and earnings from Adsterra Publisher API
 */
export async function getAdsterraEarningsAction({
  startDate,
  finishDate,
  groupBy = "date",
  domainId,
  placementId,
} = {}) {
  await requireAdmin(ADMIN_PERMISSIONS.ADS_VIEW);

  const apiKey = process.env.ADSTERRA_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      configured: false,
      error: "ADSTERRA_API_KEY is not configured in environment variables.",
    };
  }

  try {
    // Default to last 30 days if not specified
    const today = new Date().toISOString().split("T")[0];
    let start = startDate;
    let finish = finishDate || today;

    if (!start) {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split("T")[0];
    }

    const queryParams = new URLSearchParams({
      start_date: start,
      finish_date: finish,
      group_by: groupBy,
    });

    if (domainId) {
      queryParams.set("domain", String(domainId));
    }
    if (placementId) {
      queryParams.set("placement", String(placementId));
    }

    const apiUrl = `${ADSTERRA_BASE_URL}/stats.json?${queryParams.toString()}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errBody = await response.text();
      let parsedErr = errBody;
      try {
        const j = JSON.parse(errBody);
        parsedErr = j.message || JSON.stringify(j.errors) || errBody;
      } catch {}
      return {
        success: false,
        configured: true,
        status: response.status,
        error: `Adsterra API Error (${response.status}): ${parsedErr}`,
      };
    }

    const data = await response.json();
    const items = data.items || [];

    // Calculate aggregated totals
    let totalRevenue = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    items.forEach((item) => {
      totalRevenue += Number(item.revenue || 0);
      totalImpressions += Number(item.impression || 0);
      totalClicks += Number(item.clicks || 0);
    });

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpm = totalImpressions > 0 ? (totalRevenue / (totalImpressions / 1000)) : 0;

    return {
      success: true,
      configured: true,
      startDate: start,
      finishDate: finish,
      groupBy,
      totalRevenue: Number(totalRevenue.toFixed(4)),
      totalImpressions,
      totalClicks,
      avgCtr: Number(avgCtr.toFixed(2)),
      avgCpm: Number(avgCpm.toFixed(4)),
      items,
      itemCount: data.itemCount || items.length,
      dbLastUpdateTime: data.dbLastUpdateTime || null,
      dbDateTime: data.dbDateTime || null,
    };
  } catch (err) {
    console.error("Error calling Adsterra Publisher API:", err);
    return {
      success: false,
      configured: true,
      error: err.message || "Failed to connect to Adsterra Statistics API.",
    };
  }
}

