"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Trophy,
  Users,
  Search,
  Swords,
  Filter,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DataQualityClient({
  issues,
  totalMatches,
  healthScore,
  summaryCounts,
}) {
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [inspectingIssue, setInspectingIssue] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filteredIssues = issues.filter(
    (issue) => selectedSeverity === "all" || issue.severity === selectedSeverity
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-red-500" />
              Data Quality Audit Center
            </h1>
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs font-mono">
              Live DB Diagnostic
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Read-only automated audit detecting orphaned foreign keys, unassigned winners, missing timestamps, and telemetry gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/matches?status=unresolved_nonzero">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Review 111 Actionable Matches</span>
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Health Scorecard */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {/* Health Score */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Database Health Score</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">{healthScore}%</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-bold">
                  Grade: A-
                </Badge>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3">
              {((1 - summaryCounts.critical / totalMatches) * 100).toFixed(2)}% of match records have complete, verified outcomes.
            </p>
          </div>

          {/* Critical Issues */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <p className="text-xs font-mono uppercase tracking-wider text-red-400">Critical Anomalies</p>
              </div>
              <p className="text-3xl font-extrabold text-red-400 mt-2">
                {summaryCounts.critical.toLocaleString()}
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3">
              Completed matches with scores &gt; 0 missing designated winners.
            </p>
          </div>

          {/* Warnings */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-400">Integrity Warnings</p>
              <p className="text-3xl font-extrabold text-amber-400 mt-2">
                {summaryCounts.warnings.toLocaleString()}
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3">
              Missing match dates (38) or unassigned player rosters (3).
            </p>
          </div>

          {/* Info / Ingestion Notice */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-blue-400">Informational Items</p>
              <p className="text-3xl font-extrabold text-zinc-200 mt-2">
                {summaryCounts.info.toLocaleString()}
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3">
              Scheduled fixtures (13.5k), Swiss draws (43), unmapped telemetry (2.7k).
            </p>
          </div>
        </div>
      </Card>

      {/* Safety Policy Notice */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-300">
        <Info className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Strict Safe Data Policy Enforcement</p>
          <p className="text-zinc-400 leading-relaxed">
            Data Quality Audit is strictly read-only and never performs blind automated deletions or bulk updates. Every highlighted discrepancy provides root cause provenance and links to individual entity editors for verified administrator resolution.
          </p>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: "all", label: "All Audit Categories", count: issues.length },
          { id: "CRITICAL", label: "Critical", count: issues.filter((i) => i.severity === "CRITICAL").length, color: "text-red-400" },
          { id: "WARNING", label: "Warnings", count: issues.filter((i) => i.severity === "WARNING").length, color: "text-amber-400" },
          { id: "INFO", label: "Informational", count: issues.filter((i) => i.severity === "INFO").length, color: "text-blue-400" },
        ].map((tab) => {
          const isActive = selectedSeverity === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedSeverity(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80"
              }`}
            >
              <span className={tab.color}>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Audit Issue Cards Grid */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const isCritical = issue.severity === "CRITICAL";
          const isWarning = issue.severity === "WARNING";
          const isInfo = issue.severity === "INFO";

          return (
            <Card
              key={issue.id}
              className={`bg-zinc-950 border transition-all ${
                isCritical
                  ? "border-red-500/30 hover:border-red-500/50"
                  : isWarning
                  ? "border-amber-500/30 hover:border-amber-500/50"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`text-[10px] font-bold ${
                          isCritical
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : isWarning
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[10px]">
                        {issue.category}
                      </Badge>
                      <h3 className="text-base font-bold text-white">{issue.title}</h3>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
                      {issue.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                      <div>
                        <span className="text-zinc-400 font-medium block text-[11px] uppercase tracking-wider">
                          Probable Root Cause:
                        </span>
                        <span className="text-zinc-300 mt-0.5 block">{issue.rootCause}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-medium block text-[11px] uppercase tracking-wider">
                          Recommended Action:
                        </span>
                        <span className="text-zinc-300 mt-0.5 block">{issue.action}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Count & Action */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-2xl font-bold font-mono text-white block">
                        {issue.count.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-zinc-400 uppercase font-mono">
                        Affected Records
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {issue.records && issue.records.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectingIssue(issue)}
                          className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 text-xs h-8 gap-1.5"
                        >
                          <span>Inspect Records</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}

                      {issue.id === "unresolved-nonzero" && (
                        <Link href="/matches?status=unresolved_nonzero">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 gap-1">
                            <span>Open In Matches</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inspect Records Modal */}
      {inspectingIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-[10px] font-bold ${
                      inspectingIssue.severity === "CRITICAL"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : inspectingIssue.severity === "WARNING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {inspectingIssue.severity}
                  </Badge>
                  <h3 className="text-base font-bold text-white">
                    {inspectingIssue.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Displaying sample of {inspectingIssue.records.length} of {inspectingIssue.count.toLocaleString()} affected records in database.
                </p>
              </div>

              <button
                onClick={() => setInspectingIssue(null)}
                className="text-zinc-400 hover:text-white text-sm px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            {/* Records Content */}
            <div className="overflow-y-auto flex-1 border border-zinc-800 rounded-lg">
              {inspectingIssue.recordType === "match" ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Match ID</th>
                      <th className="py-2.5 px-3">Tournament</th>
                      <th className="py-2.5 px-3">Matchup</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3">Played At</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                    {inspectingIssue.records.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{r.id.substring(0, 8)}...</span>
                            <button
                              onClick={() => handleCopy(r.id)}
                              className="text-zinc-400 hover:text-white"
                              title="Copy UUID"
                            >
                              {copiedId === r.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300 truncate max-w-[160px]">
                          {r.tournaments?.name || "Independent"}
                        </td>
                        <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">
                          {r.team1?.name || "TBD"} vs {r.team2?.name || "TBD"}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-300">
                          {r.score1 ?? "-"} : {r.score2 ?? "-"}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                          {r.played_at ? new Date(r.played_at).toLocaleDateString() : "NULL"}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Link href={`/matches/${r.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[11px] border-zinc-700 text-zinc-200 hover:bg-zinc-800 px-2"
                            >
                              Inspect
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : inspectingIssue.recordType === "player" ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Player ID</th>
                      <th className="py-2.5 px-3">IGN</th>
                      <th className="py-2.5 px-3">Real Name</th>
                      <th className="py-2.5 px-3">Country</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                    {inspectingIssue.records.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                          {r.id.substring(0, 8)}...
                        </td>
                        <td className="py-2.5 px-3 text-white font-bold">{r.ign}</td>
                        <td className="py-2.5 px-3 text-zinc-300">{r.name || "N/A"}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{r.country || "N/A"}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{r.role || "N/A"}</td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Link href={`/players/${r.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[11px] border-zinc-700 text-zinc-200 hover:bg-zinc-800 px-2"
                            >
                              Edit Profile
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Match ID</th>
                      <th className="py-2.5 px-3">PUUID</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3 text-center">Kills</th>
                      <th className="py-2.5 px-3 text-center">Deaths</th>
                      <th className="py-2.5 px-3 text-center">Assists</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                    {inspectingIssue.records.map((r, i) => (
                      <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                          {r.match_id ? `${r.match_id.substring(0, 8)}...` : "N/A"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                          {r.puuid ? `${r.puuid.substring(0, 16)}...` : "N/A"}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300">{r.team_id || "Unassigned"}</td>
                        <td className="py-2.5 px-3 text-center text-white font-bold">{r.kills ?? 0}</td>
                        <td className="py-2.5 px-3 text-center text-zinc-400">{r.deaths ?? 0}</td>
                        <td className="py-2.5 px-3 text-center text-zinc-400">{r.assists ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Read-only inspection view</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingIssue(null)}
                className="border-zinc-800 text-zinc-300"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
