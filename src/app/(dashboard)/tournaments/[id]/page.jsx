import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { checkTournamentDependencies } from "@/lib/entity-safety";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Users, Swords, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TournamentEditForm } from "./tournament-edit-form";

export const metadata = {
  title: "Tournament Detail & Editing",
};

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }) {
  await requireAdmin(ADMIN_PERMISSIONS.TOURNAMENTS_VIEW);
  const { id } = await params;

  let tournament = null;
  let matches = [];
  let tournamentTeams = [];
  let depCheck = { canDelete: true, totalDependencies: 0, details: {} };

  try {
    const [tourneyRes, matchesRes, teamsRes, dep] = await Promise.all([
      query("SELECT * FROM tournaments WHERE id = $1 LIMIT 1", [id]),
      query(
        "SELECT id, played_at, score1 as score_team1, score2 as score_team2, winner_id FROM matches WHERE tournament_id = $1 ORDER BY played_at DESC NULLS LAST LIMIT 5",
        [id]
      ),
      query(
        `SELECT tt.team_id, tt.placement, 
                json_build_object('id', t.id, 'name', t.name, 'logo_url', t.logo_url) as teams
         FROM tournament_teams tt
         LEFT JOIN teams t ON tt.team_id = t.id
         WHERE tt.tournament_id = $1`,
        [id]
      ),
      checkTournamentDependencies(id),
    ]);

    tournament = tourneyRes.rows[0] || null;
    matches = matchesRes.rows || [];
    tournamentTeams = teamsRes.rows || [];
    depCheck = dep;
  } catch (err) {
    console.error("VPS DB Tournament detail fetch error:", err);
  }

  if (!tournament) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tournaments Directory</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-amber-500 shrink-0">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {tournament.name}
              </h1>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-mono uppercase">
                {tournament.tier || "Tier TBD"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Status: {tournament.status || "upcoming"} • Region: {tournament.region || "Global"}
            </p>
          </div>
        </div>

        <a
          href={`https://khelpedia.org/tournaments/${tournament.slug || tournament.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <span>Public Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* 2 Columns: Edit Form & Enrolled Teams / Matches */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <TournamentEditForm tournament={tournament} dependencyCheck={depCheck} />
        </div>

        {/* Right Column: Teams & Matches */}
        <div className="lg:col-span-5 space-y-6">
          {/* Enrolled Teams */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Enrolled Teams ({tournamentTeams.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournamentTeams.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {tournamentTeams.map((tt) => {
                    const team = tt.teams;
                    return (
                      <div key={tt.team_id} className="p-3 flex items-center justify-between text-xs bg-zinc-900/40">
                        <Link
                          href={`/teams/${tt.team_id}`}
                          className="font-medium text-white hover:text-red-400 transition-colors"
                        >
                          {team?.name || `Team #${tt.team_id}`}
                        </Link>
                        {tt.placement && (
                          <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 text-amber-400">
                            Place: {tt.placement}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No participating teams mapped to this tournament.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Linked Matches */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Swords className="h-4 w-4 text-red-500" />
                <span>Recent Tournament Matches ({matches.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
                  {matches.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between bg-zinc-900/40">
                      <div>
                        <span className="text-zinc-300">
                          Score: {m.score_team1 ?? 0} - {m.score_team2 ?? 0}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">
                          {m.played_at ? new Date(m.played_at).toLocaleDateString() : "Date TBD"}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">ID: {m.id}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No matches recorded under this tournament yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
