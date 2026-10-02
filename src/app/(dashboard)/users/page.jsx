import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { UsersTableClient } from "./users-table-client";
import { Users, Shield, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "User Management",
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin(ADMIN_PERMISSIONS.USERS_VIEW);

  const adminDb = createAdminClient();

  // Parallel fetch: Auth users, profiles, and linked gaming accounts
  const [userDataRes, profilesRes, linkedAccountsRes] = await Promise.all([
    adminDb.auth.admin.listUsers().catch(() => ({ data: { users: [] } })),
    adminDb.from("profiles").select("*"),
    adminDb.from("user_linked_accounts").select("*"),
  ]);

  const users = userDataRes?.data?.users || [];
  const profiles = profilesRes?.data || [];
  const linkedAccounts = linkedAccountsRes?.data || [];

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const adminCount = users.filter((u) => profileMap.get(u.id)?.is_admin).length;
  const activeCount = users.filter((u) => u.email_confirmed_at && !u.banned_until).length;
  const suspendedCount = users.filter((u) => u.banned_until).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          User Database & Access Control
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Inspect registered accounts, manage administrative roles, and oversee gaming credentials.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Total Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {users.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Registered platform identities
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Administrators
            </CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {adminCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Privileged control accounts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Active / Confirmed
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {activeCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Verified email credentials
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Suspended Accounts
            </CardTitle>
            <UserX className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {suspendedCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Temporarily or permanently blocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Table */}
      <UsersTableClient
        users={users}
        profiles={profiles}
        linkedAccounts={linkedAccounts}
      />
    </div>
  );
}
