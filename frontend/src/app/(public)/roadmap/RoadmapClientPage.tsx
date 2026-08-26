"use client";

import React, { useState } from "react";
import type { RoadmapPhase, RoadmapDomain, RoadmapTopic, RoadmapStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, ArrowRight, Zap, Target,
  CheckCircle2, Circle, Clock, BookOpen, Layers, Map
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface RoadmapData {
  phases:  RoadmapPhase[];
  domains: RoadmapDomain[];
  topics:  RoadmapTopic[];
}

interface Props {
  initialData: RoadmapData | null;
  currentlyLearning: { primary: string; next: string; primaryDescription?: string } | null;
}

// ── Status Display ────────────────────────────────────────────

const STATUS_CONFIG: Record<RoadmapStatus, {
  label: string; shortLabel: string; color: string; bg: string; borderColor: string; dotColor: string;
}> = {
  "not-started": { label: "Not Started",  shortLabel: "—",           color: "text-white/30",      bg: "bg-white/[0.03]",     borderColor: "border-white/[0.06]", dotColor: "bg-white/15" },
  "up-next":     { label: "Up Next",      shortLabel: "UP NEXT",     color: "text-blue-400",      bg: "bg-blue-500/10",      borderColor: "border-blue-500/20",  dotColor: "bg-blue-400" },
  "in-progress": { label: "In Progress",  shortLabel: "IN PROGRESS", color: "text-[#e8c547]",     bg: "bg-[#e8c547]/10",     borderColor: "border-[#e8c547]/25", dotColor: "bg-[#e8c547]" },
  "practicing":  { label: "Practicing",   shortLabel: "PRACTICING",  color: "text-emerald-400",   bg: "bg-emerald-500/10",   borderColor: "border-emerald-500/20",dotColor: "bg-emerald-400" },
  "review":      { label: "Review",       shortLabel: "REVIEW",      color: "text-purple-400",    bg: "bg-purple-500/10",    borderColor: "border-purple-500/20", dotColor: "bg-purple-400" },
  "completed":   { label: "Completed",    shortLabel: "COMPLETED",   color: "text-emerald-400",   bg: "bg-emerald-500/10",   borderColor: "border-emerald-500/20",dotColor: "bg-emerald-400" },
  "optional":    { label: "Optional",     shortLabel: "OPTIONAL",    color: "text-white/30",      bg: "bg-white/[0.02]",     borderColor: "border-white/[0.05]", dotColor: "bg-white/10" },
  "paused":      { label: "Paused",       shortLabel: "PAUSED",      color: "text-orange-400",    bg: "bg-orange-500/10",    borderColor: "border-orange-500/20", dotColor: "bg-orange-400" },
};

function StatusChip({ status }: { status: RoadmapStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (status === "not-started") return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg} border ${cfg.borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${status === "in-progress" ? "animate-pulse" : ""}`} />
      {cfg.shortLabel}
    </span>
  );
}

// ── Progress Bar ──────────────────────────────────────────────

function ProgressBar({ value, color = "#e8c547" }: { value: number; color?: string }) {
  if (value <= 0) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/[0.06] rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/30 tabular-nums flex-shrink-0">{value}%</span>
    </div>
  );
}

// ── Domain Row ────────────────────────────────────────────────

function DomainRow({ domain, topics }: { domain: RoadmapDomain; topics: RoadmapTopic[] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[domain.status];
  const domainTopics = topics.filter(
    (t) => (typeof t.domain === "string" ? t.domain : (t.domain as RoadmapDomain)._id) === domain._id
  );

  return (
    <motion.div
      layout
      className="border border-white/[0.06] rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotColor} ${domain.status === "in-progress" ? "animate-pulse" : ""}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-[#f0ede8]">{domain.title}</span>
            {domain.status !== "not-started" && <StatusChip status={domain.status} />}
          </div>
          {domain.description && (
            <p className="text-xs text-white/35 mt-1 leading-relaxed line-clamp-1">{domain.description}</p>
          )}
          {domain.progress > 0 && (
            <div className="mt-2 max-w-xs">
              <ProgressBar value={domain.progress} color={domain.color || "#e8c547"} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {domainTopics.length > 0 && (
            <span className="text-[10px] font-mono text-white/25">{domainTopics.length} topics</span>
          )}
          {domainTopics.length > 0 && (
            <ChevronDown
              size={14}
              className={`text-white/30 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {/* Topics list */}
      <AnimatePresence>
        {expanded && domainTopics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.04] bg-white/[0.01]"
          >
            <div className="px-5 py-4 space-y-3">
              {domainTopics.map((topic) => (
                <TopicRow key={topic._id} topic={topic} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Topic Row ─────────────────────────────────────────────────

function TopicRow({ topic }: { topic: RoadmapTopic }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[topic.status];

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 text-left group"
      >
        <div className={`w-1 h-1 rounded-full flex-shrink-0 mt-[6px] ${cfg.dotColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">{topic.title}</span>
            {topic.status !== "not-started" && (
              <span className={`text-[9px] font-mono uppercase tracking-widest ${cfg.color}`}>{cfg.shortLabel}</span>
            )}
            {topic.subtopics.length > 0 && (
              <ChevronDown size={11} className={`text-white/25 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`} />
            )}
          </div>
        </div>
      </button>

      {/* Subtopics */}
      <AnimatePresence>
        {expanded && topic.subtopics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pl-4"
          >
            <div className="flex flex-wrap gap-1.5">
              {topic.subtopics.map((st, i) => (
                <span key={i} className="text-[10px] text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-full px-2 py-0.5 font-mono">
                  {st}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Phase Card ────────────────────────────────────────────────

function PhaseCard({
  phase,
  domains,
  topics,
  defaultExpanded = false,
  index,
}: {
  phase: RoadmapPhase;
  domains: RoadmapDomain[];
  topics: RoadmapTopic[];
  defaultExpanded?: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const cfg = STATUS_CONFIG[phase.status];
  const isActive   = phase.status === "in-progress";
  const isComplete = phase.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
      className={`relative rounded-3xl border transition-all duration-300 overflow-hidden
        ${isActive
          ? "border-[#e8c547]/25 bg-[#e8c547]/[0.03] shadow-[0_0_40px_rgba(232,197,71,0.04)]"
          : isComplete
            ? "border-emerald-500/15 bg-emerald-500/[0.02]"
            : "border-white/[0.06] bg-white/[0.01]"
        }
      `}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-5 px-6 pt-6 pb-5 text-left"
      >
        {/* Phase number rail */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
          <div className={`
            w-10 h-10 rounded-2xl flex items-center justify-center
            text-[11px] font-mono font-bold
            ${isActive ? "bg-[#e8c547]/15 text-[#e8c547]" : isComplete ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.05] text-white/30"}
          `}>
            {String(phase.number).padStart(2, "0")}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                {phase.status !== "not-started" && <StatusChip status={phase.status} />}
                {phase.isOptional && (
                  <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full">
                    Optional Track
                  </span>
                )}
              </div>
              <h2 className={`text-lg font-bold tracking-tight leading-tight
                ${isActive ? "text-[#f0ede8]" : isComplete ? "text-white/70" : "text-white/50"}
              `}>
                {phase.title}
              </h2>
              {phase.subtitle && (
                <p className="text-xs text-white/30 mt-1 leading-relaxed">{phase.subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Progress ring */}
              {phase.progress > 0 && (
                <div className="relative">
                  <svg width="40" height="40" className="rotate-[-90deg]">
                    <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" fill="none" />
                    <circle cx="20" cy="20" r="16"
                      stroke={phase.color || "#e8c547"}
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 16}
                      strokeDashoffset={2 * Math.PI * 16 * (1 - phase.progress / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-white/50">{phase.progress}%</span>
                  </div>
                </div>
              )}

              <ChevronDown
                size={16}
                className={`text-white/25 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {/* Progress bar for active phase */}
          {phase.progress > 0 && (
            <div className="mt-3 max-w-sm">
              <ProgressBar value={phase.progress} color={phase.color || "#e8c547"} />
            </div>
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/[0.04]"
          >
            <div className="px-6 py-5">
              {/* Description */}
              {(phase.description || phase.overview) && (
                <p className="text-sm text-white/40 leading-relaxed mb-5 max-w-2xl">
                  {phase.description || phase.overview}
                </p>
              )}

              {/* Domains */}
              {domains.length > 0 ? (
                <div className="space-y-2.5">
                  {domains.map((domain) => (
                    <DomainRow key={domain._id} domain={domain} topics={topics} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/20 italic">Coming soon — domains not yet configured.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Currently Learning Banner ─────────────────────────────────

function LearningBanner({
  currentlyLearning,
  activePhase,
  nextPhase,
}: {
  currentlyLearning: Props["currentlyLearning"];
  activePhase?: RoadmapPhase;
  nextPhase?: RoadmapPhase;
}) {
  const primaryTitle = activePhase ? activePhase.title : currentlyLearning?.primary;
  const nextTitle = nextPhase ? nextPhase.title : currentlyLearning?.next;

  if (!primaryTitle) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#e8c547]/10 border border-[#e8c547]/25 rounded-2xl">
        <div className="w-2 h-2 rounded-full bg-[#e8c547] animate-pulse" />
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#e8c547]/60 mb-0.5">Currently Learning</p>
          <p className="text-sm font-semibold text-[#e8c547]">
            {primaryTitle} {activePhase && activePhase.progress > 0 && `(${activePhase.progress}%)`}
          </p>
        </div>
      </div>

      {nextTitle && (
        <>
          <ArrowRight size={14} className="text-white/20 hidden sm:block" />
          <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-blue-400/60" />
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mb-0.5">Up Next</p>
              <p className="text-sm font-medium text-white/60">{nextTitle}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Overall Stats ─────────────────────────────────────────────

function RoadmapStats({ phases }: { phases: RoadmapPhase[] }) {
  const total     = phases.length;
  const completed = phases.filter((p) => p.status === "completed").length;
  const active    = phases.filter((p) => p.status === "in-progress").length;
  const planned   = phases.filter((p) => p.status === "not-started").length;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {[
        { label: "Total Phases",  value: total,     icon: Map },
        { label: "In Progress",   value: active,    icon: Zap },
        { label: "Completed",     value: completed, icon: CheckCircle2 },
        { label: "Planned",       value: planned,   icon: Circle },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon size={12} className="text-white/25" />
          <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-bold text-white/50">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Client Page ──────────────────────────────────────────

export function RoadmapClientPage({ initialData, currentlyLearning }: Props) {
  const [filterStatus, setFilterStatus] = useState<RoadmapStatus | "all">("all");

  if (!initialData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Map size={40} className="mx-auto text-white/20" />
          <p className="text-white/40 text-sm">Roadmap not yet configured.</p>
          <p className="text-white/20 text-xs font-mono">Run the seed script or add phases in /admin/roadmap</p>
        </div>
      </main>
    );
  }

  const { phases, domains, topics } = initialData;

  const getPhaseProps = (phase: RoadmapPhase) => ({
    domains: domains.filter(
      (d) => (typeof d.phase === "string" ? d.phase : (d.phase as RoadmapPhase)._id) === phase._id
    ),
    topics,
  });

  const filteredPhases = filterStatus === "all"
    ? phases
    : phases.filter((p) => p.status === filterStatus);

  const inProgressPhase = phases.find((p) => p.status === "in-progress");

  return (
    <main className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="public-page-header !border-b-0 !bg-transparent px-6 sm:px-8 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-4"
        >
          <Map size={13} className="text-accent" />
          <span className="public-page-header-eyebrow !mb-0">02 / Roadmap</span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-[clamp(36px,5vw,72px)] font-black tracking-[-0.02em] leading-[0.95] text-[#f0ede8] uppercase">
            Programming<br />
            <span className="text-[#e8c547]">Mastery</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base text-white/40 max-w-xl leading-relaxed mb-10"
        >
          A structured path from programming fundamentals to software engineering,
          systems, cloud, cybersecurity and AI.{" "}
          <span className="text-white/25">Building depth one layer at a time.</span>
        </motion.p>

        {/* Currently learning banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-10"
        >
          <LearningBanner
            currentlyLearning={currentlyLearning}
            activePhase={inProgressPhase}
            nextPhase={phases.find((p) => p.status === "up-next" || p.status === "not-started" && p.order > (inProgressPhase?.order || -1))}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="border-t border-white/[0.06] pt-6"
        >
          <RoadmapStats phases={phases} />
        </motion.div>
      </section>

      {/* ── Filter bar ────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.05] px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto">
          {[
            { value: "all",         label: "All Phases" },
            { value: "in-progress", label: "Active" },
            { value: "up-next",     label: "Up Next" },
            { value: "completed",   label: "Completed" },
            { value: "not-started", label: "Planned" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value as typeof filterStatus)}
              className={`flex-shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all duration-150
                ${filterStatus === value
                  ? "bg-[#e8c547]/15 text-[#e8c547] border border-[#e8c547]/25"
                  : "text-white/30 hover:text-white/50 border border-white/[0.06] hover:border-white/[0.12]"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Phase Cards ───────────────────────────────────── */}
      <section className="px-6 sm:px-8 pb-24 max-w-5xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mt-10 mb-6">
          <div className="h-px flex-1 bg-white/[0.05]" />
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
            {filteredPhases.length} phase{filteredPhases.length !== 1 ? "s" : ""}
          </span>
          <div className="h-px flex-1 bg-white/[0.05]" />
        </div>

        <div className="space-y-3">
          {filteredPhases.map((phase, idx) => {
            const { domains: pd, topics: pt } = getPhaseProps(phase);
            return (
              <PhaseCard
                key={phase._id}
                phase={phase}
                domains={pd}
                topics={pt}
                defaultExpanded={phase.status === "in-progress"}
                index={idx}
              />
            );
          })}
        </div>

        {filteredPhases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Target size={40} className="text-white/15 mb-4" />
            <p className="text-white/30 text-sm">No phases match this filter</p>
          </div>
        )}

        {/* Bottom note */}
        <div className="mt-16 pt-8 border-t border-white/[0.05] text-center">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            This roadmap reflects my planned learning system.
          </p>
          <p className="text-[10px] font-mono text-white/15 mt-1">
            Planned ≠ Completed. Progress is tracked and updated from the CMS.
          </p>
        </div>
      </section>
    </main>
  );
}
