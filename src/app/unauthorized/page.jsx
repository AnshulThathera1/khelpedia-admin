import { ShieldAlert, LogOut, ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Access Restricted",
};

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Insufficient Administrative Permissions
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 text-sm text-zinc-300">
          <p>
            You have authenticated successfully, but this account has not been
            granted administrator privileges for the{" "}
            <span className="font-semibold text-white">KhelPediA Control Center</span>.
          </p>

          {user && (
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Authenticated Account:</span>
                <span className="text-zinc-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Account ID:</span>
                <span className="text-zinc-400 truncate max-w-[220px]">
                  {user.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Admin Status:</span>
                <span className="text-amber-400 font-semibold">NOT AUTHORIZED</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            If you believe this is in error, contact a Super Administrator to have
            your account elevated in the administrator database.
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <form action="/auth/signout" method="POST" className="flex-1">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Account</span>
            </button>
          </form>

          <a
            href="https://khelpedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors"
          >
            <span>Return to KhelPediA</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
