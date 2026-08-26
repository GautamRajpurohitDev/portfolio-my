"use client";

import React, { useEffect, useState, useCallback } from "react";
import { journeyApi } from "@/lib/api";
import { JourneyEntry } from "@/types";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Filter, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// Group entries by month-year
function groupByMonth(entries: JourneyEntry[]) {
  const map = new Map<string, JourneyEntry[]>();
  entries.forEach(e => {
    const d   = new Date(e.date);
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  });
  return map;
}

export default function AdminJourneyPage() {
  const [entries, setEntries]         = useState<JourneyEntry[]>([]);
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
      const res = await journeyApi.getAllAdmin();
      setEntries(res.data.data);
    } catch { toast.error("Failed to fetch journey entries"); }
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
      await journeyApi.delete(pendingId);
      toast.success("Entry deleted");
      fetch();
    } catch { toast.error("Failed to delete entry"); }
    finally  { setConfirmLoading(false); setPendingId(null); setPendingTitle(""); }
  };

  const handleTogglePublish = async (e: JourneyEntry) => {
    setTogglingId(e._id);
    try {
      await journeyApi.update(e._id, { published: !e.published });
      toast.success(e.published ? "Entry hidden" : "Entry published");
      fetch();
    } catch { toast.error("Failed to update entry"); }
    finally  { setTogglingId(null); }
  };

  const filtered = entries
    .filter(e => filterPub === "all" || (filterPub === "published" ? e.published : !e.published))
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.topic.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groups = groupByMonth(filtered);

  return (
    <div className="space-y-7 pb-14">
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Delete entry?" description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={handleDelete} isLoading={confirmLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">03 / Journey</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Learning Journal</h1>
          <p className="text-sm text-text-secondary mt-1">Every entry is a record of progress made.</p>
        </div>
        <Link
          href="/admin/journey/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit"
        >
          <Plus size={15} /> New Entry
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search entries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={filterPub}
            onChange={e => setFilterPub(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-border/60 rounded-lg pl-8 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary/40 [&>option]:bg-[#111] cursor-pointer"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        {filtered.length > 0 && (
          <span className="ml-auto text-[11px] font-mono text-text-muted">{filtered.length} entries</span>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="admin-skeleton rounded-xl h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-12 text-center space-y-4">
          <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
            {search || filterPub !== "all" ? "No results" : "Nothing documented yet"}
          </p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            {search || filterPub !== "all"
              ? "Try adjusting your search or filters."
              : "Start recording what you learn. Every session documented here is permanent evidence of growth."}
          </p>
          {search || filterPub !== "all" ? (
            <button onClick={() => { setSearch(""); setFilterPub("all"); }} className="text-xs font-mono text-primary uppercase tracking-wider">
              Clear filters
            </button>
          ) : (
            <Link href="/admin/journey/new" className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider">
              <Plus size={11} /> Add first entry
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(groups.entries()).map(([month, monthEntries], gi) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06, duration: 0.24 }}
            >
              {/* Month label */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-shrink-0 w-3 bg-border/80" />
                <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest flex-shrink-0">{month}</p>
                <div className="h-px flex-1 bg-border/30" />
              </div>

              {/* Entries */}
              <div className="space-y-2 pl-4 border-l border-border/40">
                {monthEntries.map((entry, ei) => {
                  const d   = new Date(entry.date);
                  const day = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

                  return (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: gi * 0.06 + ei * 0.04 }}
                      className="group relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border border-border/80 bg-[#0f0f0f] group-hover:border-primary/50 group-hover:bg-primary/10 transition-all" />

                      <div className="bg-[#0f0f0f] border border-border/60 rounded-xl px-5 py-4 hover:border-border hover:bg-white/[0.015] transition-all card-hover-glow">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: date + content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">{day}</span>
                              {entry.topic && (
                                <>
                                  <span className="text-text-muted/40">·</span>
                                  <span className="text-[11px] font-mono text-text-muted truncate">{entry.topic}</span>
                                </>
                              )}
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                                entry.published ? "status-published" : "status-draft"
                              }`}>
                                {entry.published ? "Pub" : "Draft"}
                              </span>
                              {entry.featured && (
                                <span className="text-primary text-[11px] font-mono">★</span>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold font-clash text-text-primary group-hover:text-primary transition-colors leading-snug">
                              {entry.title}
                            </h3>
                            {entry.summary && (
                              <p className="text-xs text-text-muted mt-1.5 leading-relaxed line-clamp-2">{entry.summary}</p>
                            )}
                            {/* Chips: learned / built */}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {entry.learned && (
                                <span className="text-[10px] font-mono text-text-muted bg-white/[0.03] border border-border/40 px-2 py-0.5 rounded">
                                  Learned · {entry.learned.substring(0, 40)}{entry.learned.length > 40 ? "…" : ""}
                                </span>
                              )}
                              {entry.built && (
                                <span className="text-[10px] font-mono text-primary/60 bg-primary/[0.04] border border-primary/10 px-2 py-0.5 rounded">
                                  Built · {entry.built.substring(0, 40)}{entry.built.length > 40 ? "…" : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleTogglePublish(entry)}
                              disabled={togglingId === entry._id}
                              title={entry.published ? "Unpublish" : "Publish"}
                              className={`p-1.5 rounded-md transition-all disabled:opacity-50 ${
                                entry.published ? "text-success hover:text-yellow-400 hover:bg-yellow-400/10" : "text-text-muted hover:text-success hover:bg-success/10"
                              }`}
                            >
                              {togglingId === entry._id
                                ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                : entry.published ? <EyeOff size={14} /> : <Eye size={14} />
                              }
                            </button>
                            <Link href={`/admin/journey/${entry._id}/edit`} title="Edit"
                              className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-all">
                              <Edit2 size={14} />
                            </Link>
                            <button onClick={() => requestDelete(entry._id, entry.title)} title="Delete"
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
