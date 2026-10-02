"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Globe,
  Lock,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code,
  BookOpen,
  ArrowRight,
  FileCode,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SeoClient({
  auditRows,
  currentEntity,
  currentStatus,
  currentSearch,
  stats,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showRuleModal, setShowRuleModal] = useState(false);

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  // Filter audit rows locally
  const filteredRows = auditRows.filter((row) => {
    const matchesEntity =
      currentEntity === "all" || row.type === currentEntity;

    const matchesStatus =
      currentStatus === "all" ||
      (currentStatus === "indexable" && row.isIndexable) ||
      (currentStatus === "noindex" && !row.isIndexable);

    const matchesSearch =
      currentSearch === "" ||
      row.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
      row.subtitle.toLowerCase().includes(currentSearch.toLowerCase()) ||
      row.reason.toLowerCase().includes(currentSearch.toLowerCase());

    return matchesEntity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Globe className="h-7 w-7 text-red-500" />
              SEO & Indexability Management
            </h1>
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-xs">
              src/lib/seo.js Criteria
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Audit search engine indexability, crawl budget allocation, and ensure zero low-value content indexing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/seo/sitemaps">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm text-xs">
              <Layers className="h-4 w-4" />
              <span>Inspect Sitemaps</span>
            </Button>
          </Link>
          <Link href="/editorial">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1.5 text-xs">
              <BookOpen className="h-4 w-4" />
              <span>Enrich Thin Entities</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Isolation Security Card */}
      <Card className="bg-zinc-950 border-emerald-500/30 shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Admin Panel Private Network Isolation Enforced
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                    Protected
                  </Badge>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                  This administration interface is strictly isolated and access-controlled. Every response is injected with <code className="text-emerald-300 bg-emerald-950/40 px-1 py-0.5 rounded font-mono text-[11px]">X-Robots-Tag: noindex, nofollow, noarchive, nosnippet</code> and shielded by <code className="text-emerald-300 bg-emerald-950/40 px-1 py-0.5 rounded font-mono text-[11px]">robots.txt: Disallow /</code>. Search crawlers and unauthenticated visitors have zero access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-13 md:pl-0">
              <div className="text-left md:text-right">
                <span className="text-zinc-400 block text-[10px] uppercase">Crawler Access</span>
                <span className="text-emerald-400 font-bold">0% Blocked</span>
              </div>
              <div className="text-left md:text-right border-l border-zinc-800 pl-4">
                <span className="text-zinc-400 block text-[10px] uppercase">Binding</span>
                <span className="text-zinc-200">127.0.0.1:3001</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public KhelPediA SEO Health Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Database Entities</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalEntities.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Across All Categories</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Globe className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Indexable URLs</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {stats.totalIndexable}
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">index, follow + in Sitemap</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Thin Protected Pages</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {stats.totalNoindex.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">noindex, follow guard</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Crawl Efficiency</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {((1 - stats.totalIndexable / stats.totalEntities) * 100).toFixed(1)}%
              </p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Budget Shield Ratio</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indexability Distribution Matrix */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800/80 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
              Entity Indexability Breakdown (src/lib/seo.js)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Comparing public search visibility across all core entities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRuleModal(true)}
            className="border-zinc-800 text-zinc-300 text-xs h-7 gap-1"
          >
            <Code className="h-3.5 w-3.5" />
            <span>View Indexability Criteria SQL</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-4">Entity Type</th>
                  <th className="py-2.5 px-4 text-center">Total Records</th>
                  <th className="py-2.5 px-4 text-center">Indexable (in Sitemap)</th>
                  <th className="py-2.5 px-4 text-center">Noindex (Shielded)</th>
                  <th className="py-2.5 px-4">Page Quality Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {[
                  {
                    type: "Tournaments",
                    total: stats.tournaments.total,
                    indexable: stats.tournaments.indexable,
                    noindex: stats.tournaments.noindex,
                    rule: "editorial_content > 100 chars OR matches >= 3",
                  },
                  {
                    type: "Teams",
                    total: stats.teams.total,
                    indexable: stats.teams.indexable,
                    noindex: stats.teams.noindex,
                    rule: "editorial_content > 100 chars OR (active roster + matches >= 1) OR matches >= 3",
                  },
                  {
                    type: "Players",
                    total: stats.players.total,
                    indexable: stats.players.indexable,
                    noindex: stats.players.noindex,
                    rule: "ign != '' AND (player_stats matches > 0 OR editorial_content > 100 chars)",
                  },
                  {
                    type: "Articles & News",
                    total: stats.blogs.total,
                    indexable: stats.blogs.indexable,
                    noindex: stats.blogs.noindex,
                    rule: "is_published = true",
                  },
                  {
                    type: "Games",
                    total: stats.games.total,
                    indexable: stats.games.indexable,
                    noindex: stats.games.noindex,
                    rule: "Primary category taxonomy hubs (All indexable)",
                  },
                ].map((row) => (
                  <tr key={row.type} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{row.type}</td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-300">
                      {row.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {row.indexable.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400">
                      {row.noindex.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{row.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        {/* Entity Type Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Entities" },
            { id: "player", label: "Players (18)" },
            { id: "team", label: "Teams (Sample)" },
            { id: "tournament", label: "Tournaments (Sample)" },
            { id: "blog", label: "Blogs (30)" },
            { id: "game", label: "Games (6)" },
          ].map((tab) => {
            const isActive = currentEntity === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateFilters({ entity: tab.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status Filter & Search Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Statuses" },
              { id: "indexable", label: "Indexable (index, follow)" },
              { id: "noindex", label: "Thin (noindex, follow)" },
            ].map((s) => {
              const isActive = currentStatus === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => updateFilters({ status: s.id })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white border border-zinc-700"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search entity or reason..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs h-9 focus-visible:ring-red-500"
            />
          </form>
        </div>
      </div>

      {/* Entity Indexability Audit Explorer */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Exact Reason / Audit Diagnostic</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    No entities found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={`${row.type}-${row.id}`} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Entity Name */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-white truncate">{row.name}</span>
                        <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {row.subtitle}
                        </span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="border-zinc-800 text-zinc-300 font-mono text-[10px] uppercase">
                        {row.type}
                      </Badge>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {row.isIndexable ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                          INDEXABLE
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold">
                          NOINDEX
                        </Badge>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-md">
                      <p className="text-zinc-300 text-xs leading-relaxed">
                        {row.reason}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!row.isIndexable && (
                          <Link href="/editorial">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2.5 border-zinc-800 text-amber-400 hover:bg-amber-500/10"
                            >
                              Add Lore
                            </Button>
                          </Link>
                        )}
                        <Link href={row.url}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indexability Rules Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  Indexability Criteria Predicates (src/lib/seo.js)
                </h3>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 max-h-[60vh] overflow-y-auto leading-relaxed">
              <div>
                <span className="text-emerald-400 font-bold block">// Tournaments Rule</span>
                <span className="text-zinc-400 block whitespace-pre-wrap">
{`LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 100
OR (
  EXISTS (
    SELECT 1 FROM matches m 
    WHERE m.tournament_id = t.id 
    HAVING COUNT(m.id) >= 3
  )
)`}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-emerald-400 font-bold block">// Teams Rule</span>
                <span className="text-zinc-400 block whitespace-pre-wrap">
{`LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 100
OR (
  EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id)
  AND EXISTS (SELECT 1 FROM matches m WHERE (m.team1_id = t.id OR m.team2_id = t.id) HAVING COUNT(m.id) >= 1)
)
OR (
  EXISTS (
    SELECT 1 FROM matches m 
    WHERE (m.team1_id = t.id OR m.team2_id = t.id) 
    HAVING COUNT(m.id) >= 3
  )
)`}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-emerald-400 font-bold block">// Players Rule</span>
                <span className="text-zinc-400 block whitespace-pre-wrap">
{`p.ign IS NOT NULL AND TRIM(p.ign) != ''
AND (
  EXISTS (SELECT 1 FROM player_stats ps WHERE ps.player_id = p.id AND ps.matches_played > 0)
  OR LENGTH(TRIM(COALESCE(p.editorial_content, ''))) > 100
)`}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-emerald-400 font-bold block">// Blogs Rule</span>
                <span className="text-zinc-400 block">b.is_published = true</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
              <span>Shared verbatim between Sitemaps and Page Metadata</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRuleModal(false)}
                className="border-zinc-800 text-zinc-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
