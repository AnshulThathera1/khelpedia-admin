import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { query } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Trophy,
  Swords,
  Shield,
  Gamepad2,
  UserCheck,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  TournamentStatusChart,
  EntityDistributionChart,
} from "./overview-charts";

export const metadata = {
  title: "Dashboard Overview",
};

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  await requireAdmin(ADMIN_PERMISSIONS.DASHBOARD_VIEW);

  const adminDb = createAdminClient();

  let counts = {
    matches_count: 0,
    tournaments_count: 0,
    tournaments_completed: 0,
    tournaments_upcoming: 0,
    teams_count: 0,
    blogs_count: 0,
    blogs_published: 0,
    players_count: 0,
    games_count: 0,
  };
  let recentBlogs = [];
  let recentTournaments = [];
  let usersCount = 0;

  try {
    const [countsRes, blogsRes, tourneysRes, usersRes] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*) FROM matches) as matches_count,
          (SELECT COUNT(*) FROM tournaments) as tournaments_count,
          (SELECT COUNT(*) FROM tournaments WHERE status = 'completed') as tournaments_completed,
          (SELECT COUNT(*) FROM tournaments WHERE status = 'upcoming') as tournaments_upcoming,
          (SELECT COUNT(*) FROM teams) as teams_count,
          (SELECT COUNT(*) FROM blogs) as blogs_count,
          (SELECT COUNT(*) FROM blogs WHERE is_published = true) as blogs_published,
          (SELECT COUNT(*) FROM players) as players_count,
          (SELECT COUNT(*) FROM games) as games_count
      `),
      query("SELECT id, title, slug, is_published, created_at, category FROM blogs ORDER BY created_at DESC LIMIT 5"),
      query("SELECT id, name, slug, status, tier, start_date FROM tournaments ORDER BY start_date DESC NULLS LAST, created_at DESC LIMIT 5"),
      adminDb.auth.admin.listUsers().catch(() => ({ data: { users: [] } })),
    ]);

    if (countsRes.rows && countsRes.rows[0]) {
      counts = countsRes.rows[0];
    }
    recentBlogs = blogsRes.rows || [];
    recentTournaments = tourneysRes.rows || [];
    usersCount = usersRes?.data?.users?.length || 0;
  } catch (err) {
    console.error("VPS DB Overview fetch error:", err);
  }

  const matchesCount = parseInt(counts.matches_count || "0", 10);
  const tournamentsCount = parseInt(counts.tournaments_count || "0", 10);
  const tournamentsCompleted = parseInt(counts.tournaments_completed || "0", 10);
  const tournamentsUpcoming = parseInt(counts.tournaments_upcoming || "0", 10);
  const teamsCount = parseInt(counts.teams_count || "0", 10);
  const blogsCount = parseInt(counts.blogs_count || "0", 10);
  const blogsPublished = parseInt(counts.blogs_published || "0", 10);
  const blogsDraft = Math.max(0, blogsCount - blogsPublished);
  const playersCount = parseInt(counts.players_count || "0", 10);
  const gamesCount = parseInt(counts.games_count || "0", 10);

  // Data for charts
  const tournamentChartData = [
    { name: "Upcoming", value: tournamentsUpcoming },
    { name: "Completed", value: tournamentsCompleted },
  ];

  const entityChartData = [
    { name: "Tournaments", count: tournamentsCount },
    { name: "Teams", count: teamsCount },
    { name: "Articles", count: blogsCount },
    { name: "Players", count: playersCount },
    { name: "Games", count: gamesCount },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Command Center
            </h1>
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs font-mono">
              PRODUCTION LIVE
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time management and data overview across all KhelPediA entities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/system/health"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>System Health</span>
          </Link>
          <Link
            href="/blogs/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-medium text-white transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 metrics) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Matches */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1 sm:p-6 sm:pb-2 space-y-0">
            <CardTitle className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
              Matches
            </CardTitle>
            <Swords className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-1 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono">
              {matchesCount.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">
              Historical match archive
            </p>
          </CardContent>
        </Card>

        {/* Tournaments */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1 sm:p-6 sm:pb-2 space-y-0">
            <CardTitle className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
              Tournaments
            </CardTitle>
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-1 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono">
              {tournamentsCount.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">
              {tournamentsUpcoming} up • {tournamentsCompleted} past
            </p>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1 sm:p-6 sm:pb-2 space-y-0">
            <CardTitle className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
              Teams
            </CardTitle>
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-1 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono">
              {teamsCount.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">
              Esports organizations
            </p>
          </CardContent>
        </Card>

        {/* Articles */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1 sm:p-6 sm:pb-2 space-y-0">
            <CardTitle className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
              Articles
            </CardTitle>
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-1 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono">
              {blogsCount.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">
              {blogsPublished} pub • {blogsDraft} draft
            </p>
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1 sm:p-6 sm:pb-2 space-y-0">
            <CardTitle className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
              Players
            </CardTitle>
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-1 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono">
              {playersCount.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">
              Tracked competitors
            </p>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1 sm:p-6 sm:pb-2 space-y-0">
            <CardTitle className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
              Platform Users
            </CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-1 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono">
              {usersCount.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">
              Supabase Auth accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Entity Distribution Bar Chart */}
        <Card className="lg:col-span-4 bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base text-white">Entity Inventory</CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Total volume of verified entities indexed in the production database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityDistributionChart data={entityChartData} />
          </CardContent>
        </Card>

        {/* Tournament Status Donut */}
        <Card className="lg:col-span-3 bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base text-white">Tournament Status Ratio</CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Proportion of upcoming vs concluded tournaments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TournamentStatusChart data={tournamentChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Platform Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Articles */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Latest Articles</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Most recently created editorial news and guides.
              </CardDescription>
            </div>
            <Link
              href="/blogs"
              className="text-xs text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-800/80">
              {recentBlogs.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate hover:text-red-400 transition-colors">
                      <Link href={`/blogs/edit/${b.id}`}>{b.title}</Link>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                      <span>{new Date(b.created_at).toLocaleDateString()}</span>
                      {b.category && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400">{b.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={b.is_published ? "default" : "outline"}
                    className="text-[10px] font-mono shrink-0"
                  >
                    {b.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              ))}
              {recentBlogs.length === 0 && (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  No articles found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tournaments */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Recent Tournaments</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Newly scheduled and archived tournament records.
              </CardDescription>
            </div>
            <Link
              href="/tournaments"
              className="text-xs text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-800/80">
              {recentTournaments.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {t.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                      <span>{t.start_date ? new Date(t.start_date).toLocaleDateString() : "Date TBD"}</span>
                      {t.tier && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400 uppercase">Tier: {t.tier}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono shrink-0 uppercase border-zinc-800 text-zinc-300"
                  >
                    {t.status || "upcoming"}
                  </Badge>
                </div>
              ))}
              {recentTournaments.length === 0 && (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  No tournaments found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
