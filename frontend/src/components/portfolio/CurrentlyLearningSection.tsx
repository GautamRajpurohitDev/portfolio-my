"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export interface CurrentlyLearningConfig {
  primary: string;
  description: string;
  progress: number;
  next: string;
  roadmap: string[];
}

interface CurrentlyLearningSectionProps {
  config?: CurrentlyLearningConfig | null;
}

export function CurrentlyLearningSection({ config }: CurrentlyLearningSectionProps) {
  if (!config) return null;

  // ── Defensive numeric coercion — prevents NaN / undefined rendering ──
  const rawProgress = Number(config.progress ?? 0);
  const progress = Math.min(100, Math.max(0, isNaN(rawProgress) ? 0 : rawProgress));
  const progressRounded = Math.round(progress);
  const filledBlocks = Math.floor(progress / 5); // out of 20
  const emptyBlocks = 20 - filledBlocks;

  return (
    <section
      className="section border-t border-border bg-bg-alt"
      id="currently-learning"
      aria-labelledby="learning-heading"
    >
      <div className="container">

        {/* Label */}
        <SlideUp>
          <span className="label-meta block mb-12">02 / Learning</span>
        </SlideUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* ── LEFT — Current topic + progress ─────────────── */}
          <div className="lg:col-span-7">

            <SlideUp delay={0.04}>
              <h2
                id="learning-heading"
                className="font-display font-bold leading-none tracking-tighter text-text-secondary mb-1 uppercase"
                style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
              >
                CURRENTLY
              </h2>
            </SlideUp>
            <SlideUp delay={0.08}>
              <h2
                className="font-display font-bold leading-none tracking-tighter text-text-primary mb-10 uppercase"
                style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
              >
                LEARNING
              </h2>
            </SlideUp>

            {/* Topic name */}
            <SlideUp delay={0.12}>
              <div className="flex items-center gap-4 mb-8">
                <span
                  className="font-display font-bold text-accent leading-none tracking-tighter"
                  style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}
                >
                  {config.primary || "—"}
                </span>
                <BookOpen
                  size={28}
                  strokeWidth={1}
                  className="text-accent opacity-50 hidden lg:block shrink-0 mt-1"
                />
              </div>
            </SlideUp>

            {/* Description */}
            {config.description && (
              <SlideUp delay={0.16}>
                <p className="text-[17px] lg:text-[19px] text-text-secondary leading-relaxed mb-12 max-w-lg">
                  {config.description}
                </p>
              </SlideUp>
            )}

            {/* ── PROGRESS ──────────────────────────────────── */}
            <SlideUp delay={0.2}>
              <div>
                {/* Status badge */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase text-accent">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-accent animate-[pulseAccent_2s_ease-in-out_infinite]"
                      aria-hidden
                    />
                    IN PROGRESS
                  </span>
                </div>

                {/* Large percentage number */}
                <div className="flex items-baseline gap-2 mb-5">
                  <span
                    className="font-display font-bold text-text-primary leading-none tracking-tighter tabular-nums"
                    style={{ fontSize: "clamp(72px, 10vw, 120px)" }}
                    aria-label={`${progressRounded}% complete`}
                  >
                    {progressRounded}
                  </span>
                  <span
                    className="font-display font-bold text-text-secondary"
                    style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
                    aria-hidden
                  >
                    %
                  </span>
                </div>

                {/* Animated CSS fill bar */}
                <div
                  className="w-full h-[3px] bg-border rounded-full overflow-hidden mb-4"
                  role="progressbar"
                  aria-valuenow={progressRounded}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${progressRounded}% progress`}
                >
                  <ProgressFill progress={progress} />
                </div>

                {/* Monospace decorative bar */}
                <span
                  className="font-mono text-[12px] text-text-tertiary tracking-[0.12em] select-none"
                  aria-hidden="true"
                >
                  {"█".repeat(filledBlocks)}{"░".repeat(emptyBlocks)}
                </span>
              </div>
            </SlideUp>
          </div>

          {/* ── RIGHT — Up Next + Roadmap ─────────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-center mt-4 lg:mt-0">
            <SlideUp delay={0.28}>
              <div className="bg-bg border border-border rounded-2xl p-8 lg:p-10 relative overflow-hidden">

                {/* Decorative top accent */}
                <div
                  className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
                  aria-hidden
                />

                <h3 className="label-meta mb-8">Up Next</h3>

                {config.next && (
                  <div className="mb-10">
                    <p className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary mb-2">
                      Immediate Focus
                    </p>
                    <p
                      className="font-display font-bold text-text-primary leading-none tracking-tight"
                      style={{ fontSize: "clamp(22px, 2.5vw, 30px)" }}
                    >
                      {config.next}
                    </p>
                  </div>
                )}

                {config.roadmap?.length > 0 && (
                  <div>
                    <p className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary mb-5">
                      Learning Path
                    </p>
                    <ol className="space-y-3" aria-label="Learning roadmap">
                      {config.roadmap.map((item, i) => (
                        <li key={item} className="flex items-center gap-3">
                          <span
                            className="font-mono text-[11px] text-text-tertiary w-5 shrink-0 tabular-nums"
                            aria-hidden
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="flex-1 h-px bg-border-muted" aria-hidden />
                          <span className="text-[13px] text-text-secondary font-medium">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-10 pt-6 border-t border-border">
                  <Link
                    href="/roadmap"
                    className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
                  >
                    Full Roadmap <ArrowRight size={12} strokeWidth={2} />
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

// ── Animated progress fill ────────────────────────────────────────

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
          : { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }
      }
    />
  );
}
