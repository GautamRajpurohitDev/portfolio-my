"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, BookOpen, Layers,
  Award, Flag, Rss, Settings, LogOut, ExternalLink,
  Menu, X, ChevronRight, PanelLeftClose, PanelLeftOpen, Home, Palette, Rows4, Image as ImageIcon, Map, FileText
} from "lucide-react";

// ── Layout Constants ──────────────────────────────────────────
const SIDEBAR_EXPANDED_WIDTH = "w-[240px]";
const SIDEBAR_COLLAPSED_WIDTH = "w-[72px]";

// ── Nav structure ─────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { name: "Overview",   href: "/admin",             icon: LayoutDashboard, exact: true },
      { name: "Roadmap",    href: "/admin/roadmap",     icon: Map },
      { name: "Media",      href: "/admin/media",       icon: ImageIcon },
      { name: "Projects",   href: "/admin/projects",    icon: FolderKanban },
      { name: "Journey",    href: "/admin/journey",     icon: BookOpen },
    ],
  },
  {
    label: "Profile",
    items: [
      { name: "About",         href: "/admin/about",         icon: BookOpen },
      { name: "Skills",        href: "/admin/skills",        icon: Layers },
      { name: "Resume",        href: "/admin/resume",        icon: FileText },
      { name: "Certificates",  href: "/admin/certificates",  icon: Award },
      { name: "Milestones",    href: "/admin/milestones",    icon: Flag },
    ],
  },
  {
    label: "Publishing",
    items: [
      { name: "Updates",  href: "/admin/updates",  icon: Rss },
    ],
  },
  {
    label: "Appearance",
    items: [
      { name: "Home / Hero",   href: "/admin/home",      icon: Home },
      { name: "Page Sections", href: "/admin/sections",  icon: Rows4 },
      { name: "Settings",      href: "/admin/settings",  icon: Palette },
    ],
  },
];

function NavItem({ item, pathname, isCollapsed }: { item: typeof NAV_GROUPS[0]["items"][0]; pathname: string | null; isCollapsed?: boolean }) {
  const isActive = item.exact
    ? pathname === item.href
    : (pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.name : undefined}
      aria-label={item.name}
      className={`
        relative flex items-center h-10 w-full rounded-lg text-[13px] font-medium
        transition-colors duration-150 group outline-none
        focus-visible:ring-1 focus-visible:ring-primary/50
        ${isActive
          ? "bg-primary/[0.08] text-text-primary font-semibold border-l-2 border-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border-l-2 border-transparent"
        }
        ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"}
      `}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        className={`flex-shrink-0 transition-colors duration-150 ${
          isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
        }`}
      />
      {!isCollapsed && (
        <span className="flex-1 leading-none truncate whitespace-nowrap">{item.name}</span>
      )}
    </Link>
  );
}

