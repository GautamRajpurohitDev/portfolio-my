"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AboutConfig } from "./AboutSection";

interface AboutSnapshotSectionProps {
  config?: AboutConfig | null;
}

export function AboutSnapshotSection({ config }: AboutSnapshotSectionProps) {
  if (!config) return null;

  const metaStrip = [
    { label: "LOCATION",      value: config.location     || "INDIA" },
    { label: "EDUCATION",     value: config.education    || "BCA | MCA" },
    { label: "BUILDING SINCE",value: "2026" },
    { label: "CURRENT FOCUS", value: config.currentFocus || "GIT → C", accent: true },
  ].filter(m => m.value);

  return (
    <section
      className="section border-t border-border bg-bg"
      id="about-snapshot"
      aria-labelledby="about-snapshot-heading"
    >
      <div className="container">

        {/* Section label */}
        <SlideUp>
          <span className="label-meta block mb-12 text-accent">01 / About</span>
        </SlideUp>

        {/* ── SPLIT EDITORIAL LAYOUT ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-16">

          {/* Left — large editorial statement */}
          <div className="lg:col-span-6">
            <SlideUp delay={0.05}>
              <h2
                id="about-snapshot-heading"
                className="font-display font-bold leading-[0.94] tracking-tighter text-text-primary mb-8 uppercase"
                style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
              >
                {config.shortIntro || "I'M GAUTAM."}
              </h2>
            </SlideUp>
            <SlideUp delay={0.1}>
              <p
                className="text-text-secondary leading-relaxed font-body"
                style={{ fontSize: "clamp(17px, 2vw, 21px)" }}
              >
                MCA student building strong software engineering fundamentals,
                low-level understanding, and real-world software from first principles.
              </p>
            </SlideUp>
          </div>

          {/* Right — bio & link */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <SlideUp delay={0.15}>
              <div className="text-[16px] lg:text-[17px] leading-relaxed text-text-secondary whitespace-pre-line">
                {config.personalStatement || (
                  "Starting from the foundation and deliberately building upward. Documenting every milestone, concept, and project publicly."
                )}
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
              >
                Read Full Bio <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </SlideUp>
          </div>
        </div>

        {/* ── METADATA STRIP: CLEAN EDITORIAL GRID ─────────────── */}
        <SlideUp delay={0.25}>
          <div className="border-t border-border pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {metaStrip.map(({ label, value, accent }) => (
              <div key={label} className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-tertiary mb-1.5">
                  {label}
                </span>
                <span
                  className={`font-display text-[16px] sm:text-[18px] font-semibold uppercase tracking-tight ${
                    accent ? "text-accent" : "text-text-primary"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </SlideUp>

      </div>
    </section>
  );
}
