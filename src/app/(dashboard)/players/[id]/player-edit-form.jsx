"use client";

import { useState, useTransition } from "react";
import { updatePlayerAction, deletePlayerSafeAction } from "../../actions/entity-actions";
import { Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function PlayerEditForm({ player, teams, dependencyCheck }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ text: "", type: "" });

  const [ign, setIgn] = useState(player.ign || "");
  const [name, setName] = useState(player.name || "");
  const [country, setCountry] = useState(player.country || "");
  const [role, setRole] = useState(player.role || "");
  const [teamId, setTeamId] = useState(player.team_id ? String(player.team_id) : "");
  const [earnings, setEarnings] = useState(player.earnings || "");
  const [editorialContent, setEditorialContent] = useState(player.editorial_content || "");

  const handleSave = (e) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage({ text: "Saving player profile...", type: "info" });
      const formData = new FormData();
      formData.append("id", player.id);
      formData.append("ign", ign);
      formData.append("name", name);
      formData.append("country", country);
      formData.append("role", role);
      formData.append("team_id", teamId);
      if (earnings) formData.append("earnings", earnings);
      formData.append("editorial_content", editorialContent);

      const res = await updatePlayerAction(formData);
      if (res?.success) {
        setMessage({ text: "Player profile updated successfully.", type: "success" });
      } else {
        setMessage({ text: res?.error || "Failed to update player.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to attempt deletion of player "${player.ign}"?`)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", player.id);

      const res = await deletePlayerSafeAction(formData);
      if (res?.success) {
        alert("Player deleted successfully.");
        router.push("/players");
      } else {
        setMessage({ text: res?.error || "Cannot delete player.", type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Player Identity & Editorial Biography</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">In-Game Name (IGN)</label>
            <input
              type="text"
              required
              value={ign}
              disabled={isPending}
              onChange={(e) => setIgn(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Real Name</label>
            <input
              type="text"
              value={name}
              disabled={isPending}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tyson Van Ngo"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Country</label>
            <input
              type="text"
              value={country}
              disabled={isPending}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Canada, South Korea"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Competitive Role</label>
            <input
              type="text"
              value={role}
              disabled={isPending}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Duelist, Initiator, IGL"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Assigned Team</label>
            <select
              value={teamId}
              disabled={isPending}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">Free Agent / Unassigned</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Career Earnings ($ USD)</label>
            <input
              type="number"
              value={earnings}
              disabled={isPending}
              onChange={(e) => setEarnings(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-zinc-400 font-medium">
              Editorial Biography (SEO Custom Copy)
            </label>
            <span className="text-[11px] font-mono text-zinc-500">
              {editorialContent.length} characters (100+ chars required for organic indexing)
            </span>
          </div>
          <textarea
            rows={6}
            value={editorialContent}
            disabled={isPending}
            onChange={(e) => setEditorialContent(e.target.value)}
            placeholder="Write verified background, agent pool, tournament trophies, and career trajectory..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isPending ? "Saving..." : "Save Player Profile"}</span>
        </button>
      </form>

      {/* Safe Delete Check */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Safe Delete Policy Check</h3>
        {dependencyCheck.canDelete ? (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">
              No foreign-key dependencies detected. This player record can be deleted safely.
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Player Record</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs space-y-1">
            <span className="font-semibold block">Deletion Blocked by Safe Delete Policy</span>
            <p className="text-[11px] text-amber-300/90 leading-relaxed">{dependencyCheck.warning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
