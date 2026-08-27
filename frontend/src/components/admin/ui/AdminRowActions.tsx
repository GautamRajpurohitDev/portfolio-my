"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, ExternalLink, Trash2, Eye, EyeOff, Check, Copy, Files } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface AdminRowActionsProps {
  editHref?: string;
  previewHref?: string;
  copyUrl?: string;
  isPublished?: boolean;
  onTogglePublish?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  customActions?: ActionItem[];
}

export function AdminRowActions({
  editHref,
  previewHref,
  copyUrl,
  isPublished,
  onTogglePublish,
  onDuplicate,
  onDelete,
  customActions = [],
}: AdminRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!copyUrl) return;
    navigator.clipboard.writeText(copyUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1000);
  };

  const hasStandardActions = Boolean(
    editHref || previewHref || copyUrl || onTogglePublish || onDuplicate || onDelete
  );
  if (!hasStandardActions && customActions.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
        title="Actions"
        aria-label="Row actions"
      >
        <MoreVertical size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-[#111111] border border-white/[0.1] shadow-2xl py-1 z-50 overflow-hidden font-body text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit */}
            {editHref && (
              <Link
                href={editHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <Edit2 size={12} className="text-text-muted shrink-0" />
                <span>Edit</span>
              </Link>
            )}

            {/* Preview */}
            {previewHref && (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <ExternalLink size={12} className="text-text-muted shrink-0" />
                <span>Preview ↗</span>
              </a>
            )}

            {/* Copy Link */}
            {copyUrl && (
              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-text-muted shrink-0" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            )}

            {/* Duplicate */}
            {onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDuplicate();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <Files size={12} className="text-text-muted shrink-0" />
                <span>Duplicate as Draft</span>
              </button>
            )}

            {/* Toggle Publish / Visibility */}
            {onTogglePublish && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onTogglePublish();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                {isPublished ? (
                  <>
                    <EyeOff size={12} className="text-text-muted shrink-0" />
                    <span>Unpublish / Draft</span>
                  </>
                ) : (
                  <>
                    <Eye size={12} className="text-emerald-400 shrink-0" />
                    <span>Publish Live</span>
                  </>
                )}
              </button>
            )}

            {/* Custom actions */}
            {customActions.map((action, idx) => (
              <React.Fragment key={idx}>
                {action.separator && <div className="h-px bg-white/[0.06] my-1" />}
                {action.href ? (
                  action.external ? (
                    <a
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                    >
                      {action.icon && <span className="shrink-0">{action.icon}</span>}
                      <span>{action.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                    >
                      {action.icon && <span className="shrink-0">{action.icon}</span>}
                      <span>{action.label}</span>
                    </Link>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={action.disabled}
                    onClick={() => {
                      setIsOpen(false);
                      action.onClick?.();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer ${
                      action.destructive
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                    }`}
                  >
                    {action.icon && <span className="shrink-0">{action.icon}</span>}
                    <span>{action.label}</span>
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Delete */}
            {onDelete && (
              <>
                <div className="h-px bg-white/[0.06] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} className="shrink-0" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminRowActions;
