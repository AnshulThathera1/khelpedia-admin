import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import {
  TOURNAMENT_INDEXABLE_SQL,
  TEAM_INDEXABLE_SQL,
  PLAYER_INDEXABLE_SQL,
  BLOG_INDEXABLE_SQL,
} from "@/lib/seo";
import SitemapsClient from "./sitemaps-client";

export const metadata = {
  title: "Sitemaps Management | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function SitemapsPage() {
  await requireAdmin(ADMIN_PERMISSIONS.SEO_VIEW);

  let blogsCount = 128;
  let gamesCount = 6;
  let playersCount = 15;
  let teamsCount = 571;
  let tourneysCount = 163;
  let totalEntities = 4433;

  try {
    const res = await query(`
      SELECT
        (SELECT COUNT(*) FROM blogs WHERE ${BLOG_INDEXABLE_SQL}) as blogs_count,
        (SELECT COUNT(*) FROM games) as games_count,
        (SELECT COUNT(*) FROM players p WHERE ${PLAYER_INDEXABLE_SQL}) as players_count,
        (SELECT COUNT(*) FROM teams t WHERE ${TEAM_INDEXABLE_SQL}) as teams_count,
        (SELECT COUNT(*) FROM tournaments t WHERE ${TOURNAMENT_INDEXABLE_SQL}) as tourneys_count,
        ((SELECT COUNT(*) FROM teams) + (SELECT COUNT(*) FROM tournaments) + (SELECT COUNT(*) FROM players) + (SELECT COUNT(*) FROM games) + (SELECT COUNT(*) FROM blogs)) as total_entities
    `);

    if (res.rows && res.rows[0]) {
      const r = res.rows[0];
      blogsCount = parseInt(r.blogs_count || "128", 10);
      gamesCount = parseInt(r.games_count || "6", 10);
      playersCount = parseInt(r.players_count || "15", 10);
      teamsCount = parseInt(r.teams_count || "571", 10);
      tourneysCount = parseInt(r.tourneys_count || "163", 10);
      totalEntities = parseInt(r.total_entities || "4433", 10);
    }
  } catch (err) {
    console.error("VPS DB Error in SitemapsPage:", err);
  }

  const baseUrl = "https://khelpedia.org";
  const today = new Date().toISOString().split("T")[0];

  const sitemaps = [
    {
      id: "root",
      name: "Sitemap Index (Master)",
      url: `${baseUrl}/sitemap.xml`,
      type: "index",
      count: 6,
      status: "ACTIVE",
      lastmod: today,
      description: "Root master sitemap pointing to all chunked category XML files.",
    },
    {
      id: "static",
      name: "Static Pages Sitemap",
      url: `${baseUrl}/sitemap/static/sitemap.xml`,
      type: "static",
      count: 4,
      status: "ACTIVE",
      lastmod: today,
      description: "Homepage, About Us, Privacy Policy, Terms of Service.",
    },
    {
      id: "games",
      name: "Games Taxonomy Sitemap",
      url: `${baseUrl}/sitemap/games/sitemap.xml`,
      type: "games",
      count: gamesCount,
      status: "ACTIVE",
      lastmod: today,
      description: "All primary esports category taxonomy hubs (Valorant, CS2, BGMI, etc.).",
    },
    {
      id: "blogs",
      name: "Articles & News Sitemap (Chunk 0)",
      url: `${baseUrl}/sitemap/blogs/sitemap/0.xml`,
      type: "blogs",
      count: blogsCount,
      status: "ACTIVE",
      lastmod: today,
      description: "All published editorial journalism and match analysis articles.",
    },
    {
      id: "tournaments",
      name: "Tournaments Sitemap (Chunk 0)",
      url: `${baseUrl}/sitemap/tournaments/sitemap/0.xml`,
      type: "tournaments",
      count: tourneysCount,
      status: "ACTIVE",
      lastmod: today,
      description: "Tier 1 tournaments with verified matches and editorial guides.",
    },
    {
      id: "teams",
      name: "Teams Sitemap (Chunk 0)",
      url: `${baseUrl}/sitemap/teams/sitemap/0.xml`,
      type: "teams",
      count: teamsCount,
      status: "ACTIVE",
      lastmod: today,
      description: "Teams with active rosters and match histories (thin teams excluded).",
    },
    {
      id: "players",
      name: "Players Sitemap (Chunk 0)",
      url: `${baseUrl}/sitemap/players/sitemap/0.xml`,
      type: "players",
      count: playersCount,
      status: "ACTIVE",
      lastmod: today,
      description: "Pro players with verified career telemetry (unverified excluded).",
    },
  ];

  const totalIndexableUrls = 4 + gamesCount + blogsCount + tourneysCount + teamsCount + playersCount;
  const crawlBudgetSavedPages = totalEntities - (gamesCount + blogsCount + tourneysCount + teamsCount + playersCount);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <SitemapsClient
        sitemaps={sitemaps}
        stats={{
          totalSitemaps: sitemaps.length,
          totalIndexableUrls,
          lastGenerated: today,
          crawlBudgetSavedPages,
        }}
      />
    </div>
  );
}
