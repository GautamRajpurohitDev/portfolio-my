"use client";

import React, { useEffect, useState, useCallback } from "react";
import { skillsApi } from "@/lib/api";
import { Skill, SkillStatus } from "@/types";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Layers, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const CATEGORY_LABELS: Record<string, string> = {
  "programming":    "Programming Languages",
  "cs-fundamentals":"CS Fundamentals",
  "web":            "Web Development",
  "databases":      "Databases",
  "systems":        "Systems & OS",
  "cloud":          "Cloud & DevOps",
  "ai-ml":          "AI & Machine Learning",
  "mobile":         "Mobile Development",
  "tools":          "Tools & Workflow",
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  "in-progress": { label: "In Progress", cls: "bg-accent/10 border-accent/30 text-accent" },
  "learning":    { label: "In Progress", cls: "bg-accent/10 border-accent/30 text-accent" },
  "practicing":  { label: "Practicing",  cls: "bg-amber-400/10 border-amber-400/30 text-amber-400" },
  "review":      { label: "In Review",   cls: "bg-blue-400/10 border-blue-400/30 text-blue-400" },
  "completed":   { label: "Completed",   cls: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400" },
  "not-started": { label: "Planned",     cls: "bg-white/[0.04] border-border/40 text-text-muted" },
  "planned":     { label: "Planned",     cls: "bg-white/[0.04] border-border/40 text-text-muted" },
  "optional":    { label: "Optional",    cls: "bg-purple-400/10 border-purple-400/30 text-purple-400" },
  "paused":      { label: "Paused",      cls: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400" },
};

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${cls}`}>
      {text}
    </span>
  );
}

export default function AdminSkillsPage() {
  const [skills, setSkills]           = useState<Skill[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId]     = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await skillsApi.getAllAdmin();
      setSkills(res.data.data);
    } catch { toast.error("Failed to fetch skills"); }
    finally  { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const requestDelete = (id: string, name: string) => {
    setPendingId(id); setPendingName(name); setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await skillsApi.delete(pendingId);
      toast.success("Skill deleted");
      fetch();
    } catch { toast.error("Failed to delete skill"); }
    finally  { setConfirmLoading(false); setPendingId(null); setPendingName(""); }
  };

  const handleToggle = async (s: Skill) => {
    setTogglingId(s._id);
    try {
      await skillsApi.update(s._id, { published: !s.published });
      toast.success(s.published ? "Skill hidden" : "Skill published");
      fetch();
    } catch { toast.error("Failed to update skill"); }
    finally  { setTogglingId(null); }
  };

  const filtered = skills
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

  // Group by category
  const groups = new Map<string, Skill[]>();
  filtered.forEach(s => {
    if (!groups.has(s.category)) groups.set(s.category, []);
    groups.get(s.category)!.push(s);
  });

  return (
    <div className="space-y-7 pb-14">
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Delete skill?" description={`"${pendingName}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={handleDelete} isLoading={confirmLoading}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">04 / Capabilities & Stack</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Skills Management Desk</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your authentic skill inventory. Edit statuses, set progress (0–100%), and organize domain roadmaps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/skills"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono text-text-muted border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
          >
            Preview Public Page ↗
          </Link>
          <Link href="/admin/skills/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit">
            <Plus size={15} /> Add New Skill
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search skills…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        {!isLoading && (
          <span className="ml-auto text-[11px] font-mono text-text-muted">{filtered.length} total skills</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="admin-skeleton rounded-xl h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-12 text-center space-y-4">
          <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
            {search ? "No results" : "No skills yet"}
          </p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            {search ? "Try a different search term." : "Start by adding your genuine capabilities and planned learning paths."}
          </p>
          {search ? (
            <button onClick={() => setSearch("")} className="text-xs font-mono text-primary uppercase tracking-wider">Clear search</button>
          ) : (
            <Link href="/admin/skills/new" className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider">
              <Plus size={11} /> Add first skill
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([cat, catSkills], gi) => (
            <motion.section
              key={cat}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest flex-shrink-0">
                  {CATEGORY_LABELS[cat] || cat}
                </p>
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-mono text-text-muted">{catSkills.length}</span>
              </div>

              {/* Skills grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catSkills.map((skill, si) => {
                  const stCfg = STATUS_CFG[skill.status] ?? { label: skill.status, cls: "bg-white/[0.04] border-border/40 text-text-muted" };
                  const hasProgress = typeof skill.progress === "number" && skill.progress > 0;

                  return (
                    <motion.div
                      key={skill._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: gi * 0.05 + si * 0.03 }}
                      className="group bg-[#0f0f0f] border border-border/60 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-primary/40 hover:bg-white/[0.02] transition-all"
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${skill.published ? "bg-emerald-400" : "bg-zinc-600"}`} title={skill.published ? "Published" : "Hidden"} />
                            <p className="text-sm font-semibold text-text-primary font-body">{skill.name}</p>
                          </div>
                          {hasProgress && (
                            <span className="text-xs font-mono font-bold text-accent">
                              {skill.progress}%
                            </span>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          <Badge text={stCfg.label} cls={stCfg.cls} />
                          {skill.featured && (
                            <span className="text-[9px] font-mono uppercase text-accent border border-accent/30 bg-accent/5 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom action row with obvious EDIT & DELETE */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <span className="text-[10px] font-mono text-text-muted">Order: {skill.order ?? 0}</span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(skill)}
                            disabled={togglingId === skill._id}
                            title={skill.published ? "Hide from public site" : "Publish to public site"}
                            className={`p-1.5 rounded transition-all disabled:opacity-50 ${skill.published ? "text-emerald-400 hover:text-yellow-400" : "text-text-muted hover:text-emerald-400"}`}
                          >
                            {togglingId === skill._id
                              ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : skill.published ? <Eye size={13} /> : <EyeOff size={13} />
                            }
                          </button>

                          <Link
                            href={`/admin/skills/${skill._id}/edit`}
                            title="Edit Skill Details"
                            className="flex items-center gap-1 px-2 py-1 bg-white/[0.04] hover:bg-primary/20 text-text-secondary hover:text-primary rounded text-[11px] font-mono uppercase tracking-wider transition-colors"
                          >
                            <Edit2 size={11} /> Edit
                          </Link>

                          <button
                            onClick={() => requestDelete(skill._id, skill.name)}
                            title="Delete Skill"
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}
