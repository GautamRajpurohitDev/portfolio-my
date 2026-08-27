"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Rss,
  Layers,
  Award,
  Flag,
  Image as ImageIcon,
  FileText,
  Home,
  Map as MapIcon,
  Rows4,
  Settings,
  Plus,
  ExternalLink,
  RefreshCw,
  LogOut,
  Sparkles,
  Command as CommandIcon,
  ChevronRight,
  Clock,
  Globe,
  Upload,
  ShieldCheck,
  Activity,
  Edit2,
  FileBox,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { projectsApi, skillsApi, journeyApi, updatesApi, mediaApi } from "@/lib/api";

export interface CommandItem {
  id: string;
  label: string;
  category: "RECENT" | "NAVIGATION" | "CREATE" | "PORTFOLIO" | "CONTENT" | "SYSTEM";
  icon: React.ElementType;
  sublabel?: string;
  badge?: string;
  keywords?: string[];
  href?: string;
  externalHref?: string;
  action?: () => void;
  shortcut?: string;
}

const STATIC_COMMANDS: CommandItem[] = [
  // ── Navigation ───────────────────────────────────────────────
  {
    id: "nav-dashboard",
    label: "Dashboard",
    category: "NAVIGATION",
    icon: LayoutDashboard,
    href: "/admin",
    keywords: ["home", "overview", "analytics", "stats", "control center"],
  },
  {
    id: "nav-projects",
    label: "Projects",
    category: "NAVIGATION",
    icon: FolderKanban,
    href: "/admin/projects",
    keywords: ["work", "portfolio", "apps", "code"],
  },
  {
    id: "nav-journey",
    label: "Journey & Logs",
    category: "NAVIGATION",
    icon: BookOpen,
    href: "/admin/journey",
    keywords: ["journal", "learning", "progress", "entries", "diary"],
  },
  {
    id: "nav-updates",
    label: "Build Log & Updates",
    category: "NAVIGATION",
    icon: Rss,
    href: "/admin/updates",
    keywords: ["announcements", "posts", "news", "articles"],
  },
  {
    id: "nav-skills",
    label: "Skills & Capabilities",
    category: "NAVIGATION",
    icon: Layers,
    href: "/admin/skills",
    keywords: ["tech", "languages", "mastery", "frameworks", "git"],
  },
  {
    id: "nav-certificates",
    label: "Certificates",
    category: "NAVIGATION",
    icon: Award,
    href: "/admin/certificates",
    keywords: ["credentials", "courses", "licenses"],
  },
  {
    id: "nav-milestones",
    label: "Key Milestones",
    category: "NAVIGATION",
    icon: Flag,
    href: "/admin/milestones",
    keywords: ["goals", "achievements", "timeline"],
  },
  {
    id: "nav-media",
    label: "Media Library",
    category: "NAVIGATION",
    icon: ImageIcon,
    href: "/admin/media",
    keywords: ["images", "assets", "uploads", "photos", "videos"],
  },
  {
    id: "nav-resume",
    label: "Curriculum Vitae / Resume",
    category: "NAVIGATION",
    icon: FileText,
    href: "/admin/resume",
    keywords: ["cv", "pdf", "bio", "documents"],
  },
  {
    id: "nav-home",
    label: "Home / Hero CMS",
    category: "NAVIGATION",
    icon: Home,
    href: "/admin/home",
    keywords: ["hero", "headline", "status", "avatar"],
  },
  {
    id: "nav-about",
    label: "About Profile CMS",
    category: "NAVIGATION",
    icon: BookOpen,
    href: "/admin/about",
    keywords: ["bio", "statement", "story", "education"],
  },
  {
    id: "nav-roadmap",
    label: "Roadmap Architecture",
    category: "NAVIGATION",
    icon: MapIcon,
    href: "/admin/roadmap",
    keywords: ["curriculum", "phases", "domains", "topics"],
  },
  {
    id: "nav-sections",
    label: "Page Sections Order",
    category: "NAVIGATION",
    icon: Rows4,
    href: "/admin/sections",
    keywords: ["layout", "reorder", "visibility", "structure"],
  },
  {
    id: "nav-activity",
    label: "Activity & Audit Stream",
    category: "NAVIGATION",
    icon: Activity,
    href: "/admin/activity",
    keywords: ["audit", "logs", "security events", "history"],
  },
  {
    id: "nav-security",
    label: "Security Center",
    category: "NAVIGATION",
    icon: ShieldCheck,
    href: "/admin/security",
    keywords: ["auth", "posture", "tokens", "headers", "jwt"],
  },
  {
    id: "nav-settings",
    label: "Global Settings",
    category: "NAVIGATION",
    icon: Settings,
    href: "/admin/settings",
    keywords: ["config", "seo", "branding", "social", "contact"],
  },

  // ── Create Actions ───────────────────────────────────────────
  {
    id: "create-project",
    label: "New Project",
    category: "CREATE",
    icon: Plus,
    href: "/admin/projects/new",
    keywords: ["add project", "create project", "new app"],
  },
  {
    id: "create-journey",
    label: "New Journey Entry",
    category: "CREATE",
    icon: Plus,
    href: "/admin/journey/new",
    keywords: ["add journey", "log progress", "journal entry"],
  },
  {
    id: "create-update",
    label: "New Update",
    category: "CREATE",
    icon: Plus,
    href: "/admin/updates/new",
    keywords: ["add update", "write update", "new post"],
  },
  {
    id: "create-skill",
    label: "New Skill",
    category: "CREATE",
    icon: Plus,
    href: "/admin/skills/new",
    keywords: ["add skill", "new technology"],
  },
  {
    id: "create-media",
    label: "Upload Media Files",
    category: "CREATE",
    icon: Upload,
    href: "/admin/media",
    keywords: ["upload image", "upload asset"],
  },
  {
    id: "create-resume",
    label: "Upload Resume Version",
    category: "CREATE",
    icon: Upload,
    href: "/admin/resume",
    keywords: ["upload cv", "new resume pdf"],
  },

  // ── Portfolio Previews ───────────────────────────────────────
  {
    id: "port-live",
    label: "View Live Site ↗",
    category: "PORTFOLIO",
    icon: Globe,
    externalHref: "/",
    keywords: ["homepage", "public portfolio"],
  },
  {
    id: "port-projects",
    label: "View Projects Showcase ↗",
    category: "PORTFOLIO",
    icon: ExternalLink,
    externalHref: "/projects",
    keywords: ["public projects"],
  },
  {
    id: "port-journey",
    label: "View Public Journey ↗",
    category: "PORTFOLIO",
    icon: ExternalLink,
    externalHref: "/journey",
    keywords: ["public journal"],
  },
  {
    id: "port-skills",
    label: "View Public Skills ↗",
    category: "PORTFOLIO",
    icon: ExternalLink,
    externalHref: "/skills",
    keywords: ["public skills"],
  },
  {
    id: "port-roadmap",
    label: "View Public Roadmap ↗",
    category: "PORTFOLIO",
    icon: ExternalLink,
    externalHref: "/roadmap",
    keywords: ["public roadmap"],
  },
];

