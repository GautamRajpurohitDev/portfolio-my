"use client";

import React, { useEffect, useState, useCallback } from "react";
import { updatesApi } from "@/lib/api";
import { Update } from "@/types";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ExternalLink, Filter, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function AdminUpdatesPage() {
  const [updates, setUpdates]         = useState<Update[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [filterPub, setFilterPub]     = useState("all");
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId]     = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await updatesApi.getAllAdmin();
      setUpdates(res.data.data);
    } catch { toast.error("Failed to fetch updates"); }
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
      await updatesApi.delete(pendingId);
      toast.success("Update deleted");
      fetch();
    } catch { toast.error("Failed to delete update"); }
    finally  { setConfirmLoading(false); setPendingId(null); setPendingTitle(""); }
  };

  const handleToggle = async (u: Update) => {
    setTogglingId(u._id);
    try {
      await updatesApi.update(u._id, { published: !u.published });
      toast.success(u.published ? "Update unpublished" : "Update published");
      fetch();
    } catch { toast.error("Failed to update"); }
    finally  { setTogglingId(null); }
  };

  const filtered = updates
    .filter(u => filterPub === "all" || (filterPub === "published" ? u.published : !u.published))
    .filter(u => !search || u.title.toLowerCase().includes(search.toLowerCase()) || (u.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const published = updates.filter(u => u.published).length;
  const drafts    = updates.filter(u => !u.published).length;

  return (
    <div className="space-y-7 pb-14">
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Delete update?" description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={handleDelete} isLoading={confirmLoading}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">07 / Build Log</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Build Log</h1>
          <p className="text-sm text-text-secondary mt-1">Publish updates, announcements, and build notes.</p>
        </div>
        <Link href="/admin/updates/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit">
          <Plus size={15} /> New Update
        </Link>
      </div>

      {/* Stats strip */}
      {!isLoading && updates.length > 0 && (
        <div className="flex items-center gap-6 text-[11px] font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />{published} published
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-border" />{drafts} draft
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search updates or tags…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select value={filterPub} onChange={e => setFilterPub(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-border/60 rounded-lg pl-8 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary/40 [&>option]:bg-[#111] cursor-pointer">
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="admin-skeleton rounded-xl h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-12 text-center space-y-4">
          <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">{search || filterPub !== "all" ? "No results" : "Nothing published yet"}</p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            {search || filterPub !== "all" ? "Try adjusting your search or filters." : "Start your build log. Document what you're working on and ship updates publicly."}
          </p>
          {search || filterPub !== "all" ? (
            <button onClick={() => { setSearch(""); setFilterPub("all"); }} className="text-xs font-mono text-primary uppercase tracking-wider">Clear filters</button>
          ) : (
            <Link href="/admin/updates/new" className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider">
              <Plus size={11} /> Write first update
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((u, idx) => {
            const date = new Date(u.date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden card-hover-glow flex flex-col"
              >
                {/* Cover image strip */}
                {u.coverImage && (
                  <div className="h-28 overflow-hidden border-b border-border/40">
                    <img src={u.coverImage} alt={u.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  </div>
                )}

                <div className="flex-1 p-5 space-y-3">
                  {/* Date + status row */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-text-muted tracking-wider">{date}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                      u.published ? "status-published" : "status-draft"
                    }`}>
                      {u.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-clash font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                    {u.title}
                  </h3>

                  {/* Summary */}
                  {u.summary && (
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{u.summary}</p>
                  )}

                  {/* Tags */}
                  {u.tags && u.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {u.tags.slice(0, 4).map((tag, ti) => (
                        <span key={ti} className="text-[10px] font-mono text-text-muted bg-white/[0.03] border border-border/40 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {u.tags.length > 4 && (
                        <span className="text-[10px] font-mono text-text-muted">+{u.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="px-5 pb-4 flex items-center gap-1.5 border-t border-border/30 pt-3">
                  <Link href={`/admin/updates/${u._id}/edit`}
                    className="flex-1 text-center py-1.5 text-xs font-mono uppercase tracking-wider text-text-secondary border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all">
                    Edit
                  </Link>
                  {u.published && (
                    <a href={`/updates/${u.slug}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-text-muted border border-border/60 rounded-lg hover:text-blue-400 hover:border-blue-400/30 transition-all" title="Preview live">
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button onClick={() => handleToggle(u)} disabled={togglingId === u._id}
                    title={u.published ? "Unpublish" : "Publish"}
                    className={`p-2 border border-border/60 rounded-lg transition-all disabled:opacity-50 ${u.published ? "text-success hover:text-yellow-400 hover:border-yellow-400/30" : "text-text-muted hover:text-success hover:border-success/30"}`}>
                    {togglingId === u._id ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : u.published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => requestDelete(u._id, u.title)}
                    className="p-2 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
