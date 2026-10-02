import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import MatchesClient from "./matches-client";

export const metadata = {
  title: "Matches Management | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function MatchesPage({ searchParams }) {
  await requireAdmin(ADMIN_PERMISSIONS.MATCHES_VIEW);

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const limit = Math.min(100, Math.max(10, parseInt(sp?.limit || "25", 10)));
  const status = sp?.status || "all";
  const gameId = sp?.game || "";
  const search = sp?.search?.trim() || "";

  let games = [];
  let stats = {
    totalMatches: 484114,
    unresolvedMatches: 21810,
    unplayedMatches: 21600,
    actionableMatches: 210,
    decidedMatches: 462304,
  };
  let matches = [];
  let filteredCount = 484114;

  try {
    // 1. Fetch available games for filter selector & high-level stats concurrently
    const [gamesRes, statsRes] = await Promise.all([
      query("SELECT id, name, slug FROM games ORDER BY name ASC"),
      query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE winner_id IS NULL) as unresolved,
          COUNT(*) FILTER (WHERE winner_id IS NULL AND score1 = 0 AND score2 = 0) as unplayed,
          COUNT(*) FILTER (WHERE winner_id IS NULL AND (score1 != 0 OR score2 != 0)) as actionable,
          COUNT(*) FILTER (WHERE winner_id IS NOT NULL) as decided
        FROM matches
      `),
    ]);

    games = gamesRes.rows || [];

    if (statsRes.rows && statsRes.rows[0]) {
      const s = statsRes.rows[0];
      const total = parseInt(s.total || "484114", 10);
      const unresolved = parseInt(s.unresolved || "0", 10);
      stats = {
        totalMatches: total,
        unresolvedMatches: unresolved,
        unplayedMatches: parseInt(s.unplayed || "0", 10),
        actionableMatches: parseInt(s.actionable || "0", 10),
        decidedMatches: parseInt(s.decided || (total - unresolved).toString(), 10),
      };
      filteredCount = total;
    }

    // 2. Build Filter Conditions for Matches List
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (status === "decided") {
      whereConditions.push("m.winner_id IS NOT NULL");
    } else if (status === "unresolved_zero") {
      whereConditions.push("m.winner_id IS NULL AND m.score1 = 0 AND m.score2 = 0");
    } else if (status === "unresolved_nonzero") {
      whereConditions.push("m.winner_id IS NULL AND (m.score1 != 0 OR m.score2 != 0)");
    } else if (status === "draw") {
      whereConditions.push("m.winner_id IS NULL AND m.score1 = 1 AND m.score2 = 1");
    }

    if (gameId) {
      whereConditions.push(`t.game_id = $${paramIndex++}`);
      params.push(gameId);
    }

    if (search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
      if (isUuid) {
        whereConditions.push(`m.id = $${paramIndex++}`);
        params.push(search);
      } else {
        whereConditions.push(`(t1.name ILIKE $${paramIndex} OR t2.name ILIKE $${paramIndex} OR m.round ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // 3. Count filtered rows if filtering is applied
    if (whereConditions.length > 0) {
      const countSql = `
        SELECT count(*) 
        FROM matches m
        ${gameId ? "JOIN tournaments t ON m.tournament_id = t.id" : ""}
        ${search ? "LEFT JOIN teams t1 ON m.team1_id = t1.id LEFT JOIN teams t2 ON m.team2_id = t2.id" : ""}
        ${whereClause}
      `;
      const countRes = await query(countSql, params);
      filteredCount = parseInt(countRes.rows[0]?.count || "0", 10);
    }

    // 4. Query paginated matches
    const offset = (page - 1) * limit;
    const listParams = [...params, limit, offset];
    const listSql = `
      SELECT m.id, m.score1, m.score2, m.round, m.map, m.played_at, m.created_at,
             t.id as tournament_id, t.name as tournament_name, t.slug as tournament_slug, t.tier as tournament_tier,
             g.id as game_id, g.name as game_name, g.slug as game_slug,
             t1.id as team1_id, t1.name as team1_name, t1.slug as team1_slug, t1.logo_url as team1_logo,
             t2.id as team2_id, t2.name as team2_name, t2.slug as team2_slug, t2.logo_url as team2_logo,
             w.id as winner_id, w.name as winner_name, w.slug as winner_slug
      FROM matches m
      LEFT JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN games g ON t.game_id = g.id
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      ${whereClause}
      ORDER BY m.played_at DESC NULLS LAST, m.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const listRes = await query(listSql, listParams);

    // Map into client structure
    matches = (listRes.rows || []).map((row) => ({
      id: row.id,
      score1: row.score1,
      score2: row.score2,
      round: row.round,
      map: row.map,
      played_at: row.played_at,
      created_at: row.created_at,
      tournaments: row.tournament_id
        ? {
            id: row.tournament_id,
            name: row.tournament_name,
            slug: row.tournament_slug,
            tier: row.tournament_tier,
            games: row.game_id ? { id: row.game_id, name: row.game_name, slug: row.game_slug } : null,
          }
        : null,
      team1: row.team1_id ? { id: row.team1_id, name: row.team1_name, slug: row.team1_slug, logo_url: row.team1_logo } : null,
      team2: row.team2_id ? { id: row.team2_id, name: row.team2_name, slug: row.team2_slug, logo_url: row.team2_logo } : null,
      winner: row.winner_id ? { id: row.winner_id, name: row.winner_name, slug: row.winner_slug } : null,
    }));
  } catch (err) {
    console.error("VPS DB Error fetching matches:", err);
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      <MatchesClient
        initialMatches={matches}
        totalCount={filteredCount}
        page={page}
        limit={limit}
        currentStatus={status}
        currentGameId={gameId}
        currentSearch={search}
        games={games}
        stats={stats}
      />
    </div>
  );
}
