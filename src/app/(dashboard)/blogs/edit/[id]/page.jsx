import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import EditBlogClient from "./edit-blog-client";

export const metadata = {
  title: "Edit Article | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function EditBlogPage({ params }) {
  await requireAdmin(ADMIN_PERMISSIONS.BLOGS_EDIT);

  const p = await params;
  const blogId = p?.id;
  if (!blogId) notFound();

  let blog = null;
  try {
    const res = await query("SELECT * FROM blogs WHERE id = $1 LIMIT 1", [blogId]);
    blog = res.rows[0];
  } catch (err) {
    console.error("Error fetching blog from VPS DB:", err);
  }

  if (!blog) {
    notFound();
  }

  let author = null;
  if (blog.author_id) {
    try {
      const adminDb = createAdminClient();
      const { data: profile } = await adminDb
        .from("profiles")
        .select("id, display_name, email")
        .eq("id", blog.author_id)
        .single();
      author = profile;
    } catch {
      // Fallback
    }
  }

  const enrichedBlog = {
    ...blog,
    author: author || { display_name: "Staff Writer" },
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <EditBlogClient blog={enrichedBlog} />
    </div>
  );
}
