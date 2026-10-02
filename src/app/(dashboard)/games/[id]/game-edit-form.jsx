"use client";

import { useState, useTransition } from "react";
import { updateGameAction, deleteGameSafeAction } from "../../actions/entity-actions";
import { Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GameEditForm({ game, dependencyCheck }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ text: "", type: "" });

  const [name, setName] = useState(game.name || "");
  const [genre, setGenre] = useState(game.genre || "");
  const [description, setDescription] = useState(game.description || "");
  const [iconUrl, setIconUrl] = useState(game.icon_url || "");

  const handleSave = (e) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage({ text: "Saving game title...", type: "info" });
      const formData = new FormData();
      formData.append("id", game.id);
      formData.append("name", name);
      formData.append("genre", genre);
      formData.append("description", description);
      formData.append("icon_url", iconUrl);

      const res = await updateGameAction(formData);
      if (res?.success) {
        setMessage({ text: "Game updated successfully.", type: "success" });
      } else {
        setMessage({ text: res?.error || "Failed to update game.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to attempt deletion of "${game.name}"?`)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", game.id);

      const res = await deleteGameSafeAction(formData);
      if (res?.success) {
        alert("Game deleted successfully.");
        router.push("/games");
      } else {
        setMessage({ text: res?.error || "Cannot delete game.", type: "error" });
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
        <h3 className="text-sm font-semibold text-white">Game Title Attributes</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Title Name</label>
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
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Genre</label>
            <input
              type="text"
              value={genre}
              disabled={isPending}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Tactical FPS, Battle Royale, MOBA"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1 font-medium">Icon Asset URL</label>
          <input
            type="url"
            value={iconUrl}
            disabled={isPending}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1 font-medium">Description</label>
          <textarea
            rows={4}
            value={description}
            disabled={isPending}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isPending ? "Saving..." : "Save Game Title"}</span>
        </button>
      </form>

      {/* Safe Delete Check */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Safe Delete Policy Check</h3>
        {dependencyCheck.canDelete ? (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">
              No foreign-key dependencies detected. This game can be deleted safely.
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Game Record</span>
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
