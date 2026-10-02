import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import NewBlogClient from "./new-blog-client";

export const metadata = {
  title: "Draft New Article | KhelPediA Control Center",
  robots: { index: false, follow: false },
};

export default async function NewBlogPage() {
  await requireAdmin(ADMIN_PERMISSIONS.BLOGS_CREATE);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <NewBlogClient />
    </div>
  );
}
