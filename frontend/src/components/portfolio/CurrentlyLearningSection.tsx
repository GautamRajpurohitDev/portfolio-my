"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export interface CurrentlyLearningConfig {
  primary: string;
  description: string;
  progress: number;
  status?: string;
  next: string;
  roadmap: string[];
  phaseLabel?: string;
}

interface CurrentlyLearningSectionProps {
  config?: CurrentlyLearningConfig | null;
}

export function CurrentlyLearningSection({ config }: CurrentlyLearningSectionProps) {
  if (!config) return null;

  const rawProgress = Number(config.progress ?? 0);
  const progress = Math.min(100, Math.max(0, isNaN(rawProgress) ? 0 : rawProgress));
  const progressRounded = Math.round(progress);
  const phaseLabel = config.phaseLabel
    ? config.phaseLabel.toUpperCase()
    : `CURRENT FOCUS: ${config.primary?.toUpperCase() || "ACTIVE"}`;

  const isCompleted = config.status === "completed" || progress >= 100;
  const statusLabel = isCompleted
    ? "FOUNDATION COMPLETED"
    : config.status === "practicing"
    ? "PRACTICING & REFINING"
    : config.status === "review"
    ? "IN REVIEW"
    : config.status === "not-started"
    ? "PLANNED FOCUS"
    : "FOUNDATION IN PROGRESS";

  const statusDotColor = isCompleted ? "bg-emerald-400" : "bg-accent";
  const statusTextColor = isCompleted ? "text-emerald-400" : "text-accent";

  return (
    <section
      className="section border-t border-border bg-bg-alt"
      id="currently-learning"
      aria-labelledby="learning-heading"
    >
      <div className="container">

        {/* Label */}
        <SlideUp>
          <span className="label-meta block mb-12 text-accent">02 / Current Learning</span>
        </SlideUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* ── LEFT — Integrated Skill + Progress Block ─────── */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <SlideUp delay={0.04}>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor} animate-pulse`} />
                  <span className={`font-mono text-xs uppercase tracking-widest ${statusTextColor}`}>
                    {statusLabel}
                  </span>
                </div>
              </SlideUp>

              {/* Topic Name + Integrated Percentage */}
              <SlideUp delay={0.08}>
                <div className="flex items-baseline justify-between gap-6 mb-6">
                  <h2
                    id="learning-heading"
                    className="font-display font-bold tracking-tighter text-text-primary uppercase"
                    style={{ fontSize: "clamp(38px, 5.5vw, 68px)", lineHeight: 0.95 }}
                  >
                    {config.primary || "Git & GitHub"}
                  </h2>
                  <span
                    className="font-display font-bold text-accent tabular-nums shrink-0"
                    style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1 }}
                  >
                    {progressRounded}%
                  </span>
                </div>
              </SlideUp>

              {/* Description */}
              <SlideUp delay={0.12}>
                <p className="text-[16px] sm:text-[18px] text-text-secondary leading-relaxed mb-8 max-w-xl font-body">
                  {config.description ||
                    "Mastering version control from first principles — branching models, interactive rebasing, commit semantics, and collaborative workflows."}
                </p>
              </SlideUp>

              {/* Integrated Progress Line */}
              <SlideUp delay={0.16}>
                <div className="w-full h-1.5 bg-border-muted rounded-full overflow-hidden mb-3">
                  <ProgressFill progress={progress} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                  <span>{phaseLabel}</span>
                  <span>{progressRounded}% VERIFIED MASTERY</span>
                </div>
              </SlideUp>
            </div>
          </div>

          {/* ── RIGHT — Up Next & Path ───────────────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <SlideUp delay={0.2}>
              <div className="border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0 lg:pl-12">
                <div className="mb-8">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary block mb-2">
                    Up Next On Curriculum
                  </span>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                    {config.next || "Pseudocode & C Foundations"}
                  </p>
                </div>

                {config.roadmap?.length > 0 && (
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary block mb-4">
                      Sequential Roadmap
                    </span>
                    <ol className="divide-y divide-border/60" aria-label="Learning roadmap sequence">
                      {config.roadmap.slice(0, 4).map((item, i) => (
                        <li key={item} className="py-2.5 flex items-center justify-between gap-3 text-[13.5px]">
                          <span className="font-mono text-[11px] text-text-tertiary tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-text-secondary font-medium flex-1 text-left">
                            {item}
                          </span>
                          <span className="font-mono text-[10px] text-text-tertiary uppercase">
                            PLANNED
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-border">
                  <Link
                    href="/roadmap"
                    className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
                  >
                    Explore Full Roadmap <ArrowRight size={13} strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </SlideUp>
          </div>

        </div>
      </div>
    </section>
  );
}

function ProgressFill({ progress }: { progress: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="h-full bg-accent rounded-full"
      initial={{ width: "0%" }}
      whileInView={{ width: `${progress}%` }}
      viewport={{ once: true }}
      transition={
        shouldReduce
          ? { duration: 0 }
          : { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
      }
    />
  );
}
