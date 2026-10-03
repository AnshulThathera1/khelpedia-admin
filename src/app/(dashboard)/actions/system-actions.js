"use server";

import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { query } from "@/lib/db";

const SETTINGS_PATH = path.join(process.cwd(), "src", "config", "system-settings.json");
const AUDIT_PATH = path.join(process.cwd(), "src", "config", "audit-logs.json");

/**
 * Read system settings from disk
 */
export async function getSystemSettings() {
  await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_VIEW);

  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(raw);

    // Sync latest maintenance mode directly from shared PostgreSQL database
    try {
      const dbRes = await query("SELECT value FROM system_settings WHERE key = 'maintenance'");
      if (dbRes?.rows?.[0]?.value) {
        settings.maintenance = { ...settings.maintenance, ...dbRes.rows[0].value };
      }
    } catch (dbErr) {
      console.warn("Could not read maintenance mode from DB:", dbErr.message);
    }

    // Build masked environment variables audit report
    const maskKey = (val) => {
      if (!val) return "NOT CONFIGURED";
      if (val.length < 12) return "••••••••••••";
      return `${val.slice(0, 6)}••••••••••••${val.slice(-4)}`;
    };

    const envStatus = [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        category: "Database & Storage",
        configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        maskedValue: maskKey(process.env.NEXT_PUBLIC_SUPABASE_URL),
        purpose: "Supabase project connection endpoint",
        isSecret: false,
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        category: "Database & Storage",
        configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        maskedValue: maskKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        purpose: "Public anonymous client authorization token",
        isSecret: true,
      },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        category: "Database & Storage",
        configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        maskedValue: maskKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
        purpose: "Superuser privileged bypass key (Server only)",
        isSecret: true,
      },
      {
        name: "GEMINI_API_KEY",
        category: "AI & Editorial",
        configured: Boolean(process.env.GEMINI_API_KEY),
        maskedValue: maskKey(process.env.GEMINI_API_KEY),
        purpose: "Google Gemini 2.5 Flash generative AI API",
        isSecret: true,
      },
      {
        name: "DISCORD_WEBHOOK_URL",
        category: "Notifications",
        configured: Boolean(process.env.DISCORD_WEBHOOK_URL),
        maskedValue: maskKey(process.env.DISCORD_WEBHOOK_URL),
        purpose: "Editorial alerts and system ping channel webhook",
        isSecret: true,
      },
      {
        name: "PANDASCORE_API_KEY",
        category: "Data Ingestion",
        configured: Boolean(process.env.PANDASCORE_API_KEY),
        maskedValue: maskKey(process.env.PANDASCORE_API_KEY),
        purpose: "PandaScore REST API tournament & match data feed",
        isSecret: true,
      },
      {
        name: "RIOT_API_KEY",
        category: "Data Ingestion",
        configured: Boolean(process.env.RIOT_API_KEY),
        maskedValue: maskKey(process.env.RIOT_API_KEY),
        purpose: "Riot Games Developer API for Valorant & LoL feeds",
        isSecret: true,
      },
      {
        name: "CRON_SECRET",
        category: "Security & Jobs",
        configured: Boolean(process.env.CRON_SECRET),
        maskedValue: maskKey(process.env.CRON_SECRET),
        purpose: "Bearer token protecting /api/cron automated routes",
        isSecret: true,
      },
    ];

    return {
      settings,
      envStatus,
      nodeVersion: process.version,
      platformInfo: {
        nodeEnv: process.env.NODE_ENV || "development",
        port: 3001,
        privateNetworkEnforced: true,
      },
    };
  } catch (err) {
    console.error("Failed to load system settings:", err);
    return null;
  }
}

/**
 * Record an audit log event
 */
