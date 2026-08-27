"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderKanban,
  BookOpen,
  Rss,
  Layers,
  Award,
  Flag,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  Upload,
} from "lucide-react";

interface CreateOption {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const CREATE_OPTIONS: CreateOption[] = [
  {
    label: "Project",
    href: "/admin/projects/new",
    icon: FolderKanban,
    description: "New portfolio case study",
  },
  {
    label: "Journey Entry",
    href: "/admin/journey/new",
    icon: BookOpen,
    description: "Log programming progress",
  },
  {
    label: "Build Update",
    href: "/admin/updates/new",
    icon: Rss,
    description: "Broadcast an announcement",
  },
  {
    label: "Skill",
    href: "/admin/skills/new",
    icon: Layers,
    description: "Track a capability or language",
  },
  {
    label: "Certificate",
    href: "/admin/certificates/new",
    icon: Award,
    description: "Add a verified credential",
  },
  {
    label: "Milestone",
    href: "/admin/milestones/new",
    icon: Flag,
    description: "Key development milestone",
  },
  {
    label: "Upload Media",
    href: "/admin/media",
    icon: ImageIcon,
    description: "Add image or video assets",
  },
  {
    label: "Upload Resume",
    href: "/admin/resume",
    icon: FileText,
    description: "New curriculum vitae version",
  },
];

export function AdminCreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg bg-primary text-[#090909] font-clash font-semibold text-xs hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        title="Create new content"
        aria-label="Create new content"
      >
        <Plus size={14} strokeWidth={2.5} />
        <span className="hidden sm:inline">Create</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[#121212] border border-border/80 shadow-2xl p-1.5 z-50 overflow-hidden font-body text-xs"
          >
            <p className="px-2.5 py-1 text-[9.5px] font-mono text-text-muted uppercase tracking-widest font-semibold select-none">
              Create New
            </p>
            <div className="h-px bg-border/40 my-1" />

            <div className="space-y-0.5 max-h-72 overflow-y-auto">
              {CREATE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/[0.03] border border-border/50 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary group-hover:text-primary transition-colors leading-tight">
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCreateMenu;
