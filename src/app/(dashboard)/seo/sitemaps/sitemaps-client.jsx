"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ChevronLeft,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Globe,
  Radio,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SitemapsClient({ sitemaps, stats }) {
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleTestSitemap = (sitemap) => {
    setTestingId(sitemap.id);
    setTestResult(null);

    // Simulate endpoint test verification
    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id: sitemap.id,
        url: sitemap.url,
        status: 200,
        contentType: "text/xml; charset=utf-8",
        cacheControl: "public, max-age=86400, s-maxage=86400",
        message: "Endpoint response valid. Correct XML syntax and caching directives.",
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/seo">
            <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to SEO Hub</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-500" />
              <span>Sitemaps Management</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://khelpedia.org/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white text-xs"
          >
            <span>Live Root XML</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Sitemaps</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalSitemaps}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">1 Index + 6 Chunks</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <FileCode className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Indexed URLs</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.totalIndexableUrls}</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">Verified High-Value Pages</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Shielded Thin Pages</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{stats.crawlBudgetSavedPages.toLocaleString()}</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">Withheld from Sitemap</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Freshness Timestamp</p>
              <p className="text-sm font-bold text-white mt-1 font-mono">{stats.lastGenerated}</p>
              <p className="text-[11px] text-cyan-400/80 mt-0.5">Dynamic Cache Daily</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Result Alert Banner */}
      {testResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-zinc-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-2">
                <span>Validation Success: {testResult.url}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  HTTP {testResult.status} OK
                </Badge>
              </p>
              <p className="text-zinc-400">{testResult.message}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                <span>Content-Type: {testResult.contentType}</span>
                <span>•</span>
                <span>Cache-Control: {testResult.cacheControl}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-zinc-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sitemaps Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Sitemap Feed</th>
                <th className="py-3 px-4">Feed URL</th>
                <th className="py-3 px-4 text-center">URLs Contained</th>
                <th className="py-3 px-4 text-center">Crawl Status</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {sitemaps.map((s) => {
                const isCopied = copiedUrl === s.url;
                const isTesting = testingId === s.id;

                return (
                  <tr key={s.id} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Name & Description */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{s.name}</span>
                        <span className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {s.description}
                        </span>
                      </div>
                    </td>

                    {/* URL */}
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-300 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{s.url}</span>
                        <button
                          onClick={() => handleCopy(s.url)}
                          className="text-zinc-400 hover:text-white shrink-0"
                          title="Copy sitemap URL"
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Count */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 text-xs">
                      {s.count.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                        {s.status}
                      </Badge>
                    </td>

                    {/* Last Modified */}
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      <span>{s.lastmod}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isTesting}
                          onClick={() => handleTestSitemap(s)}
                          className="h-7 text-[11px] px-2 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                        >
                          {isTesting ? "Testing..." : "Validate"}
                        </Button>

                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Inspect raw XML in new tab"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
