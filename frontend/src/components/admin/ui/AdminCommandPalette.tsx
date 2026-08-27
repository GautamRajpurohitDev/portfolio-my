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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface CommandItem {
  id: string;
  label: string;
  category: "NAVIGATION" | "CREATE" | "PORTFOLIO" | "SYSTEM";
  icon: React.ElementType;
  keywords?: string[];
  href?: string;
  externalHref?: string;
  action?: () => void;
  shortcut?: string;
}

const ALL_COMMANDS: CommandItem[] = [
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
    keywords: ["tech", "languages", "mastery", "frameworks"],
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
    id: "create-certificate",
    label: "New Certificate",
    category: "CREATE",
    icon: Plus,
    href: "/admin/certificates/new",
    keywords: ["add certificate", "upload credential"],
  },
  {
    id: "create-milestone",
    label: "New Milestone",
    category: "CREATE",
    icon: Plus,
    href: "/admin/milestones/new",
    keywords: ["add milestone", "new goal"],
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
  {
    id: "port-contact",
    label: "View Public Contact ↗",
    category: "PORTFOLIO",
    icon: ExternalLink,
    externalHref: "/contact",
    keywords: ["public contact"],
  },

  // ── System ───────────────────────────────────────────────────
  {
    id: "sys-refresh",
    label: "Refresh Workspace Data",
    category: "SYSTEM",
    icon: RefreshCw,
    action: () => {
      window.location.reload();
    },
    keywords: ["reload", "re-fetch", "sync"],
  },
  {
    id: "sys-settings",
    label: "Open System Settings",
    category: "SYSTEM",
    icon: Settings,
    href: "/admin/settings",
    keywords: ["configuration", "preferences"],
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
      const next = [id, ...filtered].slice(0, 4);
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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filtered command items
  const filteredCommands = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return ALL_COMMANDS;
    }
    return ALL_COMMANDS.filter((cmd) => {
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
        .map((id) => ALL_COMMANDS.find((c) => c.id === id))
        .filter(Boolean) as CommandItem[];
      if (recents.length > 0) {
        map.set("RECENT", recents);
      }
    }

    // Populate regular categories
    const categories: ("NAVIGATION" | "CREATE" | "PORTFOLIO" | "SYSTEM")[] = [
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
  }, [filteredCommands, query, recentIds]);

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
      saveRecent(cmd.id);
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
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(flattenedItems.length - 1, 0) : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = flattenedItems[selectedIndex];
      if (current) {
        executeCommand(current);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200]"
                />
              </Dialog.Overlay>

              {/* Command Dialog */}
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -12 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[201] w-full max-w-xl px-4 outline-none"
                  onKeyDown={handleKeyDown}
                >
                  <div className="bg-[#101010] border border-border/80 rounded-2xl shadow-2xl overflow-hidden font-body flex flex-col max-h-[70vh]">
                    {/* Search Input Bar */}
                    <div className="flex items-center gap-3 px-4 h-13 border-b border-border/60 bg-[#141414]">
                      <Search size={16} className="text-text-muted shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search commands, collections, actions…"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setSelectedIndex(0);
                        }}
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none font-body"
                        aria-label="Command search"
                      />
                      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/[0.06] border border-border/60 text-[10px] font-mono text-text-muted select-none">
                        ESC
                      </kbd>
                    </div>

                    {/* Results List */}
                    <div
                      ref={listRef}
                      className="flex-1 overflow-y-auto p-2 space-y-3 max-h-[50vh] scrollbar-thin"
                    >
                      {flattenedItems.length === 0 ? (
                        <div className="py-12 text-center text-text-muted space-y-1">
                          <p className="text-xs font-mono uppercase tracking-wider">
                            No commands found
                          </p>
                          <p className="text-[11px] text-text-muted">
                            No matching actions for "{query}"
                          </p>
                        </div>
                      ) : (
                        Array.from(groups.entries()).map(([groupLabel, items]) => (
                          <div key={groupLabel} className="space-y-0.5">
                            <p className="px-3 py-1.5 text-[9.5px] font-mono text-text-muted tracking-widest uppercase font-semibold select-none flex items-center gap-1.5">
                              {groupLabel === "RECENT" && <Clock size={10} />}
                              <span>{groupLabel}</span>
                            </p>
                            <div className="space-y-0.5">
                              {items.map((cmd) => {
                                const currentIndex = flattenedItems.indexOf(cmd);
                                const isSelected = selectedIndex === currentIndex;
                                const Icon = cmd.icon;

                                return (
                                  <button
                                    key={cmd.id}
                                    data-index={currentIndex}
                                    type="button"
                                    onClick={() => executeCommand(cmd)}
                                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-100 cursor-pointer ${
                                      isSelected
                                        ? "bg-primary/[0.12] text-text-primary border-l-2 border-primary"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border-l-2 border-transparent"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                          isSelected
                                            ? "bg-primary/20 border-primary/40 text-primary"
                                            : "bg-white/[0.03] border-border/50 text-text-muted"
                                        }`}
                                      >
                                        <Icon size={14} />
                                      </div>
                                      <span className="text-xs font-medium truncate">
                                        {cmd.label}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {cmd.category === "CREATE" && (
                                        <span className="text-[9px] font-mono text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                                          Create
                                        </span>
                                      )}
                                      {isSelected && (
                                        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-white/[0.08] text-text-muted">
                                          ↵ Select
                                        </kbd>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Keyboard Hint Footer */}
                    <div className="px-4 py-2.5 bg-[#0c0c0c] border-t border-border/50 flex items-center justify-between text-[10.5px] font-mono text-text-muted select-none">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border/40 text-[9.5px]">↑</kbd>
                          <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border/40 text-[9.5px]">↓</kbd>
                          <span>Navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-border/40 text-[9.5px]">↵</kbd>
                          <span>Open</span>
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-border/40 text-[9.5px]">ESC</kbd>
                        <span>Close</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AdminCommandPalette;
