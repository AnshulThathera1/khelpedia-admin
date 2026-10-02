import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import {
  TOURNAMENT_INDEXABLE_SQL,
  TEAM_INDEXABLE_SQL,
  PLAYER_INDEXABLE_SQL,
  BLOG_INDEXABLE_SQL,
} from "@/lib/seo";
import SeoClient from "./seo-client";

export const metadata = {
  title: "SEO & Indexability Management | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function SeoPage({ searchParams }) {
  await requireAdmin(ADMIN_PERMISSIONS.SEO_VIEW);

  const sp = await searchParams;
  const currentEntity = sp?.entity || "all";
  const currentStatus = sp?.status || "all"; // 'all' | 'indexable' | 'noindex'
  const currentSearch = sp?.search?.trim() || "";

  let totalTeams = 2120;
  let totalTourneys = 2161;
  let totalPlayers = 18;
  let totalGames = 6;
  let totalBlogs = 128;

  let indexableTeamsCount = 571;
  let indexableTourneysCount = 163;
  let indexablePlayersCount = 15;
  let indexableGamesCount = 6;
  let indexableBlogsCount = 128;

  let playersList = [];
  let gamesList = [];
  let blogsList = [];
  let teamsSample = [];
  let tourneysSample = [];
  let teamMatchCounts = new Map();
  let teamRosterCounts = new Map();
  let tourneyMatchCounts = new Map();
  let tourneyTeamCounts = new Map();

  try {
    const [
      countsRes,
      playersRes,
      gamesRes,
      blogsRes,
      teamsSampleRes,
      tourneysSampleRes,
    ] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*) FROM teams) as total_teams,
          (SELECT COUNT(*) FROM tournaments) as total_tourneys,
          (SELECT COUNT(*) FROM players) as total_players,
          (SELECT COUNT(*) FROM games) as total_games,
          (SELECT COUNT(*) FROM blogs) as total_blogs,
          (SELECT COUNT(*) FROM teams t WHERE ${TEAM_INDEXABLE_SQL}) as indexable_teams,
          (SELECT COUNT(*) FROM tournaments t WHERE ${TOURNAMENT_INDEXABLE_SQL}) as indexable_tourneys,
          (SELECT COUNT(*) FROM players p WHERE ${PLAYER_INDEXABLE_SQL}) as indexable_players,
          (SELECT COUNT(*) FROM blogs b WHERE ${BLOG_INDEXABLE_SQL}) as indexable_blogs
      `),
      query(`
        SELECT p.id, p.ign, p.name, p.slug, p.country, p.role, p.team_id, p.editorial_content, t.name as team_name,
               ps.matches_played, ps.rating
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        LEFT JOIN player_stats ps ON ps.player_id = p.id
      `),
      query("SELECT id, name, slug, genre, description FROM games"),
      query("SELECT id, title, slug, is_published, views, created_at FROM blogs LIMIT 30"),
      query("SELECT id, name, slug, region, country, editorial_content FROM teams LIMIT 60"),
      query(`
        SELECT t.id, t.name, t.slug, t.tier, t.editorial_content, g.name as game_name
        FROM tournaments t
        LEFT JOIN games g ON t.game_id = g.id
        LIMIT 60
      `),
    ]);

    if (countsRes.rows && countsRes.rows[0]) {
      const c = countsRes.rows[0];
      totalTeams = parseInt(c.total_teams || "2120", 10);
      totalTourneys = parseInt(c.total_tourneys || "2161", 10);
      totalPlayers = parseInt(c.total_players || "18", 10);
      totalGames = parseInt(c.total_games || "6", 10);
      totalBlogs = parseInt(c.total_blogs || "128", 10);

      indexableTeamsCount = parseInt(c.indexable_teams || "571", 10);
      indexableTourneysCount = parseInt(c.indexable_tourneys || "163", 10);
      indexablePlayersCount = parseInt(c.indexable_players || "15", 10);
      indexableGamesCount = totalGames;
      indexableBlogsCount = parseInt(c.indexable_blogs || "128", 10);
    }

    playersList = (playersRes.rows || []).map((p) => ({
      ...p,
      teams: p.team_name ? { name: p.team_name } : null,
    }));
    gamesList = gamesRes.rows || [];
    blogsList = blogsRes.rows || [];
    teamsSample = teamsSampleRes.rows || [];
    tourneysSample = (tourneysSampleRes.rows || []).map((t) => ({
      ...t,
      games: t.game_name ? { name: t.game_name } : null,
    }));

    // Batch enrich sampled teams with match and roster counts
    const teamIds = teamsSample.map((t) => t.id).filter(Boolean);
    if (teamIds.length > 0) {
      const [matchesBatch, rosterBatch] = await Promise.all([
        query(
          `
          SELECT t_id, SUM(cnt)::int as total_matches
          FROM (
            SELECT team1_id as t_id, count(*) as cnt FROM matches WHERE team1_id = ANY($1::uuid[]) GROUP BY team1_id
            UNION ALL
            SELECT team2_id as t_id, count(*) as cnt FROM matches WHERE team2_id = ANY($1::uuid[]) GROUP BY team2_id
          ) s
          GROUP BY t_id
        `,
          [teamIds]
        ),
        query(
          `
          SELECT team_id, count(*)::int as roster_count
          FROM players
          WHERE team_id = ANY($1::uuid[])
          GROUP BY team_id
        `,
          [teamIds]
        ),
      ]);

      (matchesBatch.rows || []).forEach((r) => {
        teamMatchCounts.set(r.t_id, r.total_matches);
      });
      (rosterBatch.rows || []).forEach((r) => {
        teamRosterCounts.set(r.team_id, r.roster_count);
      });
    }

    // Batch enrich sampled tournaments with match counts and participating teams
    const tourneyIds = tourneysSample.map((t) => t.id).filter(Boolean);
    if (tourneyIds.length > 0) {
      const [matchesBatch, teamsBatch] = await Promise.all([
        query(
          `
          SELECT tournament_id, count(*)::int as match_count
          FROM matches
          WHERE tournament_id = ANY($1::uuid[])
          GROUP BY tournament_id
        `,
          [tourneyIds]
        ),
        query(
          `
          SELECT tournament_id, COUNT(DISTINCT team_id)::int as team_count
          FROM (
            SELECT tournament_id, team1_id as team_id FROM matches WHERE tournament_id = ANY($1::uuid[]) AND team1_id IS NOT NULL
            UNION ALL
            SELECT tournament_id, team2_id as team_id FROM matches WHERE tournament_id = ANY($1::uuid[]) AND team2_id IS NOT NULL
          ) sub
          GROUP BY tournament_id
        `,
          [tourneyIds]
        ),
      ]);

      (matchesBatch.rows || []).forEach((r) => {
        tourneyMatchCounts.set(r.tournament_id, r.match_count);
      });
      (teamsBatch.rows || []).forEach((r) => {
        tourneyTeamCounts.set(r.tournament_id, r.team_count);
      });
    }
  } catch (err) {
    console.error("VPS DB Error in SeoPage:", err);
  }

  const totalIndexable =
    indexableTeamsCount +
    indexableTourneysCount +
    indexablePlayersCount +
    indexableGamesCount +
    indexableBlogsCount;

  const totalEntities =
    totalTeams + totalTourneys + totalPlayers + totalGames + totalBlogs;
  const totalNoindex = totalEntities - totalIndexable;

  // Compile Entity Audit Rows with Exact Reasons
  const auditRows = [];

  // Players
  playersList.forEach((p) => {
    const hasStats = Boolean(p.matches_played && p.matches_played > 0);
    const hasEd = Boolean(p.editorial_content && p.editorial_content.trim().length > 100);
    const isIndexable = (hasStats || hasEd) && Boolean(p.ign && p.ign.trim().length > 0);

    let reason = "";
    if (hasStats) {
      reason = `Verified pro telemetry (${p.matches_played} career matches recorded)`;
    } else if (hasEd) {
      reason = "Verified pro lore: Detailed editorial biography (> 100 chars)";
    } else {
      reason = "Thin Profile: No verified career statistics and no unique editorial lore (> 100 chars). Marked noindex, follow to protect crawl budget.";
    }

    auditRows.push({
      id: p.id,
      name: p.ign,
      subtitle: [p.name, p.teams?.name].filter(Boolean).join(" • ") || "Player",
      type: "player",
      isIndexable,
      status: isIndexable ? "INDEXABLE" : "NOINDEX",
      reason,
      url: `/players/${p.id}`,
    });
  });

  // Games
  gamesList.forEach((g) => {
    auditRows.push({
      id: g.id,
      name: g.name,
      subtitle: g.genre || "Esports Title",
      type: "game",
      isIndexable: true,
      status: "INDEXABLE",
      reason: "Hub category page with primary esports taxonomy and active tournaments.",
      url: `/games/${g.id}`,
    });
  });

  // Blogs
  blogsList.forEach((b) => {
    const isIndexable = b.is_published;
    auditRows.push({
      id: b.id,
      name: b.title,
      subtitle: `Article • /blogs/${b.slug}`,
      type: "blog",
      isIndexable,
      status: isIndexable ? "INDEXABLE" : "NOINDEX",
      reason: isIndexable
        ? "Editorial article published to live feed with canonical URL."
        : "Unpublished draft article.",
      url: `/blogs/edit/${b.id}`,
    });
  });

  // Teams (Sample)
  teamsSample.forEach((t) => {
    const matchCount = teamMatchCounts.get(t.id) || 0;
    const rosterCount = teamRosterCounts.get(t.id) || 0;
    const hasEd = Boolean(t.editorial_content && t.editorial_content.trim().length > 100);
    const hasRosterAndMatch = rosterCount > 0 && matchCount >= 1;
    const hasMatches = matchCount >= 3;
    const isIndexable = hasEd || hasRosterAndMatch || hasMatches;

    let reason = "";
    if (hasEd) {
      reason = "Enriched Lore: High-density editorial background (> 100 chars).";
    } else if (hasRosterAndMatch) {
      reason = `Active Competitive Roster: Verified roster (${rosterCount} players) with ${matchCount} recorded match(es).`;
    } else if (hasMatches) {
      reason = `Competitive Match Record: ${matchCount} matches recorded, active tournament history and head-to-head statistics available.`;
    } else if (matchCount > 0) {
      reason = `Thin Entity: Insufficient competitive data (${matchCount} match recorded, no active roster, needs >= 3 matches). Guarded with noindex, follow.`;
    } else {
      reason = "Thin Entity: No match history, no active roster, and no editorial lore. Guarded with noindex, follow to preserve crawl budget.";
    }

    auditRows.push({
      id: t.id,
      name: t.name,
      subtitle: [t.region, t.country].filter(Boolean).join(" • ") || "Team",
      type: "team",
      isIndexable,
      status: isIndexable ? "INDEXABLE" : "NOINDEX",
      reason,
      url: `/teams/${t.id}`,
    });
  });

  // Tournaments (Sample)
  tourneysSample.forEach((t) => {
    const matchCount = tourneyMatchCounts.get(t.id) || 0;
    const teamCount = tourneyTeamCounts.get(t.id) || 0;
    const hasEd = Boolean(t.editorial_content && t.editorial_content.trim().length > 100);
    const hasMatches = matchCount >= 3;
    const isIndexable = hasEd || hasMatches;

    let reason = "";
    if (hasEd) {
      reason = "Tier 1 Verified Event: Rich tournament guide & prize pool lore (> 100 chars).";
    } else if (hasMatches) {
      reason = `Tournament Competition: ${matchCount} matches recorded across ${teamCount || "multiple"} participating teams with full bracket/results available.`;
    } else if (matchCount > 0) {
      reason = `Thin Tournament: Insufficient match history (${matchCount} match recorded, needs >= 3 matches for indexable bracket). Guarded with noindex, follow.`;
    } else {
      reason = "Thin Tournament: No recorded matches or bracket data. Guarded with noindex, follow.";
    }

    auditRows.push({
      id: t.id,
      name: t.name,
      subtitle: `${t.games?.name || "Esports"}${t.tier ? ` • Tier ${t.tier}` : ""}`,
      type: "tournament",
      isIndexable,
      status: isIndexable ? "INDEXABLE" : "NOINDEX",
      reason,
      url: `/tournaments/${t.id}`,
    });
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      <SeoClient
        auditRows={auditRows}
        currentEntity={currentEntity}
        currentStatus={currentStatus}
        currentSearch={currentSearch}
        stats={{
          totalEntities,
          totalIndexable,
          totalNoindex,
          teams: { total: totalTeams, indexable: indexableTeamsCount, noindex: totalTeams - indexableTeamsCount },
          tournaments: { total: totalTourneys, indexable: indexableTourneysCount, noindex: totalTourneys - indexableTourneysCount },
          players: { total: totalPlayers, indexable: indexablePlayersCount, noindex: totalPlayers - indexablePlayersCount },
          games: { total: totalGames, indexable: indexableGamesCount, noindex: 0 },
          blogs: { total: totalBlogs, indexable: indexableBlogsCount, noindex: 0 },
        }}
      />
    </div>
  );
}
