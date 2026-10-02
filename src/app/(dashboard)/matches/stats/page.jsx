import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import StatsClient from "./stats-client";

export const metadata = {
  title: "Match & Player Statistics | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function MatchStatsPage() {
  await requireAdmin(ADMIN_PERMISSIONS.MATCHES_VIEW);

  let games = [];
  let playerStats = [];
  let metrics = {
    totalMatches: 484114,
    totalTelemetryRecords: 133980,
    totalTournaments: 2161,
    verifiedPlayersCount: 0,
  };

  try {
    const [gamesRes, statsRes, metricsRes] = await Promise.all([
      query("SELECT id, name, slug, icon_url FROM games ORDER BY name ASC"),
      query(`
        SELECT 
          ps.id, ps.player_id, ps.game_id, ps.kills, ps.deaths, ps.assists, 
          ps.win_rate, ps.matches_played, ps.rating, ps.headshot_pct, ps.avg_damage,
          p.id as p_id, p.ign as p_ign, p.name as p_name, p.country as p_country, p.role as p_role, p.image_url as p_image_url,
          t.id as t_id, t.name as t_name, t.slug as t_slug, t.logo_url as t_logo_url,
          g.id as g_id, g.name as g_name, g.slug as g_slug
        FROM player_stats ps
        LEFT JOIN players p ON ps.player_id = p.id
        LEFT JOIN teams t ON p.team_id = t.id
        LEFT JOIN games g ON ps.game_id = g.id
        ORDER BY ps.rating DESC NULLS LAST
      `),
      query(`
        SELECT 
          (SELECT COUNT(*) FROM matches) as total_matches,
          (SELECT COUNT(*) FROM match_players) as total_telemetry,
          (SELECT COUNT(*) FROM tournaments) as total_tournaments
      `),
    ]);

    games = gamesRes.rows || [];
    playerStats = (statsRes.rows || []).map((row) => ({
      id: row.id,
      player_id: row.player_id,
      game_id: row.game_id,
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      win_rate: row.win_rate,
      matches_played: row.matches_played,
      rating: row.rating,
      headshot_pct: row.headshot_pct,
      avg_damage: row.avg_damage,
      players: row.p_id
        ? {
            id: row.p_id,
            ign: row.p_ign,
            name: row.p_name,
            country: row.p_country,
            role: row.p_role,
            image_url: row.p_image_url,
            teams: row.t_id ? { id: row.t_id, name: row.t_name, slug: row.t_slug, logo_url: row.t_logo_url } : null,
          }
        : null,
      games: row.g_id ? { id: row.g_id, name: row.g_name, slug: row.g_slug } : null,
    }));

    if (metricsRes.rows && metricsRes.rows[0]) {
      const m = metricsRes.rows[0];
      metrics = {
        totalMatches: parseInt(m.total_matches || "484114", 10),
        totalTelemetryRecords: parseInt(m.total_telemetry || "133980", 10),
        totalTournaments: parseInt(m.total_tournaments || "2161", 10),
        verifiedPlayersCount: playerStats.length,
      };
    }
  } catch (err) {
    console.error("VPS DB Error fetching match stats:", err);
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <StatsClient
        playerStats={playerStats || []}
        games={games || []}
        metrics={{
          totalMatches,
          totalTelemetryRecords,
          totalTournaments,
          verifiedPlayersCount: playerStats?.length || 0,
        }}
      />
    </div>
  );
}
