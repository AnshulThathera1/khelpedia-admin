import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS, hasPermission } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { query } from "@/lib/db";
import MediaClient from "./media-client";

export const metadata = {
  title: "Media Library | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function MediaPage({ searchParams }) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.MEDIA_VIEW);

  const sp = await searchParams;
  const currentCategory = sp?.category || "all";
  const currentSearch = sp?.search?.trim() || "";

  const adminDb = createAdminClient();

  // 1. Fetch files from Supabase storage bucket 'khelpedia-media'
  const { data: storageFiles } = await adminDb.storage
    .from("khelpedia-media")
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  const uploadedMedia = (storageFiles || [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => {
      const {
        data: { publicUrl },
      } = adminDb.storage.from("khelpedia-media").getPublicUrl(f.name);

      return {
        id: f.id || f.name,
        name: f.name,
        url: publicUrl,
        size: f.metadata?.size || null,
        mimeType: f.metadata?.mimetype || "image",
        createdAt: f.created_at,
        isUploaded: true,
        source: "storage",
        category: "uploaded",
        usedBy: "Direct Storage Asset",
        entityUrl: null,
      };
    });

  // 2. Query team logos, game icons, and blog covers in parallel from VPS DB
  let teamsRows = [];
  let gamesRows = [];
  let blogsRows = [];

  try {
    const [teamsRes, gamesRes, blogsRes] = await Promise.all([
      query("SELECT id, name, logo_url FROM teams WHERE logo_url IS NOT NULL LIMIT 80"),
      query("SELECT id, name, icon_url FROM games WHERE icon_url IS NOT NULL"),
      query("SELECT id, title, cover_image_url FROM blogs WHERE cover_image_url IS NOT NULL LIMIT 30"),
    ]);
    teamsRows = teamsRes.rows || [];
    gamesRows = gamesRes.rows || [];
    blogsRows = blogsRes.rows || [];
  } catch (err) {
    console.error("VPS DB Error in MediaPage:", err);
  }

  const teamLogos = teamsRows.map((t) => ({
    id: `team-${t.id}`,
    name: `${t.name} Logo`,
    url: t.logo_url,
    size: null,
    mimeType: "image",
    createdAt: null,
    isUploaded: false,
    source: "teams",
    category: "logos",
    usedBy: `Team: ${t.name}`,
    entityUrl: `/teams/${t.id}`,
  }));

  const gameIcons = gamesRows.map((g) => ({
    id: `game-${g.id}`,
    name: `${g.name} Cover Icon`,
    url: g.icon_url,
    size: null,
    mimeType: "image",
    createdAt: null,
    isUploaded: false,
    source: "games",
    category: "icons",
    usedBy: `Game: ${g.name}`,
    entityUrl: `/games/${g.id}`,
  }));

  const blogCovers = blogsRows.map((b) => ({
    id: `blog-${b.id}`,
    name: `${b.title.substring(0, 32)}... Cover`,
    url: b.cover_image_url,
    size: null,
    mimeType: "image",
    createdAt: null,
    isUploaded: false,
    source: "blogs",
    category: "covers",
    usedBy: `Article: ${b.title}`,
    entityUrl: `/blogs/edit/${b.id}`,
  }));

  const allMedia = [...uploadedMedia, ...gameIcons, ...blogCovers, ...teamLogos];

  const canUpload = hasPermission(adminUser.role, ADMIN_PERMISSIONS.MEDIA_UPLOAD);
  const canDelete = hasPermission(adminUser.role, ADMIN_PERMISSIONS.MEDIA_DELETE);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <MediaClient
        mediaItems={allMedia}
        currentCategory={currentCategory}
        currentSearch={currentSearch}
        stats={{
          totalCount: allMedia.length,
          uploadedCount: uploadedMedia.length,
          logosCount: teamLogos.length,
          iconsCount: gameIcons.length,
          coversCount: blogCovers.length,
        }}
        permissions={{
          canUpload,
          canDelete,
        }}
      />
    </div>
  );
}
