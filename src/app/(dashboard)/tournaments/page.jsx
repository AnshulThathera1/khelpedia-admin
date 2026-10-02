import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { TournamentsTableClient } from "./tournaments-table-client";
import { Trophy, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Tournaments Management",
};

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  await requireAdmin(ADMIN_PERMISSIONS.TOURNAMENTS_VIEW);

  let tournaments = [];
  let games = [];

  try {
    const [tournamentsRes, gamesRes] = await Promise.all([
      query(
        "SELECT id, name, slug, game_id, region, status, prize_pool, currency, start_date, end_date, tier, editorial_content FROM tournaments ORDER BY start_date DESC NULLS LAST, created_at DESC LIMIT 1000"
      ),
      query("SELECT id, name FROM games"),
    ]);

    tournaments = tournamentsRes.rows || [];
    games = gamesRes.rows || [];
  } catch (err) {
    console.error("VPS DB Tournaments fetch error:", err);
  }

  const total = tournaments.length;
  const upcoming = tournaments.filter((t) => t.status === "upcoming").length;
  const completed = tournaments.filter((t) => t.status === "completed").length;
  const ongoing = tournaments.filter((t) => t.status === "ongoing" || t.status === "live").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Tournaments & Events Management
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Inspect esports tournaments, competitive tiers, prize pools, schedules, and custom event overviews.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Total Tournaments
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {total.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Events stored in database
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Upcoming Events
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {upcoming.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Scheduled future tournaments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Completed Events
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {completed.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Archived historical results
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Live Ongoing
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {ongoing}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Currently running matches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Table */}
      <TournamentsTableClient tournaments={tournaments} games={games} />
    </div>
  );
}
