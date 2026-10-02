"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Save,
  Trash2,
  Eye,
  Edit3,
  ImageIcon,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBlogAction, deleteBlogAction } from "@/app/(dashboard)/actions/blog-actions";

export default function EditBlogClient({ blog }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(blog.title || "");
  const [slug, setSlug] = useState(blog.slug || "");
  const [coverImageUrl, setCoverImageUrl] = useState(blog.cover_image_url || "");
  const [excerpt, setExcerpt] = useState(blog.excerpt || "");
  const [content, setContent] = useState(blog.content || "");
  const [isPublished, setIsPublished] = useState(Boolean(blog.is_published));
  const [isPreview, setIsPreview] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Article title cannot be empty.");
      return;
    }

    const formData = new FormData();
    formData.append("id", blog.id);
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("cover_image_url", coverImageUrl.trim());
    formData.append("excerpt", excerpt.trim());
    formData.append("content", content.trim());
    formData.append("is_published", isPublished ? "true" : "false");

    startTransition(async () => {
      const res = await updateBlogAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to update article.");
      } else {
        setSuccess("Article updated successfully.");
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    setError("");
    const formData = new FormData();
    formData.append("id", blog.id);

    startTransition(async () => {
      const res = await deleteBlogAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to delete article.");
      } else {
        router.push("/blogs");
      }
    });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/blogs">
            <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Articles</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span>Edit Article</span>
            </h1>
            <Badge
              className={`text-[10px] ${
                isPublished
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {isPublished ? "Live Published" : "Draft"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {blog.is_published && (
            <a
              href={`https://khelpedia.org/blogs/${blog.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900"
            >
              <span>View Live</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1.5 h-8 text-xs"
          >
            {isPreview ? (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editor</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="border-red-900/40 text-red-400 hover:bg-red-950/40 h-8 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5 h-8 text-xs font-semibold shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isPending ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-zinc-950 border-zinc-800 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
              Article Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-zinc-200 font-semibold">
                Article Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-sm focus-visible:ring-red-500 h-10"
              />
            </div>

            {/* Slug & Cover Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-zinc-300">
                  URL Slug
                </Label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-3 h-9 focus-within:ring-1 focus-within:ring-red-500">
                  <span className="text-zinc-400 font-mono text-xs">/blogs/</span>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-transparent border-0 text-white font-mono text-xs w-full focus:outline-none pl-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cover" className="text-zinc-300">
                    Cover Image URL
                  </Label>
                  <Link href="/media" target="_blank" className="text-[11px] text-red-400 hover:underline flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>Media Library</span>
                  </Link>
                </div>
                <Input
                  id="cover"
                  type="url"
                  placeholder="https://..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white h-9"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label htmlFor="excerpt" className="text-zinc-300">
                Short Excerpt / Summary
              </Label>
              <textarea
                id="excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Publishing Status Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">Publishing Status</span>
                <span className="text-[11px] text-zinc-400 block">
                  {isPublished
                    ? "Article is publicly indexable and visible on KhelPediA."
                    : "Article is saved as an unlisted draft."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? "bg-emerald-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Content Body Card */}
        <Card className="bg-zinc-950 border-zinc-800 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-zinc-800/80">
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                Article Body
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                HTML markup formatting supported.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
              <span>{wordCount} Words</span>
              <span>•</span>
              <span>{charCount} Characters</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isPreview ? (
              <div className="min-h-[360px] p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-200 prose prose-invert max-w-none text-sm leading-relaxed">
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full max-h-72 object-cover rounded-lg mb-6 border border-zinc-800"
                  />
                )}
                <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
                {excerpt && (
                  <p className="text-zinc-400 italic text-base mb-6 border-l-2 border-red-500 pl-3">
                    {excerpt}
                  </p>
                )}
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <textarea
                rows={18}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed resize-y"
              />
            )}
          </CardContent>
        </Card>
      </form>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-900/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Delete Article</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>&ldquo;{blog.title}&rdquo;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(false)}
                className="border-zinc-800 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
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
