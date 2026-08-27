"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RoadmapPhase {
  _id: string;
  number: number;
  title: string;
  status: string;
}

interface RoadmapPreviewProps {
  phases?: RoadmapPhase[];
  currentPhase?: any;
}

export function RoadmapPreviewSection({ phases = [], currentPhase }: RoadmapPreviewProps) {
  if (!phases || phases.length === 0) return null;

  const rawProgress = Number(currentPhase?.phase?.progress ?? 0);
  const progress = Math.min(100, Math.max(0, isNaN(rawProgress) ? 0 : rawProgress));
  const progressRounded = Math.round(progress);

  return (
    <section
      className="section border-t border-border bg-bg"
      id="roadmap-preview"
      aria-labelledby="roadmap-heading"
    >
      <div className="container">

        {/* Header */}
        <SlideUp>
          <div className="flex items-end justify-between mb-14 pb-4 border-b border-border">
            <div>
              <span className="label-meta block mb-3 text-accent">04 / Curriculum</span>
              <h2
                id="roadmap-heading"
                className="font-display font-bold tracking-tighter text-text-primary uppercase"
                style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
              >
                Programming Mastery Roadmap
              </h2>
            </div>
            <Link
              href="/roadmap"
              className="hidden sm:flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200 shrink-0"
            >
              Full Curriculum <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>
        </SlideUp>

        {/* Active + Next Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 mb-14 sm:mb-18">
          {/* Active Phase */}
          <SlideUp delay={0.06}>
            <div className="border-t border-accent/40 pt-5">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-accent font-semibold">
                  CURRENT ACTIVE PHASE
                </span>
              </div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight mb-4">
                {currentPhase?.phase?.title || "Phase 00: Development Workflow"}
              </p>
              <div className="w-full h-1.5 bg-border-muted rounded-full overflow-hidden mb-2.5">
                <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-mono text-[11px] text-text-tertiary">
                {progressRounded}% Verified Progress
              </span>
            </div>
          </SlideUp>

          {/* Up Next */}
          <SlideUp delay={0.1}>
            <div className="border-t border-border pt-5">
              <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary block mb-2.5">
                UP NEXT ON CURRICULUM
              </span>
              <p className="font-display font-bold text-2xl sm:text-3xl text-text-secondary tracking-tight mb-2.5">
                {currentPhase?.upNext || "Phase 01: Problem Solving Foundations"}
              </p>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Structured foundations in logic, memory management, and algorithmic thinking.
              </p>
            </div>
          </SlideUp>
        </div>

        {/* All Phases: Open Editorial Grid (No Decorative Pill Wall) */}
        <SlideUp delay={0.14}>
          <div className="pt-10 sm:pt-12 border-t border-border">
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary block mb-6">
              Curriculum Sequence ({phases.length} Phases)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-5">
              {phases.map((phase) => {
                const isActive = phase.status === "in-progress";
                const isCompleted = phase.status === "completed";
                return (
                  <div
                    key={phase._id}
                    className="py-3 flex items-baseline justify-between gap-3 border-b border-border/50"
                  >
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={`font-mono text-[11px] tabular-nums ${isActive ? "text-accent font-bold" : "text-text-tertiary"}`}>
                        {String(phase.number).padStart(2, "0")}
                      </span>
                      <span className={`text-[13.5px] font-medium truncate ${isActive ? "text-accent font-semibold" : "text-text-secondary"}`}>
                        {phase.title}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-widest shrink-0 ${
                      isActive ? "text-accent" : isCompleted ? "text-success" : "text-text-tertiary"
                    }`}>
                      {isActive ? "ACTIVE" : isCompleted ? "DONE" : "PLANNED"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </SlideUp>

        {/* Mobile Full Link */}
        <SlideUp delay={0.2} className="mt-10 sm:hidden">
          <Link
            href="/roadmap"
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-border rounded-xl text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-text-primary"
          >
            Full Curriculum <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}
