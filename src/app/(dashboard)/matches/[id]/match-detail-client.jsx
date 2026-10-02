"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Swords,
  ChevronLeft,
  Trophy,
  Calendar,
  Layers,
  Shield,
  Edit,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  Target,
  Flame,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMatchAction, deleteMatchSafeAction } from "@/app/(dashboard)/actions/entity-actions";

export default function MatchDetailClient({
  match,
  h2h,
  playerPerformances,
  canEdit,
  canDelete,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [copiedId, setCopiedId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Edit form state
  const [editScore1, setEditScore1] = useState(match.score1 ?? "");
  const [editScore2, setEditScore2] = useState(match.score2 ?? "");
  const [editWinnerId, setEditWinnerId] = useState(match.winner_id || "");
  const [editRound, setEditRound] = useState(match.round || "");
  const [editMap, setEditMap] = useState(match.map || "");
  const [editPlayedAt, setEditPlayedAt] = useState(
    match.played_at ? new Date(match.played_at).toISOString().slice(0, 16) : ""
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");

    const formData = new FormData();
    formData.append("id", match.id);
    formData.append("score1", editScore1);
    formData.append("score2", editScore2);
    formData.append("winner_id", editWinnerId);
    formData.append("round", editRound);
    formData.append("map", editMap);
    formData.append("played_at", editPlayedAt);

    startTransition(async () => {
      const res = await updateMatchAction(formData);
      if (!res.success) {
        setActionError(res.error || "Failed to update match.");
      } else {
        setActionSuccess("Match details updated successfully.");
        setIsEditOpen(false);
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    setActionError("");
    const formData = new FormData();
    formData.append("id", match.id);

    startTransition(async () => {
      const res = await deleteMatchSafeAction(formData);
      if (!res.success) {
        setActionError(res.error || "Failed to delete match.");
      } else {
        router.push("/matches");
      }
    });
  };

  const isDecided = Boolean(match.winner?.id || match.winner_id);
  const isActionable = !isDecided && (match.score1 > 0 || match.score2 > 0);
  const isDraw = !isDecided && match.score1 === match.score2 && match.score1 > 0;
  const isUnplayed = !isDecided && match.score1 === 0 && match.score2 === 0;

  const team1Name = match.team1?.name || "TBD Team 1";
  const team2Name = match.team2?.name || "TBD Team 2";
  const isTeam1Winner = match.winner?.id === match.team1?.id || match.winner_id === match.team1?.id;
  const isTeam2Winner = match.winner?.id === match.team2?.id || match.winner_id === match.team2?.id;

  const playedDateFormatted = match.played_at
    ? new Date(match.played_at).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : "No Date Recorded";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/matches">
            <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Matches</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400">Match ID:</span>
            <span className="font-mono text-xs font-semibold text-zinc-200">{match.id}</span>
            <button
              onClick={() => handleCopy(match.id)}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Copy UUID"
            >
              {copiedId === match.id ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 gap-1.5 h-8 text-xs"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Match</span>
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="border-red-900/50 text-red-400 hover:bg-red-950/50 gap-1.5 h-8 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Action Alerts */}
      {actionError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Scoreboard Card */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-md overflow-hidden">
        {/* Tournament & Stage Header */}
        <div className="bg-zinc-900/80 px-6 py-3 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Link
              href={`/tournaments/${match.tournaments?.id || ""}`}
              className="font-semibold text-white hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>{match.tournaments?.name || "Independent Match Series"}</span>
            </Link>
            {match.tournaments?.games?.name && (
              <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-300">
                {match.tournaments.games.name}
              </Badge>
            )}
            {match.tournaments?.tier && (
              <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300">
                Tier {match.tournaments.tier}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-zinc-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{playedDateFormatted}</span>
            </div>
            {match.round && (
              <span className="font-medium text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 text-[11px]">
                {match.round}
              </span>
            )}
            {match.map && (
              <span className="font-mono text-[11px] text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
                Map: {match.map}
              </span>
            )}
          </div>
        </div>

        {/* Head-to-Head Scoreboard Centerpiece */}
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 text-center">
            {/* Team 1 */}
            <div className="md:col-span-3 flex flex-col items-center md:items-end gap-2 text-center md:text-right">
              {match.team1_id ? (
                <Link
                  href={`/teams/${match.team1_id}`}
                  className="group flex flex-col items-center md:items-end gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl md:text-2xl font-bold tracking-tight group-hover:text-red-400 transition-colors ${
                        isTeam1Winner ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {team1Name}
                    </span>
                    {isTeam1Winner && (
                      <Trophy className="h-6 w-6 text-emerald-400 shrink-0 animate-bounce" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    {match.team1?.region && <span>{match.team1.region}</span>}
                    {match.team1?.country && <span>• {match.team1.country}</span>}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ) : (
                <span className="text-xl font-bold text-zinc-500">{team1Name}</span>
              )}
            </div>

            {/* Score Center */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <div
                className={`px-5 py-2.5 rounded-xl border font-mono font-bold text-3xl md:text-4xl shadow-inner ${
                  isDecided
                    ? "bg-zinc-900 border-zinc-700 text-white"
                    : isActionable
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400"
                }`}
              >
                <span>{match.score1 ?? "-"}</span>
                <span className="text-zinc-600 mx-2">:</span>
                <span>{match.score2 ?? "-"}</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2 font-mono">
                {match.round || "Best of Series"}
              </span>
            </div>

            {/* Team 2 */}
            <div className="md:col-span-3 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              {match.team2_id ? (
                <Link
                  href={`/teams/${match.team2_id}`}
                  className="group flex flex-col items-center md:items-start gap-1"
                >
                  <div className="flex items-center gap-2">
                    {isTeam2Winner && (
                      <Trophy className="h-6 w-6 text-emerald-400 shrink-0 animate-bounce" />
                    )}
                    <span
                      className={`text-xl md:text-2xl font-bold tracking-tight group-hover:text-red-400 transition-colors ${
                        isTeam2Winner ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {team2Name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    {match.team2?.region && <span>{match.team2.region}</span>}
                    {match.team2?.country && <span>• {match.team2.country}</span>}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ) : (
                <span className="text-xl font-bold text-zinc-500">{team2Name}</span>
              )}
            </div>
          </div>

          {/* Outcome Status Banner */}
          <div className="mt-8 pt-5 border-t border-zinc-800/80">
            {isDecided ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 py-2.5 px-4 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  Match Decided — Winner: <strong>{match.winner?.name || "Official Winner Verified"}</strong>
                </span>
              </div>
            ) : isActionable ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-300 text-xs font-medium bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Data Quality Discrepancy:</strong> Scores were recorded ({match.score1} - {match.score2}), but no winner is assigned in the database.
                  </span>
                </div>
                {canEdit && (
                  <Button
                    size="sm"
                    onClick={() => {
                      // Preselect candidate winner based on higher score
                      if (match.score1 > match.score2 && match.team1_id) {
                        setEditWinnerId(match.team1_id);
                      } else if (match.score2 > match.score1 && match.team2_id) {
                        setEditWinnerId(match.team2_id);
                      }
                      setIsEditOpen(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold h-7 text-xs shrink-0"
                  >
                    Assign Winner Now
                  </Button>
                )}
              </div>
            ) : isDraw ? (
              <div className="flex items-center justify-center gap-2 text-blue-400 text-sm font-medium bg-blue-500/10 py-2.5 px-4 rounded-lg border border-blue-500/20">
                <CheckCircle2 className="h-5 w-5" />
                <span>Match concluded as a Tie / Draw (1-1) in Group Swiss stage.</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-medium bg-zinc-900 py-2 px-4 rounded-lg border border-zinc-800">
                <Clock className="h-4 w-4" />
                <span>Fixture Scheduled / Unplayed (0-0 score recorded).</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Head-to-Head Historical Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Swords className="h-4 w-4 text-red-500" />
              Historical Head-to-Head
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Direct all-time rivalry between {team1Name} and {team2Name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Total H2H Matches:</span>
              <span className="font-bold text-white font-mono">{h2h.total}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate max-w-[140px]">{team1Name}</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {h2h.team1Wins} wins ({h2h.total > 0 ? ((h2h.team1Wins / h2h.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${h2h.total > 0 ? (h2h.team1Wins / h2h.total) * 100 : 50}%`,
                  }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{
                    width: `${h2h.total > 0 ? (h2h.team2Wins / h2h.total) * 100 : 50}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate max-w-[140px]">{team2Name}</span>
                <span className="font-bold text-red-400 font-mono">
                  {h2h.team2Wins} wins ({h2h.total > 0 ? ((h2h.team2Wins / h2h.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
              <span className="text-zinc-400">Ties / Draws:</span>
              <span className="text-zinc-300 font-mono">{h2h.draws}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent H2H Matches Table */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              Recent H2H Encounters
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Latest encounters recorded in the database between both squads
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {h2h.recentMatches.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                No previous historical encounters recorded between these two teams.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/60 border-y border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Tournament</th>
                      <th className="py-2.5 px-4">Round</th>
                      <th className="py-2.5 px-4 text-center">Score</th>
                      <th className="py-2.5 px-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {h2h.recentMatches.map((rm) => {
                      const isCurrent = rm.id === match.id;
                      const dateStr = rm.played_at
                        ? new Date(rm.played_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBD";

                      return (
                        <tr
                          key={rm.id}
                          className={`hover:bg-zinc-800/40 transition-colors ${
                            isCurrent ? "bg-red-500/5 font-medium" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 text-zinc-400 whitespace-nowrap">
                            {dateStr}
                            {isCurrent && (
                              <Badge className="ml-1.5 text-[9px] px-1 py-0 bg-red-500/20 text-red-400 border-red-500/30">
                                Current
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-zinc-300 truncate max-w-[200px]">
                            {rm.tournaments?.name || "Independent"}
                          </td>
                          <td className="py-2.5 px-4 text-zinc-400 whitespace-nowrap">
                            {rm.round || "Standard"}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold whitespace-nowrap">
                            <span className="text-zinc-200">
                              {rm.score1 ?? "-"} : {rm.score2 ?? "-"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <Link href={`/matches/${rm.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[11px] text-zinc-400 hover:text-white px-2"
                              >
                                View
                              </Button>
                            </Link>
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

      {/* Individual Player Performances Section */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                Player Performance Statistics ({playerPerformances.length})
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-0.5">
                Ingested game-level telemetry, kills, damage, and agent statistics
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-xs">
              match_players Table
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {playerPerformances.length === 0 ? (
            <div className="p-8 text-center space-y-2 border-t border-zinc-800">
              <Users className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-medium text-zinc-300">No telemetry recorded for this match</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Detailed round-by-round player telemetry was not provided by the API source for this match series. Only high-level team scores and outcomes are tracked.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/60 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Player Identifier</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4 text-center">Kills</th>
                    <th className="py-3 px-4 text-center">Deaths</th>
                    <th className="py-3 px-4 text-center">Assists</th>
                    <th className="py-3 px-4 text-center">K/D Ratio</th>
                    <th className="py-3 px-4 text-center">Combat Score</th>
                    <th className="py-3 px-4 text-center">Rounds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {playerPerformances.map((p, idx) => {
                    const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills;
                    return (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                          {p.puuid ? `${p.puuid.substring(0, 16)}...` : `Player #${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-300 font-normal">
                            {p.team_id || "Unassigned"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-white">{p.kills ?? 0}</td>
                        <td className="py-2.5 px-4 text-center text-zinc-400">{p.deaths ?? 0}</td>
                        <td className="py-2.5 px-4 text-center text-zinc-400">{p.assists ?? 0}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-semibold text-emerald-400">
                          {kd}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-zinc-200">
                          {p.score ? p.score.toLocaleString() : "-"}
                        </td>
                        <td className="py-2.5 px-4 text-center text-zinc-400">{p.rounds_played ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Metadata & Provenance */}
      <Card className="bg-zinc-950 border-zinc-800 text-xs text-zinc-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-400">
            Database Record Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-[11px]">
            <div>
              <span className="text-zinc-400 block">Created At:</span>
              <span className="text-zinc-200">{match.created_at || "N/A"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Tournament ID:</span>
              <span className="text-zinc-200 truncate block">{match.tournament_id || "None"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Team 1 ID:</span>
              <span className="text-zinc-200 truncate block">{match.team1_id || "None"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Team 2 ID:</span>
              <span className="text-zinc-200 truncate block">{match.team2_id || "None"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Match Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-red-500" />
                Edit Match Details
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              {/* Scores Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="score1" className="text-zinc-300">
                    {team1Name} Score
                  </Label>
                  <Input
                    id="score1"
                    type="number"
                    min="0"
                    value={editScore1}
                    onChange={(e) => setEditScore1(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="score2" className="text-zinc-300">
                    {team2Name} Score
                  </Label>
                  <Input
                    id="score2"
                    type="number"
                    min="0"
                    value={editScore2}
                    onChange={(e) => setEditScore2(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Winner Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="winner" className="text-zinc-300">
                  Designated Winner
                </Label>
                <select
                  id="winner"
                  value={editWinnerId}
                  onChange={(e) => setEditWinnerId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  <option value="">No Winner / Draw / Unresolved</option>
                  {match.team1_id && (
                    <option value={match.team1_id}>
                      {team1Name} (Team 1)
                    </option>
                  )}
                  {match.team2_id && (
                    <option value={match.team2_id}>
                      {team2Name} (Team 2)
                    </option>
                  )}
                </select>
              </div>

              {/* Round & Map */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="round" className="text-zinc-300">
                    Round / Phase
                  </Label>
                  <Input
                    id="round"
                    type="text"
                    value={editRound}
                    onChange={(e) => setEditRound(e.target.value)}
                    placeholder="e.g. Upper Quarterfinals"
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="map" className="text-zinc-300">
                    Map Name
                  </Label>
                  <Input
                    id="map"
                    type="text"
                    value={editMap}
                    onChange={(e) => setEditMap(e.target.value)}
                    placeholder="e.g. Ascent or Mirage"
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
              </div>

              {/* Played At */}
              <div className="space-y-1.5">
                <Label htmlFor="playedAt" className="text-zinc-300">
                  Played At (Date & Time)
                </Label>
                <Input
                  id="playedAt"
                  type="datetime-local"
                  value={editPlayedAt}
                  onChange={(e) => setEditPlayedAt(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  className="border-zinc-800 text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  {isPending ? "Saving Changes..." : "Save Match"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-900/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Delete Match Record</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete this match record? This action will verify foreign-key dependencies before removing.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(false)}
                className="border-zinc-800 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
