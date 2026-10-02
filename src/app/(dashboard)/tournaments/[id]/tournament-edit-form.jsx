"use client";

import { useState, useTransition } from "react";
import { updateTournamentAction, deleteTournamentSafeAction } from "../../actions/entity-actions";
import { Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentEditForm({ tournament, dependencyCheck }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ text: "", type: "" });

  const [name, setName] = useState(tournament.name || "");
  const [status, setStatus] = useState(tournament.status || "upcoming");
  const [tier, setTier] = useState(tournament.tier || "");
  const [region, setRegion] = useState(tournament.region || "");
  const [prizePool, setPrizePool] = useState(tournament.prize_pool || "");
  const [currency, setCurrency] = useState(tournament.currency || "USD");
  const [startDate, setStartDate] = useState(
    tournament.start_date ? tournament.start_date.substring(0, 10) : ""
  );
  const [endDate, setEndDate] = useState(
    tournament.end_date ? tournament.end_date.substring(0, 10) : ""
  );
  const [format, setFormat] = useState(tournament.format || "");
  const [editorialContent, setEditorialContent] = useState(tournament.editorial_content || "");

  const handleSave = (e) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage({ text: "Saving tournament details...", type: "info" });
      const formData = new FormData();
      formData.append("id", tournament.id);
      formData.append("name", name);
      formData.append("status", status);
      formData.append("tier", tier);
      formData.append("region", region);
      if (prizePool) formData.append("prize_pool", prizePool);
      formData.append("currency", currency);
      if (startDate) formData.append("start_date", startDate);
      if (endDate) formData.append("end_date", endDate);
      formData.append("format", format);
      formData.append("editorial_content", editorialContent);

      const res = await updateTournamentAction(formData);
      if (res?.success) {
        setMessage({ text: "Tournament updated successfully.", type: "success" });
      } else {
        setMessage({ text: res?.error || "Failed to update tournament.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to attempt deletion of tournament "${tournament.name}"?`)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", tournament.id);

      const res = await deleteTournamentSafeAction(formData);
      if (res?.success) {
        alert("Tournament deleted successfully.");
        router.push("/tournaments");
      } else {
        setMessage({ text: res?.error || "Cannot delete tournament.", type: "error" });
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
        <h3 className="text-sm font-semibold text-white">Tournament Parameters & Editorial Content</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Tournament Name</label>
            <input
              type="text"
              required
              value={name}
              disabled={isPending}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Status</label>
            <select
              value={status}
              disabled={isPending}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Tier</label>
            <input
              type="text"
              value={tier}
              disabled={isPending}
              onChange={(e) => setTier(e.target.value)}
              placeholder="e.g. S-Tier, A-Tier, Challengers"
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
              placeholder="e.g. International, North America"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Prize Pool</label>
            <input
              type="number"
              value={prizePool}
              disabled={isPending}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. 1000000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              disabled={isPending}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              disabled={isPending}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
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
            placeholder="Write tournament stakes, qualification pathways, championship storyline..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isPending ? "Saving..." : "Save Tournament Details"}</span>
        </button>
      </form>

      {/* Safe Delete Check */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Safe Delete Policy Check</h3>
        {dependencyCheck.canDelete ? (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">
              No foreign-key dependencies detected. This tournament can be deleted safely.
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Tournament Record</span>
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
