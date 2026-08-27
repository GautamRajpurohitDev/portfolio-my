"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { AdminCommandPalette } from "@/components/admin/ui/AdminCommandPalette";
import { AdminCreateMenu } from "@/components/admin/ui/AdminCreateMenu";

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
        relative flex items-center h-8.5 w-full rounded-md text-[13px]
        transition-colors duration-150 group outline-none select-none
        focus-visible:ring-1 focus-visible:ring-primary/50
        ${
          isActive
            ? "bg-white/[0.04] text-text-primary font-semibold"
            : "text-text-secondary hover:text-text-primary hover:bg-white/[0.02]"
        }
        ${isCollapsed ? "justify-center px-0" : "px-3 gap-2.5"}
      `}
    >
      {/* Active Left Indicator Bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded-r"
          aria-hidden="true"
        />
      )}

      <Icon
        size={15}
        strokeWidth={isActive ? 2 : 1.5}
        className={`flex-shrink-0 transition-colors duration-150 ${
          isActive
            ? "text-primary"
            : "text-text-muted group-hover:text-text-primary"
        }`}
      />
      {!isCollapsed && (
        <span className="flex-1 leading-none truncate whitespace-nowrap font-body text-xs">
          {item.name}
        </span>
      )}
      {!isCollapsed && isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      )}
    </Link>
  );
}

function SidebarContent({
  pathname,
  logout,
  isCollapsed,
  onToggleCollapse,
}: {
  pathname: string | null;
  logout: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080808]">
      {/* ── Fixed Sidebar Header ─────────────────────────────── */}
      <div
        className={`p-4 border-b border-white/[0.08] flex items-center justify-between relative flex-shrink-0 ${
          isCollapsed ? "flex-col gap-2.5" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-clash font-bold text-primary tracking-wider">
              GR
            </span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-xs font-clash font-bold text-text-primary tracking-wide uppercase truncate leading-tight">
                Gautam Rajpurohit
              </h2>
              <p className="text-[9.5px] font-mono text-primary/80 tracking-widest uppercase mt-0.5">
                ADMIN / OS
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={14} />
            ) : (
              <PanelLeftClose size={14} />
            )}
          </button>
        )}
      </div>

      {/* ── Scrollable Technical Navigation Rail ─────────────── */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5 select-none custom-scrollbar"
        aria-label="Admin Navigation"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 pb-1 pt-1 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  {group.number}
                </span>
                <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
                  / {group.label}
                </span>
              </div>
            ) : (
              <div className="h-px bg-white/[0.08] my-2 mx-1" />
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

      {/* ── Fixed Sidebar Footer ─────────────────────────────── */}
      <div className="p-3 border-t border-white/[0.08] flex-shrink-0 bg-[#080808]">
        <button
          onClick={logout}
          title={isCollapsed ? "Sign out" : undefined}
          className={`
            flex items-center h-8.5 w-full rounded text-xs font-body
            text-text-muted hover:text-red-400 hover:bg-red-500/[0.06]
            transition-colors duration-150 cursor-pointer
            ${isCollapsed ? "justify-center px-0" : "px-3 gap-2.5"}
          `}
          aria-label="Sign out"
        >
          <LogOut size={14} className="flex-shrink-0 text-text-muted hover:text-red-400" />
          {!isCollapsed && <span className="truncate">Sign out</span>}
        </button>
      </div>
    </div>
  );
}

// Simple Page Transition Animation
const pageVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function getBreadcrumb(pathname: string | null): {
  section: string;
  sectionHref: string;
  current: string;
} {
  if (!pathname || pathname === "/admin") {
    return { section: "Console", sectionHref: "/admin", current: "Overview" };
  }
  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  if (parts.length === 0) {
    return { section: "Console", sectionHref: "/admin", current: "Overview" };
  }
  const main = parts[0];
  const formattedMain = main.charAt(0).toUpperCase() + main.slice(1);

  if (parts.length === 1) {
    return {
      section: "Workspace",
      sectionHref: `/admin/${main}`,
      current: formattedMain,
    };
  }

  const sub = parts[1];
  let formattedSub = sub.charAt(0).toUpperCase() + sub.slice(1);
  if (sub === "new") formattedSub = "Create New";
  if (parts.length > 2 && parts[2] === "edit") formattedSub = "Edit";

  return {
    section: formattedMain,
    sectionHref: `/admin/${main}`,
    current: formattedSub,
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Handle escape key to close drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    },
    [isMobileNavOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved === "true") setIsSidebarCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem("adminSidebarCollapsed", String(next));
  };

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
            INITIALIZING OS…
          </p>
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
        />
      </aside>

      {/* ── Mobile Top Bar ────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 border border-primary/30 rounded flex items-center justify-center">
            <span className="text-[10px] font-clash font-bold text-primary">GR</span>
          </div>
          <span className="text-xs font-clash font-bold tracking-wide uppercase">
            ADMIN / OS
          </span>
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
      </div>

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
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Application Shell ────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
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
              <Search size={11} className="text-text-muted" />
              <span className="hidden xl:inline text-text-muted text-[11px]">Command…</span>
              <kbd className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-white/[0.05] border border-white/[0.08] text-[9px] font-mono text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Global Create Button */}
            <AdminCreateMenu />

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/[0.08] border border-emerald-500/20 text-[10px] font-mono text-emerald-400 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="uppercase tracking-wider hidden sm:inline">Online</span>
            </div>

            {/* View Site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono text-text-secondary hover:text-text-primary bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] transition-all"
            >
              <span>View Site</span>
              <ExternalLink size={10} />
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
        <main className="flex-1 min-w-0 overflow-y-auto pt-12 lg:pt-0 relative">
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 py-8 min-h-full min-w-0"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
