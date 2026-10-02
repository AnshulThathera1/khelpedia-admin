import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS, hasPermission } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { query } from "@/lib/db";
import BlogsClient from "./blogs-client";

export const metadata = {
  title: "Articles & Editorial | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function AdminBlogsPage({ searchParams }) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.BLOGS_VIEW);

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const limit = Math.min(100, Math.max(10, parseInt(sp?.limit || "20", 10)));
  const status = sp?.status || "all";
  const search = sp?.search?.trim() || "";

  let totalBlogs = 0;
  let publishedCount = 0;
  let draftsCount = 0;
  let blogs = [];
  let filteredCount = 0;

  try {
    // 1. Fetch Summary Counts from VPS Database
    const [totalRes, publishedRes, draftsRes] = await Promise.all([
      query("SELECT COUNT(*) FROM blogs"),
      query("SELECT COUNT(*) FROM blogs WHERE is_published = true"),
      query("SELECT COUNT(*) FROM blogs WHERE is_published = false"),
    ]);

    totalBlogs = parseInt(totalRes.rows[0]?.count || "0", 10);
    publishedCount = parseInt(publishedRes.rows[0]?.count || "0", 10);
    draftsCount = parseInt(draftsRes.rows[0]?.count || "0", 10);

    // 2. Build Query
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (status === "published") {
      whereConditions.push("is_published = true");
    } else if (status === "draft") {
      whereConditions.push("is_published = false");
    }

    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR slug ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const countRes = await query(`SELECT COUNT(*) FROM blogs ${whereClause}`, params);
    filteredCount = parseInt(countRes.rows[0]?.count || "0", 10);

    const offset = (page - 1) * limit;
    const listParams = [...params, limit, offset];
    const listSql = `
      SELECT id, title, slug, excerpt, cover_image_url, is_published, published_at, created_at, updated_at, views, author_id
      FROM blogs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const listRes = await query(listSql, listParams);
    blogs = listRes.rows || [];
  } catch (dbErr) {
    console.error("VPS DB Error fetching blogs:", dbErr.message);
  }

  // Safely enrich blogs with author profiles from Supabase Auth
  let enrichedBlogs = blogs;
  const authorIds = [...new Set(blogs.map((b) => b.author_id).filter(Boolean))];
  if (authorIds.length > 0) {
    try {
      const adminDb = createAdminClient();
      const { data: profiles } = await adminDb
        .from("profiles")
        .select("id, display_name, email")
        .in("id", authorIds);

      const profilesMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
      enrichedBlogs = blogs.map((b) => ({
        ...b,
        author: profilesMap[b.author_id] || { display_name: "Staff Writer" },
      }));
    } catch {
      // Profile enrichment fallback
    }
  }

  const canCreate = hasPermission(adminUser.role, ADMIN_PERMISSIONS.BLOGS_CREATE);
  const canPublish = hasPermission(adminUser.role, ADMIN_PERMISSIONS.BLOGS_PUBLISH);
  const canDelete = hasPermission(adminUser.role, ADMIN_PERMISSIONS.BLOGS_DELETE);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      <BlogsClient
        blogs={enrichedBlogs}
        totalCount={filteredCount ?? totalBlogs}
        page={page}
        limit={limit}
        currentStatus={status}
        currentSearch={search}
        stats={{
          total: totalBlogs,
          published: publishedCount,
          drafts: draftsCount,
        }}
        permissions={{
          canCreate,
          canPublish,
          canDelete,
        }}
      />
    </div>
  );
}
