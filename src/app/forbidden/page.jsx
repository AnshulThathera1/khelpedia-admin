import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentAdminUser } from "@/lib/auth";
import { ROLE_METADATA } from "@/lib/rbac";

export const metadata = {
  title: "Permission Denied",
};

export default async function ForbiddenPage({ searchParams }) {
  const params = await searchParams;
  const permission = params?.permission || "Unspecified";
  const adminData = await getCurrentAdminUser();

  const roleMeta = adminData?.role ? ROLE_METADATA[adminData.role] : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              403 • Permission Denied
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Role Permission Check Failed
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 text-sm text-zinc-300">
          <p>
            Your administrator account does not possess the specific permission
            required to access or modify this resource.
          </p>

          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Required Permission:</span>
              <span className="text-red-400 font-semibold">{permission}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Your Assigned Role:</span>
              <span className="text-zinc-200">
                {roleMeta?.name || adminData?.role || "Unknown Role"}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            If you need access to this section, request permission elevation from a
            Super Administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Link
            href="/overview"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
