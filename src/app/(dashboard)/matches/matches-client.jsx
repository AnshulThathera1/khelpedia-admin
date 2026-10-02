"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Swords,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatNumber(n) {
  if (n === undefined || n === null) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

export default function MatchesClient({
  initialMatches,
  totalCount,
  page,
  limit,
  currentStatus,
  currentGameId,
  currentSearch,
  games,
  stats,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [copiedId, setCopiedId] = useState(null);

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 whenever filters change, unless page was explicitly updated
    if (!("page" in updates)) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Swords className="h-7 w-7 text-red-500" />
              Matches Management
            </h1>
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-xs" suppressHydrationWarning>
              {formatNumber(stats.totalMatches)} Total Records
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, inspect, filter, and audit all competitive esports match histories and live results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/data-quality">
            <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1.5" suppressHydrationWarning>
              <AlertTriangle className="h-4 w-4" />
              Data Quality Audit ({formatNumber(stats.actionableMatches)})
            </Button>
          </Link>
          <Link href="/matches/stats">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5">
              <Layers className="h-4 w-4" />
              Player Career Stats
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Matches</p>
              <p className="text-2xl font-bold text-white mt-1" suppressHydrationWarning>
                {formatNumber(stats.totalMatches)}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Database Archive</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Swords className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Decided Matches</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1" suppressHydrationWarning>
                {formatNumber(stats.decidedMatches)}
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                {((stats.decidedMatches / (stats.totalMatches || 1)) * 100).toFixed(1)}% verified winners
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Actionable Discrepancies</p>
              <p className="text-2xl font-bold text-red-400 mt-1" suppressHydrationWarning>
                {formatNumber(stats.actionableMatches)}
              </p>
              <p className="text-[11px] text-red-400/80 mt-0.5">Scores recorded, winner null</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Unplayed / TBD</p>
              <p className="text-2xl font-bold text-zinc-300 mt-1" suppressHydrationWarning>
                {formatNumber(stats.unplayedMatches)}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">0-0 score or unplayed</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Matches", count: stats.totalMatches },
            { id: "decided", label: "Decided", count: stats.decidedMatches },
            {
              id: "unresolved_nonzero",
              label: "Needs Winner Review",
              count: stats.actionableMatches,
              isAlert: true,
            },
            { id: "unresolved_zero", label: "0-0 / Scheduled", count: stats.unplayedMatches },
            { id: "draw", label: "1-1 Draws / Ties" },
          ].map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateFilters({ status: tab.id })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? tab.isAlert
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-red-600 text-white shadow-sm"
                    : tab.isAlert
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.isAlert
                        ? "bg-red-500/20 text-red-300"
                        : "bg-zinc-700/60 text-zinc-300"
                    }`}
                  >
                    {tab.count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Game Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by Match UUID or Team Name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs h-9 focus-visible:ring-red-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: "" });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </form>

          {/* Game Dropdown */}
          <select
            value={currentGameId}
            onChange={(e) => updateFilters({ game: e.target.value })}
            className="w-full sm:w-48 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 h-9 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">All Games</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Limit Dropdown */}
          <select
            value={limit.toString()}
            onChange={(e) => updateFilters({ limit: e.target.value })}
            className="w-full sm:w-28 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 h-9 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Matches Data Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Match ID</th>
                <th className="py-3 px-4">Tournament & Game</th>
                <th className="py-3 px-4 text-center">Matchup & Scores</th>
                <th className="py-3 px-4">Round / Map</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isPending ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                      <span>Loading match data...</span>
                    </div>
                  </td>
                </tr>
              ) : initialMatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <Swords className="h-10 w-10 text-zinc-600 mx-auto" />
                      <p className="text-sm font-medium text-white">No matches found</p>
                      <p className="text-xs text-zinc-400">
                        No matches match the selected filters or search terms. Try clearing filters.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchInput("");
                          router.push(pathname);
                        }}
                        className="mt-2 text-xs border-zinc-700"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                initialMatches.map((m) => {
                  const isDecided = Boolean(m.winner?.id || m.winner_id);
                  const isActionable = !isDecided && (m.score1 > 0 || m.score2 > 0);
                  const isDraw = !isDecided && m.score1 === m.score2 && m.score1 > 0;
                  const isUnplayed = !isDecided && m.score1 === 0 && m.score2 === 0;

                  const playedDate = m.played_at
                    ? new Date(m.played_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "No Date Recorded";

                  const team1Name = m.team1?.name || "TBD Team";
                  const team2Name = m.team2?.name || "TBD Team";
                  const isTeam1Winner = m.winner?.id === m.team1?.id || m.winner_id === m.team1?.id;
                  const isTeam2Winner = m.winner?.id === m.team2?.id || m.winner_id === m.team2?.id;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-zinc-900/50 transition-colors group"
                    >
                      {/* Match ID */}
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{m.id.substring(0, 8)}...</span>
                          <button
                            onClick={() => handleCopyId(m.id)}
                            title="Copy full UUID"
                            className="text-zinc-400 hover:text-white transition-colors"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tournament & Game */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="flex flex-col">
                          <Link
                            href={`/tournaments/${m.tournaments?.id || ""}`}
                            className="font-medium text-white hover:text-red-400 truncate transition-colors"
                            title={m.tournaments?.name || "Unknown Tournament"}
                          >
                            {m.tournaments?.name || "Independent Match"}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {m.tournaments?.games?.name && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 border-zinc-800 text-zinc-400 font-normal"
                              >
                                {m.tournaments.games.name}
                              </Badge>
                            )}
                            {m.tournaments?.tier && (
                              <span className="text-[10px] text-zinc-400 uppercase font-mono">
                                Tier {m.tournaments.tier}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Matchup & Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* Team 1 */}
                          <div className="flex items-center gap-1.5 text-right justify-end w-36">
                            <span
                              className={`truncate font-medium ${
                                isTeam1Winner ? "text-emerald-400 font-bold" : "text-zinc-200"
                              }`}
                              title={team1Name}
                            >
                              {team1Name}
                            </span>
                            {isTeam1Winner && (
                              <Trophy className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>

                          {/* Score Badge */}
                          <div
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold whitespace-nowrap ${
                              isDecided
                                ? "bg-zinc-800 text-white border border-zinc-700"
                                : isActionable
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                            }`}
                          >
                            {m.score1 ?? "-"} : {m.score2 ?? "-"}
                          </div>

                          {/* Team 2 */}
                          <div className="flex items-center gap-1.5 text-left justify-start w-36">
                            {isTeam2Winner && (
                              <Trophy className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            )}
                            <span
                              className={`truncate font-medium ${
                                isTeam2Winner ? "text-emerald-400 font-bold" : "text-zinc-200"
                              }`}
                              title={team2Name}
                            >
                              {team2Name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Round & Map */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 font-medium">{m.round || "Standard Series"}</span>
                          <span className="text-[11px] text-zinc-400">{m.map || "Multiple / Unspecified"}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                        <span className="text-[11px]">{playedDate}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isDecided ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 text-[10px]">
                            Decided
                          </Badge>
                        ) : isActionable ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/10 text-[10px] animate-pulse">
                            Needs Winner
                          </Badge>
                        ) : isDraw ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/10 text-[10px]">
                            Draw
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-800 text-[10px]">
                            Unplayed / 0-0
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link href={`/matches/${m.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1 px-2.5"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-800/80 bg-zinc-900/40 text-xs text-zinc-400">
          <div suppressHydrationWarning>
            Showing <span className="font-semibold text-white">{formatNumber(startIndex)}</span> to{" "}
            <span className="font-semibold text-white">{formatNumber(endIndex)}</span> of{" "}
            <span className="font-semibold text-white">{formatNumber(totalCount)}</span> matches
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => updateFilters({ page: (page - 1).toString() })}
              className="h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-[11px]">
              Page {page} of {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => updateFilters({ page: (page + 1).toString() })}
              className="h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
