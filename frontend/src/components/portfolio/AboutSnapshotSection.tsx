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

  // Build metadata strip from CMS data
  const metaStrip = [
    { label: "EDUCATION",     value: config.education    || "MCA STUDENT" },
    { label: "LOCATION",      value: config.location     || "INDIA"        },
    { label: "BUILDING SINCE",value: "2026"                                },
    { label: "CURRENT FOCUS", value: config.currentFocus || "GIT → C", accent: true },
  ].filter(m => m.value);

  return (
    <section
      className="section border-t border-border"
      id="about-snapshot"
      aria-labelledby="about-snapshot-heading"
    >
      <div className="container">

        {/* Section label */}
        <SlideUp>
          <span className="label-meta block mb-16">01 / About</span>
        </SlideUp>

        {/* ── SPLIT EDITORIAL LAYOUT ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-20">

          {/* Left — large editorial statement */}
          <div className="lg:col-span-6">
            <SlideUp delay={0.05}>
              <h2
                id="about-snapshot-heading"
                className="font-display font-bold leading-[0.92] tracking-tighter text-text-primary mb-8 uppercase"
                style={{ fontSize: "clamp(48px, 6.5vw, 88px)" }}
              >
                {config.shortIntro || "I'M GAUTAM."}
              </h2>
            </SlideUp>
            <SlideUp delay={0.1}>
              <p
                className="text-text-secondary leading-relaxed"
                style={{ fontSize: "clamp(18px, 2.2vw, 22px)" }}
              >
                MCA student building strong software engineering fundamentals,
                problem-solving ability and real software.
              </p>
            </SlideUp>
          </div>

          {/* Right — bio paragraph */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-10">
            <SlideUp delay={0.15}>
              {config.personalStatement ? (
                <div
                  className="text-[16px] lg:text-[17px] leading-relaxed text-text-secondary whitespace-pre-line"
                >
                  {config.personalStatement}
                </div>
              ) : (
                <p className="text-[16px] text-text-secondary leading-relaxed">
                  Building from the ground up — learning version control, low-level programming, 
                  data structures, and the full stack of modern software development.
                  Documenting every step publicly.
                </p>
              )}
            </SlideUp>

            <SlideUp delay={0.2}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
              >
                Read More <ArrowRight size={12} strokeWidth={2} />
              </Link>
            </SlideUp>
          </div>
        </div>

        {/* ── METADATA STRIP ─────────────────────────────────── */}
        <SlideUp delay={0.25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-lg overflow-hidden">
            {metaStrip.map(({ label, value, accent }) => (
              <div key={label} className="bg-bg-card px-6 py-5">
                <span className="label-meta block mb-2">{label}</span>
                <span
                  className={`font-mono text-[13px] tracking-wide font-semibold uppercase ${
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

