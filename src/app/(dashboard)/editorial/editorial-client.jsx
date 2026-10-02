"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Edit,
  Save,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  Trophy,
  Users,
  Gamepad2,
  FileText,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEditorialAction } from "@/app/(dashboard)/actions/entity-actions";

export default function EditorialClient({
  entities,
  currentType,
  currentDensity,
  currentSearch,
  stats,
  canEdit,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [editingItem, setEditingItem] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

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

  const openEditor = (item) => {
    setEditingItem(item);
    setEditContent(item.content || "");
    setActionError("");
    setActionSuccess("");
  };

  const handleSaveEditorial = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setActionError("");
    setActionSuccess("");

    const formData = new FormData();
    formData.append("entity_type", editingItem.type);
    formData.append("id", editingItem.id);
    formData.append("content", editContent.trim());

    startTransition(async () => {
      const res = await updateEditorialAction(formData);
      if (!res.success) {
        setActionError(res.error || "Failed to update editorial content.");
      } else {
        setActionSuccess("Editorial content updated successfully.");
        setEditingItem(null);
        router.refresh();
      }
    });
  };

  // Filter entities locally
  const filteredEntities = entities.filter((item) => {
    const matchesType = currentType === "all" || item.type === currentType;

    const charCount = item.content ? item.content.length : 0;
    const matchesDensity =
      currentDensity === "all" ||
      (currentDensity === "rich" && charCount >= 200) ||
      (currentDensity === "thin" && charCount < 200);

    const matchesSearch =
      currentSearch === "" ||
      item.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(currentSearch.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(currentSearch.toLowerCase()));

    return matchesType && matchesDensity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <BookOpen className="h-7 w-7 text-red-500" />
              Editorial Content Hub
            </h1>
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-xs">
              Cross-Entity Management
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Maintain unique, high-density lore, history, guides, and journalism across all teams, tournaments, players, games, and blogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/blogs/new">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm text-xs">
              <FileText className="h-4 w-4" />
              <span>Draft Blog Article</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      {actionError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Entities</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalTracked.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Teams, Tourneys, Blogs</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Enriched Editorial</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {stats.richContentCount}
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">&gt; 200 chars unique lore</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Needs Editorial Copy</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {(stats.totalTracked - stats.richContentCount).toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">Thin or missing copy</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">SEO Indexing Rule</p>
              <p className="text-sm font-bold text-white mt-1">src/lib/seo.js</p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Enriched = index, follow</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        {/* Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Entities" },
            { id: "blog", label: "Articles & News", icon: FileText, count: stats.blogsCount },
            { id: "team", label: "Teams", icon: Shield, count: stats.teamsCount },
            { id: "tournament", label: "Tournaments", icon: Trophy, count: stats.tourneysCount },
            { id: "player", label: "Players", icon: Users, count: stats.playersCount },
            { id: "game", label: "Games", icon: Gamepad2, count: stats.gamesCount },
          ].map((tab) => {
            const isActive = currentType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateFilters({ type: tab.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50"
                }`}
              >
                {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-700/60 text-zinc-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Density Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Density" },
              { id: "rich", label: "Enriched (> 200 chars)" },
              { id: "thin", label: "Needs Content (< 200 chars)" },
            ].map((d) => {
              const isActive = currentDensity === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => updateFilters({ density: d.id })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white border border-zinc-700"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search entity or copy..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs h-9 focus-visible:ring-red-500"
            />
          </form>
        </div>
      </div>

      {/* Editorial Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Editorial Snippet Preview</th>
                <th className="py-3 px-4 text-center">Density</th>
                <th className="py-3 px-4 text-center">SEO State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No entities found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEntities.map((item) => {
                  const plainSnippet = item.content
                    ? item.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
                    : "No editorial content recorded yet.";
                  const charCount = item.content ? item.content.length : 0;
                  const wordCount = plainSnippet ? plainSnippet.split(/\s+/).length : 0;
                  const isRich = charCount >= 200;

                  return (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Entity Title & Subtitle */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="flex flex-col">
                          <Link
                            href={item.url}
                            className="font-bold text-white hover:text-red-400 transition-colors truncate block"
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className="border-zinc-800 text-zinc-300 font-mono text-[10px] uppercase">
                          {item.type}
                        </Badge>
                      </td>

                      {/* Snippet Preview */}
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-zinc-300 line-clamp-2 leading-relaxed text-[11px]">
                          {plainSnippet}
                        </p>
                      </td>

                      {/* Density */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[11px]">
                        <span className={isRich ? "text-emerald-400 font-bold" : "text-amber-400"}>
                          {charCount} chars
                        </span>
                        <span className="text-zinc-400 block text-[10px]">{wordCount} words</span>
                      </td>

                      {/* SEO State */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isRich ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            Indexable Rich
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            Needs Copy
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditor(item)}
                              className="h-7 text-[11px] px-2.5 border-zinc-800 text-zinc-200 hover:bg-zinc-800 gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit Copy</span>
                            </Button>
                          )}
                          <Link href={item.url}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                              title="Inspect Entity"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Editorial Drawer / Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                    {editingItem.type}
                  </Badge>
                  <h3 className="text-base font-bold text-white">
                    Edit Editorial Content: {editingItem.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Write unique lore, history, playstyle analysis, or tournament guides. HTML markup is supported.
                </p>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveEditorial} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-zinc-300">
                    Editorial Text / HTML Content
                  </Label>
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                    <span className={editContent.length >= 200 ? "text-emerald-400" : "text-amber-400"}>
                      {editContent.length} chars
                    </span>
                    <span>•</span>
                    <span>{editContent.trim() ? editContent.trim().split(/\s+/).length : 0} words</span>
                  </div>
                </div>
                <textarea
                  id="content"
                  rows={12}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="<p>Write detailed editorial history, background, rivalry analysis, and achievements...</p>"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <span className="text-[11px] text-zinc-400">
                  Target &gt; 200 characters to qualify for search indexation.
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(null)}
                    className="border-zinc-800 text-zinc-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    {isPending ? "Saving..." : "Save Editorial Copy"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
