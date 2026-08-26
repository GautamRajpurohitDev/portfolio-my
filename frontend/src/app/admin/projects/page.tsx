"use client";

import React, { useEffect, useState, useCallback } from "react";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types";
import {
  Plus, Edit2, Trash2, Search, Filter,
  Eye, EyeOff, ExternalLink, LayoutGrid, List,
  ArrowUpDown, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  "idea":        { label: "Idea",        cls: "status-idea" },
  "in-progress": { label: "In Progress", cls: "status-progress" },
  "completed":   { label: "Completed",   cls: "status-completed" },
  "archived":    { label: "Archived",    cls: "status-archived" },
};

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${cls}`}>
      {text}
    </span>
  );
}

type SortKey = "updatedAt" | "title" | "status";
type ViewMode = "list" | "grid";

export default function AdminProjectsPage() {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey]           = useState<SortKey>("updatedAt");
  const [view, setView]                 = useState<ViewMode>("list");
  const [togglingId, setTogglingId]     = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId]       = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await projectsApi.getAllAdmin();
      setProjects(res.data.data);
    } catch { toast.error("Failed to fetch projects"); }
    finally  { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id); setPendingTitle(title); setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await projectsApi.delete(pendingId);
      toast.success("Project deleted");
      fetch();
    } catch { toast.error("Failed to delete project"); }
    finally  { setConfirmLoading(false); setPendingId(null); setPendingTitle(""); }
  };

  const handleTogglePublish = async (p: Project) => {
    setTogglingId(p._id);
    try {
      await projectsApi.update(p._id, { published: !p.published });
      toast.success(p.published ? "Project unpublished" : "Project published");
      fetch();
    } catch { toast.error("Failed to update project"); }
    finally  { setTogglingId(null); }
  };

  const filtered = projects
    .filter(p => filterStatus === "all" || p.status === filterStatus)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.shortDescription?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === "title") return a.title.localeCompare(b.title);
      if (sortKey === "status") return a.status.localeCompare(b.status);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="space-y-7 pb-14">
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Delete project?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={handleDelete} isLoading={confirmLoading}
      />

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">02 / Projects</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-secondary mt-1">Manage the work you're building.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit"
        >
          <Plus size={15} /> New Project
        </Link>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-border/60 rounded-lg pl-8 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary/40 [&>option]:bg-[#111] cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="idea">Idea</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="appearance-none bg-white/[0.03] border border-border/60 rounded-lg pl-8 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary/40 [&>option]:bg-[#111] cursor-pointer"
          >
            <option value="updatedAt">Updated</option>
            <option value="title">Title A–Z</option>
            <option value="status">Status</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white/[0.03] border border-border/60 rounded-lg overflow-hidden ml-auto">
          {(["list", "grid"] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                view === v ? "bg-white/[0.07] text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {v === "list" ? <List size={14} /> : <LayoutGrid size={14} />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="admin-skeleton rounded-xl h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasFilter={!!(search || filterStatus !== "all")}
          onClear={() => { setSearch(""); setFilterStatus("all"); }}
          createHref="/admin/projects/new"
          entityName="Projects"
          desc="Your portfolio is still being built. Your first project belongs here."
        />
      ) : view === "grid" ? (
        <GridView
          projects={filtered}
          togglingId={togglingId}
          onToggle={handleTogglePublish}
          onDelete={requestDelete}
        />
      ) : (
        <ListView
          projects={filtered}
          togglingId={togglingId}
          onToggle={handleTogglePublish}
          onDelete={requestDelete}
        />
      )}

      {/* Count */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-[11px] font-mono text-text-muted">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
          {(search || filterStatus !== "all") && " · filtered"}
        </p>
      )}
    </div>
  );
}

// ── Grid View ─────────────────────────────────────────────────
function GridView({ projects, togglingId, onToggle, onDelete }: {
  projects: Project[];
  togglingId: string | null;
  onToggle: (p: Project) => void;
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((p, idx) => {
        const status = STATUS_CONFIG[p.status] ?? { label: p.status, cls: "status-draft" };
        const updAt  = new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const image  = p.media?.[0]?.url;

        return (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.22 }}
            className="group bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden card-hover-glow flex flex-col"
          >
            {/* Image */}
            <div className="relative h-36 bg-white/[0.02] flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">No image</span>
                </div>
              )}
              {/* Featured badge */}
              {p.featured && (
                <div className="absolute top-2 left-2">
                  <Badge text="Featured" cls="status-featured" />
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-start gap-2 justify-between">
                <h3 className="text-sm font-clash font-semibold text-text-primary leading-tight group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <Badge text={status.label} cls={status.cls} />
              </div>
              {p.shortDescription && (
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{p.shortDescription}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge text={p.published ? "Published" : "Draft"} cls={p.published ? "status-published" : "status-draft"} />
                <span className="text-[10px] font-mono text-text-muted">{updAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-1.5">
              <Link href={`/admin/projects/${p._id}/edit`} className="flex-1 text-center py-2 text-xs font-mono uppercase tracking-wider text-text-secondary border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all">
                Edit
              </Link>
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-text-muted border border-border/60 rounded-lg hover:text-blue-400 hover:border-blue-400/30 transition-all">
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                onClick={() => onToggle(p)} disabled={togglingId === p._id}
                className={`p-2 border border-border/60 rounded-lg transition-all disabled:opacity-50 ${
                  p.published ? "text-success hover:text-yellow-400 hover:border-yellow-400/30" : "text-text-muted hover:text-success hover:border-success/30"
                }`}
              >
                {togglingId === p._id ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : p.published ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => onDelete(p._id, p.title)}
                className="p-2 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── List View ─────────────────────────────────────────────────
function ListView({ projects, togglingId, onToggle, onDelete }: {
  projects: Project[];
  togglingId: string | null;
  onToggle: (p: Project) => void;
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <div className="bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border/60 bg-white/[0.02]">
            {["Project", "Status", "Visibility", "Updated", "Actions"].map(h => (
              <th key={h} className={`px-5 py-3.5 text-[10px] font-mono text-text-muted uppercase tracking-widest font-medium ${h === "Actions" ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {projects.map((p, idx) => {
            const status = STATUS_CONFIG[p.status] ?? { label: p.status, cls: "status-draft" };
            const updAt  = new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <motion.tr
                key={p._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.025 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-text-primary group-hover:text-primary transition-colors leading-tight">
                    {p.title}
                    {p.featured && <span className="ml-2 text-primary text-[10px] font-mono">★</span>}
                  </div>
                  {p.shortDescription && (
                    <p className="text-xs text-text-muted mt-0.5 max-w-xs truncate">{p.shortDescription}</p>
                  )}
                </td>
                <td className="px-5 py-4"><Badge text={status.label} cls={status.cls} /></td>
                <td className="px-5 py-4"><Badge text={p.published ? "Published" : "Draft"} cls={p.published ? "status-published" : "status-draft"} /></td>
                <td className="px-5 py-4 text-xs font-mono text-text-muted whitespace-nowrap">{updAt}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-muted hover:text-blue-400 rounded-md hover:bg-blue-400/10 transition-all" title="Preview">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => onToggle(p)} disabled={togglingId === p._id}
                      className={`p-1.5 rounded-md transition-all disabled:opacity-50 ${p.published ? "text-success hover:text-yellow-400 hover:bg-yellow-400/10" : "text-text-muted hover:text-success hover:bg-success/10"}`}
                      title={p.published ? "Unpublish" : "Publish"}
                    >
                      {togglingId === p._id ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : p.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <Link href={`/admin/projects/${p._id}/edit`} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-all" title="Edit">
                      <Edit2 size={14} />
                    </Link>
                    <button onClick={() => onDelete(p._id, p.title)} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
function EmptyState({ hasFilter, onClear, createHref, entityName, desc }: {
  hasFilter: boolean; onClear: () => void; createHref: string; entityName: string; desc: string;
}) {
  return (
    <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-12 text-center space-y-4">
      <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
        {hasFilter ? "No results" : `No ${entityName} yet`}
      </p>
      <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
        {hasFilter ? "Try adjusting your search or filters." : desc}
      </p>
      {hasFilter ? (
        <button onClick={onClear} className="text-xs font-mono text-primary hover:text-primary/80 uppercase tracking-wider transition-colors">
          Clear filters
        </button>
      ) : (
        <Link href={createHref} className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 uppercase tracking-wider transition-colors">
          <Plus size={12} /> Create first
        </Link>
      )}
    </div>
  );
}
