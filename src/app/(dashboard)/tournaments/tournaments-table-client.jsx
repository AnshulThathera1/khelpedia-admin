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
  Trophy,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { deleteTournamentSafeAction } from "../actions/entity-actions";

export function TournamentsTableClient({ tournaments, games }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  const gameMap = new Map(games.map((g) => [g.id, g.name]));

  const filteredTournaments = tournaments.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const gameName = gameMap.get(t.game_id) || "";

    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.slug && t.slug.toLowerCase().includes(q)) ||
      (t.region && t.region.toLowerCase().includes(q)) ||
      (t.tier && t.tier.toLowerCase().includes(q)) ||
      gameName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter !== "ALL" && t.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleDelete = (tournamentId, tournamentName) => {
    if (!window.confirm(`Attempt safe deletion of tournament "${tournamentName}"?`)) return;

    startTransition(async () => {
      setActionMessage({ text: "Checking dependencies and deleting...", type: "info" });
      const formData = new FormData();
      formData.append("id", tournamentId);

      const res = await deleteTournamentSafeAction(formData);
      if (res?.success) {
        setActionMessage({ text: `Tournament "${tournamentName}" deleted successfully.`, type: "success" });
      } else {
        setActionMessage({
          text: res?.error || "Cannot delete tournament due to linked matches/teams.",
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

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tournaments by name, game, region, or tier..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 text-xs font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-900/60">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Tournament</TableHead>
              <TableHead className="text-zinc-400">Game Title</TableHead>
              <TableHead className="text-zinc-400">Tier / Region</TableHead>
              <TableHead className="text-zinc-400">Prize Pool</TableHead>
              <TableHead className="text-zinc-400">Dates</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTournaments.map((tournament) => {
              const gameName = gameMap.get(tournament.game_id) || "Valorant";
              const isCompleted = tournament.status === "completed";
              const isOngoing = tournament.status === "ongoing";

              return (
                <TableRow
                  key={tournament.id}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Name */}
                  <TableCell>
                    <div className="min-w-0 max-w-xs">
                      <Link
                        href={`/tournaments/${tournament.id}`}
                        className="font-medium text-white text-xs hover:text-red-400 transition-colors truncate block"
                      >
                        {tournament.name}
                      </Link>
                      <span className="text-zinc-500 text-[11px] font-mono truncate block">
                        slug: {tournament.slug || `tournament-${tournament.id}`}
                      </span>
                    </div>
                  </TableCell>

                  {/* Game */}
                  <TableCell className="text-xs text-zinc-300 font-mono">
                    {gameName}
                  </TableCell>

                  {/* Tier & Region */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                      <span className="uppercase text-amber-400 font-semibold">
                        {tournament.tier || "Tier TBD"}
                      </span>
                      {tournament.region && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{tournament.region}</span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Prize Pool */}
                  <TableCell className="text-xs font-mono text-zinc-300">
                    {tournament.prize_pool
                      ? `${tournament.currency || "$"} ${Number(tournament.prize_pool).toLocaleString()}`
                      : "—"}
                  </TableCell>

                  {/* Dates */}
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {tournament.start_date
                      ? new Date(tournament.start_date).toLocaleDateString()
                      : "TBD"}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      className={`text-[10px] font-mono uppercase ${
                        isOngoing
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"
                          : isCompleted
                          ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {tournament.status || "upcoming"}
                    </Badge>
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
                            href={`/tournaments/${tournament.id}`}
                            className="cursor-pointer text-xs flex items-center justify-between"
                          >
                            <span>Inspect & Edit</span>
                            <Edit className="h-3.5 w-3.5 text-zinc-400" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(tournament.id, tournament.name)}
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

            {filteredTournaments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-28 text-zinc-500 text-xs"
                >
                  No tournaments found matching search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
