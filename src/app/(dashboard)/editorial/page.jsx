import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS, hasPermission } from "@/lib/rbac";
import { query } from "@/lib/db";
import EditorialClient from "./editorial-client";

export const metadata = {
  title: "Editorial Hub | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function EditorialPage({ searchParams }) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.EDITORIAL_VIEW);

  const sp = await searchParams;
  const currentType = sp?.type || "all";
  const currentDensity = sp?.density || "all"; // 'all' | 'rich' | 'thin'
  const currentSearch = sp?.search?.trim() || "";

  let teamsData = [];
  let tourneysData = [];
  let playersData = [];
  let gamesData = [];
  let blogsData = [];
  let richTeams = 0;
  let richTourneys = 0;

  try {
    const [
      teamsRes,
      tourneysRes,
      playersRes,
      gamesRes,
      blogsRes,
      richTeamsRes,
      richTourneysRes,
    ] = await Promise.all([
      query("SELECT id, name, slug, region, country, editorial_content, updated_at FROM teams ORDER BY name ASC LIMIT 60"),
      query(`
        SELECT t.id, t.name, t.slug, t.tier, t.description, t.editorial_content, t.updated_at,
               json_build_object('name', g.name) as games
        FROM tournaments t
        LEFT JOIN games g ON t.game_id = g.id
        ORDER BY t.name ASC LIMIT 60
      `),
      query(`
        SELECT p.id, p.ign, p.name, p.country, p.role, p.editorial_content, p.updated_at,
               json_build_object('name', tm.name) as teams
        FROM players p
        LEFT JOIN teams tm ON p.team_id = tm.id
        ORDER BY p.ign ASC
      `),
      query("SELECT id, name, slug, genre, description, updated_at FROM games ORDER BY name ASC"),
      query("SELECT id, title, slug, excerpt, content, is_published, created_at, updated_at FROM blogs ORDER BY created_at DESC LIMIT 60"),
      query("SELECT COUNT(*) FROM teams WHERE editorial_content IS NOT NULL AND length(editorial_content) > 50"),
      query("SELECT COUNT(*) FROM tournaments WHERE editorial_content IS NOT NULL AND length(editorial_content) > 50"),
    ]);

    teamsData = teamsRes.rows || [];
    tourneysData = tourneysRes.rows || [];
    playersData = playersRes.rows || [];
    gamesData = gamesRes.rows || [];
    blogsData = blogsRes.rows || [];
    richTeams = parseInt(richTeamsRes.rows[0]?.count || "0", 10);
    richTourneys = parseInt(richTourneysRes.rows[0]?.count || "0", 10);
  } catch (err) {
    console.error("VPS DB Editorial fetch error:", err);
  }

  const teams = teamsData.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: [t.region, t.country].filter(Boolean).join(" • ") || "Esports Team",
    type: "team",
    content: t.editorial_content || "",
    updatedAt: t.updated_at,
    url: `/teams/${t.id}`,
  }));

  const tournaments = tourneysData.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: `${t.games?.name || "Esports"}${t.tier ? ` • Tier ${t.tier}` : ""}`,
    type: "tournament",
    content: t.editorial_content || t.description || "",
    updatedAt: t.updated_at,
    url: `/tournaments/${t.id}`,
  }));

  const players = playersData.map((p) => ({
    id: p.id,
    title: p.ign,
    subtitle: [p.name, p.teams?.name, p.country].filter(Boolean).join(" • ") || "Pro Player",
    type: "player",
    content: p.editorial_content || "",
    updatedAt: p.updated_at,
    url: `/players/${p.id}`,
  }));

  const games = gamesData.map((g) => ({
    id: g.id,
    title: g.name,
    subtitle: g.genre || "Competitive Discipline",
    type: "game",
    content: g.description || "",
    updatedAt: g.updated_at,
    url: `/games/${g.id}`,
  }));

  const blogs = blogsData.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.is_published ? "Published Article" : "Draft Article",
    type: "blog",
    content: b.content || b.excerpt || "",
    updatedAt: b.updated_at || b.created_at,
    url: `/blogs/edit/${b.id}`,
  }));

  const allEntities = [...blogs, ...teams, ...tournaments, ...players, ...games];
  const totalRichCount = richTeams + richTourneys + blogsData.length;

  const canEdit = hasPermission(adminUser.role, ADMIN_PERMISSIONS.EDITORIAL_EDIT);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <EditorialClient
        entities={allEntities}
        currentType={currentType}
        currentDensity={currentDensity}
        currentSearch={currentSearch}
        stats={{
          totalTracked: allEntities.length,
          richContentCount: totalRichCount,
          blogsCount: blogsData.length,
          teamsCount: teamsData.length,
          tourneysCount: tourneysData.length,
          playersCount: playersData.length,
          gamesCount: gamesData.length,
        }}
        canEdit={canEdit}
      />
    </div>
  );
}
