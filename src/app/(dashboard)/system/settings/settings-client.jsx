"use client";

import { useState, useTransition } from "react";
import {
  Settings,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Save,
  Key,
  Clock,
  Server,
  Radio,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updatePlatformMetadataAction,
  toggleMaintenanceModeAction,
  toggleFeatureFlagAction,
  updateSecurityConfigAction,
} from "@/app/(dashboard)/actions/system-actions";

export function SettingsClient({ initialData, userRole }) {
  const [data, setData] = useState(initialData || {});
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("platform"); // platform | maintenance | features | security

  const settings = data.settings || {};
  const envStatus = data.envStatus || [];
  const platform = settings.platform || {};
  const maintenance = settings.maintenance || {};
  const featureFlags = settings.featureFlags || {};
  const security = settings.security || {};

  // Form states
  const [platformForm, setPlatformForm] = useState({ ...platform });
  const [maintenanceMessage, setMaintenanceMessage] = useState(maintenance.message || "");
  const [securityForm, setSecurityForm] = useState({
    adminSessionTimeoutMinutes: security.adminSessionTimeoutMinutes || 120,
    maxLoginAttempts: security.maxLoginAttempts || 5,
  });

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePlatform = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updatePlatformMetadataAction(platformForm);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            platform: { ...platformForm },
          },
        }));
        setStatusMessage({ type: "success", text: "Platform metadata saved successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update platform metadata." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handleToggleMaintenance = () => {
    const nextState = !maintenance.enabled;
    startTransition(async () => {
      const res = await toggleMaintenanceModeAction(nextState, maintenanceMessage);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            maintenance: {
              ...prev.settings.maintenance,
              enabled: nextState,
              message: maintenanceMessage,
            },
          },
        }));
        setStatusMessage({
          type: "success",
          text: `Maintenance mode is now ${nextState ? "ACTIVATED" : "DEACTIVATED"}.`,
        });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to toggle maintenance mode." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handleToggleFeature = (flagKey, currentState) => {
    const nextState = !currentState;
    startTransition(async () => {
      const res = await toggleFeatureFlagAction(flagKey, nextState);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            featureFlags: {
              ...prev.settings.featureFlags,
              [flagKey]: {
                ...prev.settings.featureFlags[flagKey],
                enabled: nextState,
              },
            },
          },
        }));
        setStatusMessage({
          type: "success",
          text: `Feature flag '${featureFlags[flagKey]?.name}' set to ${nextState ? "ENABLED" : "DISABLED"}.`,
        });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to toggle feature flag." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateSecurityConfigAction(securityForm);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            security: {
              ...prev.settings.security,
              ...securityForm,
            },
          },
        }));
        setStatusMessage({ type: "success", text: "Security parameters updated successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update security parameters." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  System Settings & Hardening
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono flex items-center gap-1"
                >
                  <Lock className="h-2.5 w-2.5" />
                  Private LAN (Port 3001)
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                Configure global platform metadata, feature flags, maintenance mode emergency toggles, and environment secrets health.
              </p>
            </div>
          </div>
        </div>

        {/* Global Badges */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span>Node {data.nodeVersion || "v22"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Audit Trail Active</span>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs font-medium transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("platform")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === "platform"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-blue-400" />
          <span>Platform Metadata</span>
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === "maintenance"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${maintenance.enabled ? "text-amber-400" : "text-zinc-400"}`} />
          <span>Maintenance Mode {maintenance.enabled && "(ACTIVE)"}</span>
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === "features"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-purple-400" />
          <span>Feature Flags ({Object.keys(featureFlags).length})</span>
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === "security"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Key className="h-3.5 w-3.5 text-emerald-400" />
          <span>Security & Environment ({envStatus.length})</span>
        </button>
      </div>

      {/* TAB 1: PLATFORM METADATA */}
      {activeTab === "platform" && (
        <form onSubmit={handleSavePlatform} className="space-y-4">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-white">Platform Information & Brand</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Primary public branding, communication channels, and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Platform Name</label>
                  <Input
                    value={platformForm.siteName || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, siteName: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Production URL</label>
                  <Input
                    value={platformForm.siteUrl || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, siteUrl: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Brand Tagline</label>
                  <Input
                    value={platformForm.siteTagline || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, siteTagline: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Contact Email</label>
                  <Input
                    value={platformForm.contactEmail || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, contactEmail: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Support / Feedback Email</label>
                  <Input
                    value={platformForm.supportEmail || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, supportEmail: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Discord Community Link</label>
                  <Input
                    value={platformForm.discordUrl || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, discordUrl: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Twitter / X Handle</label>
                  <Input
                    value={platformForm.twitterHandle || ""}
                    onChange={(e) => setPlatformForm({ ...platformForm, twitterHandle: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* TAB 2: MAINTENANCE MODE */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${maintenance.enabled ? "text-amber-400" : "text-zinc-400"}`} />
                  Maintenance Mode Emergency Gate
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  When enabled, visitors to khelpedia.org see a polite maintenance splash page while the private admin panel remains accessible.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono ${
                  maintenance.enabled
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {maintenance.enabled ? "MAINTENANCE ACTIVE" : "NORMAL OPERATION"}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Maintenance Mode Status</h4>
                  <p className="text-[11px] text-zinc-400">
                    {maintenance.enabled
                      ? "Public site traffic is temporarily blocked. Whitelisted IP addresses still have access."
                      : "Public website is fully accessible to all visitors and search engine crawlers."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={maintenance.enabled}
                  disabled={isPending}
                  onClick={handleToggleMaintenance}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    maintenance.enabled ? "bg-amber-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                      maintenance.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400">Public Maintenance Notice</label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white"
                  placeholder="Message to display to visitors..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400">Whitelisted Subnets & IPs</label>
                <div className="flex flex-wrap gap-2">
                  {(maintenance.whitelistedIps || []).map((ip) => (
                    <Badge key={ip} variant="outline" className="bg-zinc-950 text-zinc-300 border-zinc-800 text-[10px] font-mono">
                      {ip}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: FEATURE FLAGS */}
      {activeTab === "features" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Dynamic Platform Feature Flags</h2>
            <p className="text-xs text-zinc-400">
              Instantly enable or disable capabilities site-wide without redeploying code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(featureFlags).map(([key, flag]) => (
              <Card key={key} className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xs font-semibold text-white">{flag.name}</CardTitle>
                      <Badge variant="outline" className="text-[9px] bg-zinc-800 text-zinc-400 border-zinc-700">
                        {flag.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500">Key: {key}</p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={flag.enabled}
                    disabled={isPending}
                    onClick={() => handleToggleFeature(key, flag.enabled)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      flag.enabled ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                        flag.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <p className="text-xs text-zinc-400">{flag.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & ENVIRONMENT INSPECTOR */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Security Parameters Card */}
          <form onSubmit={handleSaveSecurity}>
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  Session & Lockout Policies
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Enforce session limits and brute-force defenses for administrative accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">
                      Admin Session Inactivity Timeout (Minutes)
                    </label>
                    <Input
                      type="number"
                      value={securityForm.adminSessionTimeoutMinutes}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          adminSessionTimeoutMinutes: e.target.value,
                        })
                      }
                      className="bg-zinc-950 border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">
                      Max Failed Login Attempts Before Lockout
                    </label>
                    <Input
                      type="number"
                      value={securityForm.maxLoginAttempts}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          maxLoginAttempts: e.target.value,
                        })
                      }
                      className="bg-zinc-950 border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Security Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Environment Variables Secret Health Table */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Environment Configuration Health</h3>
              <p className="text-xs text-zinc-400">
                Audited environment variables and server secrets. Sensitive values are permanently masked.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Variable Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Configured Value (Masked)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {envStatus.map((item) => (
                    <tr key={item.name} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-white text-[11px]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[9px] bg-zinc-800 text-zinc-400 border-zinc-700">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                            {item.maskedValue}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.maskedValue, item.name)}
                            title="Copy masked reference"
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
                          >
                            {copiedKey === item.name ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            item.configured
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {item.configured ? "CONFIGURED" : "MISSING"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px] max-w-xs truncate">
                        {item.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
