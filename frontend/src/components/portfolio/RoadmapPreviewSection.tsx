"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ArrowRight, CheckCircle2, Circle, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

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

  // Defensive progress from currentPhase
  const rawProgress = Number(currentPhase?.phase?.progress ?? 0);
  const progress = Math.min(100, Math.max(0, isNaN(rawProgress) ? 0 : rawProgress));
  const progressRounded = Math.round(progress);

  return (
    <section
      className="section border-t border-border"
      id="roadmap-preview"
      aria-labelledby="roadmap-heading"
    >
      <div className="container">

        {/* Header */}
        <SlideUp>
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="label-meta block mb-4">04 / Roadmap</span>
              <h2
                id="roadmap-heading"
                className="font-display font-bold tracking-tighter text-text-primary uppercase"
                style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                Programming Mastery
              </h2>
            </div>
            <Link
              href="/roadmap"
              className="hidden sm:flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
            >
              FULL ROADMAP <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </SlideUp>

        {/* Current + Next status strip */}
        {currentPhase && (
          <SlideUp delay={0.08}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden mb-16">

              {/* Current */}
              <div className="bg-bg-card p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-accent" aria-hidden />
                <span className="label-meta block mb-3 text-accent">CURRENT</span>
                <p
                  className="font-display font-bold text-text-primary tracking-tight mb-4"
                  style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                >
                  {currentPhase.phase?.title || "—"}
                </p>
                {/* Progress bar */}
                <div className="w-full h-[2px] bg-border rounded-full overflow-hidden">
                  <RoadmapProgressFill progress={progress} />
                </div>
                <span className="font-mono text-[12px] text-accent mt-2 block">
                  {progressRounded}% complete
                </span>
              </div>

              {/* Next */}
              <div className="bg-bg-card p-8">
                <span className="label-meta block mb-3">UP NEXT</span>
                <p
                  className="font-display font-bold text-text-secondary tracking-tight"
                  style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                >
                  {currentPhase.upNext || "TBD"}
                </p>
              </div>
            </div>
          </SlideUp>
        )}

        {/* Phase flow */}
        <SlideUp delay={0.12}>
          <p className="label-meta mb-6">All Phases</p>
        </SlideUp>
        <StaggerContainer staggerDelay={0.04} className="flex flex-wrap gap-3">
          {phases.map((phase) => (
            <StaggerItem key={phase._id}>
              <PhaseBadge phase={phase} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <SlideUp delay={0.3} className="mt-12 sm:hidden">
          <Link
            href="/roadmap"
            className="flex items-center justify-center gap-2 w-full py-4 border border-border rounded-xl text-[13px] font-semibold tracking-wide uppercase text-text-secondary"
          >
            Full Roadmap <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}

// ── ANIMATED PROGRESS FILL ────────────────────────────────────

function RoadmapProgressFill({ progress }: { progress: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="h-full bg-accent rounded-full"
      initial={{ width: "0%" }}
      whileInView={{ width: `${progress}%` }}
      viewport={{ once: true }}
      transition={shouldReduce ? { duration: 0 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    />
  );
}

// ── PHASE BADGE ───────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: RoadmapPhase }) {
  const isCompleted  = phase.status === "completed";
  const isInProgress = phase.status === "in-progress" || phase.status === "practicing";
  const isNext       = phase.status === "up-next";

  let statusClass = "border-border text-text-tertiary bg-bg-card opacity-50";
  let Icon = Circle;

  if (isCompleted) {
    statusClass = "border-border-muted text-text-secondary bg-bg-card opacity-80";
    Icon = CheckCircle2;
  } else if (isInProgress) {
    statusClass = "border-accent text-accent bg-accent/5 ring-1 ring-accent/20";
    Icon = PlayCircle;
  } else if (isNext) {
    statusClass = "border-border-hover text-text-primary bg-bg-card";
    Icon = Clock;
  }

  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 ${statusClass}`}>
      <Icon size={14} strokeWidth={2} className={isInProgress ? "text-accent" : ""} />
      <span className="font-mono text-[12px] tracking-wide uppercase font-semibold">
        {phase.title}
      </span>
    </div>
  );
}



