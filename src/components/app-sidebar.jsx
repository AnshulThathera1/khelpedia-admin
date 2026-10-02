"use client";

import {
  Home,
  Users,
  Trophy,
  FileText,
  Swords,
  LogOut,
  ChevronUp,
  Shield,
  Gamepad2,
  Search,
  Settings,
  Flame,
  Radio,
  BarChart3,
  Layers,
  Sparkles,
  UserCheck,
  Activity,
  ShieldAlert,
  BookOpen,
  ImageIcon,
  Lock,
  Globe,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_METADATA } from "@/lib/rbac";

const navigationGroups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/overview", icon: Home },
    ],
  },
  {
    label: "Competition & Data",
    items: [
      { title: "Matches", url: "/matches", icon: Swords },
      { title: "Statistics", url: "/matches/stats", icon: BarChart3 },
      { title: "Data Quality", url: "/data-quality", icon: ShieldAlert },
    ],
  },
  {
    label: "Entities & Esports",
    items: [
      { title: "Teams", url: "/teams", icon: Shield },
      { title: "Players", url: "/players", icon: UserCheck },
      { title: "Tournaments", url: "/tournaments", icon: Trophy },
      { title: "Games", url: "/games", icon: Gamepad2 },
    ],
  },
  {
    label: "Content & Editorial",
    items: [
      { title: "Articles & News", url: "/blogs", icon: FileText },
      { title: "Editorial Hub", url: "/editorial", icon: BookOpen },
      { title: "Media Library", url: "/media", icon: ImageIcon },
    ],
  },
  {
    label: "SEO & Growth",
    items: [
      { title: "SEO & Indexability", url: "/seo", icon: Globe },
      { title: "Sitemaps", url: "/seo/sitemaps", icon: Layers },
    ],
  },
  {
    label: "Monetization & Ads",
    items: [
      { title: "Advertising & Adsterra", url: "/advertising", icon: Flame },
    ],
  },
  {
    label: "Automation & Ingestion",
    items: [
      { title: "Ingestion & AI Jobs", url: "/ingestion", icon: Sparkles },
    ],
  },
  {
    label: "Access & System",
    items: [
      { title: "Users & Accounts", url: "/users", icon: Users },
      { title: "System Health", url: "/system/health", icon: Activity },
      { title: "System Settings", url: "/system/settings", icon: Settings },
      { title: "Audit Trail", url: "/system/audit-logs", icon: ShieldAlert },
    ],
  },
];

export function AppSidebar({ adminUser }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const userEmail = adminUser?.user?.email || "admin@khelpedia.org";
  const displayName =
    adminUser?.profile?.display_name ||
    userEmail.split("@")[0] ||
    "Administrator";
  const roleKey = adminUser?.role || "SUPER_ADMIN";
  const roleMeta = ROLE_METADATA[roleKey] || {
    name: "Admin",
    badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const handleSignOut = async () => {
    try {
      window.location.href = "/auth/signout";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <Sidebar variant="inset" className="border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm text-white">
              KhelPediA
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                Control Center
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Environment Status Badge */}
        <div className="mt-3 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Lock className="h-3 w-3" />
            <span>Secure Admin</span>
          </span>
          <span className="text-zinc-400">v1.0.0</span>
        </div>
      </SidebarHeader>

      {/* Nav Content */}
      <SidebarContent className="px-2 py-3">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-2">
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono px-3 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/overview" && pathname.startsWith(item.url));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.url}
                            onClick={() => {
                              if (isMobile) {
                                setOpenMobile(false);
                              }
                            }}
                          />
                        }
                        isActive={isActive}
                        className={`flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-zinc-800 text-white font-semibold"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer / User Profile */}
      <SidebarFooter className="p-3 border-t border-zinc-800/80">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between p-2 h-auto rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition-colors text-left cursor-pointer outline-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0 text-xs font-bold text-zinc-300">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start min-w-0 text-left">
                    <span className="text-xs font-medium text-white truncate max-w-[120px]">
                      {displayName}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded border mt-0.5 font-mono ${roleMeta.badgeClass}`}
                    >
                      {roleMeta.name}
                    </span>
                  </div>
                </div>
                <ChevronUp className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl p-1.5"
              >
                <div className="px-2 py-1.5 border-b border-zinc-800 text-xs">
                  <p className="font-medium text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">{userEmail}</p>
                </div>
                <div className="px-2 py-1 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>Session</span>
                  <span className="text-emerald-400">Authenticated</span>
                </div>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-300 text-xs cursor-pointer rounded-md mt-1"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
