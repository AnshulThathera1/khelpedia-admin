"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Trophy,
  Swords,
  Users,
  Target,
  Flame,
  Award,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StatsClient({ playerStats, games, metrics }) {
  const [selectedGame, setSelectedGame] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating"); // 'rating' | 'kills' | 'win_rate' | 'matches_played' | 'kd'
  const [sortOrder, setSortOrder] = useState("desc");

  // Filtering
  const filteredStats = playerStats.filter((ps) => {
    const matchesGame =
      selectedGame === "all" ||
      ps.game_id === selectedGame ||
      ps.games?.slug === selectedGame;

    const ign = ps.players?.ign || "";
    const name = ps.players?.name || "";
    const team = ps.players?.teams?.name || "";
    const matchesSearch =
      search === "" ||
      ign.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      team.toLowerCase().includes(search.toLowerCase());

    return matchesGame && matchesSearch;
  });

  // Sorting
  const sortedStats = [...filteredStats].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (sortBy === "rating") {
      valA = a.rating ?? 0;
      valB = b.rating ?? 0;
    } else if (sortBy === "kills") {
      valA = a.kills ?? 0;
      valB = b.kills ?? 0;
    } else if (sortBy === "win_rate") {
      valA = a.win_rate ?? 0;
      valB = b.win_rate ?? 0;
    } else if (sortBy === "matches_played") {
      valA = a.matches_played ?? 0;
      valB = b.matches_played ?? 0;
    } else if (sortBy === "kd") {
      valA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
      valB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
    }

    return sortOrder === "desc" ? valB - valA : valA - valB;
  });

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-red-500" />
            Competitive Statistics & Telemetry
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Career performance metrics, verified player ratings, headshot accuracy, and combat analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/matches">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1.5">
              <Swords className="h-4 w-4" />
              Browse Matches
            </Button>
          </Link>
          <Link href="/data-quality">
            <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1.5">
              Data Quality Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Match History</p>
              <p className="text-2xl font-bold text-white mt-1">
                {metrics.totalMatches.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Recorded Fixtures</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Swords className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Player Performances</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {metrics.totalTelemetryRecords.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">In-Game Match Logs</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Tournaments Tracked</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {metrics.totalTournaments.toLocaleString()}
              </p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Tier 1 & Regional</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Trophy className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Verified Pro Telemetry</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {metrics.verifiedPlayersCount}
              </p>
              <p className="text-[11px] text-purple-400/80 mt-0.5">Career Profiles Active</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Game Selector */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 h-9 focus:outline-none focus:ring-1 focus:ring-red-500 w-full sm:w-44"
          >
            <option value="all">All Games ({playerStats.length})</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Quick Filter Pill */}
          <span className="text-xs text-zinc-400 hidden md:inline">
            Showing <strong>{sortedStats.length}</strong> of {playerStats.length} profiles
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search by IGN, player, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs h-9 focus-visible:ring-red-500"
          />
        </div>
      </div>

      {/* Career Telemetry Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Pro Player</th>
                <th className="py-3 px-4">Game</th>
                <th
                  onClick={() => toggleSort("rating")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rating</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("win_rate")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Win Rate</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("matches_played")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Matches</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("kills")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Career Kills</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("kd")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>K/D Ratio</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Headshot %</th>
                <th className="py-3 px-4 text-center">Avg Damage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {sortedStats.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-zinc-400">
                    No verified player statistics found matching filters.
                  </td>
                </tr>
              ) : (
                sortedStats.map((ps, index) => {
                  const player = ps.players;
                  const kd =
                    ps.deaths > 0
                      ? (ps.kills / ps.deaths).toFixed(2)
                      : (ps.kills ?? 0).toString();

                  return (
                    <tr key={ps.id} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Rank Index */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                        {index + 1}
                      </td>

                      {/* Player IGN & Team */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/players/${ps.player_id}`}
                            className="font-bold text-white hover:text-red-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{player?.ign || "Unknown Player"}</span>
                            {player?.country && (
                              <span className="text-[10px] text-zinc-400 uppercase font-mono">
                                ({player.country})
                              </span>
                            )}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-400">
                            {player?.name && <span>{player.name}</span>}
                            {player?.teams?.name && (
                              <>
                                <span>•</span>
                                <span className="text-zinc-300 font-medium">{player.teams.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Game */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className="border-zinc-800 text-zinc-300 font-normal text-[10px]">
                          {ps.games?.name || "Game"}
                        </Badge>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-mono font-bold text-xs">
                          {ps.rating ? ps.rating.toFixed(2) : "-"}
                        </Badge>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`font-bold ${
                              (ps.win_rate ?? 0) >= 60
                                ? "text-emerald-400"
                                : (ps.win_rate ?? 0) >= 50
                                ? "text-zinc-200"
                                : "text-amber-400"
                            }`}
                          >
                            {ps.win_rate ? `${ps.win_rate}%` : "-"}
                          </span>
                        </div>
                      </td>

                      {/* Matches Played */}
                      <td className="py-3 px-4 text-center font-mono text-zinc-300 whitespace-nowrap">
                        {ps.matches_played ? ps.matches_played.toLocaleString() : "-"}
                      </td>

                      {/* Career Kills */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-white whitespace-nowrap">
                        {ps.kills ? ps.kills.toLocaleString() : "-"}
                      </td>

                      {/* K/D Ratio */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {kd}
                      </td>

                      {/* Headshot % */}
                      <td className="py-3 px-4 text-center font-mono text-zinc-300 whitespace-nowrap">
                        {ps.headshot_pct ? `${ps.headshot_pct}%` : "-"}
                      </td>

                      {/* Average Damage */}
                      <td className="py-3 px-4 text-center font-mono text-zinc-300 whitespace-nowrap">
                        {ps.avg_damage ? ps.avg_damage.toFixed(1) : "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link href={`/players/${ps.player_id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1 px-2.5"
                          >
                            <span>Profile</span>
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
      </div>
    </div>
  );
}
