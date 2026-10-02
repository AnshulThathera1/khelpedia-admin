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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Gamepad2,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { deleteGameSafeAction } from "../actions/entity-actions";

export function GamesTableClient({ games, tournamentCounts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  const tourneyMap = new Map(tournamentCounts.map((t) => [t.game_id, t.count]));

  const filteredGames = games.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      g.name.toLowerCase().includes(q) ||
      (g.slug && g.slug.toLowerCase().includes(q)) ||
      (g.genre && g.genre.toLowerCase().includes(q))
    );
  });

  const handleDelete = (gameId, gameName) => {
    if (!window.confirm(`Attempt safe deletion of game "${gameName}"?`)) return;

    startTransition(async () => {
      setActionMessage({ text: "Checking dependencies and deleting...", type: "info" });
      const formData = new FormData();
      formData.append("id", gameId);

      const res = await deleteGameSafeAction(formData);
      if (res?.success) {
        setActionMessage({ text: `Game "${gameName}" deleted successfully.`, type: "success" });
      } else {
        setActionMessage({
          text: res?.error || "Cannot delete game due to linked tournaments.",
          type: "error",
        });
      }
      setTimeout(() => setActionMessage({ text: "", type: "" }), 6000);
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

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search esports titles by name, genre, or slug..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-900/60">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Game Title</TableHead>
              <TableHead className="text-zinc-400">Genre</TableHead>
              <TableHead className="text-zinc-400">Linked Tournaments</TableHead>
              <TableHead className="text-zinc-400">Slug</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.map((game) => {
              const tourneysCount = tourneyMap.get(game.id) || 0;

              return (
                <TableRow
                  key={game.id}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Title & Icon */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {game.icon_url ? (
                        <img
                          src={game.icon_url}
                          alt={game.name}
                          className="h-8 w-8 rounded-lg object-contain bg-zinc-900 border border-zinc-800 p-0.5"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 shrink-0">
                          <Gamepad2 className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/games/${game.id}`}
                          className="font-medium text-white text-xs hover:text-red-400 transition-colors truncate block"
                        >
                          {game.name}
                        </Link>
                        {game.description && (
                          <span className="text-zinc-500 text-[11px] truncate block max-w-xs">
                            {game.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Genre */}
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] font-mono border-zinc-800 text-zinc-300">
                      {game.genre || "Tactical FPS"}
                    </Badge>
                  </TableCell>

                  {/* Tournaments */}
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      <span>{tourneysCount} tournaments</span>
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="text-xs text-zinc-500 font-mono">
                    {game.slug || `game-${game.id}`}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/games/${game.id}`}
                            className="cursor-pointer text-xs flex items-center justify-between"
                          >
                            <span>Inspect & Edit</span>
                            <Edit className="h-3.5 w-3.5 text-zinc-400" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(game.id, game.name)}
                          className="cursor-pointer text-xs text-red-400 focus:bg-red-500/10 flex items-center justify-between"
                        >
                          <span>Safe Delete</span>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredGames.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-28 text-zinc-500 text-xs"
                >
                  No game titles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