function SidebarContent({ pathname, logout, isCollapsed, onToggleCollapse }: {
  pathname: string | null;
  logout: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0b0b0b]">
      {/* ── Fixed Sidebar Header ─────────────────────────────── */}
      <div className={`p-4 border-b border-border/60 flex items-center justify-between relative flex-shrink-0 ${isCollapsed ? "flex-col gap-3" : ""}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-clash font-bold text-primary tracking-wider">GR</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-xs font-clash font-semibold text-text-primary tracking-wide uppercase truncate leading-tight">
                Gautam Rajpurohit
              </h2>
              <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase mt-0.5">
                Admin Console
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md border border-border/50 transition-colors flex items-center justify-center"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        )}
      </div>

      {/* ── Scrollable Navigation List ────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!isCollapsed ? (
              <p className="px-3 mb-2 text-[10px] font-mono text-text-muted tracking-widest uppercase select-none">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-border/40 mx-2 mb-2 mt-1 first:hidden" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Fixed Sidebar Footer ──────────────────────────────── */}
      <div className="p-3 border-t border-border/60 space-y-0.5 flex flex-col flex-shrink-0 bg-[#0b0b0b]">
        {/* View Portfolio */}
        <Link
          href="/"
          target="_blank"
          aria-label="View Portfolio"
          className={`
            relative flex items-center h-10 w-full rounded-lg text-[13px] text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors group outline-none
            ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"}
          `}
        >
          <ExternalLink size={18} strokeWidth={1.75} className="flex-shrink-0 text-text-secondary group-hover:text-text-primary" />
          {!isCollapsed && <span className="leading-none whitespace-nowrap truncate">View Portfolio</span>}
          {isCollapsed && (
            <div role="tooltip" className="absolute left-[calc(100%+10px)] px-2.5 py-1 rounded-md bg-[#161616] border border-border text-xs font-mono text-text-primary shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              View Portfolio
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          aria-label="Logout"
          className={`
            relative flex items-center h-10 w-full rounded-lg text-[13px] text-text-secondary hover:text-red-400 hover:bg-red-500/[0.08] transition-colors group outline-none text-left
            ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"}
          `}
        >
          <LogOut size={18} strokeWidth={1.75} className="flex-shrink-0 text-text-secondary group-hover:text-red-400" />
          {!isCollapsed && <span className="leading-none whitespace-nowrap truncate">Logout</span>}
          {isCollapsed && (
            <div role="tooltip" className="absolute left-[calc(100%+10px)] px-2.5 py-1 rounded-md bg-[#161616] border border-border text-xs font-mono text-text-primary shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Page fade-in animation ────────────────────────────────────
const pageVariants = {
  hidden:  { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

function getBreadcrumb(pathname: string | null) {
  if (!pathname || pathname === "/admin") return { section: "Workspace", current: "Overview" };
  for (const group of NAV_GROUPS) {
    const found = group.items.find(it => it.href === pathname || (it.href !== "/admin" && pathname.startsWith(it.href)));
    if (found) return { section: group.label, current: found.name };
  }
  const clean = pathname.replace("/admin/", "").split("/")[0];
  const name = clean.charAt(0).toUpperCase() + clean.slice(1);
  return { section: "Console", current: name };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Close mobile nav on route change
  useEffect(() => { setIsMobileNavOpen(false); }, [pathname]);

  // Handle escape key to close drawer
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  }, [isMobileNavOpen]);

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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="min-h-screen flex bg-bg text-text-primary overflow-hidden admin-grain">

      {/* ── Desktop Sidebar ───────────────────────────────────── */}
      <aside 
        className={`hidden lg:flex flex-shrink-0 flex-col bg-[#0b0b0b] border-r border-border/70 sticky top-0 h-screen z-30 transition-[width] duration-250 ease-out overflow-hidden ${
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-border/60 bg-[#0c0c0c]/95 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center">
            <span className="text-[10px] font-clash font-bold text-primary">GR</span>
          </div>
          <span className="text-sm font-clash font-semibold tracking-wide">Admin Console</span>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-lg text-text-secondary hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
              className="fixed inset-0 bg-black/70 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-[#0b0b0b] border-r border-border/70 z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <SidebarContent pathname={pathname} logout={logout} isCollapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Application Shell ────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* ── Desktop Top Header Bar ──────────────────────────── */}
        <header className="hidden lg:flex items-center justify-between h-14 px-8 border-b border-border/60 bg-[#090909]/90 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-muted uppercase tracking-wider">{breadcrumb.section}</span>
            <ChevronRight size={12} className="text-text-muted" />
            <span className="text-text-primary font-medium">{breadcrumb.current}</span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-border/60 text-[11px] font-mono text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Sync Active</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary bg-white/[0.03] hover:bg-white/[0.07] border border-border/60 hover:border-border transition-all"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-border/60">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-clash font-bold text-primary">
                GR
              </div>
              <span className="text-xs font-medium text-text-primary hidden xl:inline-block">Gautam R.</span>
            </div>
          </div>
        </header>

        {/* ── Main Scrollable Workspace Content ─────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0 relative">
          <div
            aria-hidden
            className="pointer-events-none fixed top-0 right-0 w-[600px] h-[400px] opacity-[0.03]"
            style={{ background: "radial-gradient(ellipse at top right, #e8c547 0%, transparent 70%)" }}
          />

          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-10 py-8 min-h-full min-w-0"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

