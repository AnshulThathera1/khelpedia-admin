"use client";

import { useState, useTransition } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Eye,
  X,
  Lock,
  Layers,
  CheckCircle2,
  FileText,
  Flame,
  Gamepad2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuditLogsAction } from "@/app/(dashboard)/actions/system-actions";

const CATEGORIES = ["ALL", "SECURITY", "SYSTEM", "CONTENT", "MONETIZATION", "DATA", "ACCESS"];

export function AuditClient({ initialLogs = [], totalCount = 0, userRole }) {
  const [logs, setLogs] = useState(initialLogs);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedLog, setSelectedLog] = useState(null);

  const handleFilter = (cat, search = searchQuery) => {
    setSelectedCategory(cat);
    startTransition(async () => {
      const res = await getAuditLogsAction({
        category: cat,
        search,
        limit: 100,
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    startTransition(async () => {
      const res = await getAuditLogsAction({
        category: selectedCategory,
        search: val,
        limit: 100,
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khelpedia_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Action", "Category", "Actor", "Role", "IP Address", "Details"];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.actorEmail}"`,
      `"${l.actorRole}"`,
      `"${l.ipAddress}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khelpedia_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "SECURITY":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "SYSTEM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "CONTENT":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "MONETIZATION":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DATA":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ACCESS":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Audit Trail & Administrative History
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono flex items-center gap-1"
                >
                  <Lock className="h-2.5 w-2.5" />
                  Tamper-Evident Store
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                Permanent chronological record of all administrative logins, entity modifications, security toggles, and sync runs.
              </p>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-zinc-700 bg-zinc-900 text-zinc-200 text-xs gap-1.5"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="border-zinc-700 bg-zinc-900 text-zinc-200 text-xs gap-1.5"
          >
            <Download className="h-3 w-3" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-zinc-800 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search action, actor, or details..."
            className="pl-8 bg-zinc-900/60 border-zinc-800 text-xs text-white"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action & Category</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Origin IP</th>
              <th className="py-3 px-4">Details Summary</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                  No audit log entries found matching criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-xs">{log.action}</div>
                    <Badge variant="outline" className={`text-[9px] mt-0.5 font-mono ${getCategoryBadgeClass(log.category)}`}>
                      {log.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-zinc-200 font-medium">{log.actorEmail}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{log.actorRole}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 max-w-sm truncate text-[11px]">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Event Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                <h3 className="font-semibold text-white text-sm">
                  Audit Event Details: {selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500">Action:</span>
                  <div className="text-white font-semibold">{selectedLog.action}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Category:</span>
                  <div>
                    <Badge variant="outline" className={`text-[9px] ${getCategoryBadgeClass(selectedLog.category)}`}>
                      {selectedLog.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Actor:</span>
                  <div className="text-zinc-300">{selectedLog.actorEmail} ({selectedLog.actorRole})</div>
                </div>
                <div>
                  <span className="text-zinc-500">Timestamp:</span>
                  <div className="text-zinc-300">{selectedLog.timestamp}</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 font-mono text-[11px]">Event Summary:</span>
                <p className="mt-1 p-2.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
                  {selectedLog.details}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-mono text-[11px]">Event Metadata (JSON):</span>
                <pre className="mt-1 p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="text-xs border-zinc-700 bg-zinc-800 text-zinc-200"
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
