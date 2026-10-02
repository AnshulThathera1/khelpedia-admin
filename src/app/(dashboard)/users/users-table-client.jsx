"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  ExternalLink,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { updateUserRole, toggleUserSuspension } from "./actions";

export function UsersTableClient({ users, profiles, linkedAccounts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // ALL | ADMINS | USERS | SUSPENDED
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Build map of linked accounts per user
  const linkedMap = new Map();
  linkedAccounts.forEach((la) => {
    if (!linkedMap.has(la.user_id)) {
      linkedMap.set(la.user_id, []);
    }
    linkedMap.get(la.user_id).push(la);
  });

  // Filter users based on query and role filter
  const filteredUsers = users.filter((user) => {
    const profile = profileMap.get(user.id);
    const displayName =
      profile?.display_name || user.user_metadata?.full_name || "";
    const email = user.email || "";
    const id = user.id || "";
    const provider = profile?.provider || user.app_metadata?.provider || "";
    const isSuspended = Boolean(user.banned_until);
    const isAdmin = profile?.is_admin === true;

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      email.toLowerCase().includes(q) ||
      displayName.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      provider.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Role / Status filter match
    if (roleFilter === "ADMINS") return isAdmin;
    if (roleFilter === "USERS") return !isAdmin;
    if (roleFilter === "SUSPENDED") return isSuspended;

    return true;
  });

  const handleRoleChange = (userId, newRole) => {
    startTransition(async () => {
      setActionMessage({ text: "Updating role...", type: "info" });
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", newRole);

      const res = await updateUserRole(formData);
      if (res?.success) {
        setActionMessage({ text: "Role updated successfully.", type: "success" });
      } else {
        setActionMessage({ text: res?.error || "Failed to update role.", type: "error" });
      }
      setTimeout(() => setActionMessage({ text: "", type: "" }), 4000);
    });
  };

  const handleSuspensionToggle = (userId, currentSuspended) => {
    startTransition(async () => {
      const willSuspend = !currentSuspended;
      setActionMessage({
        text: willSuspend ? "Suspending account..." : "Reactivating account...",
        type: "info",
      });
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("suspend", willSuspend ? "true" : "false");

      const res = await toggleUserSuspension(formData);
      if (res?.success) {
        setActionMessage({
          text: willSuspend ? "Account suspended." : "Account reactivated.",
          type: "success",
        });
      } else {
        setActionMessage({
          text: res?.error || "Failed to update account status.",
          type: "error",
        });
      }
      setTimeout(() => setActionMessage({ text: "", type: "" }), 4000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {actionMessage.text && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border font-medium transition-all ${
            actionMessage.type === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-300"
          }`}
        >
          {actionMessage.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, user ID, or provider..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "ALL", label: "All Users", count: users.length },
            {
              id: "ADMINS",
              label: "Admins",
              count: users.filter((u) => profileMap.get(u.id)?.is_admin).length,
            },
            {
              id: "USERS",
              label: "Standard Users",
              count: users.filter((u) => !profileMap.get(u.id)?.is_admin).length,
            },
            {
              id: "SUSPENDED",
              label: "Suspended",
              count: users.filter((u) => u.banned_until).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[10px] text-zinc-500 font-mono">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-900/60">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">User Identity</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Linked Accounts</TableHead>
              <TableHead className="text-zinc-400">Auth Provider</TableHead>
              <TableHead className="text-zinc-400">Last Sign In</TableHead>
              <TableHead className="text-zinc-400">Account Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const profile = profileMap.get(user.id);
              const isAdmin = profile?.is_admin === true;
              const displayName =
                profile?.display_name ||
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "Anonymous";
              const userLinked = linkedMap.get(user.id) || [];
              const isSuspended = Boolean(user.banned_until);
              const provider =
                profile?.provider ||
                user.app_metadata?.provider ||
                "email";

              return (
                <TableRow
                  key={user.id}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Identity */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/users/${user.id}`}
                          className="font-medium text-white text-xs hover:text-red-400 transition-colors truncate block"
                        >
                          {displayName}
                        </Link>
                        <span className="text-zinc-500 text-[11px] font-mono truncate block">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
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
                  </TableCell>

                  {/* Linked Gaming Accounts */}
                  <TableCell>
                    {userLinked.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {userLinked.map((la) => (
                          <span
                            key={la.id}
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300"
                          >
                            <Gamepad2 className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            <span>
                              {la.game_name}#{la.tag_line}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-600 font-mono">
                        None
                      </span>
                    )}
                  </TableCell>

                  {/* Provider */}
                  <TableCell>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {provider}
                    </span>
                  </TableCell>

                  {/* Last Sign In */}
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {isSuspended ? (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[11px] font-mono">
                        SUSPENDED
                      </Badge>
                    ) : user.email_confirmed_at ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px] font-mono"
                      >
                        ACTIVE
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-zinc-500 border-zinc-800 text-[11px] font-mono"
                      >
                        UNVERIFIED
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl"
                      >
                        <DropdownMenuLabel className="text-xs text-zinc-400">
                          Manage Account
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/users/${user.id}`}
                            className="cursor-pointer text-xs flex items-center justify-between"
                          >
                            <span>View Full Profile</span>
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />

                        {/* Role Elevation/Demotion */}
                        <DropdownMenuLabel className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                          Change Role
                        </DropdownMenuLabel>
                        {!isAdmin ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "SUPER_ADMIN")}
                            className="cursor-pointer text-xs text-emerald-400 focus:bg-emerald-500/10"
                          >
                            <Shield className="h-3.5 w-3.5 mr-2" />
                            <span>Make Super Admin</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "USER")}
                            className="cursor-pointer text-xs text-amber-400 focus:bg-amber-500/10"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-2" />
                            <span>Demote to User</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-zinc-800" />

                        {/* Suspend / Reactivate */}
                        <DropdownMenuItem
                          onClick={() => handleSuspensionToggle(user.id, isSuspended)}
                          className={`cursor-pointer text-xs ${
                            isSuspended
                              ? "text-emerald-400 focus:bg-emerald-500/10"
                              : "text-red-400 focus:bg-red-500/10"
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-2" />
                              <span>Reactivate Account</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-2" />
                              <span>Suspend Account</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-28 text-zinc-500 text-xs"
                >
                  No users match the search and filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
