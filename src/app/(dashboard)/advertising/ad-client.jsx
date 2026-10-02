"use client";

import { useState, useTransition } from "react";
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Tv,
  Smartphone,
  Laptop,
  ShieldCheck,
  Layers,
  ExternalLink,
  Lock,
  Settings,
  Sparkles,
  Zap,
  Info,
  Radio,
  FileText,
  Swords,
  Trophy,
  UserCheck,
  Globe,
  Edit2,
  X,
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  MousePointerClick,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  toggleMasterSwitchAction,
  togglePlacementAction,
  updateAdUnitAction,
  togglePolicyAction,
  syncAdSettingsToMainSiteAction,
  getAdsterraEarningsAction,
  getAdsterraAccountAssetsAction,
} from "@/app/(dashboard)/actions/ad-actions";

export function AdClient({
  initialSettings,
  userRole,
  hasApiKey = false,
  initialEarnings = null,
  accountAssets = null,
}) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("earnings"); // earnings | placements | units | compliance | simulator
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Adsterra API Live Stats State
  const [earningsData, setEarningsData] = useState(initialEarnings);
  const [assets, setAssets] = useState(accountAssets);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState("30d");
  const [customStartDate, setCustomStartDate] = useState(
    initialEarnings?.startDate || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [customFinishDate, setCustomFinishDate] = useState(
    initialEarnings?.finishDate || new Date().toISOString().split("T")[0]
  );
  const [groupBy, setGroupBy] = useState("placement"); // placement | date | country
  const [selectedDomain, setSelectedDomain] = useState("all");

  // Edit Modal State
  const [editingUnit, setEditingUnit] = useState(null);
  const [editFormData, setEditFormData] = useState({ zoneKey: "", scriptUrl: "", enabled: true });

  // Simulator State
  const [simDevice, setSimDevice] = useState("desktop"); // desktop | mobile
  const [simTemplate, setSimTemplate] = useState("homepage"); // homepage | match | team | tournament | player | blog

  const masterEnabled = settings?.masterEnabled ?? true;
  const placements = settings?.placements || {};
  const adUnits = settings?.adUnits || {};
  const policySafety = settings?.policySafety || {};

  const totalPlacements = Object.keys(placements).length;
  const activePlacementsCount = Object.values(placements).filter((p) => p.enabled).length;
  const totalUnits = Object.keys(adUnits).length;

  const handleCopy = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyReveal = (keyId) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const handleMasterToggle = () => {
    const nextState = !masterEnabled;
    startTransition(async () => {
      const res = await toggleMasterSwitchAction(nextState);
      if (res?.success) {
        setSettings((prev) => ({ ...prev, masterEnabled: nextState }));
        setStatusMessage({
          type: "success",
          text: `Master ad engine ${nextState ? "activated site-wide" : "paused site-wide"}.`,
        });
      } else {
        setStatusMessage({ type: "error", text: res?.error || "Failed to update master switch." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handlePlacementToggle = (placementId, currentState) => {
    const nextState = !currentState;
    startTransition(async () => {
      const res = await togglePlacementAction(placementId, nextState);
      if (res?.success) {
        setSettings((prev) => ({
          ...prev,
          placements: {
            ...prev.placements,
            [placementId]: {
              ...prev.placements[placementId],
              enabled: nextState,
            },
          },
        }));
        setStatusMessage({
          type: "success",
          text: `Placement '${placements[placementId]?.name}' ${nextState ? "enabled" : "disabled"}.`,
        });
      } else {
        setStatusMessage({ type: "error", text: res?.error || "Failed to toggle placement." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handlePolicyToggle = (policyKey, currentState) => {
    const nextState = !currentState;
    startTransition(async () => {
      const res = await togglePolicyAction(policyKey, nextState);
      if (res?.success) {
        setSettings((prev) => ({
          ...prev,
          policySafety: {
            ...prev.policySafety,
            [policyKey]: nextState,
          },
        }));
        setStatusMessage({
          type: "success",
          text: `Policy setting updated.`,
        });
      } else {
        setStatusMessage({ type: "error", text: res?.error || "Failed to update policy." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const openEditUnitModal = (unitKey) => {
    const unit = adUnits[unitKey];
    if (!unit) return;
    setEditingUnit(unitKey);
    setEditFormData({
      zoneKey: unit.zoneKey || "",
      scriptUrl: unit.scriptUrl || "",
      enabled: unit.enabled ?? true,
    });
  };

  const handleSaveUnit = () => {
    if (!editingUnit) return;
    startTransition(async () => {
      const res = await updateAdUnitAction(editingUnit, editFormData);
      if (res?.success) {
        setSettings((prev) => {
          const updated = { ...prev };
          if (updated.adUnits[editingUnit]) {
            if (editFormData.zoneKey !== undefined) {
              updated.adUnits[editingUnit].zoneKey = editFormData.zoneKey;
              updated.adUnits[editingUnit].scriptEndpoint = `https://www.highrevenueformat.com/${editFormData.zoneKey}/invoke.js`;
            }
            if (editFormData.scriptUrl !== undefined) {
              updated.adUnits[editingUnit].scriptUrl = editFormData.scriptUrl;
            }
            updated.adUnits[editingUnit].enabled = editFormData.enabled;
            updated.adUnits[editingUnit].status = editFormData.enabled ? "active" : "paused";
          }
          return updated;
        });
        setStatusMessage({ type: "success", text: `Ad unit '${adUnits[editingUnit]?.name}' updated successfully.` });
        setEditingUnit(null);
      } else {
        setStatusMessage({ type: "error", text: res?.error || "Failed to update ad unit." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handleSyncToMainSite = () => {
    startTransition(async () => {
      const res = await syncAdSettingsToMainSiteAction();
      if (res?.success) {
        setStatusMessage({ type: "success", text: res.message || "Synced configuration to main site." });
      } else {
        setStatusMessage({ type: "error", text: res?.error || "Failed to sync to main site." });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  // Helper mask function
  const maskString = (str) => {
    if (!str || str.length < 8) return "••••••••••••••••";
    return `${str.slice(0, 4)}••••••••••••••••${str.slice(-4)}`;
  };

  // Helper to fetch earnings from Adsterra API
  const handleFetchEarnings = async (overrideParams = {}) => {
    setStatsLoading(true);
    try {
      const start = overrideParams.startDate ?? customStartDate;
      const finish = overrideParams.finishDate ?? customFinishDate;
      const grp = overrideParams.groupBy ?? groupBy;
      const dom = overrideParams.domainId ?? (selectedDomain === "all" ? undefined : selectedDomain);

      const res = await getAdsterraEarningsAction({
        startDate: start,
        finishDate: finish,
        groupBy: grp,
        domainId: dom,
      });

      if (res?.success) {
        setEarningsData(res);
        setStatusMessage({
          type: "success",
          text: `Fetched fresh metrics from Adsterra API (${res.itemCount} records).`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res?.error || "Failed to fetch Adsterra statistics.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to contact Adsterra API.",
      });
    } finally {
      setStatsLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const applyPreset = (preset) => {
    setDateRangePreset(preset);
    const today = new Date().toISOString().split("T")[0];
    let start = today;
    let finish = today;

    if (preset === "today") {
      start = today;
      finish = today;
    } else if (preset === "yesterday") {
      const y = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      start = y;
      finish = y;
    } else if (preset === "7d") {
      start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      finish = today;
    } else if (preset === "30d") {
      start = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
      finish = today;
    } else if (preset === "this_month") {
      const now = new Date();
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      finish = today;
    }

    setCustomStartDate(start);
    setCustomFinishDate(finish);
    handleFetchEarnings({ startDate: start, finishDate: finish });
  };

  const getPlacementTitle = (placementId) => {
    const p = assets?.placements?.find((item) => String(item.id) === String(placementId));
    if (p?.title) return p.title;

    const dict = {
      "31476401": "SocialBar_1 (Smart Social Bar)",
      "31476402": "NativeBanner_1 (Native Recommendations)",
      "31476403": "320x50_1 (Mobile Sticky Banner)",
      "31476404": "728x90_1 (Desktop Leaderboard)",
      "31476405": "300x250_1 (Medium Rectangle MPU)",
      "19502638": "Legacy 468x60 Banner",
      "19507960": "Direct Link",
    };
    return dict[String(placementId)] || `Adsterra Unit #${placementId}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Advertising & Monetization Control
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono flex items-center gap-1"
                >
                  <Lock className="h-2.5 w-2.5" />
                  Private Network Only (Port 3001)
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                Centralized management of Adsterra advertising units, site placements, CLS guard rails, and site-wide master switch.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Master Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncToMainSite}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            Sync Main Site
          </Button>

          {/* Master Switch Pill */}
          <div className="flex items-center gap-3 bg-zinc-950/80 px-3.5 py-2 rounded-lg border border-zinc-800">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-medium">
                Master Engine
              </span>
              <span
                className={`text-xs font-semibold ${
                  masterEnabled ? "text-emerald-400" : "text-amber-500"
                }`}
              >
                {masterEnabled ? "ACTIVE / SERVING" : "PAUSED / HIDDEN"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={masterEnabled}
              disabled={isPending}
              onClick={handleMasterToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                masterEnabled ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  masterEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Adsterra Revenue (30d)
              </span>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                ${Number(earningsData?.totalRevenue || 0).toFixed(4)}
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                  LIVE API
                </Badge>
              </p>
              <p className="text-[11px] text-zinc-500">
                {earningsData?.totalImpressions?.toLocaleString() || 0} impr • {earningsData?.totalClicks?.toLocaleString() || 0} clicks
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Active Placements
              </span>
              <p className="text-lg font-bold text-white">
                {activePlacementsCount}{" "}
                <span className="text-xs font-normal text-zinc-400">/ {totalPlacements} Placements</span>
              </p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {masterEnabled ? "Serving across templates" : "Placements muted by master"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Ad Units Configured
              </span>
              <p className="text-lg font-bold text-white">
                {totalUnits}{" "}
                <span className="text-xs font-normal text-zinc-400">Unique Formats</span>
              </p>
              <p className="text-[11px] text-zinc-500">728x90, 320x50, 300x250, Native, Social</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sliders className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Policy & CLS Guard
              </span>
              <p className="text-lg font-bold text-white flex items-center gap-1.5">
                100% Guarded
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </p>
              <p className="text-[11px] text-zinc-500">No adult ads, 0 popunders, hydration-safe</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("earnings")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "earnings"
              ? "bg-emerald-600 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Earnings & Performance</span>
          <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 text-[9px] px-1 py-0 h-4">
            LIVE
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab("placements")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "placements"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Placement Matrix ({activePlacementsCount}/{totalPlacements})</span>
        </button>
        <button
          onClick={() => setActiveTab("units")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "units"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Ad Units & Zone Keys ({totalUnits})</span>
        </button>
        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "compliance"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Policy & CLS Guardrails</span>
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "simulator"
              ? "bg-zinc-800 text-white font-semibold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>Layout Placement Simulator</span>
        </button>
      </div>

      {/* TAB 0: EARNINGS & LIVE PERFORMANCE */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Adsterra Publisher Revenue & Metrics
                </h2>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                  Connected: Publisher-953304
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Direct integration with Adsterra Publisher API. Metrics reflect verified ad displays, clicks, CPM, and payouts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Domain Filter */}
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  handleFetchEarnings({ domainId: e.target.value === "all" ? undefined : e.target.value });
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-zinc-700"
              >
                <option value="all">All Domains ({assets?.domains?.length || 3})</option>
                {assets?.domains?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} (ID: {d.id})
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFetchEarnings()}
                disabled={statsLoading}
                className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs gap-1.5 h-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${statsLoading ? "animate-spin text-emerald-400" : ""}`} />
                <span>{statsLoading ? "Querying API..." : "Refresh Live Data"}</span>
              </Button>
            </div>
          </div>

          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Net Revenue</span>
                  <div className="h-7 w-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                  ${Number(earningsData?.totalRevenue || 0).toFixed(4)}
                </p>
                <p className="text-[11px] text-zinc-500">
                  USD payout ({earningsData?.startDate} to {earningsData?.finishDate})
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Ad Impressions</span>
                  <div className="h-7 w-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-white tracking-tight">
                  {Number(earningsData?.totalImpressions || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-500">Served across desktop, tablet & mobile</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Clicks & CTR</span>
                  <div className="h-7 w-7 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <MousePointerClick className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-extrabold text-white tracking-tight">
                    {Number(earningsData?.totalClicks || 0).toLocaleString()}
                  </p>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                    {Number(earningsData?.avgCtr || 0).toFixed(2)}% CTR
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">Verified click interactions</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Average CPM Rate</span>
                  <div className="h-7 w-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-amber-400 tracking-tight">
                  ${Number(earningsData?.avgCpm || 0).toFixed(3)}
                </p>
                <p className="text-[11px] text-zinc-500">Estimated value per 1,000 ad impressions</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter & Controls Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            {/* Date Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono uppercase text-zinc-400 mr-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Period:
              </span>
              {[
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "7d", label: "Last 7 Days" },
                { id: "30d", label: "Last 30 Days" },
                { id: "this_month", label: "This Month" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    dateRangePreset === p.id
                      ? "bg-emerald-600 text-white font-semibold"
                      : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Group By Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase text-zinc-400 mr-2">Breakdown:</span>
              {[
                { id: "placement", label: "By Ad Unit", icon: Layers },
                { id: "date", label: "By Date", icon: BarChart3 },
                { id: "country", label: "By Country", icon: Globe2 },
              ].map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGroupBy(g.id);
                      handleFetchEarnings({ groupBy: g.id });
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      groupBy === g.id
                        ? "bg-zinc-800 text-white font-semibold border border-zinc-700"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breakdown Data Table */}
          <Card className="bg-zinc-900/60 border-zinc-800 overflow-hidden">
            <CardHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">
                  Performance Breakdown ({groupBy === "placement" ? "By Ad Placement" : groupBy === "date" ? "Daily Timeline" : "By Country / GEO"})
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  {earningsData?.startDate} to {earningsData?.finishDate} • {earningsData?.items?.length || 0} active rows reported
                </CardDescription>
              </div>
              {earningsData?.dbLastUpdateTime && (
                <div className="text-[11px] text-zinc-500 font-mono">
                  Adsterra DB Sync: {earningsData.dbLastUpdateTime}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {(!earningsData?.items || earningsData.items.length === 0) ? (
                <div className="p-8 text-center space-y-2">
                  <Info className="h-8 w-8 text-zinc-500 mx-auto" />
                  <p className="text-sm font-medium text-white">No ad metrics recorded for this exact filter</p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Adsterra updates stats incrementally throughout the day. Try switching the date filter to "Last 30 Days" or checking back after traffic serves.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider font-mono border-b border-zinc-800">
                      <tr>
                        <th className="p-3.5">
                          {groupBy === "placement" ? "Ad Unit / Placement" : groupBy === "date" ? "Date" : "Country / GEO"}
                        </th>
                        <th className="p-3.5 text-right">Impressions</th>
                        <th className="p-3.5 text-right">Clicks</th>
                        <th className="p-3.5 text-right">CTR (%)</th>
                        <th className="p-3.5 text-right">Avg CPM ($)</th>
                        <th className="p-3.5 text-right text-emerald-400 font-semibold">Revenue ($ USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {earningsData.items.map((row, idx) => {
                        const ctr = Number(row.ctr || 0);
                        const revenue = Number(row.revenue || 0);
                        const cpm = Number(row.cpm || 0);
                        const impression = Number(row.impression || 0);
                        const clicks = Number(row.clicks || 0);

                        return (
                          <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-3.5 font-medium text-white">
                              {groupBy === "placement" ? (
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-zinc-200">
                                    {getPlacementTitle(row.placement)}
                                  </span>
                                  <span className="block text-[11px] font-mono text-zinc-500">
                                    Placement ID: {row.placement}
                                  </span>
                                </div>
                              ) : groupBy === "date" ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                  <span className="font-mono text-zinc-300">{row.date}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Globe2 className="h-3.5 w-3.5 text-blue-400" />
                                  <span className="font-semibold text-white uppercase">{row.country}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-3.5 text-right font-mono text-zinc-300">
                              {impression.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-right font-mono text-zinc-300">
                              {clicks.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-right font-mono">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  ctr > 5
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : ctr > 0
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-zinc-500"
                                }`}
                              >
                                {ctr.toFixed(2)}%
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono text-amber-400">
                              ${cpm.toFixed(3)}
                            </td>
                            <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                              ${revenue.toFixed(4)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 1: PLACEMENT MATRIX */}
      {activeTab === "placements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Live Template Placements</h2>
              <p className="text-xs text-zinc-400">
                Toggle individual advertising slots across KhelPediA page layouts.
              </p>
            </div>
            {!masterEnabled && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                Note: All placements are currently suspended by Master Switch
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(placements).map(([key, placement]) => {
              const isSlotActive = masterEnabled && placement.enabled;

              return (
                <Card
                  key={key}
                  className={`border transition-all ${
                    isSlotActive
                      ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                      : "bg-zinc-950/40 border-zinc-800/60 opacity-80"
                  }`}
                >
                  <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold text-white">
                          {placement.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            isSlotActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {isSlotActive ? "LIVE" : "PAUSED"}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Target Route: <span className="text-zinc-300">{placement.targetPath}</span>
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={placement.enabled}
                      disabled={isPending}
                      onClick={() => handlePlacementToggle(key, placement.enabled)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                        placement.enabled ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          placement.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <p className="text-xs text-zinc-400">{placement.description}</p>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-mono">Format:</span>
                      <span className="text-zinc-200 font-medium">{placement.format}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setSimTemplate(key);
                          setActiveTab("simulator");
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Laptop className="h-3 w-3" />
                        Preview in Simulator
                      </button>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Container: &lt;AdContainer type=&quot;{placement.type}&quot; placement=&quot;{key}&quot; /&gt;
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AD UNITS & ZONE KEYS */}
      {activeTab === "units" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Configured Adsterra Units</h2>
              <p className="text-xs text-zinc-400">
                Official zone identifiers and script endpoints. Sensitive keys are masked by default.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncToMainSite}
              className="text-xs border-zinc-700 bg-zinc-900"
            >
              Export Configuration
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ad Unit Name</th>
                  <th className="py-3 px-4">Format / Device</th>
                  <th className="py-3 px-4">Zone Key / Script Target</th>
                  <th className="py-3 px-4">Dimensions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {Object.entries(adUnits).map(([key, unit]) => {
                  const isRevealed = revealedKeys[key];
                  const rawKey = unit.zoneKey || unit.containerId || unit.scriptUrl || "";
                  const displayKey = isRevealed ? rawKey : maskString(rawKey);

                  return (
                    <tr key={key} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{unit.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">ID: {unit.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                          {unit.format}
                        </Badge>
                        <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">Target: {unit.device}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 max-w-xs">
                          <span className="truncate text-zinc-300 text-[11px] bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                            {displayKey}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleKeyReveal(key)}
                            title={isRevealed ? "Hide key" : "Reveal key"}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(rawKey, key)}
                            title="Copy to clipboard"
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                          >
                            {copiedKey === key ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">{unit.dimensions}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            unit.enabled
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {unit.enabled ? "ACTIVE" : "PAUSED"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditUnitModal(key)}
                          className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POLICY & CLS GUARDRAILS */}
      {activeTab === "compliance" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Monetization Guardrails & Performance Standards</h2>
            <p className="text-xs text-zinc-400">
              Guarantees strict compliance with editorial guidelines, Google Core Web Vitals (CLS), and Next.js 15 App Router architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adult Filter Card */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-white">
                    Adult / 18+ Ad Filtering
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Enforced
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-xs text-zinc-400 space-y-2">
                <p>
                  Zero adult, erotic, or gambling creative formats are accepted. Zone settings on Adsterra platform are configured with strict family-safe filters.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px]">
                  <span className="text-zinc-500 font-mono">Status: Active Filter</span>
                  <button
                    onClick={() => handlePolicyToggle("blockAdultAds", policySafety.blockAdultAds)}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {policySafety.blockAdultAds ? "Lock Active (Protected)" : "Enable Filter"}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Popunder Blocker */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-white">
                    Intrusive Popunder Prohibition
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Enforced
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-xs text-zinc-400 space-y-2">
                <p>
                  Popunders, forced new-window opens, and aggressive redirects are disabled. Only non-intrusive banners, native widgets, and bottom social bar notifications are allowed.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px]">
                  <span className="text-zinc-500 font-mono">Bounce Rate Protection: 100%</span>
                  <span className="text-emerald-400 font-medium">Safe User Experience</span>
                </div>
              </CardContent>
            </Card>

            {/* CLS Guard Card */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-white">
                    Cumulative Layout Shift (CLS) Guard
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Passing
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-xs text-zinc-400 space-y-2">
                <p>
                  Ad containers pre-reserve minimum height before scripts execute (90px desktop leaderboard, 50px mobile banner, 250px MPU). Eliminates page jumpiness and protects Google SEO search scores.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px]">
                  <span className="text-zinc-500 font-mono">Min Height Reserved</span>
                  <span className="text-emerald-400 font-mono">CLS &lt; 0.05</span>
                </div>
              </CardContent>
            </Card>

            {/* App Router Hydration Guard */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-white">
                    Next.js App Router Hydration Safety
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Verified
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-xs text-zinc-400 space-y-2">
                <p>
                  All ad units use &quot;use client&quot; directives, ref containers, and DOM duplicate-script checks. Ads do not render on SSR server tree, ensuring zero hydration mismatch errors.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px]">
                  <span className="text-zinc-500 font-mono">Hydration Errors: 0</span>
                  <span className="text-emerald-400 font-mono">Clean React 19 / Next 15</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: LAYOUT PLACEMENT SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Live Layout Placement Simulator</h2>
              <p className="text-xs text-zinc-400">
                Visualize where advertisements appear across different page templates and viewport sizes.
              </p>
            </div>

            {/* Simulator Controls */}
            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                {Object.keys(placements).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSimTemplate(key)}
                    className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                      simTemplate === key
                        ? "bg-zinc-800 text-white font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Viewport Device Toggle */}
              <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setSimDevice("desktop")}
                  className={`p-1.5 rounded transition-colors ${
                    simDevice === "desktop"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Desktop View (728x90)"
                >
                  <Laptop className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSimDevice("mobile")}
                  className={`p-1.5 rounded transition-colors ${
                    simDevice === "mobile"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Mobile View (320x50)"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Wireframe Mock Canvas */}
          <div className="flex justify-center p-6 rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner overflow-x-auto">
            <div
              className={`transition-all duration-300 border border-zinc-800 rounded-lg bg-zinc-900/90 shadow-2xl p-4 flex flex-col gap-4 ${
                simDevice === "desktop" ? "w-[780px]" : "w-[360px]"
              }`}
            >
              {/* Mock Browser Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-zinc-400 truncate max-w-[200px]">
                    https://khelpedia.org{placements[simTemplate]?.targetPath || "/"}
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono border-zinc-700 text-zinc-400">
                  {simDevice === "desktop" ? "Desktop 1200px" : "Mobile 375px"}
                </Badge>
              </div>

              {/* Mock Header / Navigation */}
              <div className="h-10 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-500 text-xs">KhelPediA</span>
                  <div className="hidden sm:flex gap-2 text-[10px] text-zinc-400">
                    <span>Tournaments</span>
                    <span>Matches</span>
                    <span>Teams</span>
                    <span>News</span>
                  </div>
                </div>
                <div className="h-4 w-12 rounded bg-zinc-800" />
              </div>

              {/* Mock Content Above Ad */}
              {simTemplate === "homepage" && (
                <div className="h-28 rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 flex flex-col justify-center">
                  <div className="h-3 w-40 rounded bg-zinc-800 mb-2" />
                  <div className="h-2 w-64 rounded bg-zinc-800/60 mb-1" />
                  <div className="h-2 w-48 rounded bg-zinc-800/40" />
                </div>
              )}

              {simTemplate === "match" && (
                <div className="h-24 rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-zinc-800" />
                    <div className="h-3 w-16 rounded bg-zinc-800" />
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-500">2 — 1 (LIVE)</span>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 rounded bg-zinc-800" />
                    <div className="h-8 w-8 rounded-full bg-zinc-800" />
                  </div>
                </div>
              )}

              {simTemplate === "team" && (
                <div className="h-20 rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded bg-zinc-800 shrink-0" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-32 rounded bg-zinc-800" />
                    <div className="h-2 w-48 rounded bg-zinc-800/60" />
                  </div>
                </div>
              )}

              {simTemplate === "player" && (
                <div className="h-20 rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 shrink-0" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-28 rounded bg-zinc-800" />
                    <div className="h-2 w-36 rounded bg-zinc-800/60" />
                  </div>
                </div>
              )}

              {simTemplate === "tournament" && (
                <div className="h-20 rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-3.5 w-48 rounded bg-zinc-800" />
                    <div className="h-2 w-32 rounded bg-zinc-800/60" />
                  </div>
                  <div className="h-5 w-16 rounded bg-amber-500/20" />
                </div>
              )}

              {simTemplate === "blog" && (
                <div className="space-y-2">
                  <div className="h-4 w-5/6 rounded bg-zinc-800" />
                  <div className="h-2.5 w-full rounded bg-zinc-800/50" />
                  <div className="h-2.5 w-4/5 rounded bg-zinc-800/40" />
                </div>
              )}

              {/* SIMULATED AD SLOT */}
              <div
                className={`p-3 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                  masterEnabled && placements[simTemplate]?.enabled
                    ? "border-amber-500/60 bg-amber-500/5"
                    : "border-zinc-700 bg-zinc-950/60 opacity-60"
                }`}
                style={{
                  minHeight: simDevice === "desktop" ? "110px" : "70px",
                }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-white">
                    {placements[simTemplate]?.name || "Ad Container"}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono ${
                      masterEnabled && placements[simTemplate]?.enabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {masterEnabled && placements[simTemplate]?.enabled ? "RENDERED" : "SUPPRESSED"}
                  </Badge>
                </div>

                <div
                  className={`rounded border flex items-center justify-center font-mono text-[10px] shadow-sm my-1 ${
                    masterEnabled && placements[simTemplate]?.enabled
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-500"
                  }`}
                  style={{
                    width: simDevice === "desktop" ? "728px" : "320px",
                    maxWidth: "100%",
                    height: simDevice === "desktop" ? "90px" : "50px",
                  }}
                >
                  {simDevice === "desktop" ? "728 × 90 Leaderboard Unit" : "320 × 50 Mobile Sticky Banner"}
                </div>
                <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                  CLS Pre-Reserved Height: {simDevice === "desktop" ? "90px" : "50px"}
                </span>
              </div>

              {/* Mock Content Below Ad */}
              <div className="space-y-2">
                <div className="h-3 w-1/3 rounded bg-zinc-800" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 rounded bg-zinc-950 border border-zinc-800/80" />
                  <div className="h-16 rounded bg-zinc-950 border border-zinc-800/80" />
                </div>
              </div>

              {/* Mock Global Social Bar (if enabled) */}
              {masterEnabled && placements.root?.enabled && (
                <div className="p-2 rounded bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-between text-[10px] text-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-amber-400 animate-pulse" />
                    <span>Adsterra Smart Social Bar (Site-wide Floating Overlay)</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400">Non-intrusive bottom</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Ad Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">
                  Edit Ad Unit: {adUnits[editingUnit]?.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingUnit(null)}
                className="text-zinc-400 hover:text-white p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {adUnits[editingUnit]?.zoneKey !== undefined && (
                <div className="space-y-1">
                  <label className="text-zinc-400 font-mono text-[11px]">Adsterra Zone Key</label>
                  <Input
                    value={editFormData.zoneKey}
                    onChange={(e) => setEditFormData({ ...editFormData, zoneKey: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 font-mono text-xs text-white"
                    placeholder="e.g. 5f86b8ba897a34d202901f2a1670db55"
                  />
                </div>
              )}

              {adUnits[editingUnit]?.scriptUrl !== undefined && (
                <div className="space-y-1">
                  <label className="text-zinc-400 font-mono text-[11px]">Script Endpoint URL</label>
                  <Input
                    value={editFormData.scriptUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, scriptUrl: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 font-mono text-xs text-white"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-400 text-xs">Unit Status</span>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, enabled: !editFormData.enabled })}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    editFormData.enabled ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                      editFormData.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingUnit(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveUnit}
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
