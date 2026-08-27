"use client";

import React, { useState } from "react";
import type { RoadmapPhase, RoadmapDomain, RoadmapTopic, RoadmapStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Map, Target } from "lucide-react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

interface RoadmapData {
  phases:  RoadmapPhase[];
  domains: RoadmapDomain[];
  topics:  RoadmapTopic[];
}

interface Props {
  initialData: RoadmapData | null;
  currentlyLearning: { primary: string; next: string; primaryDescription?: string } | null;
}

const STATUS_CONFIG: Record<RoadmapStatus, { label: string; shortLabel: string; text: string; dot: string }> = {
  "not-started": { label: "Planned",     shortLabel: "PLANNED",     text: "text-text-tertiary", dot: "bg-text-tertiary" },
  "up-next":     { label: "Up Next",     shortLabel: "UP NEXT",     text: "text-blue-400",      dot: "bg-blue-400" },
  "in-progress": { label: "In Progress", shortLabel: "IN PROGRESS", text: "text-accent",        dot: "bg-accent" },
  "practicing":  { label: "Practicing",  shortLabel: "PRACTICING",  text: "text-amber-400",     dot: "bg-amber-400" },
  "review":      { label: "Review",      shortLabel: "REVIEW",      text: "text-purple-400",    dot: "bg-purple-400" },
  "completed":   { label: "Completed",   shortLabel: "COMPLETED",   text: "text-success",       dot: "bg-success" },
  "optional":    { label: "Optional",    shortLabel: "OPTIONAL",    text: "text-text-tertiary", dot: "bg-text-tertiary" },
  "paused":      { label: "Paused",      shortLabel: "PAUSED",      text: "text-orange-400",    dot: "bg-orange-400" },
};

export function RoadmapClientPage({ initialData, currentlyLearning }: Props) {
  const [filterStatus, setFilterStatus] = useState<RoadmapStatus | "all">("all");

  if (!initialData) {
    return (
      <PublicPageShell className="flex items-center justify-center">
        <div className="text-center space-y-4 py-32">
          <Map size={36} className="mx-auto text-text-tertiary" />
          <p className="text-text-secondary text-sm">Roadmap curriculum is being organized.</p>
        </div>
      </PublicPageShell>
    );
  }

  const { phases, domains, topics } = initialData;

  const inProgressPhase = phases.find((p) => p.status === "in-progress");
  const filteredPhases = filterStatus === "all"
    ? phases
    : phases.filter((p) => p.status === filterStatus);

  return (
    <PublicPageShell>
      {/* ── Hero Header ───────────────────────────────────── */}
      <header className="public-page-header">
        <div className="container">
          <div className="max-w-4xl">
            <span className="public-page-header-eyebrow">02 / Curriculum</span>
            
            <h1 className="public-page-header-title mb-4">
              Programming<br />
              <span className="text-accent">Mastery Roadmap</span>
            </h1>

            <p className="public-page-header-subtitle mb-8">
              A structured curriculum from computer science fundamentals and low-level systems to full-stack engineering, cloud infrastructure, and AI.
            </p>

            {/* Currently Active Banner (Open Layout) */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-text-tertiary uppercase block">
                    Active Focus
                  </span>
                  <span className="font-display font-semibold text-text-primary text-[15px]">
                    {inProgressPhase?.title || currentlyLearning?.primary || "Phase 00: Development Workflow"} (89%)
                  </span>
                </div>
              </div>

              {currentlyLearning?.next && (
                <div className="flex items-center gap-2 text-text-tertiary font-mono text-[12px]">
                  <span>UP NEXT:</span>
                  <span className="text-text-secondary">{currentlyLearning.next}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="sticky top-[72px] md:top-[80px] z-40 bg-bg/95 backdrop-blur-md border-b border-border py-3">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto">
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
                className={`flex-shrink-0 text-[11px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors ${
                  filterStatus === value
                    ? "bg-accent text-[#171717] font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-black/[0.04]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Curriculum Phases ─────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="max-w-4xl space-y-6">
            {filteredPhases.map((phase, idx) => {
              const phaseDomains = domains.filter(
                (d) => (typeof d.phase === "string" ? d.phase : (d.phase as RoadmapPhase)._id) === phase._id
              );
              return (
                <CurriculumPhaseCard
                  key={phase._id}
                  phase={phase}
                  domains={phaseDomains}
                  topics={topics}
                  defaultExpanded={phase.status === "in-progress"}
                  index={idx}
                />
              );
            })}

            {filteredPhases.length === 0 && (
              <div className="py-24 text-center">
                <Target size={32} className="mx-auto text-text-tertiary mb-3" />
                <p className="text-text-secondary text-sm">No phases match this filter.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

function CurriculumPhaseCard({
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
  const isActive = phase.status === "in-progress";
  const cfg = STATUS_CONFIG[phase.status] || STATUS_CONFIG["not-started"];

  return (
    <div
      className={`border rounded-2xl transition-colors overflow-hidden ${
        isActive
          ? "border-accent/50 bg-bg-card"
          : "border-border bg-bg hover:border-border-hover"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 sm:p-7 flex items-start justify-between gap-6 text-left cursor-pointer"
      >
        <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
          {/* Phase number */}
          <span className={`font-mono text-sm font-bold pt-0.5 tabular-nums ${isActive ? "text-accent" : "text-text-tertiary"}`}>
            PHASE {String(phase.number).padStart(2, "0")}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                {phase.title}
              </h2>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.text}`}>
                {cfg.shortLabel}
              </span>
            </div>

            {phase.subtitle && (
              <p className="text-[14px] text-text-secondary leading-relaxed mt-1 line-clamp-2 font-body">
                {phase.subtitle}
              </p>
            )}

            {/* Active Progress Bar */}
            {phase.progress > 0 && (
              <div className="mt-4 max-w-md">
                <div className="w-full h-1 bg-border-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${phase.progress}%` }} />
                </div>
                <span className="font-mono text-[10px] text-accent mt-1.5 block">
                  {phase.progress}% Complete
                </span>
              </div>
            )}
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-text-tertiary transition-transform duration-200 shrink-0 mt-1 ${expanded ? "rotate-180 text-text-primary" : ""}`}
        />
      </button>

      {/* Expanded Topics / Syllabus */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border px-6 sm:px-8 py-6 bg-bg-alt"
          >
            {domains.length > 0 ? (
              <div className="space-y-6">
                {domains.map((domain) => {
                  const domainTopics = topics.filter(
                    (t) => (typeof t.domain === "string" ? t.domain : (t.domain as RoadmapDomain)._id) === domain._id
                  );
                  return (
                    <div key={domain._id} className="border-b border-border/50 pb-5 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
                          {domain.title}
                        </h4>
                        {domain.status === "in-progress" && (
                          <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                            IN PROGRESS ({domain.progress}%)
                          </span>
                        )}
                      </div>
                      {domain.description && (
                        <p className="text-[13.5px] text-text-secondary mb-3 leading-relaxed">
                          {domain.description}
                        </p>
                      )}
                      {domainTopics.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mt-3 pt-2 border-t border-border/40">
                          {domainTopics.map((topic, topicIdx) => (
                            <li key={topic._id} className="flex items-baseline gap-2.5 text-[13.5px] text-text-secondary">
                              <span className="text-text-tertiary font-mono text-[11px] tabular-nums">
                                {String(topicIdx + 1).padStart(2, "0")}
                              </span>
                              <span className="font-medium text-text-primary/90">{topic.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-text-tertiary uppercase">
                Detailed domain breakdown will be published as this phase begins.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