export async function recordAuditLog(entry, adminUser = null) {
  try {
    let logs = [];
    try {
      const raw = await fs.readFile(AUDIT_PATH, "utf-8");
      logs = JSON.parse(raw);
    } catch {
      logs = [];
    }

    const newLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: entry.action || "SYSTEM_ACTION",
      category: entry.category || "SYSTEM",
      entityType: entry.entityType || "system",
      entityId: entry.entityId || "global",
      actorId: adminUser?.user?.id || entry.actorId || "system",
      actorEmail: adminUser?.user?.email || entry.actorEmail || "admin@khelpedia.org",
      actorRole: adminUser?.role || entry.actorRole || "SUPER_ADMIN",
      ipAddress: entry.ipAddress || "127.0.0.1 (LAN / Localhost)",
      details: entry.details || "",
      metadata: entry.metadata || {},
    };

    logs = [newLog, ...logs].slice(0, 200); // keep up to 200 logs
    await fs.writeFile(AUDIT_PATH, JSON.stringify(logs, null, 2), "utf-8");
    return newLog;
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

/**
 * Save updated system settings
 */
async function saveSystemSettings(settings, userEmail = "admin@khelpedia.org") {
  settings.lastUpdated = new Date().toISOString();
  settings.updatedBy = userEmail;
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

/**
 * Update Platform Metadata
 */
export async function updatePlatformMetadataAction(formData) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_MANAGE);

  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(raw);

    settings.platform.siteName = formData.siteName?.trim() || settings.platform.siteName;
    settings.platform.siteTagline = formData.siteTagline?.trim() || settings.platform.siteTagline;
    settings.platform.siteUrl = formData.siteUrl?.trim() || settings.platform.siteUrl;
    settings.platform.contactEmail = formData.contactEmail?.trim() || settings.platform.contactEmail;
    settings.platform.supportEmail = formData.supportEmail?.trim() || settings.platform.supportEmail;
    settings.platform.discordUrl = formData.discordUrl?.trim() || settings.platform.discordUrl;
    settings.platform.twitterHandle = formData.twitterHandle?.trim() || settings.platform.twitterHandle;

    await saveSystemSettings(settings, adminUser.user?.email);

    await recordAuditLog(
      {
        action: "PLATFORM_METADATA_UPDATED",
        category: "SYSTEM",
        entityType: "settings",
        entityId: "platform",
        details: `Updated platform metadata: ${settings.platform.siteName} (${settings.platform.contactEmail})`,
        metadata: settings.platform,
      },
      adminUser
    );

    revalidatePath("/system/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Maintenance Mode
 */
export async function toggleMaintenanceModeAction(enabled, message) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_MANAGE);

  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(raw);

    settings.maintenance.enabled = Boolean(enabled);
    if (message) {
      settings.maintenance.message = message.trim();
    }

    await saveSystemSettings(settings, adminUser.user?.email);

    // Persist to PostgreSQL database so khelpedia.org immediately sees it
    try {
      await query(
        `INSERT INTO system_settings (key, value, updated_at, updated_by)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (key) DO UPDATE
         SET value = $2, updated_at = NOW(), updated_by = $3`,
        [
          "maintenance",
          JSON.stringify(settings.maintenance),
          adminUser.user?.email || "admin@khelpedia.org",
        ]
      );
    } catch (dbErr) {
      console.error("Failed to sync maintenance mode to PostgreSQL:", dbErr);
    }

    await recordAuditLog(
      {
        action: enabled ? "MAINTENANCE_MODE_ENABLED" : "MAINTENANCE_MODE_DISABLED",
        category: "SECURITY",
        entityType: "system",
        entityId: "maintenance",
        details: `Maintenance mode was ${enabled ? "ACTIVATED" : "DEACTIVATED"} by administrator.`,
        metadata: { enabled, message: settings.maintenance.message },
      },
      adminUser
    );

    revalidatePath("/system/settings");
    return { success: true, enabled: settings.maintenance.enabled };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Feature Flag
 */
export async function toggleFeatureFlagAction(flagKey, enabled) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_MANAGE);

  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(raw);

    if (!settings.featureFlags[flagKey]) {
      return { success: false, error: `Feature flag '${flagKey}' not found.` };
    }

    settings.featureFlags[flagKey].enabled = Boolean(enabled);
    await saveSystemSettings(settings, adminUser.user?.email);

    await recordAuditLog(
      {
        action: "FEATURE_FLAG_TOGGLED",
        category: "SYSTEM",
        entityType: "feature_flag",
        entityId: flagKey,
        details: `Feature flag '${settings.featureFlags[flagKey].name}' set to ${enabled ? "ENABLED" : "DISABLED"}.`,
        metadata: { flagKey, enabled },
      },
      adminUser
    );

    revalidatePath("/system/settings");
    return { success: true, flagKey, enabled: settings.featureFlags[flagKey].enabled };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Update Security Configuration
 */
export async function updateSecurityConfigAction(secData) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_MANAGE);

  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(raw);

    if (secData.adminSessionTimeoutMinutes !== undefined) {
      settings.security.adminSessionTimeoutMinutes = Number(secData.adminSessionTimeoutMinutes);
    }
    if (secData.maxLoginAttempts !== undefined) {
      settings.security.maxLoginAttempts = Number(secData.maxLoginAttempts);
    }

    await saveSystemSettings(settings, adminUser.user?.email);

    await recordAuditLog(
      {
        action: "SECURITY_SETTINGS_UPDATED",
        category: "SECURITY",
        entityType: "security_config",
        entityId: "session_and_lockout",
        details: `Updated session timeout (${settings.security.adminSessionTimeoutMinutes}m) and login attempts (${settings.security.maxLoginAttempts}).`,
        metadata: settings.security,
      },
      adminUser
    );

    revalidatePath("/system/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch and Filter Audit Logs
 */
export async function getAuditLogsAction({ category = "ALL", search = "", limit = 50 }) {
  await requireAdmin(ADMIN_PERMISSIONS.AUDIT_VIEW);

  try {
    let logs = [];
    try {
      const raw = await fs.readFile(AUDIT_PATH, "utf-8");
      logs = JSON.parse(raw);
    } catch {
      logs = [];
    }

    let filtered = logs;

    if (category && category !== "ALL") {
      filtered = filtered.filter((l) => l.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.actorEmail.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      logs: filtered.slice(0, limit),
      totalCount: filtered.length,
    };
  } catch (err) {
    return { success: false, error: err.message, logs: [], totalCount: 0 };
  }
}
