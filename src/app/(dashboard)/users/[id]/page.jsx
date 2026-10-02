import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Gamepad2,
  CheckCircle2,
  Clock,
  KeyRound,
  Bell,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDetailActionsClient } from "./user-detail-actions-client";

export const metadata = {
  title: "User Profile Detail",
};

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }) {
  const currentAdmin = await requireAdmin(ADMIN_PERMISSIONS.USERS_VIEW);
  const { id } = await params;

  const adminDb = createAdminClient();

  const [authRes, profileRes, linkedRes] = await Promise.all([
    adminDb.auth.admin.getUserById(id).catch(() => ({ data: { user: null } })),
    adminDb.from("profiles").select("*").eq("id", id).maybeSingle(),
    adminDb.from("user_linked_accounts").select("*").eq("user_id", id),
  ]);

  const user = authRes?.data?.user;
  const profile = profileRes?.data || null;
  const linkedAccounts = linkedRes?.data || [];

  if (!user && !profile) {
    notFound();
  }

  const isAdmin = profile?.is_admin === true;
  const isSuspended = Boolean(user?.banned_until);
  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Anonymous User";

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Back button */}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Users Database</span>
        </Link>
      </div>

      {/* Header Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-200 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {displayName}
              </h1>
              {isAdmin ? (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[11px] font-mono">
                  SUPER_ADMIN
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-zinc-400 border-zinc-800 text-[11px] font-mono"
                >
                  USER
                </Badge>
              )}
              {isSuspended && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[11px] font-mono">
                  SUSPENDED
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">{user?.email || profile?.email}</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">UID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            variant="outline"
            className="uppercase text-[11px] font-mono px-2.5 py-1 bg-zinc-900 text-zinc-300 border-zinc-800"
          >
            Provider: {profile?.provider || user?.app_metadata?.provider || "Email"}
          </Badge>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (Metadata & Linked Accounts) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Linked Gaming Accounts */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-red-500" />
                <span>Linked Gaming Accounts</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Connected esports credentials and single sign-on IDs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkedAccounts.length > 0 ? (
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
                  {linkedAccounts.map((la) => (
                    <div key={la.id} className="p-3.5 space-y-1.5 bg-zinc-900/40">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">
                          {la.game_name}#{la.tag_line}
                        </span>
                        <Badge className="bg-zinc-800 text-zinc-300 uppercase text-[10px]">
                          {la.provider} • {la.region || "Global"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Linked: {new Date(la.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-500">
                  No third-party gaming accounts (Riot SSO, etc.) currently linked.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authentication & Session Metadata */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-zinc-400" />
                <span>Authentication & Security History</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Audit data from Supabase Auth provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">Email Verification Status</span>
                <span className="text-zinc-200">
                  {user?.email_confirmed_at ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-amber-400">Unverified</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">Account Registration Date</span>
                <span className="text-zinc-200">
                  {user?.created_at ? new Date(user.created_at).toLocaleString() : "Unknown"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">Last Sign-in Recorded</span>
                <span className="text-zinc-200">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "No recorded sign-in"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">Account Lock / Suspension</span>
                <span className={isSuspended ? "text-red-400 font-bold" : "text-emerald-400"}>
                  {isSuspended ? `Banned until: ${user.banned_until}` : "None (Account in good standing)"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Actions & Editing) */}
        <div className="lg:col-span-5 space-y-6">
          <UserDetailActionsClient
            user={user || { id, email: profile?.email, banned_until: null }}
            profile={profile}
            currentAdminId={currentAdmin.user.id}
          />
        </div>
      </div>
    </div>
  );
}
