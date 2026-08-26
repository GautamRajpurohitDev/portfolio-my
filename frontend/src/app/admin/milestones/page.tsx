"use client";

import React, { useEffect, useState, useCallback } from "react";
import { milestonesApi } from "@/lib/api";
import { Milestone } from "@/types";
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  completed:    { label: "Completed",   cls: "status-completed", dot: "bg-success" },
  "in-progress":{ label: "In Progress", cls: "status-progress",  dot: "bg-primary" },
  planned:      { label: "Planned",     cls: "status-planned",   dot: "bg-border" },
};

export default function AdminMilestonesPage() {
  const [milestones, setMilestones]   = useState<Milestone[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId]     = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await milestonesApi.getAllAdmin();
      setMilestones(res.data.data);
    } catch { toast.error("Failed to fetch milestones"); }
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
      await milestonesApi.delete(pendingId);
      toast.success("Milestone deleted");
      fetch();
    } catch { toast.error("Failed to delete milestone"); }
    finally  { setConfirmLoading(false); setPendingId(null); setPendingTitle(""); }
  };

  const handleToggle = async (m: Milestone) => {
    setTogglingId(m._id);
    try {
      await milestonesApi.update(m._id, { published: !m.published });
      toast.success(m.published ? "Milestone hidden" : "Milestone published");
      fetch();
    } catch { toast.error("Failed to update milestone"); }
    finally  { setTogglingId(null); }
  };

  // Sort: completed → in-progress → planned, then by date
  const filtered = milestones
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const order: Record<string, number> = { completed: 0, "in-progress": 1, planned: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return a.order - b.order;
    });

  const completed    = filtered.filter(m => m.status === "completed");
  const inProgress   = filtered.filter(m => m.status === "in-progress");
  const planned      = filtered.filter(m => m.status === "planned");

  return (
    <div className="space-y-7 pb-14">
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Delete milestone?" description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={handleDelete} isLoading={confirmLoading}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">06 / Milestones</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Milestones</h1>
          <p className="text-sm text-text-secondary mt-1">Progress markers along your development journey.</p>
        </div>
        <Link href="/admin/milestones/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit">
          <Plus size={15} /> New Milestone
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search milestones…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        {!isLoading && (
          <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{completed.length} done</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />{inProgress.length} active</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-border inline-block" />{planned.length} planned</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="admin-skeleton rounded-xl h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-12 text-center space-y-4">
          <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">{search ? "No results" : "No milestones yet"}</p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            {search ? "Try a different search term." : "Define the key achievements you're working toward."}
          </p>
          {!search && (
            <Link href="/admin/milestones/new" className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider">
              <Plus size={11} /> Add milestone
            </Link>
          )}
        </div>
      ) : (
        /* Progress timeline */
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-4 top-5 bottom-5 w-px bg-gradient-to-b from-border/80 via-border/40 to-transparent" aria-hidden />

          <div className="space-y-2 pl-12">
            {filtered.map((m, idx) => {
              const cfg  = STATUS_CFG[m.status] ?? STATUS_CFG.planned;
              const date = m.date
                ? new Date(m.date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : null;

              return (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group relative"
                >
                  {/* Timeline node */}
                  <div className={`absolute -left-8 top-4 w-3 h-3 rounded-full border-2 border-[#0f0f0f] ${cfg.dot} transition-all group-hover:scale-125`} />

                  <div className={`bg-[#0f0f0f] border rounded-xl px-5 py-4 transition-all ${
                    m.status === "in-progress"
                      ? "border-primary/25 shadow-[0_0_0_1px_rgba(232,197,71,0.04)]"
                      : "border-border/60 hover:border-border card-hover-glow"
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                          {m.category && (
                            <span className="text-[10px] font-mono text-text-muted">{m.category}</span>
                          )}
                          {date && (
                            <span className="text-[10px] font-mono text-text-muted">{date}</span>
                          )}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                            m.published ? "status-published" : "status-draft"
                          }`}>
                            {m.published ? "Pub" : "Draft"}
                          </span>
                        </div>
                        <h3 className={`text-sm font-clash font-semibold leading-snug transition-colors ${
                          m.status === "in-progress" ? "text-primary" : "text-text-primary group-hover:text-primary"
                        }`}>
                          {m.title}
                        </h3>
                        {m.description && (
                          <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">{m.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleToggle(m)} disabled={togglingId === m._id}
                          title={m.published ? "Unpublish" : "Publish"}
                          className={`p-1.5 rounded-md transition-all disabled:opacity-50 ${m.published ? "text-success hover:text-yellow-400 hover:bg-yellow-400/10" : "text-text-muted hover:text-success hover:bg-success/10"}`}>
                          {togglingId === m._id ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : m.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link href={`/admin/milestones/${m._id}/edit`} title="Edit"
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-all">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => requestDelete(m._id, m.title)} title="Delete"
                          className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
