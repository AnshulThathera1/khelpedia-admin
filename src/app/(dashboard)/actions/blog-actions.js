"use server";

import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBlogAction(formData) {
  const adminUser = await requireAdmin(ADMIN_PERMISSIONS.BLOGS_CREATE);

  const title = formData.get("title")?.trim();
  let slug = formData.get("slug")?.trim();
  const excerpt = formData.get("excerpt")?.trim() || "";
  const content = formData.get("content")?.trim() || "";
  const coverImageUrl = formData.get("cover_image_url")?.trim() || null;
  const isPublished = formData.get("is_published") === "true";
  const category = formData.get("category")?.trim() || "news";

  if (!title) {
    return { success: false, error: "Article title is required." };
  }

  // Generate or clean slug
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  } else {
    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  try {
    // Check slug uniqueness in VPS database
    const existing = await query("SELECT id FROM blogs WHERE slug = $1 LIMIT 1", [slug]);
    if (existing.rows && existing.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const publishedAt = isPublished ? new Date().toISOString() : null;

    const insertSql = `
      INSERT INTO blogs (
        title, slug, excerpt, content, cover_image_url, 
        author_id, is_published, published_at, category, 
        created_at, updated_at, views
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), 0)
      RETURNING id, slug
    `;

    const res = await query(insertSql, [
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      adminUser.user.id,
      isPublished,
      publishedAt,
      category,
    ]);

    const created = res.rows[0];

    revalidatePath("/blogs");
    revalidatePath("/editorial");
    revalidatePath("/overview");

    return { success: true, blog: created };
  } catch (err) {
    console.error("Error creating blog in VPS DB:", err);
    return { success: false, error: err.message || "Failed to create article." };
  }
}

export async function updateBlogAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.BLOGS_EDIT);

  const id = formData.get("id");
  const title = formData.get("title")?.trim();
  let slug = formData.get("slug")?.trim();
  const excerpt = formData.get("excerpt")?.trim() || "";
  const content = formData.get("content")?.trim() || "";
  const coverImageUrl = formData.get("cover_image_url")?.trim() || null;
  const isPublished = formData.get("is_published") === "true";
  const category = formData.get("category")?.trim() || "news";

  if (!id || !title) {
    return { success: false, error: "Article ID and Title are required." };
  }

  slug = slug
    ? slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

  try {
    const updateSql = `
      UPDATE blogs
      SET 
        title = $1,
        slug = $2,
        excerpt = $3,
        content = $4,
        cover_image_url = $5,
        is_published = $6,
        published_at = CASE WHEN $6 = true AND published_at IS NULL THEN NOW() ELSE published_at END,
        category = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING id, slug
    `;

    const res = await query(updateSql, [
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      isPublished,
      category,
      id,
    ]);

    if (!res.rows || res.rows.length === 0) {
      return { success: false, error: "Article not found in VPS database." };
    }

    revalidatePath("/blogs");
    revalidatePath(`/blogs/edit/${id}`);
    revalidatePath("/editorial");
    revalidatePath("/overview");

    return { success: true, slug: res.rows[0].slug };
  } catch (err) {
    console.error("Error updating blog in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update article." };
  }
}

export async function toggleBlogPublishAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.BLOGS_PUBLISH);

  const id = formData.get("id");
  const currentStatus = formData.get("current_status") === "true";

  if (!id) return { success: false, error: "Blog ID is required." };

  try {
    const newStatus = !currentStatus;

    const updateSql = `
      UPDATE blogs
      SET 
        is_published = $1,
        published_at = CASE WHEN $1 = true AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, is_published
    `;

    const res = await query(updateSql, [newStatus, id]);

    if (!res.rows || res.rows.length === 0) {
      return { success: false, error: "Article not found in VPS database." };
    }

    revalidatePath("/blogs");
    revalidatePath(`/blogs/edit/${id}`);
    revalidatePath("/editorial");
    revalidatePath("/overview");

    return { success: true, is_published: newStatus };
  } catch (err) {
    console.error("Error toggling blog status in VPS DB:", err);
    return { success: false, error: err.message || "Failed to toggle status." };
  }
}

export async function deleteBlogAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.BLOGS_DELETE);

  const id = formData.get("id");
  if (!id) return { success: false, error: "Blog ID is required." };

  try {
    await query("DELETE FROM blogs WHERE id = $1", [id]);

    revalidatePath("/blogs");
    revalidatePath("/editorial");
    revalidatePath("/overview");

    return { success: true };
  } catch (err) {
    console.error("Error deleting blog from VPS DB:", err);
    return { success: false, error: err.message || "Failed to delete article." };
  }
}
