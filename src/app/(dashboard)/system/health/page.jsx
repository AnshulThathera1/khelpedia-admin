import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { getSystemHealth } from "@/lib/health";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Database,
  Cpu,
  ShieldCheck,
  Server,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "System Health & Diagnostics",
};

export const dynamic = "force-dynamic";

export default async function SystemHealthPage() {
  await requireAdmin(ADMIN_PERMISSIONS.SYSTEM_VIEW);
  const health = await getSystemHealth();

  const isHealthy = health.database.status === "healthy";

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              System Health & Diagnostics
            </h1>
            <Badge
              className={`font-mono text-xs ${
                isHealthy
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {isHealthy ? "ALL SYSTEMS OPERATIONAL" : "DATABASE DEGRADED"}
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time backend infrastructure telemetry, database latency, and runtime status.
          </p>
        </div>

        <Link
          href="/system/health"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Benchmark</span>
        </Link>
      </div>

      {/* Top 4 Telemetry Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Database Latency */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Database Latency
            </CardTitle>
            <Database className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {health.database.latencyMs !== null ? `${health.database.latencyMs}ms` : "N/A"}
            </div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{health.database.provider}</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Database Records */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Tracked Records
            </CardTitle>
            <Layers className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {health.database.totalTrackedRecords.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Across 7 core entity tables
            </p>
          </CardContent>
        </Card>

        {/* Node Memory Allocation */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Heap Memory
            </CardTitle>
            <Cpu className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {health.runtime.memory.heapUsedMb} MB
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Of {health.runtime.memory.heapTotalMb} MB total allocated
            </p>
          </CardContent>
        </Card>

        {/* Process Uptime */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Process Uptime
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">
              {Math.floor(health.application.uptimeSeconds / 60)}m {health.application.uptimeSeconds % 60}s
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Node {health.runtime.nodeVersion} on {health.runtime.platform}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Inventory Table & Security Policy */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Table Inventory */}
        <Card className="lg:col-span-4 bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-400" />
              <span>Database Table Inventory</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Exact live record counts retrieved from PostgreSQL cloud database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden font-mono text-xs">
              <div className="grid grid-cols-12 bg-zinc-900/80 px-4 py-2 text-zinc-400 font-semibold border-b border-zinc-800">
                <div className="col-span-5">Table</div>
                <div className="col-span-4 text-right">Row Count</div>
                <div className="col-span-3 text-right">State</div>
              </div>
              <div className="divide-y divide-zinc-900">
                {Object.entries(health.database.tableCounts).map(([table, count]) => (
                  <div key={table} className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-900/40">
                    <div className="col-span-5 text-zinc-200 font-medium">{table}</div>
                    <div className="col-span-4 text-right text-zinc-300 font-bold">
                      {count.toLocaleString()}
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ready</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Network Isolation Status */}
        <Card className="lg:col-span-3 bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span>Security & Network Isolation</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Active boundaries protecting this administration panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800/80 space-y-1">
                <span className="text-zinc-500 block text-[10px] uppercase">Robots Crawler Policy</span>
                <span className="text-zinc-200 font-semibold">{health.security.robotsPolicy}</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800/80 space-y-1">
                <span className="text-zinc-500 block text-[10px] uppercase">Anti-Indexing Response Header</span>
                <span className="text-zinc-200 font-semibold truncate block">{health.security.antiCrawlerHeaders}</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800/80 space-y-1">
                <span className="text-zinc-500 block text-[10px] uppercase">Clickjacking Defense</span>
                <span className="text-zinc-200 font-semibold">{health.security.frameOptions}</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800/80 space-y-1">
                <span className="text-zinc-500 block text-[10px] uppercase">Access Control Engine</span>
                <span className="text-emerald-400 font-semibold">{health.security.rbacStatus}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Listening Port:</span>
                <span className="text-zinc-200 font-mono">3001</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Execution Mode:</span>
                <span className="text-zinc-200 font-mono">{health.application.environment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Network Scope:</span>
                <span className="text-amber-400 font-mono">Local / LAN Only</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
