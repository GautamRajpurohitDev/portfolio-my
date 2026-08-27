"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export interface AboutConfig {
  profileImage: string;
  name: string;
  shortIntro: string;
  personalStatement: string;
  location: string;
  education: string;
  currentFocus: string;
  interests: string[];
  areasExploring: { title: string; description: string; order: number }[];
  timeline: { year: string; title: string; description: string; order: number }[];
}

interface AboutSectionProps {
  config?: AboutConfig | null;
  hideHeader?: boolean;
}

export function AboutSection({ config, hideHeader = false }: AboutSectionProps) {
  if (!config) return null;

  const shortIntro = config.shortIntro;
  const personalStatement = config.personalStatement;
  
  const metaItems = [
    { label: "LOCATION", value: config.location || "India" },
    { label: "EDUCATION", value: config.education || "BCA | MCA" },
    { label: "CURRENT FOCUS", value: config.currentFocus || "Git & GitHub → C Programming" },
  ].filter(i => i.value);

  const areas = config.areasExploring?.length > 0 
    ? [...config.areasExploring].sort((a, b) => a.order - b.order) 
    : [
        { title: "Low-Level Systems & C/C++", description: "Memory management, pointers, and systems architecture from first principles.", order: 1 },
        { title: "Data Structures & Algorithms", description: "Rigorous problem solving, time complexity, and core algorithmic patterns.", order: 2 },
        { title: "Full-Stack Web Engineering", description: "TypeScript, React, Node.js, and modern distributed application stacks.", order: 3 },
        { title: "Cloud Infrastructure & Linux", description: "Virtualization, containerization, networking, and server administration.", order: 4 },
        { title: "Cybersecurity & Security Models", description: "Network security, authentication systems, and defensive engineering.", order: 5 },
        { title: "Artificial Intelligence & ML", description: "Mathematical foundations of machine learning and generative architectures.", order: 6 },
      ];

  return (
    <section className={hideHeader ? "py-16 sm:py-20 md:py-24 bg-bg" : "section border-t border-border"} id="about" aria-labelledby="about-heading">
      <div className="container">

        {!hideHeader && (
          <>
            <SlideUp>
              <span className="label-meta mb-4 block text-accent">01 / About</span>
            </SlideUp>

            <SlideUp delay={0.05}>
              <h2
                id="about-heading"
                className="font-display font-bold leading-tight tracking-tighter text-text-primary mb-12 sm:mb-16"
                style={{ fontSize: "clamp(36px, 5.5vw, 76px)" }}
              >
                {shortIntro}
              </h2>
            </SlideUp>
          </>
        )}

        {/* ── EDITORIAL GRID: BIO & METADATA ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-20">

          {/* Left: Bio Statement */}
          <SlideUp delay={0.1} className="lg:col-span-7">
            <div className="space-y-5 text-base sm:text-lg lg:text-[18px] leading-relaxed text-text-secondary whitespace-pre-line">
              {personalStatement || (
                <>
                  <p>
                    I am an MCA student rebuilding my software engineering foundations from first principles.
                  </p>
                  <p>
                    Rather than skipping to surface-level abstractions or framework tutorials, I am intentionally studying each layer of computing — from version control workflows and low-level memory concepts to data structures, systems architecture, and distributed engineering.
                  </p>
                  <p>
                    Everything built, learned, and refined is documented publicly.
                  </p>
                </>
              )}
            </div>
          </SlideUp>

          {/* Right: Clean Editorial Metadata Columns (No Pill Boxes) */}
          <SlideUp delay={0.15} className="lg:col-span-5">
            <div className="border-t border-border divide-y divide-border">
              {metaItems.map(({ label, value }) => (
                <div key={label} className="py-4.5 flex flex-col justify-center">
                  <span className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary uppercase mb-1">
                    {label}
                  </span>
                  <span className="font-display font-semibold text-[17px] text-text-primary tracking-tight">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </SlideUp>
        </div>

        {/* ── AREAS I'M EXPLORING: CLEAN EDITORIAL LIST ───────── */}
        <div className="pt-16 sm:pt-20 border-t border-border">
          <SlideUp delay={0.2}>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10 pb-4 border-b border-border">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-accent block mb-1.5">
                  Focus Areas
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-text-primary uppercase tracking-tight">
                  AREAS I'M EXPLORING
                </h3>
              </div>
              <Link
                href="/skills"
                className="inline-flex items-center gap-1.5 text-[12px] font-mono tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
              >
                View Full Stack <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </div>
          </SlideUp>

          {/* Clean Open Editorial List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {areas.map(({ title, description }) => (
              <SlideUp key={title} delay={0.04}>
                <div className="flex items-start gap-3.5 group">
                  <span className="text-accent font-mono text-base leading-tight mt-0.5 select-none shrink-0">
                    →
                  </span>
                  <div>
                    <h4 className="font-display font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors mb-2">
                      {title}
                    </h4>
                    <p className="text-[13.5px] text-text-secondary leading-relaxed font-body">
                      {description}
                    </p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>

        {/* ── TIMELINE ────────────────────────────────────────── */}
        {config?.timeline && config.timeline.length > 0 && (
          <div className="mt-24 pt-16 sm:pt-20 border-t border-border">
            <SlideUp>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-10 uppercase tracking-tight">
                CHRONOLOGY
              </h3>
            </SlideUp>
            <div className="divide-y divide-border/60">
              {[...config.timeline]
                .sort((a, b) => a.order - b.order)
                .map((item, i) => (
                  <SlideUp key={item.title + i} delay={0.08 + i * 0.04}>
                    <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 md:gap-8">
                      <div className="text-text-tertiary font-mono tracking-widest text-xs pt-0.5">
                        {item.year}
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-[17px] text-text-primary mb-2">
                          {item.title}
                        </h4>
                        <p className="text-[14.5px] text-text-secondary leading-relaxed whitespace-pre-line font-body">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </SlideUp>
                ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
