import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { GamesTableClient } from "./games-table-client";
import { Gamepad2, Trophy, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Games Management",
};

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  await requireAdmin(ADMIN_PERMISSIONS.GAMES_VIEW);

  let games = [];
  let tournaments = [];

  try {
    const [gamesRes, tournamentsRes] = await Promise.all([
      query("SELECT * FROM games ORDER BY name ASC"),
      query("SELECT game_id FROM tournaments WHERE game_id IS NOT NULL"),
    ]);

    games = gamesRes.rows || [];
    tournaments = tournamentsRes.rows || [];
  } catch (err) {
    console.error("VPS DB Games fetch error:", err);
  }

  const tourneyCountMap = {};
  tournaments.forEach((t) => {
    if (t.game_id) {
      tourneyCountMap[t.game_id] = (tourneyCountMap[t.game_id] || 0) + 1;
    }
  });

  const tournamentCounts = Object.entries(tourneyCountMap).map(([game_id, count]) => ({
    game_id,
    count,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Esports Games & Titles
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage competitive game disciplines, icons, genres, and tournament dependencies.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Active Game Disciplines
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {games.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Registered titles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Linked Tournaments
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {tournaments.length.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Tournament events categorized
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Active Genres
            </CardTitle>
            <Layers className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {new Set(games.map((g) => g.genre).filter(Boolean)).size}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Esports genre categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Table */}
      <GamesTableClient games={games} tournamentCounts={tournamentCounts} />
    </div>
  );
}
