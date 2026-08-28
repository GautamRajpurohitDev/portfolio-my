"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { roadmapApi, settingsApi } from "@/lib/api";
import type { RoadmapPhase, RoadmapDomain, RoadmapTopic, RoadmapStatus } from "@/types";
import {
  Map, Plus, ChevronRight, ChevronDown, Edit3, Trash2, Save, X,
  CheckCircle2, Circle, Clock, Zap, BookOpen, Loader2, AlertTriangle,
  Star, MoreVertical, Target, Layers,
  GitBranch, Globe, Database, Code2, Network, Shield, Cloud, Brain,
  Sparkles, Terminal, Settings, Trophy, Calculator, Sigma,
  GripVertical, ExternalLink,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  "not-started", "up-next", "in-progress", "practicing", "review", "completed", "optional", "paused"
];

// ── Helpers ───────────────────────────────────────────────────

function StatusBadge({ status, size = "sm" }: { status: RoadmapStatus; size?: "xs" | "sm" | "md" }) {
  const cfg = STATUS_CONFIG[status];
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0.5" : size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-widest ${sizeClass} ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
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

// ── SaveStatusIndicator ───────────────────────────────────────

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className={`text-[10px] font-mono flex items-center gap-1 ${
          status === "saving" ? "text-text-muted" :
          status === "saved"  ? "text-emerald-400" :
          "text-red-400"
        }`}
      >
        {status === "saving" && <Loader2 size={10} className="animate-spin" />}
        {status === "saved"  && <CheckCircle2 size={10} />}
        {status === "error"  && <AlertTriangle size={10} />}
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save failed"}
      </motion.span>
    </AnimatePresence>
  );
}

// ── Left Panel: Phase Tree Sidebar ───────────────────────────

function PhaseTreeItem({
  phase,
  isSelected,
  onSelect,
  onSetCurrent,
}: {
  phase: RoadmapPhase;
  isSelected: boolean;
  onSelect: () => void;
  onSetCurrent: (phase: RoadmapPhase) => void;
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

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSetCurrent(phase); }}
          title={`Set "${phase.title}" as current roadmap focus`}
          className="p-1 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
        >
          <Star size={11} />
        </button>
        <ChevronRight size={12} className={`text-text-muted ${isSelected ? "text-accent" : ""} transition-transform`} />
      </div>
    </motion.div>
  );
}

// ── Center Panel: Unified Phase Editor ───────────────────────

interface PhaseEditorFormProps {
  phase: RoadmapPhase;
  onSave: (data: Partial<RoadmapPhase>) => Promise<void>;
  saveStatus: SaveStatus;
  hasUnsaved: boolean;
  setHasUnsaved: (v: boolean) => void;
}

