"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ExplorationArea {
  title: string;
  description: string;
  order: number;
}

interface DirectionSectionProps {
  config?: {
    personalStatement?: string;
    areasExploring?: ExplorationArea[];
    name?: string;
  } | null;
}

const DEFAULT_AREAS = [
  { title: "Software Engineering Fundamentals", description: "Low-level understanding, memory layout, clean architecture.", order: 1 },
  { title: "C & C++ Programming", description: "First-principles memory management, pointers, and performance.", order: 2 },
  { title: "Data Structures & Algorithms", description: "Systematic problem solving and computational complexity.", order: 3 },
  { title: "Full-Stack Web Architecture", description: "Modern distributed systems, APIs, TypeScript, and React.", order: 4 },
  { title: "Linux & Operating Systems", description: "Kernel interaction, POSIX, networking, and system administration.", order: 5 },
  { title: "Cloud & Infrastructure", description: "Containers, CI/CD pipelines, and cloud native architectures.", order: 6 },
];

export function DirectionSection({ config }: DirectionSectionProps) {
  if (!config) return null;

  const areas = config.areasExploring?.length
    ? [...config.areasExploring].sort((a, b) => a.order - b.order)
    : DEFAULT_AREAS;

  return (
    <section
      className="section border-t border-border bg-bg"
      id="direction"
      aria-labelledby="direction-heading"
    >
      <div className="container">

        {/* Header */}
        <SlideUp>
          <span className="label-meta block mb-3 text-accent">08 / Direction</span>
          <h2
            id="direction-heading"
            className="font-display font-bold tracking-tighter text-text-primary uppercase mb-16"
            style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
          >
            What I'm Building Toward.
          </h2>
        </SlideUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left — personal statement */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <SlideUp delay={0.05}>
              <p className="text-[16px] sm:text-[18px] text-text-secondary leading-relaxed font-body">
                Starting strictly from the fundamentals and building upward — version control,
                low-level programming, data structures, full-stack systems, and distributed infrastructure. Every phase builds upon the previous one.
              </p>
            </SlideUp>

            <SlideUp delay={0.12}>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary">
                  Authentic Learning · Transparent Progress
                </p>
              </div>
            </SlideUp>
          </div>

          {/* Right — exploration areas list */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-border/70 border-t border-b border-border">
              {areas.map(({ title, description }) => (
                <SlideUp key={title} delay={0.04}>
                  <div className="py-4 flex items-baseline gap-4 group">
                    <span className="text-accent font-mono text-sm leading-tight shrink-0 select-none">
                      →
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors mb-0.5">
                        {title}
                      </h3>
                      <p className="text-[13.5px] text-text-secondary leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                </SlideUp>
              ))}
            </div>
          </div>

        </div>

        {/* CTA row */}
        <SlideUp delay={0.2} className="mt-14 flex flex-wrap gap-8">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
          >
            Full About <ArrowRight size={13} strokeWidth={2} />
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
          >
            View Roadmap <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}