const RECENT_KEY = "admin_recent_commands";

interface AdminCommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminCommandPalette({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: AdminCommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (val: boolean) => {
      if (isControlled && setControlledOpen) {
        setControlledOpen(val);
      } else {
        setInternalOpen(val);
      }
    },
    [isControlled, setControlledOpen]
  );

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [contentResults, setContentResults] = useState<CommandItem[]>([]);
  const [isSearchingContent, setIsSearchingContent] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent commands
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const next = [id, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  // Reset search and selection on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setContentResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live content search across Projects, Skills, Journey, Updates
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) {
      setContentResults([]);
      setIsSearchingContent(false);
      return;
    }

    let isMounted = true;
    setIsSearchingContent(true);

    const timer = setTimeout(async () => {
      try {
        const [projRes, skillsRes, journeyRes, updatesRes] = await Promise.allSettled([
          projectsApi.getAllAdmin(),
          skillsApi.getAllAdmin(),
          journeyApi.getAllAdmin(),
          updatesApi.getAllAdmin(),
        ]);

        if (!isMounted) return;

        const results: CommandItem[] = [];

        // Projects
        if (projRes.status === "fulfilled") {
          const projs = projRes.value.data.data || [];
          projs
            .filter((p: any) => p.title?.toLowerCase().includes(trimmed) || p.category?.toLowerCase().includes(trimmed))
            .slice(0, 4)
            .forEach((p: any) => {
              results.push({
                id: `content-proj-${p._id}`,
                label: p.title,
                sublabel: `${p.category || "Project"} · ${p.published ? "Published" : "Draft"}`,
                badge: "PROJECT",
                category: "CONTENT",
                icon: FolderKanban,
                href: `/admin/projects/${p._id}/edit`,
              });
            });
        }

        // Skills
        if (skillsRes.status === "fulfilled") {
          const skills = skillsRes.value.data.data || [];
          skills
            .filter((s: any) => s.name?.toLowerCase().includes(trimmed) || s.category?.toLowerCase().includes(trimmed))
            .slice(0, 4)
            .forEach((s: any) => {
              results.push({
                id: `content-skill-${s._id}`,
                label: s.name,
                sublabel: `${s.category} · ${s.mastery || 0}% Mastery`,
                badge: "SKILL",
                category: "CONTENT",
                icon: Layers,
                href: `/admin/skills/${s._id}/edit`,
              });
            });
        }

        // Journey
        if (journeyRes.status === "fulfilled") {
          const journeys = journeyRes.value.data.data || [];
          journeys
            .filter((j: any) => j.title?.toLowerCase().includes(trimmed) || j.summary?.toLowerCase().includes(trimmed))
            .slice(0, 3)
            .forEach((j: any) => {
              results.push({
                id: `content-journey-${j._id}`,
                label: j.title,
                sublabel: `Journey Entry · Phase ${j.phase || "00"}`,
                badge: "JOURNEY",
                category: "CONTENT",
                icon: BookOpen,
                href: `/admin/journey/${j._id}/edit`,
              });
            });
        }

        // Updates
        if (updatesRes.status === "fulfilled") {
          const updates = updatesRes.value.data.data || [];
          updates
            .filter((u: any) => u.title?.toLowerCase().includes(trimmed) || u.tags?.some((t: string) => t.toLowerCase().includes(trimmed)))
            .slice(0, 3)
            .forEach((u: any) => {
              results.push({
                id: `content-update-${u._id}`,
                label: u.title,
                sublabel: `Update Log · ${u.published ? "Live" : "Draft"}`,
                badge: "UPDATE",
                category: "CONTENT",
                icon: Rss,
                href: `/admin/updates/${u._id}/edit`,
              });
            });
        }

        setContentResults(results);
      } catch {
        // Safe catch
      } finally {
        if (isMounted) setIsSearchingContent(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Filtered command items
  const filteredCommands = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return STATIC_COMMANDS;
    }
    return STATIC_COMMANDS.filter((cmd) => {
      if (cmd.label.toLowerCase().includes(trimmed)) return true;
      if (cmd.category.toLowerCase().includes(trimmed)) return true;
      if (cmd.keywords?.some((k) => k.toLowerCase().includes(trimmed))) return true;
      return false;
    });
  }, [query]);

  // Grouped commands
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();

    // Add recent group if no query and recent items exist
    if (!query.trim() && recentIds.length > 0) {
      const recents = recentIds
        .map((id) => STATIC_COMMANDS.find((c) => c.id === id))
        .filter(Boolean) as CommandItem[];
      if (recents.length > 0) {
        map.set("RECENT", recents);
      }
    }

    // Add content search matches first if query is active
    if (contentResults.length > 0) {
      map.set("PORTFOLIO CONTENT", contentResults);
    }

    // Populate regular categories
    const categories: ("CREATE" | "NAVIGATION" | "PORTFOLIO" | "SYSTEM")[] = [
      "CREATE",
      "NAVIGATION",
      "PORTFOLIO",
      "SYSTEM",
    ];

    categories.forEach((cat) => {
      const items = filteredCommands.filter((c) => c.category === cat);
      if (items.length > 0) {
        map.set(cat, items);
      }
    });

    return map;
  }, [filteredCommands, contentResults, query, recentIds]);

  // Flattened array for index calculation
  const flattenedItems = useMemo(() => {
    const items: CommandItem[] = [];
    groups.forEach((groupItems) => {
      groupItems.forEach((item) => items.push(item));
    });
    return items;
  }, [groups]);

  // Execute selected command
  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      if (cmd.category !== "CONTENT") {
        saveRecent(cmd.id);
      }
      setOpen(false);

      if (cmd.action) {
        cmd.action();
      } else if (cmd.externalHref) {
        window.open(cmd.externalHref, "_blank", "noopener,noreferrer");
      } else if (cmd.href) {
        router.push(cmd.href);
      }
    },
    [router, saveRecent, setOpen]
  );

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(flattenedItems.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % Math.max(flattenedItems.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flattenedItems[selectedIndex]) {
        executeCommand(flattenedItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-[18%] -translate-x-1/2 w-full max-w-xl bg-[#0c0c0c] border border-white/[0.12] rounded-2xl shadow-2xl z-50 overflow-hidden font-body text-xs focus:outline-none"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Admin Command Console</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search portfolio content, jump to collections, or execute admin actions.
          </Dialog.Description>

          {/* Search Header Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
            <Search size={15} className="text-primary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search content, projects, skills, or commands… (e.g. 'Git', 'Inflow')"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {isSearchingContent && (
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-text-muted">
              ESC
            </kbd>
          </div>

          {/* List of Results */}
          <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-3">
            {flattenedItems.length === 0 ? (
              <div className="py-12 text-center text-text-muted font-mono text-xs">
                No matching commands or portfolio content found for &quot;{query}&quot;.
              </div>
            ) : (
              Array.from(groups.entries()).map(([groupName, items]) => (
                <div key={groupName} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                    <span>{groupName}</span>
                    {groupName === "PORTFOLIO CONTENT" && (
                      <span className="text-[9px] text-primary">LIVE MATCHES</span>
                    )}
                  </div>
                  {items.map((cmd) => {
                    const globalIdx = flattenedItems.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary/[0.12] text-text-primary border border-primary/30"
                            : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            size={14}
                            className={isSelected ? "text-primary shrink-0" : "text-text-muted shrink-0"}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-xs text-text-primary">
                              {cmd.label}
                            </p>
                            {cmd.sublabel && (
                              <p className="text-[10px] text-text-muted font-mono truncate">
                                {cmd.sublabel}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {cmd.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[9px] font-mono text-primary border border-white/[0.08]">
                              {cmd.badge}
                            </span>
                          )}
                          <ChevronRight
                            size={12}
                            className={isSelected ? "text-primary" : "text-text-muted opacity-40"}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#080808] border-t border-white/[0.08] text-[10px] font-mono text-text-muted">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Open / Edit</span>
              <span>ESC Close</span>
            </div>
            <span className="text-text-secondary">Gautam OS Command Console</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AdminCommandPalette;
