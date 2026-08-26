"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
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

// Default exploration areas (used when DB has none)
const DEFAULT_AREAS = [
  { title: "Software Engineering", description: "Fundamentals, systems, clean code.", order: 1 },
  { title: "C & C++", description: "Low-level programming and memory management.", order: 2 },
  { title: "Data Structures & Algorithms", description: "Problem-solving foundation.", order: 3 },
  { title: "Web Development", description: "Full-stack: HTML, CSS, JS, React, Node.", order: 4 },
  { title: "Cybersecurity", description: "Exploring the security layer of systems.", order: 5 },
  { title: "AI / ML", description: "Understanding machine learning concepts.", order: 6 },
  { title: "Cloud & Linux", description: "Infrastructure and operating systems.", order: 7 },
];

export function DirectionSection({ config }: DirectionSectionProps) {
  if (!config) return null;

  const areas = config.areasExploring?.length
    ? [...config.areasExploring].sort((a, b) => a.order - b.order)
    : DEFAULT_AREAS;

  return (
    <section
      className="section border-t border-border"
      id="direction"
      aria-labelledby="direction-heading"
    >
      <div className="container">

        {/* Header */}
        <SlideUp>
          <span className="label-meta block mb-4">10 / Direction</span>
          <h2
            id="direction-heading"
            className="font-display font-bold tracking-tighter text-text-primary uppercase mb-16"
            style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
          >
            What I'm Building Toward.
          </h2>
        </SlideUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left — personal statement */}
          <div className="lg:col-span-5">
            <SlideUp delay={0.05}>
              {config.personalStatement ? (
                <div className="text-[17px] lg:text-[18px] text-text-secondary leading-relaxed whitespace-pre-line">
                  {config.personalStatement}
                </div>
              ) : (
                <p className="text-[17px] lg:text-[18px] text-text-secondary leading-relaxed">
                  Starting from the fundamentals and building upward — version control,
                  low-level programming, data structures, web development, and eventually
                  systems, cloud, and AI. Each layer adds to the foundation.
                </p>
              )}
            </SlideUp>

            <SlideUp delay={0.12}>
              <div className="mt-10 pt-8 border-t border-border">
                <p className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary mb-3">
                  These are areas of exploration,
                </p>
                <p className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary">
                  not claims of current mastery.
                </p>
              </div>
            </SlideUp>
          </div>

          {/* Right — exploration areas grid */}
          <div className="lg:col-span-7">
            <StaggerContainer
              staggerDelay={0.06}
              className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden"
            >
              {areas.map(({ title, description }) => (
                <StaggerItem key={title}>
                  <div className="bg-bg-card p-6 h-full hover:bg-bg-elevated transition-colors duration-300 group">
                    <span
                      className="block w-1.5 h-1.5 rounded-full bg-accent mb-4 group-hover:scale-125 transition-transform duration-300"
                      aria-hidden
                    />
                    <h3 className="font-display font-semibold text-[15px] text-text-primary mb-1.5 tracking-tight">
                      {title}
                    </h3>
                    <p className="text-[13px] text-text-secondary leading-relaxed">
                      {description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

        </div>

        {/* CTA row */}
        <SlideUp delay={0.2} className="mt-16 flex flex-wrap gap-6">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
          >
            FULL ABOUT <ArrowRight size={14} strokeWidth={2} />
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
          >
            VIEW ROADMAP <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}
