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
  Trash2,
  Edit,
  ExternalLink,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { deleteTeamSafeAction } from "../actions/entity-actions";

export function TeamsTableClient({ teams, rosterCounts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  const rosterMap = new Map(rosterCounts.map((r) => [r.team_id, r.count]));

  // Get unique regions
  const regions = Array.from(
    new Set(teams.map((t) => t.region).filter(Boolean))
  ).sort();

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.slug && t.slug.toLowerCase().includes(q)) ||
      (t.country && t.country.toLowerCase().includes(q)) ||
      (t.region && t.region.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (regionFilter !== "ALL" && t.region !== regionFilter) {
      return false;
    }

    return true;
  });

  const handleDelete = (teamId, teamName) => {
    if (!window.confirm(`Attempt safe deletion of team "${teamName}"?`)) return;

    startTransition(async () => {
      setActionMessage({ text: "Checking dependencies and deleting...", type: "info" });
      const formData = new FormData();
      formData.append("id", teamId);

      const res = await deleteTeamSafeAction(formData);
      if (res?.success) {
        setActionMessage({ text: `Team "${teamName}" deleted successfully.`, type: "success" });
      } else {
        setActionMessage({
          text: res?.error || "Cannot delete team due to dependencies.",
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
            placeholder="Search teams by name, slug, region, or country..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 text-xs font-mono">Region:</span>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="ALL">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
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
              <TableHead className="text-zinc-400">Team Identity</TableHead>
              <TableHead className="text-zinc-400">Region / Country</TableHead>
              <TableHead className="text-zinc-400">Active Roster</TableHead>
              <TableHead className="text-zinc-400">Editorial Value</TableHead>
              <TableHead className="text-zinc-400">Founded</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => {
              const rosterCount = rosterMap.get(team.id) || 0;
              const hasEditorial = Boolean(
                team.editorial_content && team.editorial_content.length > 50
              );

              return (
                <TableRow
                  key={team.id}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Identity */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="h-8 w-8 rounded-lg object-contain bg-zinc-900 border border-zinc-800 p-0.5"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 shrink-0">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/teams/${team.id}`}
                          className="font-medium text-white text-xs hover:text-red-400 transition-colors truncate block"
                        >
                          {team.name}
                        </Link>
                        <span className="text-zinc-500 text-[11px] font-mono truncate block">
                          slug: {team.slug || `team-${team.id}`}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Region & Country */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                      <span>{team.region || "Global"}</span>
                      {team.country && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{team.country}</span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Active Roster */}
                  <TableCell>
                    <div className="inline-flex items-center gap-1 text-xs font-mono text-zinc-300">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{rosterCount} players</span>
                    </div>
                  </TableCell>

                  {/* Editorial Content */}
                  <TableCell>
                    {hasEditorial ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                        {team.editorial_content.length} chars
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

                  {/* Founded */}
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {team.founded_year || "—"}
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
                            href={`/teams/${team.id}`}
                            className="cursor-pointer text-xs flex items-center justify-between"
                          >
                            <span>Inspect & Edit</span>
                            <Edit className="h-3.5 w-3.5 text-zinc-400" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(team.id, team.name)}
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

            {filteredTeams.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-28 text-zinc-500 text-xs"
                >
                  No teams found matching search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
