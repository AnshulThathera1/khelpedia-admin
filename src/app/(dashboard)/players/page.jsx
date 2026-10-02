import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { PlayersTableClient } from "./players-table-client";
import { UserCheck, Shield, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Players Management",
};

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  await requireAdmin(ADMIN_PERMISSIONS.PLAYERS_VIEW);

  let players = [];
  let teams = [];

  try {
    const [playersRes, teamsRes] = await Promise.all([
      query(
        "SELECT id, ign, name, country, role, image_url, team_id, earnings, editorial_content FROM players ORDER BY ign ASC"
      ),
      query("SELECT id, name FROM teams ORDER BY name ASC"),
    ]);

    players = playersRes.rows || [];
    teams = teamsRes.rows || [];
  } catch (err) {
    console.error("VPS DB Players fetch error:", err);
  }

  const totalPlayers = players.length;
  const assignedPlayers = players.filter((p) => p.team_id).length;
  const editorialPlayers = players.filter((p) => p.editorial_content && p.editorial_content.length > 50).length;
  const totalEarnings = players.reduce((sum, p) => sum + (parseFloat(p.earnings) || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Esports Competitors Directory
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Inspect competitor IGN profiles, team rosters, career earnings, and factual editorial bios.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Tracked Competitors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {totalPlayers}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Active player profiles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Team Assigned
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {assignedPlayers}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Signed to competitive orgs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Custom Bios
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {editorialPlayers}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Unique editorial profiles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Tracked Career Prize
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              ${Math.round(totalEarnings).toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Reported earnings total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Table */}
      <PlayersTableClient players={players} teams={teams} />
    </div>
  );
}
