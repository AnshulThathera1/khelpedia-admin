import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { checkTeamDependencies } from "@/lib/entity-safety";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Users, Trophy, Swords, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamEditForm } from "./team-edit-form";

export const metadata = {
  title: "Team Detail & Editing",
};

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({ params }) {
  await requireAdmin(ADMIN_PERMISSIONS.TEAMS_VIEW);
  const { id } = await params;

  let team = null;
  let players = [];
  let matches = [];
  let depCheck = { canDelete: true, totalDependencies: 0, details: {} };

  try {
    const [teamRes, playersRes, matchesRes, dep] = await Promise.all([
      query("SELECT * FROM teams WHERE id = $1 LIMIT 1", [id]),
      query("SELECT id, ign, name, role, country FROM players WHERE team_id = $1", [id]),
      query(
        "SELECT id, played_at, winner_id, team1_id, team2_id, score1 as score_team1, score2 as score_team2 FROM matches WHERE team1_id = $1 OR team2_id = $1 ORDER BY played_at DESC NULLS LAST LIMIT 5",
        [id]
      ),
      checkTeamDependencies(id),
    ]);

    team = teamRes.rows[0] || null;
    players = playersRes.rows || [];
    matches = matchesRes.rows || [];
    depCheck = dep;
  } catch (err) {
    console.error("VPS DB Team detail error:", err);
  }

  if (!team) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Teams Directory</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-4">
          {team.logo_url ? (
            <img
              src={team.logo_url}
              alt={team.name}
              className="h-14 w-14 rounded-2xl object-contain bg-zinc-900 border border-zinc-800 p-1"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-200 shrink-0">
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {team.name}
              </h1>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-mono">
                {team.region || "Global"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Slug: {team.slug || `team-${team.id}`} • ID: {team.id}
            </p>
          </div>
        </div>

        <a
          href={`https://khelpedia.org/teams/${team.slug || team.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <span>Public Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* 2 Columns: Roster/Matches & Edit Form */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <TeamEditForm team={team} dependencyCheck={depCheck} />
        </div>

        {/* Right Column: Roster & Recent Matches */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Roster */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Active Roster ({players.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {players.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {players.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs bg-zinc-900/40">
                      <div>
                        <Link
                          href={`/players/${p.id}`}
                          className="font-medium text-white hover:text-red-400 transition-colors"
                        >
                          {p.ign}
                        </Link>
                        {p.name && (
                          <span className="text-zinc-500 text-[11px] block">{p.name}</span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 text-zinc-400">
                        {p.role || "Player"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No active players currently assigned to this team.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Swords className="h-4 w-4 text-red-500" />
                <span>Recent Match Activity ({matches.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
                  {matches.map((m) => {
                    const isWinner = m.winner_id === team.id;
                    return (
                      <div key={m.id} className="p-3 flex items-center justify-between bg-zinc-900/40">
                        <div>
                          <span className="text-zinc-300">
                            Score: {m.score_team1 ?? 0} - {m.score_team2 ?? 0}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            {m.played_at ? new Date(m.played_at).toLocaleDateString() : "Date TBD"}
                          </span>
                        </div>
                        <Badge
                          className={`text-[10px] ${
                            isWinner
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {isWinner ? "VICTORY" : "DEFEAT"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No recent matches found for this team.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
