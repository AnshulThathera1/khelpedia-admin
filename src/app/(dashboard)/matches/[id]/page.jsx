import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS, hasPermission } from "@/lib/rbac";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import MatchDetailClient from "./match-detail-client";

export const metadata = {
  title: "Match Details | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function MatchDetailPage({ params }) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.MATCHES_VIEW);
  const p = await params;
  const matchId = p?.id;

  if (!matchId) notFound();

  // 1. Fetch match record with team, tournament and game details from VPS Database
  const matchSql = `
    SELECT m.id, m.tournament_id, m.team1_id, m.team2_id, m.score1, m.score2, m.winner_id, m.round, m.map, m.played_at, m.created_at,
           t.id as t_id, t.name as t_name, t.slug as t_slug, t.tier as t_tier, t.game_id as t_game_id,
           g.id as g_id, g.name as g_name, g.slug as g_slug, g.icon_url as g_icon_url,
           t1.id as t1_id, t1.name as t1_name, t1.slug as t1_slug, t1.logo_url as t1_logo, t1.region as t1_region, t1.country as t1_country,
           t2.id as t2_id, t2.name as t2_name, t2.slug as t2_slug, t2.logo_url as t2_logo, t2.region as t2_region, t2.country as t2_country,
           w.id as w_id, w.name as w_name, w.slug as w_slug
    FROM matches m
    LEFT JOIN tournaments t ON m.tournament_id = t.id
    LEFT JOIN games g ON t.game_id = g.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    LEFT JOIN teams w ON m.winner_id = w.id
    WHERE m.id = $1
    LIMIT 1
  `;

  let match = null;
  try {
    const res = await query(matchSql, [matchId]);
    if (res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      match = {
        id: row.id,
        tournament_id: row.tournament_id,
        team1_id: row.team1_id,
        team2_id: row.team2_id,
        score1: row.score1,
        score2: row.score2,
        winner_id: row.winner_id,
        round: row.round,
        map: row.map,
        played_at: row.played_at,
        created_at: row.created_at,
        tournaments: row.t_id
          ? {
              id: row.t_id,
              name: row.t_name,
              slug: row.t_slug,
              tier: row.t_tier,
              game_id: row.t_game_id,
              games: row.g_id ? { id: row.g_id, name: row.g_name, slug: row.g_slug, icon_url: row.g_icon_url } : null,
            }
          : null,
        team1: row.t1_id ? { id: row.t1_id, name: row.t1_name, slug: row.t1_slug, logo_url: row.t1_logo, region: row.t1_region, country: row.t1_country } : null,
        team2: row.t2_id ? { id: row.t2_id, name: row.t2_name, slug: row.t2_slug, logo_url: row.t2_logo, region: row.t2_region, country: row.t2_country } : null,
        winner: row.w_id ? { id: row.w_id, name: row.w_name, slug: row.w_slug } : null,
      };
    }
  } catch (err) {
    console.error("VPS DB Error fetching match details:", err);
  }

  if (!match) {
    notFound();
  }

  // 2. Fetch Head-to-Head Statistics & Recent matches between these two teams
  let h2hMatches = [];
  let h2hTotal = 0;
  let team1Wins = 0;
  let team2Wins = 0;
  let drawsCount = 0;

  if (match.team1_id && match.team2_id) {
    try {
      const h2hSql = `
        SELECT m.id, m.score1, m.score2, m.winner_id, m.round, m.played_at,
               t.id as tournament_id, t.name as tournament_name, t.slug as tournament_slug
        FROM matches m
        LEFT JOIN tournaments t ON m.tournament_id = t.id
        WHERE (m.team1_id = $1 AND m.team2_id = $2)
           OR (m.team1_id = $2 AND m.team2_id = $1)
        ORDER BY m.played_at DESC NULLS LAST
        LIMIT 10
      `;

      const h2hCountSql = `
        SELECT count(*)
        FROM matches m
        WHERE (m.team1_id = $1 AND m.team2_id = $2)
           OR (m.team1_id = $2 AND m.team2_id = $1)
      `;

      const [h2hRes, countRes] = await Promise.all([
        query(h2hSql, [match.team1_id, match.team2_id]),
        query(h2hCountSql, [match.team1_id, match.team2_id]),
      ]);

      h2hMatches = (h2hRes.rows || []).map((r) => ({
        id: r.id,
        score1: r.score1,
        score2: r.score2,
        winner_id: r.winner_id,
        round: r.round,
        played_at: r.played_at,
        tournaments: r.tournament_id ? { id: r.tournament_id, name: r.tournament_name, slug: r.tournament_slug } : null,
      }));

      h2hTotal = parseInt(countRes.rows[0]?.count || h2hMatches.length.toString(), 10);

      h2hMatches.forEach((m) => {
        if (m.winner_id === match.team1_id) {
          team1Wins++;
        } else if (m.winner_id === match.team2_id) {
          team2Wins++;
        } else {
          drawsCount++;
        }
      });
    } catch (h2hErr) {
      console.error("VPS DB Error fetching h2h:", h2hErr);
    }
  }

  // 3. Fetch individual player performances for this match
  let playerPerformances = [];
  try {
    const perfRes = await query(
      "SELECT * FROM match_players WHERE match_id = $1 ORDER BY score DESC NULLS LAST",
      [matchId]
    );
    playerPerformances = perfRes.rows || [];
  } catch (perfErr) {
    console.error("VPS DB Error fetching match player performances:", perfErr);
  }

  const canEdit = hasPermission(adminUser.role, ADMIN_PERMISSIONS.MATCHES_EDIT);
  const canDelete = hasPermission(adminUser.role, ADMIN_PERMISSIONS.MATCHES_DELETE);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <MatchDetailClient
        match={match}
        h2h={{
          total: h2hTotal,
          team1Wins,
          team2Wins,
          draws: drawsCount,
          recentMatches: h2hMatches,
        }}
        playerPerformances={playerPerformances}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
