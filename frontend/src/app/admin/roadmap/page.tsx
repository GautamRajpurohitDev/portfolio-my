"use client";

import React, { useEffect, useState, useCallback } from "react";
import { roadmapApi, settingsApi } from "@/lib/api";
import type { RoadmapPhase, RoadmapDomain, RoadmapTopic, RoadmapStatus } from "@/types";
import {
  Map, Plus, ChevronRight, ChevronDown, Edit3, Trash2, Save, X,
  CheckCircle2, Circle, Clock, Zap, BookOpen, Loader2, AlertTriangle,
  GripVertical, Star, MoreVertical, ArrowUpDown, Target, Layers,
  GitBranch, Globe, Database, Code2, Network, Shield, Cloud, Brain,
  Sparkles, Terminal, Settings, Trophy, Calculator, Sigma
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────

type SelectionType = "phase" | "domain" | "topic" | null;
type Selection = { type: SelectionType; id: string } | null;
type Panel = "tree" | "domains" | "editor";

// ── Status Config ─────────────────────────────────────────────

const STATUS_CONFIG: Record<RoadmapStatus, { label: string; color: string; bg: string; dotColor: string }> = {
  "not-started": { label: "Not Started",  color: "text-text-muted",    bg: "bg-white/[0.03]",   dotColor: "bg-white/20" },
  "up-next":     { label: "Up Next",      color: "text-blue-400",      bg: "bg-blue-500/10",    dotColor: "bg-blue-400" },
  "in-progress": { label: "In Progress",  color: "text-accent",        bg: "bg-accent/10",      dotColor: "bg-accent" },
  "practicing":  { label: "Practicing",   color: "text-emerald-400",   bg: "bg-emerald-500/10", dotColor: "bg-emerald-400" },
  "review":      { label: "Review",       color: "text-purple-400",    bg: "bg-purple-500/10",  dotColor: "bg-purple-400" },
  "completed":   { label: "Completed",    color: "text-emerald-400",   bg: "bg-emerald-500/10", dotColor: "bg-emerald-400" },
  "optional":    { label: "Optional",     color: "text-text-muted",    bg: "bg-white/[0.03]",   dotColor: "bg-white/10" },
  "paused":      { label: "Paused",       color: "text-orange-400",    bg: "bg-orange-500/10",  dotColor: "bg-orange-400" },
};

const ALL_STATUSES: RoadmapStatus[] = [
  "not-started","up-next","in-progress","practicing","review","completed","optional","paused"
];

// ── Helpers ───────────────────────────────────────────────────

function StatusBadge({ status, size = "sm" }: { status: RoadmapStatus; size?: "xs" | "sm" | "md" }) {
  const cfg = STATUS_CONFIG[status];
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0.5" : size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-widest ${sizeClass} ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

function ProgressRing({ value, size = 32, strokeWidth = 3, color = "#e8c547" }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}

function Skel({ className = "" }: { className?: string }) {
  return <div className={`admin-skeleton rounded-lg ${className}`} />;
}

// ── Phase Icon Map ────────────────────────────────────────────

const PHASE_ICONS: Record<string, React.ElementType> = {
  GitBranch, BookOpen, Calculator, Trophy, Code2, Sigma,
  Network, Layers, Globe, Terminal, Cloud, Shield, Brain,
  Sparkles, Settings, Target, Map, Database, Zap,
};

function PhaseIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = PHASE_ICONS[name] || BookOpen;
  return <Icon size={size} />;
}

// ── Phase Tree Sidebar ────────────────────────────────────────

function PhaseTreeItem({
  phase,
  isSelected,
  onSelect,
  onSetCurrent,
}: {
  phase: RoadmapPhase;
  isSelected: boolean;
  onSelect: () => void;
  onSetCurrent: (title: string) => void;
}) {
  const cfg = STATUS_CONFIG[phase.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-150 select-none
        ${isSelected
          ? "bg-accent/10 border border-accent/20"
          : "hover:bg-white/[0.03] border border-transparent"
        }
      `}
      onClick={onSelect}
    >
      {/* Progress ring + icon */}
      <div className="relative flex-shrink-0">
        <ProgressRing value={phase.progress} size={34} strokeWidth={2.5} color={phase.color || "#e8c547"} />
        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
          <PhaseIcon name={phase.icon} size={13} />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-text-muted">
            {String(phase.number).padStart(2, "0")}
          </span>
          <span className={`text-xs font-medium truncate ${isSelected ? "text-accent" : "text-text-primary"}`}>
            {phase.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={phase.status} size="xs" />
          {phase.progress > 0 && (
            <span className="text-[9px] font-mono text-text-muted">{phase.progress}%</span>
          )}
        </div>
      </div>

      {/* Actions (visible on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        {phase.status === "in-progress" && (
          <button
            onClick={(e) => { e.stopPropagation(); onSetCurrent(phase.title); }}
            title="Set as current focus"
            className="p-1 rounded-md text-accent hover:bg-accent/10 transition-colors"
          >
            <Star size={11} />
          </button>
        )}
        <ChevronRight size={12} className={`text-text-muted ${isSelected ? "text-accent rotate-90" : ""} transition-transform`} />
      </div>
    </motion.div>
  );
}

// ── Domain Panel Item ─────────────────────────────────────────

function DomainItem({
  domain,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  domain: RoadmapDomain;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[domain.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
        transition-all duration-150
        ${isSelected
          ? "bg-accent/10 border border-accent/20"
          : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]"
        }
      `}
      onClick={onSelect}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? "text-accent" : "text-text-primary"}`}>
          {domain.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={domain.status} size="xs" />
          {domain.progress > 0 && (
            <span className="text-[9px] font-mono text-text-muted">{domain.progress}%</span>
          )}
        </div>
      </div>

      {/* Action menu */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-all"
        >
          <MoreVertical size={14} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-0 top-8 z-50 w-32 bg-surface border border-border rounded-xl shadow-2xl py-1 overflow-hidden"
            >
              <button onClick={() => { onEdit(); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors">
                <Edit3 size={12} /> Edit
              </button>
              <button onClick={() => { onDelete(); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Topic Item ────────────────────────────────────────────────

function TopicItem({
  topic,
  isSelected,
  onSelect,
  onStatusChange,
  onDelete,
}: {
  topic: RoadmapTopic;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (status: RoadmapStatus) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[topic.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all duration-150 overflow-hidden
        ${isSelected
          ? "border-accent/20 bg-accent/5"
          : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.10]"
        }
      `}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={onSelect}
      >
        {/* Status dot */}
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotColor}`} />

        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary truncate">{topic.title}</p>
          {topic.subtopics.length > 0 && (
            <p className="text-[10px] text-text-muted mt-0.5">{topic.subtopics.length} subtopics</p>
          )}
        </div>

        {/* Quick status picker */}
        <select
          value={topic.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(e.target.value as RoadmapStatus)}
          className="text-[10px] bg-transparent border border-white/[0.08] rounded-lg px-1.5 py-1 text-text-muted focus:outline-none focus:border-accent/40 cursor-pointer"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Subtopics */}
      <AnimatePresence>
        {expanded && topic.subtopics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.05] px-4 py-2.5 bg-white/[0.01]"
          >
            <div className="flex flex-wrap gap-1.5">
              {topic.subtopics.map((st, i) => (
                <span key={i} className="text-[10px] bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-0.5 text-text-muted">
                  {st}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Phase Editor Form ─────────────────────────────────────────

function PhaseEditorForm({
  phase,
  onSave,
  onCancel,
  saving,
}: {
  phase: RoadmapPhase;
  onSave: (data: Partial<RoadmapPhase>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    title: phase.title,
    subtitle: phase.subtitle,
    description: phase.description,
    overview: phase.overview,
    status: phase.status,
    progress: phase.progress,
    icon: phase.icon,
    color: phase.color,
    isOptional: phase.isOptional,
    published: phase.published,
    learningObjectives: phase.learningObjectives.join("\n"),
    prerequisites: phase.prerequisites.join("\n"),
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    onSave({
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      overview: form.overview,
      status: form.status as RoadmapStatus,
      progress: Number(form.progress),
      icon: form.icon,
      color: form.color,
      isOptional: form.isOptional,
      published: form.published,
      learningObjectives: form.learningObjectives.split("\n").map((s) => s.trim()).filter(Boolean),
      prerequisites: form.prerequisites.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Edit Phase</h3>
          <p className="text-[10px] text-text-muted font-mono mt-0.5">PHASE {String(phase.number).padStart(2,"0")}</p>
        </div>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Title</span>
          <input value={form.title} onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors" />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Subtitle</span>
          <input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)}
            className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Status</span>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}
              className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer">
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Progress %</span>
            <input type="number" min="0" max="100" value={form.progress}
              onChange={(e) => update("progress", e.target.value)}
              className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors" />
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Description</span>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2}
            className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors resize-none" />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Overview</span>
          <textarea value={form.overview} onChange={(e) => update("overview", e.target.value)} rows={3}
            className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors resize-none" />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Learning Objectives (one per line)</span>
          <textarea value={form.learningObjectives} onChange={(e) => update("learningObjectives", e.target.value)} rows={3}
            className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors resize-none font-mono text-xs" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Icon (Lucide name)</span>
            <input value={form.icon} onChange={(e) => update("icon", e.target.value)}
              className="mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors font-mono" />
          </label>
          <label className="block">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Color (hex)</span>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => update("color", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer p-0.5" />
              <input value={form.color} onChange={(e) => update("color", e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors font-mono" />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)}
              className="w-4 h-4 accent-accent rounded" />
            <span className="text-xs text-text-secondary">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isOptional} onChange={(e) => update("isOptional", e.target.checked)}
              className="w-4 h-4 accent-accent rounded" />
            <span className="text-xs text-text-secondary">Optional / Secondary Track</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-background text-xs font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save Changes
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 text-xs text-text-muted hover:text-text-primary border border-white/[0.08] rounded-xl hover:border-white/[0.16] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Domain / Topic Create Forms ───────────────────────────────

function CreateDomainForm({ phaseId, onSave, onCancel, saving }: {
  phaseId: string; onSave: (data: Record<string, unknown>) => void; onCancel: () => void; saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RoadmapStatus>("not-started");

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-text-primary">New Domain</p>
      <input placeholder="Domain title" value={title} onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors" />
      <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors resize-none" />
      <select value={status} onChange={(e) => setStatus(e.target.value as RoadmapStatus)}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors">
        {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
      </select>
      <div className="flex gap-2">
        <button disabled={!title.trim() || saving} onClick={() => onSave({ phase: phaseId, title, description, status })}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent text-background text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-accent/90 transition-colors">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Create
        </button>
        <button onClick={onCancel} className="px-3 py-2 text-xs text-text-muted border border-white/[0.08] rounded-xl hover:border-white/[0.16] transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function CreateTopicForm({ domainId, phaseId, onSave, onCancel, saving }: {
  domainId: string; phaseId: string; onSave: (data: Record<string, unknown>) => void; onCancel: () => void; saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [subtopics, setSubtopics] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-text-primary">New Topic</p>
      <input placeholder="Topic title" value={title} onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors" />
      <textarea placeholder="Subtopics (one per line)" value={subtopics} onChange={(e) => setSubtopics(e.target.value)} rows={4}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors resize-none font-mono text-xs" />
      <div className="flex gap-2">
        <button disabled={!title.trim() || saving} onClick={() => onSave({
          domain: domainId, phase: phaseId, title,
          subtopics: subtopics.split("\n").map((s) => s.trim()).filter(Boolean),
        })}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent text-background text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-accent/90 transition-colors">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Create
        </button>
        <button onClick={onCancel} className="px-3 py-2 text-xs text-text-muted border border-white/[0.08] rounded-xl hover:border-white/[0.16] transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────

export default function AdminRoadmapPage() {
  const [phases,    setPhases]    = useState<RoadmapPhase[]>([]);
  const [domains,   setDomains]   = useState<RoadmapDomain[]>([]);
  const [topics,    setTopics]    = useState<RoadmapTopic[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);

  const [selectedPhase,  setSelectedPhase]  = useState<RoadmapPhase | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<RoadmapDomain | null>(null);
  const [editingPhase,   setEditingPhase]   = useState<RoadmapPhase | null>(null);
  const [editingDomain,  setEditingDomain]  = useState<RoadmapDomain | null>(null);

  const [showCreateDomain, setShowCreateDomain] = useState(false);
  const [showCreateTopic,  setShowCreateTopic]  = useState(false);
  const [search,  setSearch]  = useState("");

  // ── Load ───────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, dRes, tRes] = await Promise.all([
        roadmapApi.getAllPhases(),
        roadmapApi.getAllDomains(),
        roadmapApi.getAllTopics(),
      ]);
      const ps = pRes.data.data as RoadmapPhase[];
      setPhases(ps);
      setDomains(dRes.data.data as RoadmapDomain[]);
      setTopics(tRes.data.data as RoadmapTopic[]);
      if (!selectedPhase && ps.length > 0) setSelectedPhase(ps[0]);
    } catch (e: any) {
      setError(e.message || "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  // ── Toast helper ───────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Phase actions ──────────────────────────────────────────

  const handleSavePhase = async (data: Partial<RoadmapPhase>) => {
    if (!editingPhase) return;
    setSaving(true);
    try {
      await roadmapApi.updatePhase(editingPhase._id, data);
      await load();
      setEditingPhase(null);
      showToast("Phase saved");
    } catch { showToast("Save failed"); } finally { setSaving(false); }
  };

  const handleSetCurrentFocus = async (title: string) => {
    try {
      await settingsApi.update({ currentlyLearning: { primary: title } });
      showToast(`Current focus set to "${title}"`);
    } catch { showToast("Failed to update current focus"); }
  };

  // ── Domain actions ─────────────────────────────────────────

  const handleCreateDomain = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await roadmapApi.createDomain(data);
      await load();
      setShowCreateDomain(false);
      showToast("Domain created");
    } catch { showToast("Create failed"); } finally { setSaving(false); }
  };

  const handleSaveDomain = async (data: Partial<RoadmapDomain>) => {
    if (!editingDomain) return;
    setSaving(true);
    try {
      await roadmapApi.updateDomain(editingDomain._id, data);
      await load();
      setEditingDomain(null);
      showToast("Domain saved");
    } catch { showToast("Save failed"); } finally { setSaving(false); }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm("Delete this domain and all its topics?")) return;
    try {
      await roadmapApi.deleteDomain(id);
      if (selectedDomain?._id === id) setSelectedDomain(null);
      await load();
      showToast("Domain deleted");
    } catch { showToast("Delete failed"); }
  };

  // ── Topic actions ──────────────────────────────────────────

  const handleCreateTopic = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await roadmapApi.createTopic(data);
      await load();
      setShowCreateTopic(false);
      showToast("Topic created");
    } catch { showToast("Create failed"); } finally { setSaving(false); }
  };

  const handleTopicStatusChange = async (topicId: string, status: RoadmapStatus) => {
    try {
      await roadmapApi.updateTopic(topicId, { status });
      setTopics((prev) => prev.map((t) => t._id === topicId ? { ...t, status } : t));
    } catch { showToast("Update failed"); }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Delete this topic?")) return;
    try {
      await roadmapApi.deleteTopic(id);
      setTopics((prev) => prev.filter((t) => t._id !== id));
      showToast("Topic deleted");
    } catch { showToast("Delete failed"); }
  };

  // ── Filtered data ──────────────────────────────────────────

  const phaseDomains = selectedPhase
    ? domains.filter((d) => (typeof d.phase === "string" ? d.phase : (d.phase as RoadmapPhase)._id) === selectedPhase._id)
    : [];

  const domainTopics = selectedDomain
    ? topics.filter((t) => (typeof t.domain === "string" ? t.domain : (t.domain as RoadmapDomain)._id) === selectedDomain._id)
    : [];

  const filteredPhases = search
    ? phases.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : phases;

  // ── Stats ──────────────────────────────────────────────────

  const totalPhases    = phases.length;
  const inProgressPhases = phases.filter((p) => p.status === "in-progress").length;
  const completedPhases  = phases.filter((p) => p.status === "completed").length;
  const totalDomains   = domains.length;
  const totalTopics    = topics.length;

  // ── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skel className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skel key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-[260px_1fr_1fr] gap-4 h-[600px]">
          <Skel className="h-full" />
          <Skel className="h-full" />
          <Skel className="h-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-text-secondary">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-accent text-background text-xs font-semibold rounded-xl">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map size={18} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Programming Mastery Roadmap</h1>
          </div>
          <p className="text-xs text-text-muted font-mono">ROADMAP MANAGER — ADMIN</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/roadmap" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-text-muted border border-white/[0.08] rounded-xl hover:border-white/[0.16] hover:text-text-primary transition-colors">
            <Globe size={12} /> View Public
          </a>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Phases",      value: totalPhases,      icon: Map },
          { label: "In Progress", value: inProgressPhases, icon: Zap },
          { label: "Domains",     value: totalDomains,     icon: Layers },
          { label: "Topics",      value: totalTopics,      icon: BookOpen },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-text-muted" />
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Three-panel layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-4 items-start">

        {/* ── Panel 1: Phase Tree ────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Phases</p>
            <input
              placeholder="Search phases…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
          <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
            {filteredPhases.map((phase) => (
              <PhaseTreeItem
                key={phase._id}
                phase={phase}
                isSelected={selectedPhase?._id === phase._id}
                onSelect={() => { setSelectedPhase(phase); setSelectedDomain(null); setEditingPhase(null); setShowCreateDomain(false); }}
                onSetCurrent={handleSetCurrentFocus}
              />
            ))}
            {filteredPhases.length === 0 && (
              <p className="text-xs text-text-muted text-center py-8">No phases found</p>
            )}
          </div>
        </div>

        {/* ── Panel 2: Domains ───────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {selectedPhase ? (
            <>
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                      Phase {String(selectedPhase.number).padStart(2,"0")} — Domains
                    </p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{selectedPhase.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEditingPhase(selectedPhase)}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors">
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => { setShowCreateDomain(true); setEditingDomain(null); }}
                      className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* Phase status + progress */}
                <div className="flex items-center gap-3 mt-3">
                  <StatusBadge status={selectedPhase.status} />
                  {selectedPhase.progress > 0 && (
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${selectedPhase.progress}%` }} />
                    </div>
                  )}
                  {selectedPhase.progress > 0 && (
                    <span className="text-[10px] font-mono text-text-muted">{selectedPhase.progress}%</span>
                  )}
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
                {/* Edit Phase form */}
                <AnimatePresence>
                  {editingPhase && editingPhase._id === selectedPhase._id && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="bg-white/[0.03] border border-accent/20 rounded-2xl p-4 mb-3">
                      <PhaseEditorForm
                        phase={editingPhase}
                        onSave={handleSavePhase}
                        onCancel={() => setEditingPhase(null)}
                        saving={saving}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Create domain form */}
                <AnimatePresence>
                  {showCreateDomain && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="bg-white/[0.03] border border-white/[0.10] rounded-2xl p-4 mb-2">
                      <CreateDomainForm
                        phaseId={selectedPhase._id}
                        onSave={handleCreateDomain}
                        onCancel={() => setShowCreateDomain(false)}
                        saving={saving}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {phaseDomains.length === 0 && !showCreateDomain && !editingPhase && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Layers size={28} className="text-text-muted mb-2 opacity-40" />
                    <p className="text-xs text-text-muted">No domains yet</p>
                    <button onClick={() => setShowCreateDomain(true)}
                      className="mt-3 text-xs text-accent hover:underline">Add first domain</button>
                  </div>
                )}

                {phaseDomains.map((domain) => (
                  <div key={domain._id}>
                    <DomainItem
                      domain={domain}
                      isSelected={selectedDomain?._id === domain._id}
                      onSelect={() => { setSelectedDomain(domain); setShowCreateTopic(false); }}
                      onEdit={() => setEditingDomain(domain)}
                      onDelete={() => handleDeleteDomain(domain._id)}
                    />
                    {/* Inline domain edit */}
                    <AnimatePresence>
                      {editingDomain?._id === domain._id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="mt-1 ml-4 bg-white/[0.03] border border-white/[0.10] rounded-xl p-3">
                          <div className="space-y-2">
                            <input value={editingDomain.title}
                              onChange={(e) => setEditingDomain({ ...editingDomain, title: e.target.value })}
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/40" />
                            <select value={editingDomain.status}
                              onChange={(e) => setEditingDomain({ ...editingDomain, status: e.target.value as RoadmapStatus })}
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/40">
                              {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                            </select>
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveDomain({ title: editingDomain.title, status: editingDomain.status })} disabled={saving}
                                className="px-3 py-1.5 bg-accent text-background text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-accent/90 transition-colors">
                                {saving ? "Saving…" : "Save"}
                              </button>
                              <button onClick={() => setEditingDomain(null)}
                                className="px-3 py-1.5 text-xs text-text-muted border border-white/[0.08] rounded-lg hover:border-white/[0.16] transition-colors">Cancel</button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
              Select a phase
            </div>
          )}
        </div>

        {/* ── Panel 3: Topics ────────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {selectedDomain ? (
            <>
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Topics</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{selectedDomain.title}</p>
                  </div>
                  <button onClick={() => setShowCreateTopic(true)}
                    className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors">
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
                <AnimatePresence>
                  {showCreateTopic && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="bg-white/[0.03] border border-white/[0.10] rounded-2xl p-4 mb-2">
                      <CreateTopicForm
                        domainId={selectedDomain._id}
                        phaseId={typeof selectedDomain.phase === "string" ? selectedDomain.phase : (selectedDomain.phase as RoadmapPhase)._id}
                        onSave={handleCreateTopic}
                        onCancel={() => setShowCreateTopic(false)}
                        saving={saving}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {domainTopics.length === 0 && !showCreateTopic && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen size={28} className="text-text-muted mb-2 opacity-40" />
                    <p className="text-xs text-text-muted">No topics yet</p>
                    <button onClick={() => setShowCreateTopic(true)}
                      className="mt-3 text-xs text-accent hover:underline">Add first topic</button>
                  </div>
                )}

                <div className="group">
                  {domainTopics.map((topic) => (
                    <div key={topic._id} className="mb-2">
                      <TopicItem
                        topic={topic}
                        isSelected={false}
                        onSelect={() => {}}
                        onStatusChange={(status) => handleTopicStatusChange(topic._id, status)}
                        onDelete={() => handleDeleteTopic(topic._id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
              Select a domain
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-2xl shadow-2xl text-sm text-text-primary"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
