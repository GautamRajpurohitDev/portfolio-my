"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Layers,
  Award,
  Flag,
  Rss,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  Rows4,
  Image as ImageIcon,
  Map,
  FileText,
  Search,
  History,
  ShieldCheck,
  Star,
  WifiOff,
} from "lucide-react";
import { AdminCommandPalette } from "@/components/admin/ui/AdminCommandPalette";
import { AdminCreateMenu } from "@/components/admin/ui/AdminCreateMenu";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";

// ── Layout Constants ──────────────────────────────────────────
const SIDEBAR_EXPANDED_WIDTH = "w-[240px]";
const SIDEBAR_COLLAPSED_WIDTH = "w-[68px]";

interface AdminNavItemType {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface AdminNavGroupType {
  number: string;
  label: string;
  items: AdminNavItemType[];
}

// ── Technical Navigation Structure ─────────────────────────────
const NAV_GROUPS: AdminNavGroupType[] = [
  {
    number: "01",
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    number: "02",
    label: "CONTENT",
    items: [
      { name: "Projects",     href: "/admin/projects",     icon: FolderKanban },
      { name: "Journey",      href: "/admin/journey",      icon: BookOpen },
      { name: "Updates",      href: "/admin/updates",      icon: Rss },
      { name: "Skills",       href: "/admin/skills",       icon: Layers },
      { name: "Certificates", href: "/admin/certificates", icon: Award },
      { name: "Milestones",   href: "/admin/milestones",   icon: Flag },
      { name: "Media",        href: "/admin/media",        icon: ImageIcon },
      { name: "Resume",       href: "/admin/resume",       icon: FileText },
    ],
  },
  {
    number: "03",
    label: "PORTFOLIO",
    items: [
      { name: "Home / Hero",   href: "/admin/home",     icon: Home },
      { name: "About",         href: "/admin/about",    icon: BookOpen },
      { name: "Roadmap",       href: "/admin/roadmap",  icon: Map },
      { name: "Page Sections", href: "/admin/sections", icon: Rows4 },
    ],
  },
  {
    number: "04",
    label: "SYSTEM",
    items: [
      { name: "Activity", href: "/admin/activity", icon: History },
      { name: "Security", href: "/admin/security", icon: ShieldCheck },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const ALL_NAV_ITEMS: AdminNavItemType[] = NAV_GROUPS.flatMap((g) => g.items);

function NavItem({
  item,
  pathname,
  isCollapsed,
}: {
  item: AdminNavItemType;
  itemIndex?: number;
  pathname: string | null;
  isCollapsed?: boolean;
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.name : undefined}
      aria-label={item.name}
      className={`
        relative flex items-center h-8.5 w-full rounded text-[13px]
        transition-colors duration-150 group outline-none select-none
        focus-visible:ring-1 focus-visible:ring-primary/50
        ${
          isActive
            ? "bg-white/[0.04] text-text-primary font-medium border-l-2 border-primary"
            : "text-text-secondary hover:text-text-primary hover:bg-white/[0.02] border-l-2 border-transparent"
        }
        ${isCollapsed ? "justify-center px-0" : "px-3 gap-2.5"}
      `}
    >
      <Icon
        size={14}
        className={`flex-shrink-0 transition-colors duration-150 ${
          isActive
            ? "text-primary"
            : "text-text-muted group-hover:text-text-primary"
        }`}
      />
      {!isCollapsed && (
        <span className="truncate font-body">{item.name}</span>
      )}
      {isActive && (
        <span className="absolute right-2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function SidebarContent({
  pathname,
  logout,
  isCollapsed,
  onToggleCollapse,
  pinnedRoutes = [],
}: {
  pathname: string | null;
  logout: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  pinnedRoutes?: string[];
}) {
  const pinnedNavItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => pinnedRoutes.includes(item.href));
  }, [pinnedRoutes]);

  return (
    <div className="flex flex-col h-full select-none">
      {/* ── Brand Header Rail ─────────────────────────────────── */}
      <div className="h-12 border-b border-white/[0.08] px-3.5 flex items-center justify-between flex-shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 min-w-0 outline-none group"
        >
          <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-clash font-bold text-primary shrink-0 group-hover:border-primary transition-colors">
            GR
          </div>
          {!isCollapsed && (
            <div className="min-w-0 leading-tight">
              <span className="font-clash font-bold text-[11px] text-text-primary tracking-wide uppercase truncate block">
                GAUTAM RAJPUROHIT
              </span>
              <span className="text-[9px] font-mono text-primary uppercase tracking-widest block opacity-90">
                ADMIN / OS
              </span>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={13} />
            ) : (
              <PanelLeftClose size={13} />
            )}
          </button>
        )}
      </div>

      {/* ── Navigation Group Items ────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 admin-scrollbar font-body"
        aria-label="Admin Navigation"
      >
        {/* Pinned Favorites Section */}
        {pinnedNavItems.length > 0 && !isCollapsed && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono text-primary font-bold tracking-[0.18em] uppercase">
              <Star size={9} className="fill-primary" />
              <span>FAVORITES</span>
            </div>
            <div className="space-y-0.5">
              {pinnedNavItems.map((item) => (
                <NavItem
                  key={`fav-${item.href}`}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
            <div className="h-px bg-white/[0.04] my-2" />
          </div>
        )}

        {NAV_GROUPS.map((group) => (
          <div key={group.number} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-0.5 text-[9px] font-mono text-text-muted font-bold tracking-[0.18em] uppercase">
                {group.number} / {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Operator Footer ───────────────────────────────────── */}
      <div className="border-t border-white/[0.08] p-2.5 flex-shrink-0">
        <button
          onClick={logout}
          aria-label="Sign out"
          className={`flex items-center gap-2.5 w-full h-8 px-2.5 rounded text-xs font-body text-text-muted hover:text-red-400 hover:bg-red-500/[0.06] transition-colors cursor-pointer ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Sign out of Admin"
        >
          <LogOut size={13} className="shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

function getBreadcrumb(pathname: string | null): { section: string; sectionHref: string; current: string } {
  if (!pathname || pathname === "/admin") {
    return { section: "CONSOLE", sectionHref: "/admin", current: "Overview" };
  }

  const segments = pathname.split("/").filter(Boolean);
  const resource = segments[1];
  const action = segments[2];

  const matched = ALL_NAV_ITEMS.find((item) => item.href === `/admin/${resource}`);
  const resourceLabel = matched ? matched.name : resource ? resource.charAt(0).toUpperCase() + resource.slice(1) : "Overview";

  if (action === "new") {
    return { section: resourceLabel.toUpperCase(), sectionHref: `/admin/${resource}`, current: "Create Record" };
  }
  if (action && segments[3] === "edit") {
    return { section: resourceLabel.toUpperCase(), sectionHref: `/admin/${resource}`, current: "Edit Record" };
  }

  return { section: "WORKSPACE", sectionHref: "/admin", current: resourceLabel };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { pinnedRoutes, isOnline } = useAdminWorkspace();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Restore sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Escape -> close mobile nav
      if (e.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen]);

  // Close mobile nav on route transition
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Auth gate
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
            <span className="text-xs font-clash font-bold text-primary">GR</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted tracking-widest uppercase">
            AUTHENTICATING SYSTEM…
          </span>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="min-h-screen flex bg-[#080808] text-text-primary overflow-hidden admin-grain">
      {/* ── Global Command Palette ─────────────────────────────── */}
      <AdminCommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />

      {/* ── Desktop Sidebar Rail ───────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-shrink-0 flex-col bg-[#080808] border-r border-white/[0.08] sticky top-0 h-screen z-30 transition-[width] duration-200 ease-out overflow-hidden ${
          isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH
        }`}
      >
        <SidebarContent
          pathname={pathname}
          logout={logout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleCollapse}
          pinnedRoutes={pinnedRoutes}
        />
      </aside>

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-[#080808] border-r border-white/[0.08] z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <SidebarContent
                pathname={pathname}
                logout={logout}
                isCollapsed={false}
                pinnedRoutes={pinnedRoutes}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main App Content ───────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* ── Mobile Top Header Bar (Natural Flow) ───────────────── */}
        <header className="lg:hidden flex items-center justify-between h-14 border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur-md px-4 flex-shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 border border-primary/30 rounded flex items-center justify-center">
              <span className="text-[10px] font-clash font-bold text-primary">GR</span>
            </div>
            <span className="text-xs font-clash font-bold tracking-wide uppercase">
              ADMIN / OS
            </span>
            {!isOnline && (
              <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-mono text-red-400 font-bold">
                OFFLINE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-1.5 rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Search / Commands (Ctrl+K)"
              aria-label="Search and Commands"
            >
              <Search size={15} />
            </button>
            <AdminCreateMenu />
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-1.5 rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </header>

        {/* ── Desktop Modern Top Header Bar ───────────────────── */}
        <header className="hidden lg:flex items-center justify-between h-12 px-8 border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] font-mono select-none">
            <Link
              href={breadcrumb.sectionHref}
              className="text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider"
            >
              {breadcrumb.section}
            </Link>
            <ChevronRight size={10} className="text-text-muted opacity-50" />
            <span className="text-text-primary font-medium tracking-wide">
              {breadcrumb.current}
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 h-7 px-2.5 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-body text-text-muted hover:text-text-secondary transition-all cursor-pointer select-none"
              title="Search and commands (Ctrl + K)"
            >
              <Search size={11} className="text-text-muted shrink-0" />
              <span className="hidden xl:inline text-text-muted text-[11px]">Command…</span>
              <kbd className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-white/[0.05] border border-white/[0.08] text-[9px] font-mono text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Global Create Button */}
            <AdminCreateMenu />

            {/* Live Indicator */}
            {isOnline ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/[0.08] border border-emerald-500/20 text-[10px] font-mono text-emerald-400 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="uppercase tracking-wider hidden sm:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/[0.08] border border-red-500/20 text-[10px] font-mono text-red-400 select-none">
                <WifiOff size={10} className="shrink-0" />
                <span className="uppercase tracking-wider">Offline</span>
              </div>
            )}

            {/* View Site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono text-text-secondary hover:text-text-primary bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] transition-all shrink-0"
            >
              <span>View Site</span>
              <ExternalLink size={10} className="shrink-0" />
            </Link>

            {/* Monogram Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08] select-none">
              <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-clash font-bold text-primary">
                GR
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Scrollable Workspace Content ─────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto relative">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8 min-h-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
