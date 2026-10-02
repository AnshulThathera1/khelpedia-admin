import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { checkPlayerDependencies } from "@/lib/entity-safety";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Shield, BarChart3, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerEditForm } from "./player-edit-form";

export const metadata = {
  title: "Player Detail & Editing",
};

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }) {
  await requireAdmin(ADMIN_PERMISSIONS.PLAYERS_VIEW);
  const { id } = await params;

  let player = null;
  let teams = [];
  let stats = [];
  let depCheck = { canDelete: true, totalDependencies: 0, details: {} };

  try {
    const [playerRes, teamsRes, statsRes, dep] = await Promise.all([
      query("SELECT * FROM players WHERE id = $1 LIMIT 1", [id]),
      query("SELECT id, name FROM teams ORDER BY name ASC"),
      query("SELECT * FROM player_stats WHERE player_id = $1", [id]),
      checkPlayerDependencies(id),
    ]);

    player = playerRes.rows[0] || null;
    teams = teamsRes.rows || [];
    stats = statsRes.rows || [];
    depCheck = dep;
  } catch (err) {
    console.error("VPS DB Player detail fetch error:", err);
  }

  if (!player) notFound();

  const currentTeam = teams.find((t) => t.id === player.team_id);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Players Directory</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-4">
          {player.image_url ? (
            <img
              src={player.image_url}
              alt={player.ign}
              className="h-14 w-14 rounded-2xl object-cover bg-zinc-900 border border-zinc-800"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-200 shrink-0">
              {player.ign.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {player.ign}
              </h1>
              {player.role && (
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-mono">
                  {player.role}
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Real Name: {player.name || "Unknown"} • Country: {player.country || "Unspecified"}
            </p>
          </div>
        </div>

        <a
          href={`https://khelpedia.org/players/${player.slug || player.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <span>Public Profile</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* 2 Columns: Edit Form & Career Statistics */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <PlayerEditForm player={player} teams={teams} dependencyCheck={depCheck} />
        </div>

        {/* Right Column: Assigned Team & Statistics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Team */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Current Team Roster</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTeam ? (
                <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/teams/${currentTeam.id}`}
                      className="font-medium text-white hover:text-red-400 text-sm transition-colors block"
                    >
                      {currentTeam.name}
                    </Link>
                    <span className="text-[11px] font-mono text-zinc-500">ID: {currentTeam.id}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-zinc-300 border-zinc-700">
                    Assigned
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-3 text-center">
                  This competitor is currently a Free Agent (no team assigned).
                </p>
              )}
            </CardContent>
          </Card>

          {/* Statistical Records */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <span>Career Statistical Records ({stats.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
                  {stats.map((s) => (
                    <div key={s.id} className="p-3 space-y-1 bg-zinc-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-semibold">Game ID: {s.game_id}</span>
                        <span className="text-[11px] text-zinc-400">Matches: {s.matches_played ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>Win Rate: {s.win_rate ? `${s.win_rate}%` : "N/A"}</span>
                        <span>Rating: {s.rating ?? "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No statistical records linked to this player ID.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
