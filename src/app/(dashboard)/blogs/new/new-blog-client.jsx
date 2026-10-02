"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Save,
  Send,
  Eye,
  Edit3,
  ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBlogAction } from "@/app/(dashboard)/actions/blog-actions";

export default function NewBlogClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "")
    );
  };

  const handleSubmit = (isPublished) => {
    setError("");

    if (!title.trim()) {
      setError("Please provide an article title.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("cover_image_url", coverImageUrl.trim());
    formData.append("excerpt", excerpt.trim());
    formData.append("content", content.trim());
    formData.append("is_published", isPublished ? "true" : "false");

    startTransition(async () => {
      const res = await createBlogAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to save article.");
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
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-500" />
            <span>Draft New Article</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
            disabled={isPending}
            onClick={() => handleSubmit(false)}
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 gap-1.5 h-8 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => handleSubmit(true)}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5 h-8 text-xs font-semibold shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish Article</span>
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Form */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-zinc-950 border-zinc-800 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
              Article Metadata
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
                placeholder="e.g. Sentinels Secure Grand Finals Berth in Dramatic Fashion"
                value={title}
                onChange={handleTitleChange}
                className="bg-zinc-900 border-zinc-800 text-white text-sm focus-visible:ring-red-500 h-10"
              />
            </div>

            {/* Slug & Cover Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug" className="text-zinc-300">
                    URL Slug
                  </Label>
                  {autoSlug && (
                    <span className="text-[10px] text-zinc-400 font-mono">Auto-generated</span>
                  )}
                </div>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-3 h-9 focus-within:ring-1 focus-within:ring-red-500">
                  <span className="text-zinc-400 font-mono text-xs">/blogs/</span>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
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
                  placeholder="https://images.unsplash.com/... or /storage/..."
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
                placeholder="A concise 1-2 sentence lead paragraph shown on the homepage feed and meta description..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
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
                HTML & Markdown formatting supported (paragraphs, headings &lt;h2&gt;, quotes, lists).
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
                <h1 className="text-2xl font-bold text-white mb-3">{title || "Untitled Article"}</h1>
                {excerpt && (
                  <p className="text-zinc-400 italic text-base mb-6 border-l-2 border-red-500 pl-3">
                    {excerpt}
                  </p>
                )}
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-zinc-400">No content entered yet.</p>
                )}
              </div>
            ) : (
              <textarea
                rows={16}
                placeholder="<p>Write your article body here...</p>

<h2>Match Analysis</h2>
<p>Breakdown of key clutches and tactical rounds...</p>"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed resize-y"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
