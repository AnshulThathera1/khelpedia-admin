import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { checkGameDependencies } from "@/lib/entity-safety";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gamepad2, Trophy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameEditForm } from "./game-edit-form";

export const metadata = {
  title: "Game Title Detail & Editing",
};

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }) {
  await requireAdmin(ADMIN_PERMISSIONS.GAMES_VIEW);
  const { id } = await params;

  let game = null;
  let tournaments = [];
  let depCheck = { canDelete: true, totalDependencies: 0, details: {} };

  try {
    const [gameRes, tourneysRes, dep] = await Promise.all([
      query("SELECT * FROM games WHERE id = $1 LIMIT 1", [id]),
      query(
        "SELECT id, name, status, tier, start_date FROM tournaments WHERE game_id = $1 ORDER BY start_date DESC NULLS LAST LIMIT 10",
        [id]
      ),
      checkGameDependencies(id),
    ]);

    game = gameRes.rows[0] || null;
    tournaments = tourneysRes.rows || [];
    depCheck = dep;
  } catch (err) {
    console.error("VPS DB Game detail fetch error:", err);
  }

  if (!game) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Games Directory</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-4">
          {game.icon_url ? (
            <img
              src={game.icon_url}
              alt={game.name}
              className="h-14 w-14 rounded-2xl object-contain bg-zinc-900 border border-zinc-800 p-1"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-red-500 shrink-0">
              <Gamepad2 className="h-7 w-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {game.name}
              </h1>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-mono">
                {game.genre || "Esports Title"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Slug: {game.slug || `game-${game.id}`} • ID: {game.id}
            </p>
          </div>
        </div>

        <a
          href={`https://khelpedia.org/games/${game.slug || game.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <span>Public Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* 2 Columns: Edit Form & Related Tournaments */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <GameEditForm game={game} dependencyCheck={depCheck} />
        </div>

        {/* Right Column: Linked Tournaments */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Associated Tournaments ({tournaments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournaments.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
                  {tournaments.map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between bg-zinc-900/40">
                      <div>
                        <Link
                          href={`/tournaments/${t.id}`}
                          className="font-medium text-white hover:text-red-400 transition-colors block truncate max-w-[180px]"
                        >
                          {t.name}
                        </Link>
                        <span className="text-[10px] text-zinc-500">
                          {t.start_date ? new Date(t.start_date).toLocaleDateString() : "Date TBD"}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase text-zinc-400 border-zinc-800">
                        {t.status || "upcoming"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No tournaments currently associated with this game.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
