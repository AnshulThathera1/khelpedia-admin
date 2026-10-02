import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  // Enforce server-side authentication and admin authorization
  const adminData = await requireAdmin()

  return (
    <SidebarProvider>
      <AppSidebar adminUser={adminData} />
      <main className="w-full flex-1 relative min-h-screen bg-zinc-950">
        <div className="flex items-center justify-between px-3.5 py-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-zinc-400 hover:text-white" />
            <div className="flex sm:hidden items-center gap-1.5">
              <span className="font-bold tracking-tight text-xs text-white">
                KhelPediA
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Admin
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Production Control Center</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] sm:text-[11px] text-emerald-400 font-medium">
              Live DB Synced
            </span>
          </div>
        </div>
        <div className="p-3.5 sm:p-5 md:p-8 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
