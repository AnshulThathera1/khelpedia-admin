import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { TeamsTableClient } from "./teams-table-client";
import { Shield, Globe, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Teams Management",
};

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  await requireAdmin(ADMIN_PERMISSIONS.TEAMS_VIEW);

  let teams = [];
  let players = [];

  try {
    const [teamsRes, playersRes] = await Promise.all([
      query("SELECT id, name, slug, logo_url, region, country, founded_year, editorial_content FROM teams ORDER BY name ASC LIMIT 1000"),
      query("SELECT team_id FROM players WHERE team_id IS NOT NULL"),
    ]);

    teams = teamsRes.rows || [];
    players = playersRes.rows || [];
  } catch (err) {
    console.error("VPS DB Teams fetch error:", err);
  }

  // Aggregate roster counts
  const rosterCountMap = {};
  players.forEach((p) => {
    if (p.team_id) {
      rosterCountMap[p.team_id] = (rosterCountMap[p.team_id] || 0) + 1;
    }
  });

  const rosterCounts = Object.entries(rosterCountMap).map(([team_id, count]) => ({
    team_id,
    count,
  }));

  const totalTeams = teams.length;
  const editorialCount = teams.filter((t) => t.editorial_content && t.editorial_content.length > 50).length;
  const activeRosterCount = Object.keys(rosterCountMap).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Esports Teams Directory
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Inspect team identities, active player rosters, regional data, and custom editorial content.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Indexed Teams
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {totalTeams.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Active in database
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Teams with Rosters
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {activeRosterCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Have assigned players
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Custom Editorial
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {editorialCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Quality custom overviews
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Regional Diversity
            </CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {new Set(teams.map((t) => t.region).filter(Boolean)).size}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Global competitive regions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Table */}
      <TeamsTableClient teams={teams} rosterCounts={rosterCounts} />
    </div>
  );
}
