"use client";

import { useState, useTransition } from "react";
import { updateTeamAction, deleteTeamSafeAction } from "../../actions/entity-actions";
import { Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TeamEditForm({ team, dependencyCheck }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ text: "", type: "" });

  const [name, setName] = useState(team.name || "");
  const [region, setRegion] = useState(team.region || "");
  const [country, setCountry] = useState(team.country || "");
  const [foundedYear, setFoundedYear] = useState(team.founded_year || "");
  const [description, setDescription] = useState(team.description || "");
  const [editorialContent, setEditorialContent] = useState(team.editorial_content || "");

  const handleSave = (e) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage({ text: "Saving team changes...", type: "info" });
      const formData = new FormData();
      formData.append("id", team.id);
      formData.append("name", name);
      formData.append("region", region);
      formData.append("country", country);
      if (foundedYear) formData.append("founded_year", foundedYear);
      formData.append("description", description);
      formData.append("editorial_content", editorialContent);

      const res = await updateTeamAction(formData);
      if (res?.success) {
        setMessage({ text: "Team updated successfully.", type: "success" });
      } else {
        setMessage({ text: res?.error || "Failed to update team.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to attempt deletion of "${team.name}"?`)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", team.id);

      const res = await deleteTeamSafeAction(formData);
      if (res?.success) {
        alert("Team deleted successfully.");
        router.push("/teams");
      } else {
        setMessage({ text: res?.error || "Cannot delete team.", type: "error" });
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
        <h3 className="text-sm font-semibold text-white">Team Attributes & Editorial Content</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Team Name</label>
            <input
              type="text"
              required
              value={name}
              disabled={isPending}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Region</label>
            <input
              type="text"
              value={region}
              disabled={isPending}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. North America, EMEA, Pacific"
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
              placeholder="e.g. United States, Korea"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Founded Year</label>
            <input
              type="number"
              value={foundedYear}
              disabled={isPending}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder="e.g. 2020"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1 font-medium">Brief Description</label>
          <input
            type="text"
            value={description}
            disabled={isPending}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-zinc-400 font-medium">
              Editorial Content (SEO High-Value Copy)
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
            placeholder="Write unique factual background, franchise milestones, and roster evolution..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isPending ? "Saving..." : "Save Team Details"}</span>
        </button>
      </form>

      {/* Safe Delete & Dependency Audit */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Safe Delete Policy Check</h3>
        {dependencyCheck.canDelete ? (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">
              No foreign-key dependencies detected. This team can be deleted safely.
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Team Record</span>
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
