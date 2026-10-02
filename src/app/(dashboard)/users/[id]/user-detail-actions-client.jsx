"use client";

import { useState, useTransition } from "react";
import { updateUserRole, toggleUserSuspension, updateUserProfile } from "../actions";
import { Shield, UserCheck, UserX, AlertCircle, CheckCircle2, Save } from "lucide-react";

export function UserDetailActionsClient({ user, profile, currentAdminId }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ text: "", type: "" });

  const isSuspended = Boolean(user.banned_until);
  const isAdmin = profile?.is_admin === true;
  const isSelf = user.id === currentAdminId;

  const [selectedRole, setSelectedRole] = useState(
    isAdmin ? "SUPER_ADMIN" : "USER"
  );
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [emailNotifs, setEmailNotifs] = useState(
    profile?.email_notifications ?? true
  );
  const [pushNotifs, setPushNotifs] = useState(
    profile?.push_notifications ?? true
  );

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage({ text: "Updating administrative role...", type: "info" });
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("role", selectedRole);

      const res = await updateUserRole(formData);
      if (res?.success) {
        setMessage({ text: "Role successfully updated.", type: "success" });
      } else {
        setMessage({ text: res?.error || "Failed to update role.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  const handleSuspensionSubmit = () => {
    const willSuspend = !isSuspended;
    const confirmText = willSuspend
      ? `Are you sure you want to suspend access for ${user.email}?`
      : `Reactivate access for ${user.email}?`;

    if (!window.confirm(confirmText)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("suspend", willSuspend ? "true" : "false");

      const res = await toggleUserSuspension(formData);
      if (res?.success) {
        setMessage({
          text: willSuspend ? "Account suspended." : "Account reactivated.",
          type: "success",
        });
      } else {
        setMessage({
          text: res?.error || "Failed to update suspension status.",
          type: "error",
        });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage({ text: "Saving profile changes...", type: "info" });
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("displayName", displayName);
      if (emailNotifs) formData.append("emailNotifications", "on");
      if (pushNotifs) formData.append("pushNotifications", "on");

      const res = await updateUserProfile(formData);
      if (res?.success) {
        setMessage({ text: "Profile updated successfully.", type: "success" });
      } else {
        setMessage({ text: res?.error || "Failed to save profile.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {message.text && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border font-medium transition-all ${
            message.type === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-300"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Role Management Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-white">Access & Role Elevation</h3>
          </div>
          {isSelf && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Current Session
            </span>
          )}
        </div>

        <form onSubmit={handleRoleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Assigned Authority Role
            </label>
            <select
              value={selectedRole}
              disabled={isPending || isSelf}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
            >
              <option value="USER">Standard User (No Admin Privileges)</option>
              <option value="SUPER_ADMIN">Super Administrator (Full Unrestricted Access)</option>
              <option value="ADMIN">Administrator (Entity & SEO Control)</option>
              <option value="EDITOR">Editorial Lead (Articles & Media)</option>
              <option value="MODERATOR">Moderator (User Oversight)</option>
              <option value="ANALYST">Data Analyst (Read-Only Matches/Stats)</option>
            </select>
          </div>

          {!isSelf && (
            <button
              type="submit"
              disabled={isPending}
              className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              {isPending ? "Updating Role..." : "Save Role Assignment"}
            </button>
          )}
        </form>
      </div>

      {/* Profile Field Editing */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Edit Profile Details</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              disabled={isPending}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Danger0p"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifs}
                disabled={isPending}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              <span className="text-xs text-zinc-300">Email Notifications Enabled</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotifs}
                disabled={isPending}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
              />
              <span className="text-xs text-zinc-300">Web Push Notifications Enabled</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Account Status / Suspension */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Account Status Controls</h3>
        <p className="text-xs text-zinc-400">
          Suspending a user invalidates their authentication sessions and blocks further platform access.
        </p>

        {!isSelf ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleSuspensionSubmit}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer border ${
              isSuspended
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {isSuspended ? (
              <>
                <UserCheck className="h-4 w-4" />
                <span>Reactivate User Account</span>
              </>
            ) : (
              <>
                <UserX className="h-4 w-4" />
                <span>Suspend User Account</span>
              </>
            )}
          </button>
        ) : (
          <p className="text-[11px] text-zinc-500 font-mono">
            Safety Guard: You cannot suspend your own active administrator account.
          </p>
        )}
      </div>
    </div>
  );
}
