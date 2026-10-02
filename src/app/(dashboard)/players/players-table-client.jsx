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
  User,
  Shield,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { deletePlayerSafeAction } from "../actions/entity-actions";

export function PlayersTableClient({ players, teams }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const filteredPlayers = players.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const team = teamMap.get(p.team_id);
    const teamName = team ? team.name.toLowerCase() : "";

    const matchesSearch =
      !q ||
      p.ign.toLowerCase().includes(q) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.country && p.country.toLowerCase().includes(q)) ||
      (p.role && p.role.toLowerCase().includes(q)) ||
      teamName.includes(q);

    if (!matchesSearch) return false;

    if (teamFilter !== "ALL") {
      if (teamFilter === "UNASSIGNED") {
        if (p.team_id) return false;
      } else if (p.team_id !== parseInt(teamFilter, 10)) {
        return false;
      }
    }

    return true;
  });

  const handleDelete = (playerId, playerIgn) => {
    if (!window.confirm(`Attempt safe deletion of player "${playerIgn}"?`)) return;

    startTransition(async () => {
      setActionMessage({ text: "Checking dependencies and deleting...", type: "info" });
      const formData = new FormData();
      formData.append("id", playerId);

      const res = await deletePlayerSafeAction(formData);
      if (res?.success) {
        setActionMessage({ text: `Player "${playerIgn}" deleted successfully.`, type: "success" });
      } else {
        setActionMessage({
          text: res?.error || "Cannot delete player due to dependencies.",
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
            placeholder="Search players by IGN, real name, team, or country..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 text-xs font-mono">Team:</span>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 max-w-[180px] truncate"
          >
            <option value="ALL">All Players</option>
            <option value="UNASSIGNED">Unassigned (Free Agent)</option>
            {teams.slice(0, 50).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-900/60">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Player / IGN</TableHead>
              <TableHead className="text-zinc-400">Team</TableHead>
              <TableHead className="text-zinc-400">Role / Country</TableHead>
              <TableHead className="text-zinc-400">Career Earnings</TableHead>
              <TableHead className="text-zinc-400">Editorial Value</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player) => {
              const team = teamMap.get(player.team_id);
              const hasEditorial = Boolean(
                player.editorial_content && player.editorial_content.length > 50
              );

              return (
                <TableRow
                  key={player.id}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                >
                  {/* IGN & Real Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {player.image_url ? (
                        <img
                          src={player.image_url}
                          alt={player.ign}
                          className="h-8 w-8 rounded-full object-cover bg-zinc-900 border border-zinc-800"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 shrink-0">
                          {player.ign.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/players/${player.id}`}
                          className="font-medium text-white text-xs hover:text-red-400 transition-colors truncate block"
                        >
                          {player.ign}
                        </Link>
                        <span className="text-zinc-500 text-[11px] truncate block">
                          {player.name || "Real name unknown"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Team */}
                  <TableCell>
                    {team ? (
                      <Link
                        href={`/teams/${team.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5"
                      >
                        <Shield className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{team.name}</span>
                      </Link>
                    ) : (
                      <span className="text-zinc-600 text-xs font-mono">
                        Free Agent
                      </span>
                    )}
                  </TableCell>

                  {/* Role & Country */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                      <span>{player.role || "Player"}</span>
                      {player.country && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{player.country}</span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Earnings */}
                  <TableCell className="text-xs font-mono text-zinc-300">
                    {player.earnings ? `$${Number(player.earnings).toLocaleString()}` : "—"}
                  </TableCell>

                  {/* Editorial Content */}
                  <TableCell>
                    {hasEditorial ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                        {player.editorial_content.length} chars
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-zinc-600 border-zinc-800 text-[10px] font-mono"
                      >
                        No Custom Copy
                      </Badge>
                    )}
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
                            href={`/players/${player.id}`}
                            className="cursor-pointer text-xs flex items-center justify-between"
                          >
                            <span>Inspect & Edit</span>
                            <Edit className="h-3.5 w-3.5 text-zinc-400" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(player.id, player.ign)}
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

            {filteredPlayers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-28 text-zinc-500 text-xs"
                >
                  No players found matching search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