function PhaseEditorForm({ phase, onSave, saveStatus, hasUnsaved, setHasUnsaved }: PhaseEditorFormProps) {
  const [form, setForm] = useState({
    title:              phase.title,
    subtitle:           phase.subtitle || "",
    description:        phase.description || "",
    overview:           phase.overview || "",
    status:             phase.status,
    progress:           phase.progress,
    icon:               phase.icon,
    color:              phase.color,
    isOptional:         phase.isOptional,
    published:          phase.published,
    learningObjectives: phase.learningObjectives?.length ? phase.learningObjectives : [],
    prerequisites:      phase.prerequisites?.length ? phase.prerequisites : [],
  });

  // Reset form when phase changes
  useEffect(() => {
    setForm({
      title:              phase.title,
      subtitle:           phase.subtitle || "",
      description:        phase.description || "",
      overview:           phase.overview || "",
      status:             phase.status,
      progress:           phase.progress,
      icon:               phase.icon,
      color:              phase.color,
      isOptional:         phase.isOptional,
      published:          phase.published,
      learningObjectives: phase.learningObjectives?.length ? phase.learningObjectives : [],
      prerequisites:      phase.prerequisites?.length ? phase.prerequisites : [],
    });
    setHasUnsaved(false);
  }, [phase._id]); // eslint-disable-line

  const update = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
    setHasUnsaved(true);
  };

  const handleSubmit = async () => {
    await onSave({
      title:              form.title,
      subtitle:           form.subtitle,
      description:        form.description,
      overview:           form.overview,
      status:             form.status as RoadmapStatus,
      progress:           Number(form.progress),
      icon:               form.icon,
      color:              form.color,
      isOptional:         form.isOptional,
      published:          form.published,
      learningObjectives: form.learningObjectives.filter(Boolean),
      prerequisites:      form.prerequisites.filter(Boolean),
    });
    setHasUnsaved(false);
  };

  // Objective list helpers
  const addObjective = () => update("learningObjectives", [...form.learningObjectives, ""]);
  const updateObjective = (i: number, val: string) => {
    const next = [...form.learningObjectives];
    next[i] = val;
    update("learningObjectives", next);
  };
  const removeObjective = (i: number) => {
    update("learningObjectives", form.learningObjectives.filter((_, idx) => idx !== i));
  };

  const progressVal = Number(form.progress);

  return (
    <div className="flex flex-col h-full">
      {/* ── Editor Header ──────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-mono text-primary font-semibold tracking-wider uppercase block mb-1">
              Phase {String(phase.number).padStart(2, "0")} / Edit
            </span>
            <h2 className="text-base font-clash font-bold text-text-primary uppercase tracking-tight truncate">
              {phase.title}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <SaveStatusIndicator status={saveStatus} />
            {hasUnsaved && saveStatus === "idle" && (
              <span className="text-[10px] font-mono text-text-muted">Unsaved changes</span>
            )}
            <a
              href="/roadmap"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
              title="Preview public roadmap"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Scrollable Fields ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-7 min-h-0">

        {/* 01 / IDENTITY & STATUS */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">
            01 / Identity & Status
          </span>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">Title</span>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">Subtitle</span>
            <input
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="One-line tagline for this phase"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">Status</span>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full bg-[#141414] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </label>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">
                Progress — {progressVal}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressVal}
                onChange={(e) => update("progress", e.target.value)}
                className="w-full h-2 accent-primary cursor-pointer mb-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={progressVal}
                onChange={(e) => update("progress", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 02 / DESCRIPTION & OVERVIEW */}
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">
            02 / Description & Overview
          </span>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">Summary Description</span>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Short description shown in phase cards…"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">Detailed Overview</span>
            <textarea
              value={form.overview}
              onChange={(e) => update("overview", e.target.value)}
              rows={3}
              placeholder="Expanded overview for the phase detail view…"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
            />
          </label>
        </div>

        {/* 03 / LEARNING OBJECTIVES */}
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
              03 / Learning Objectives
            </span>
            <button
              type="button"
              onClick={addObjective}
              className="flex items-center gap-1 text-[10px] font-mono text-accent hover:text-accent/80 transition-colors"
            >
              <Plus size={10} /> Add Objective
            </button>
          </div>

          {form.learningObjectives.length === 0 ? (
            <p className="text-[11px] text-text-muted italic">No objectives yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {form.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted w-4 flex-shrink-0">{i + 1}.</span>
                  <input
                    value={obj}
                    onChange={(e) => updateObjective(i, e.target.value)}
                    placeholder="e.g. Understand pointer arithmetic"
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(i)}
                    className="p-1.5 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 04 / APPEARANCE */}
        <div className="space-y-3.5 pt-3 border-t border-white/[0.06]">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">
            04 / Appearance
          </span>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Icon (Lucide key)</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-white/[0.05] border border-white/[0.08] rounded-lg text-text-muted flex-shrink-0">
                  <PhaseIcon name={form.icon} size={14} />
                </div>
                <input
                  value={form.icon}
                  onChange={(e) => update("icon", e.target.value)}
                  placeholder="e.g. Code2"
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors font-mono"
                />
              </div>
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Theme Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer p-0.5 flex-shrink-0"
                />
                <input
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-colors font-mono"
                />
              </div>
            </label>
          </div>
        </div>

        {/* 05 / PUBLISHING */}
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">
            05 / Publishing
          </span>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update("published", e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-xs text-text-secondary">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isOptional}
                onChange={(e) => update("isOptional", e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-xs text-text-secondary">Optional / Secondary Track</span>
            </label>
          </div>
        </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-white/[0.08] flex-shrink-0 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-[#090909] text-xs font-clash font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {saveStatus === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ── Right Panel: Domain Item ──────────────────────────────────

interface DomainAccordionItemProps {
  domain: RoadmapDomain;
  topics: RoadmapTopic[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditDomain: () => void;
  onDeleteDomain: () => void;
  onCreateTopic: () => void;
  onTopicStatusChange: (topicId: string, status: RoadmapStatus) => void;
  onDeleteTopic: (topicId: string) => void;
  editingDomain: RoadmapDomain | null;
  setEditingDomain: (d: RoadmapDomain | null) => void;
  handleSaveDomain: (data: Partial<RoadmapDomain>) => void;
  saving: boolean;
}

function DomainAccordionItem({
  domain, topics, isExpanded, onToggle,
  onEditDomain, onDeleteDomain, onCreateTopic,
  onTopicStatusChange, onDeleteTopic,
  editingDomain, setEditingDomain, handleSaveDomain, saving,
}: DomainAccordionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[domain.status];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-150 ${
      isExpanded
        ? "border-accent/20 bg-accent/[0.03]"
        : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.10]"
    }`}>
      {/* Domain row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotColor}`} />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isExpanded ? "text-accent" : "text-text-primary"}`}>
            {domain.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={domain.status} size="xs" />
            {domain.progress > 0 && (
              <span className="text-[9px] font-mono text-text-muted">{domain.progress}%</span>
            )}
            <span className="text-[9px] font-mono text-text-muted">
              {topics.length} topic{topics.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Domain menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={13} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-8 z-50 w-32 bg-[#141414] border border-white/[0.10] rounded-xl shadow-2xl py-1 overflow-hidden"
              >
                <button
                  onClick={() => { onEditDomain(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => { onDeleteDomain(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ChevronDown
          size={13}
          className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Domain inline editor */}
      <AnimatePresence>
        {editingDomain?._id === domain._id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <div className="space-y-2">
              <input
                value={editingDomain.title}
                onChange={(e) => setEditingDomain({ ...editingDomain, title: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40"
              />
              <select
                value={editingDomain.status}
                onChange={(e) => setEditingDomain({ ...editingDomain, status: e.target.value as RoadmapStatus })}
                className="w-full bg-[#141414] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40"
              >
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveDomain({ title: editingDomain.title, status: editingDomain.status })}
                  disabled={saving}
                  className="px-3 py-1.5 bg-accent text-[#090909] text-xs font-bold rounded-lg disabled:opacity-40 hover:bg-accent/90 transition-colors"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditingDomain(null)}
                  className="px-3 py-1.5 text-xs text-text-muted border border-white/[0.08] rounded-lg hover:border-white/[0.16] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topics accordion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.05]"
          >
            <div className="px-3 py-2 space-y-1.5">
              {topics.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <BookOpen size={20} className="text-text-muted mb-1.5 opacity-30" />
                  <p className="text-[11px] text-text-muted">No topics yet</p>
                  <button
                    onClick={onCreateTopic}
                    className="mt-2 text-[11px] text-accent hover:underline"
                  >
                    Add first topic
                  </button>
                </div>
              ) : (
                topics.map((topic) => (
                  <TopicRowItem
                    key={topic._id}
                    topic={topic}
                    onStatusChange={(status) => onTopicStatusChange(topic._id, status)}
                    onDelete={() => onDeleteTopic(topic._id)}
                  />
                ))
              )}
              <button
                onClick={onCreateTopic}
                className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg border border-dashed border-white/[0.08] hover:border-accent/30 text-[11px] font-mono text-text-muted hover:text-accent transition-all"
              >
                <Plus size={11} /> Add Topic
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Topic Row Item ────────────────────────────────────────────

function TopicRowItem({
  topic,
  onStatusChange,
  onDelete,
}: {
  topic: RoadmapTopic;
  onStatusChange: (s: RoadmapStatus) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[topic.status];

  return (
    <motion.div
      layout
      className="rounded-lg border border-white/[0.05] bg-white/[0.01] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
        <p className="flex-1 text-xs text-text-primary truncate">{topic.title}</p>
        {topic.subtopics.length > 0 && (
          <span className="text-[9px] text-text-muted font-mono flex-shrink-0">
            {topic.subtopics.length} sub
          </span>
        )}
        <select
          value={topic.status}
          onChange={(e) => onStatusChange(e.target.value as RoadmapStatus)}
          className="text-[9px] bg-transparent border border-white/[0.06] rounded-md px-1 py-0.5 text-text-muted focus:outline-none focus:border-accent/30 cursor-pointer flex-shrink-0"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        {topic.subtopics.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-0.5 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && topic.subtopics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.04] px-3 py-2 bg-white/[0.01]"
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

// ── Create Forms ──────────────────────────────────────────────

function CreateDomainForm({ phaseId, onSave, onCancel, saving }: {
  phaseId: string; onSave: (data: Record<string, unknown>) => void; onCancel: () => void; saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<RoadmapStatus>("not-started");

  return (
    <div className="space-y-2.5 bg-white/[0.03] border border-accent/20 rounded-xl p-4">
      <p className="text-[10px] font-mono text-accent uppercase tracking-widest">New Domain</p>
      <input
        placeholder="Domain title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40 transition-colors"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as RoadmapStatus)}
        className="w-full bg-[#141414] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40 transition-colors"
      >
        {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
      </select>
      <div className="flex gap-2">
        <button
          disabled={!title.trim() || saving}
          onClick={() => onSave({ phase: phaseId, title, status })}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent text-[#090909] text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Create
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-xs text-text-muted border border-white/[0.08] rounded-xl hover:border-white/[0.16] transition-colors"
        >
          Cancel
        </button>
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
    <div className="space-y-2.5 bg-white/[0.03] border border-accent/20 rounded-xl p-4">
      <p className="text-[10px] font-mono text-accent uppercase tracking-widest">New Topic</p>
      <input
        placeholder="Topic title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40 transition-colors"
      />
      <textarea
        placeholder={"Subtopics (one per line)\nWhat Git Is\nWorking Tree\nCommit Model"}
        value={subtopics}
        onChange={(e) => setSubtopics(e.target.value)}
        rows={3}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40 transition-colors resize-none font-mono"
      />
      <div className="flex gap-2">
        <button
          disabled={!title.trim() || saving}
          onClick={() => onSave({
            domain: domainId,
            phase: phaseId,
            title,
            subtopics: subtopics.split("\n").map((s) => s.trim()).filter(Boolean),
          })}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent text-[#090909] text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Create
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-xs text-text-muted border border-white/[0.08] rounded-xl hover:border-white/[0.16] transition-colors"
        >
          Cancel
        </button>
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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const [selectedPhase,  setSelectedPhase]  = useState<RoadmapPhase | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [editingDomain,  setEditingDomain]  = useState<RoadmapDomain | null>(null);

  const [showCreateDomain, setShowCreateDomain] = useState(false);
  const [createTopicForDomain, setCreateTopicForDomain] = useState<string | null>(null);
  const [search,  setSearch]  = useState("");

  // ── Load ────────────────────────────────────────────────────

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

  // ── Keyboard shortcut: Ctrl/Cmd+S ───────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (selectedPhase && hasUnsaved && saveStatus !== "saving") {
          // Trigger save via ref
          saveRef.current?.();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedPhase, hasUnsaved, saveStatus]);

  const saveRef = useRef<(() => void) | null>(null);

  // ── Toast helper ────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Phase save ──────────────────────────────────────────────

  const handleSavePhase = async (data: Partial<RoadmapPhase>) => {
    if (!selectedPhase) return;
    setSaveStatus("saving");
    try {
      await roadmapApi.updatePhase(selectedPhase._id, data);
      // Update local phase list
      setPhases((prev) => prev.map((p) => p._id === selectedPhase._id ? { ...p, ...data } : p));
      setSelectedPhase((p) => p ? { ...p, ...data } : p);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleSetCurrentFocus = async (phase: RoadmapPhase) => {
    try {
      await settingsApi.update({
        currentlyLearning: {
          currentLearningPhaseId: phase._id,
          primary: phase.title,
        },
      });
      showToast(`Current focus → "${phase.title}"`);
    } catch { showToast("Failed to update current focus"); }
  };

  // ── Domain actions ──────────────────────────────────────────

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
      if (expandedDomain === id) setExpandedDomain(null);
      await load();
      showToast("Domain deleted");
    } catch { showToast("Delete failed"); }
  };

  // ── Topic actions ───────────────────────────────────────────

  const handleCreateTopic = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await roadmapApi.createTopic(data);
      await load();
      setCreateTopicForDomain(null);
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

  // ── Derived data ────────────────────────────────────────────

  const phaseDomains = selectedPhase
    ? domains.filter((d) => (typeof d.phase === "string" ? d.phase : (d.phase as RoadmapPhase)._id) === selectedPhase._id)
    : [];

  const filteredPhases = search
    ? phases.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : phases;

  const totalPhases      = phases.length;
  const inProgressPhases = phases.filter((p) => p.status === "in-progress").length;
  const completedPhases  = phases.filter((p) => p.status === "completed").length;
  const totalDomains     = domains.length;
  const totalTopics      = topics.length;

  // ── Loading / Error ─────────────────────────────────────────

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
        <button onClick={load} className="px-4 py-2 bg-accent text-[#090909] text-xs font-bold rounded-xl">Retry</button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6 min-h-screen pb-14">
      {/* ── Header ──────────────────────────────────────────── */}
      <AdminPageHeader
        eyebrow="PORTFOLIO / ROADMAP"
        title="Programming Mastery Roadmap"
        description="Manage learning phases, domains, and topic-level progress tracking."
        actions={
          <a
            href="/roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-mono text-text-secondary border border-border/70 rounded-lg hover:border-primary/30 hover:text-primary transition-all"
          >
            <Globe size={13} /> View Public
          </a>
        }
      />

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Phases",      value: totalPhases,      icon: Map },
          { label: "In Progress", value: inProgressPhases, icon: Zap },
          { label: "Completed",   value: completedPhases,  icon: CheckCircle2 },
          { label: "Domains",     value: totalDomains,     icon: Layers },
          { label: "Topics",      value: totalTopics,      icon: BookOpen },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#101010] border border-border/70 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={13} className="text-text-muted" />
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-2xl font-clash font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Three-panel layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── Panel 1: Phase List (25% = 3 cols) ──────────── */}
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 pt-4.5 pb-3.5 border-b border-white/[0.05]">
            <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-2 font-medium">Curriculum Phases</p>
            <input
              placeholder="Search phases…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
          <div className="p-2 space-y-1 max-h-[660px] overflow-y-auto">
            {filteredPhases.map((phase) => (
              <PhaseTreeItem
                key={phase._id}
                phase={phase}
                isSelected={selectedPhase?._id === phase._id}
                onSelect={() => {
                  setSelectedPhase(phase);
                  setExpandedDomain(null);
                  setEditingDomain(null);
                  setShowCreateDomain(false);
                  setCreateTopicForDomain(null);
                  setHasUnsaved(false);
                  setSaveStatus("idle");
                }}
                onSetCurrent={handleSetCurrentFocus}
              />
            ))}
            {filteredPhases.length === 0 && (
              <p className="text-xs text-text-muted text-center py-8">No phases found</p>
            )}
          </div>
        </div>

        {/* ── Panel 2: Unified Phase Editor (46% = 6 cols) ── */}
        <div className="lg:col-span-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: "660px" }}>
          {selectedPhase ? (
            <PhaseEditorForm
              key={selectedPhase._id}
              phase={selectedPhase}
              onSave={handleSavePhase}
              saveStatus={saveStatus}
              hasUnsaved={hasUnsaved}
              setHasUnsaved={setHasUnsaved}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted text-sm min-h-[400px]">
              Select a phase to edit
            </div>
          )}
        </div>

        {/* ── Panel 3: Domains + Topics (29% = 3 cols) ─────── */}
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {selectedPhase ? (
            <>
              {/* Panel header */}
              <div className="px-5 pt-4.5 pb-3.5 border-b border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-primary font-semibold tracking-wider uppercase">
                      Domains & Topics
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{selectedPhase.title}</p>
                  </div>
                  <button
                    onClick={() => { setShowCreateDomain(true); setCreateTopicForDomain(null); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-[#090909] text-xs font-clash font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Domain
                  </button>
                </div>
              </div>

              {/* Domains list */}
              <div className="p-3 space-y-2 max-h-[580px] overflow-y-auto">

                {/* Create domain form */}
                <AnimatePresence>
                  {showCreateDomain && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <CreateDomainForm
                        phaseId={selectedPhase._id}
                        onSave={handleCreateDomain}
                        onCancel={() => setShowCreateDomain(false)}
                        saving={saving}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {phaseDomains.length === 0 && !showCreateDomain && (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Layers size={28} className="text-text-muted mb-2 opacity-30" />
                    <p className="text-xs text-text-muted">No domains yet</p>
                    <button
                      onClick={() => setShowCreateDomain(true)}
                      className="mt-3 text-xs text-accent hover:underline"
                    >
                      Add first domain
                    </button>
                  </div>
                )}

                {/* Domain accordion items */}
                {phaseDomains.map((domain) => {
                  const domainTopics = topics.filter((t) =>
                    (typeof t.domain === "string" ? t.domain : (t.domain as RoadmapDomain)._id) === domain._id
                  );
                  return (
                    <div key={domain._id} className="group">
                      {/* Create topic form */}
                      <AnimatePresence>
                        {createTopicForDomain === domain._id && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-2"
                          >
                            <CreateTopicForm
                              domainId={domain._id}
                              phaseId={selectedPhase._id}
                              onSave={handleCreateTopic}
                              onCancel={() => setCreateTopicForDomain(null)}
                              saving={saving}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <DomainAccordionItem
                        domain={domain}
                        topics={domainTopics}
                        isExpanded={expandedDomain === domain._id}
                        onToggle={() => setExpandedDomain(expandedDomain === domain._id ? null : domain._id)}
                        onEditDomain={() => setEditingDomain(editingDomain?._id === domain._id ? null : domain)}
                        onDeleteDomain={() => handleDeleteDomain(domain._id)}
                        onCreateTopic={() => {
                          setCreateTopicForDomain(domain._id);
                          setExpandedDomain(domain._id);
                        }}
                        onTopicStatusChange={handleTopicStatusChange}
                        onDeleteTopic={handleDeleteTopic}
                        editingDomain={editingDomain}
                        setEditingDomain={setEditingDomain}
                        handleSaveDomain={handleSaveDomain}
                        saving={saving}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-text-muted text-sm">
              Select a phase
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#141414] border border-white/[0.10] rounded-2xl shadow-2xl text-sm text-text-primary"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
