"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ImageIcon,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Shield,
  FileText,
  Gamepad2,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMediaAction, deleteMediaAction } from "@/app/(dashboard)/actions/media-actions";

export default function MediaClient({
  mediaItems,
  currentCategory,
  currentSearch,
  stats,
  permissions,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Upload file state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setActionError("");
    setActionSuccess("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      const res = await uploadMediaAction(formData);
      if (!res.success) {
        setActionError(res.error || "Upload failed.");
      } else {
        setActionSuccess("Media uploaded successfully.");
        setIsUploadOpen(false);
        setSelectedFile(null);
        setFilePreview(null);
        router.refresh();
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setActionError("");

    const formData = new FormData();
    formData.append("fileName", deletingItem.name);

    startTransition(async () => {
      const res = await deleteMediaAction(formData);
      setDeletingItem(null);
      if (!res.success) {
        setActionError(res.error || "Delete failed.");
      } else {
        router.refresh();
      }
    });
  };

  // Filter items locally
  const filteredItems = mediaItems.filter((item) => {
    const matchesCategory =
      currentCategory === "all" || item.category === currentCategory;

    const matchesSearch =
      currentSearch === "" ||
      item.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
      item.usedBy.toLowerCase().includes(currentSearch.toLowerCase()) ||
      item.url.toLowerCase().includes(currentSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ImageIcon className="h-7 w-7 text-red-500" />
              Media & Asset Library
            </h1>
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-xs">
              {stats.totalCount} Assets
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Upload, preview, copy URLs, and inspect where team crests, game banners, and blog graphics are deployed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canUpload && (
            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm text-xs"
            >
              <Upload className="h-4 w-4" />
              <span>Upload New Media</span>
            </Button>
          )}
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
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Active Media</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalCount}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Referenced Assets</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <FolderOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Storage Bucket</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{stats.uploadedCount}</p>
              <p className="text-[11px] text-purple-400/80 mt-0.5">khelpedia-media bucket</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Upload className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Team Logos</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.logosCount}</p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Organization Crests</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Editorial Covers</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.coversCount}</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">Article Banners</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Media", count: stats.totalCount },
            { id: "uploaded", label: "Uploaded Files", count: stats.uploadedCount },
            { id: "logos", label: "Team Logos", count: stats.logosCount },
            { id: "covers", label: "Article Covers", count: stats.coversCount },
            { id: "icons", label: "Game Icons", count: stats.iconsCount },
          ].map((tab) => {
            const isActive = currentCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateFilters({ category: tab.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            placeholder="Search asset or entity..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs h-9 focus-visible:ring-red-500"
          />
        </form>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <Card className="bg-zinc-950 border-zinc-800 p-12 text-center">
          <ImageIcon className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">No media items found</p>
          <p className="text-xs text-zinc-400 mt-1">
            No assets match the selected filter or search term.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const isCopied = copiedUrl === item.url;

            return (
              <Card
                key={item.id}
                className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden flex flex-col group"
              >
                {/* Image Preview Box */}
                <div
                  onClick={() => setPreviewMedia(item)}
                  className="aspect-video w-full bg-zinc-900 flex items-center justify-center p-3 relative cursor-pointer overflow-hidden border-b border-zinc-800/80"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`text-[9px] uppercase font-mono px-1 py-0 ${
                        item.category === "uploaded"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : item.category === "logos"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          : item.category === "icons"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {item.category}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <CardContent className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                  <div>
                    <h4
                      className="font-medium text-white truncate text-xs"
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                    <p
                      className="text-[11px] text-zinc-400 truncate mt-0.5"
                      title={item.usedBy}
                    >
                      {item.usedBy}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(item.url)}
                      className={`h-6 text-[10px] px-2 border-zinc-800 flex items-center gap-1 ${
                        isCopied ? "text-emerald-400 border-emerald-500/30" : "text-zinc-300"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-1">
                      {item.entityUrl && (
                        <Link href={item.entityUrl} title="Go to entity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-400 hover:text-white">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}

                      {item.isUploaded && permissions.canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingItem(item)}
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete file"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-red-500" />
                Upload to Storage Bucket
              </h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                }}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-red-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-900/40"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                />

                {filePreview ? (
                  <div className="space-y-2">
                    <img
                      src={filePreview}
                      alt="Upload preview"
                      className="max-h-40 mx-auto rounded object-contain border border-zinc-800"
                    />
                    <p className="text-zinc-300 font-medium">{selectedFile?.name}</p>
                    <p className="text-[11px] text-zinc-400">
                      {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-zinc-500 mx-auto" />
                    <p className="text-zinc-200 font-medium">Click to select an image</p>
                    <p className="text-[11px] text-zinc-400">
                      PNG, JPEG, WebP, SVG, GIF up to 10 MB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="border-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!selectedFile || isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs"
                >
                  {isPending ? "Uploading..." : "Upload File"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {previewMedia.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{previewMedia.usedBy}</p>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center bg-zinc-900/60 rounded-lg p-4 border border-zinc-800 overflow-hidden">
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-h-[50vh] max-w-full object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
              <span className="font-mono text-zinc-400 truncate max-w-sm text-[11px]">
                {previewMedia.url}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(previewMedia.url)}
                className="gap-1 border-zinc-800 text-zinc-200"
              >
                <Copy className="h-3 w-3" />
                <span>Copy URL</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-900/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Delete File from Storage</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deletingItem.name}</strong> from the storage bucket?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingItem(null)}
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
