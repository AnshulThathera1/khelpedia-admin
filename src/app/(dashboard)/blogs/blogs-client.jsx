"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  toggleBlogPublishAction,
  deleteBlogAction,
} from "@/app/(dashboard)/actions/blog-actions";

export default function BlogsClient({
  blogs,
  totalCount,
  page,
  limit,
  currentStatus,
  currentSearch,
  stats,
  permissions,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [actionError, setActionError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!("page" in updates)) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleTogglePublish = async (blog) => {
    setActionError("");
    setTogglingId(blog.id);

    const formData = new FormData();
    formData.append("id", blog.id);
    formData.append("current_status", blog.is_published ? "true" : "false");

    startTransition(async () => {
      const res = await toggleBlogPublishAction(formData);
      setTogglingId(null);
      if (!res.success) {
        setActionError(res.error || "Failed to toggle article status.");
      } else {
        router.refresh();
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBlog) return;
    setActionError("");

    const formData = new FormData();
    formData.append("id", deletingBlog.id);

    startTransition(async () => {
      const res = await deleteBlogAction(formData);
      setDeletingBlog(null);
      if (!res.success) {
        setActionError(res.error || "Failed to delete article.");
      } else {
        router.refresh();
      }
    });
  };

  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <FileText className="h-7 w-7 text-red-500" />
              Articles & News Management
            </h1>
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-xs">
              {stats.total} Articles
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Author, edit, review, and schedule esports journalism, event reports, and feature stories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/editorial">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Editorial Hub</span>
            </Button>
          </Link>

          <Link href="/media">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span>Media Library</span>
            </Button>
          </Link>

          {permissions.canCreate && (
            <Link href="/blogs/new">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Draft New Article</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Global Error Banner */}
      {actionError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Articles</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Database Archive</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Published Live</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.published}</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">Visible on KhelPediA</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Drafts / In Review</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{stats.drafts}</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">Unpublished Content</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Publishing Policy</p>
              <p className="text-lg font-bold text-white mt-1">Manual Approval</p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Zero auto-publishing</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: "All Articles", count: stats.total },
            { id: "published", label: "Published", count: stats.published },
            { id: "draft", label: "Drafts", count: stats.drafts },
          ].map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateFilters({ status: tab.id })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-zinc-700/60 text-zinc-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search by title or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs h-9 focus-visible:ring-red-500"
          />
        </form>
      </div>

      {/* Articles Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Views</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isPending ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                      <span>Loading articles...</span>
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <FileText className="h-10 w-10 text-zinc-600 mx-auto" />
                      <p className="text-sm font-medium text-white">No articles found</p>
                      <p className="text-xs text-zinc-400">
                        No articles match the current filter or search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs.map((b) => {
                  const authorName = b.author?.display_name || "Editorial Staff";
                  const dateStr = b.created_at
                    ? new Date(b.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unknown";

                  return (
                    <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Title & Slug */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          {b.cover_image_url ? (
                            <img
                              src={b.cover_image_url}
                              alt=""
                              className="h-10 w-14 rounded object-cover bg-zinc-800 shrink-0 border border-zinc-800"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/blogs/edit/${b.id}`}
                              className="font-bold text-white hover:text-red-400 transition-colors truncate block"
                              title={b.title}
                            >
                              {b.title}
                            </Link>
                            <span className="font-mono text-[11px] text-zinc-400 truncate mt-0.5">
                              /{b.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                        <span className="font-medium">{authorName}</span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                        <span>{dateStr}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {b.is_published ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            Published
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            Draft
                          </Badge>
                        )}
                      </td>

                      {/* Views */}
                      <td className="py-3 px-4 text-center font-mono text-zinc-300 whitespace-nowrap">
                        {b.views ? b.views.toLocaleString() : "0"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {permissions.canPublish && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={togglingId === b.id}
                              onClick={() => handleTogglePublish(b)}
                              className={`h-7 text-[11px] px-2.5 border-zinc-800 ${
                                b.is_published
                                  ? "text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10"
                                  : "text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {togglingId === b.id
                                ? "Updating..."
                                : b.is_published
                                ? "Unpublish"
                                : "Publish"}
                            </Button>
                          )}

                          <Link href={`/blogs/edit/${b.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2 border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </Button>
                          </Link>

                          {permissions.canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingBlog(b)}
                              className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-800/80 bg-zinc-900/40 text-xs text-zinc-400">
          <div>
            Showing <span className="font-semibold text-white">{startIndex}</span> to{" "}
            <span className="font-semibold text-white">{endIndex}</span> of{" "}
            <span className="font-semibold text-white">{totalCount}</span> articles
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => updateFilters({ page: (page - 1).toString() })}
              className="h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-[11px]">
              Page {page} of {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => updateFilters({ page: (page + 1).toString() })}
              className="h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-900/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Delete Article</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>&ldquo;{deletingBlog.title}&rdquo;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingBlog(null)}
                className="border-zinc-800 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
