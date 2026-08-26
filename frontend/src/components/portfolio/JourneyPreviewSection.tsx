"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface JourneyEntry {
  _id: string;
  date: string;
  title: string;
  topic: string;
  summary: string;
  nextStep?: string;
  githubUrl?: string;
  published: boolean;
}

interface JourneyPreviewProps {
  journey?: JourneyEntry[];
  hideHeader?: boolean;
}

export function JourneyPreviewSection({ journey = [], hideHeader = false }: JourneyPreviewProps) {
  const entries = journey.slice(0, 5);

  return (
    <section
      className={hideHeader ? "py-12 md:py-16 bg-bg-alt" : "section border-t border-border bg-bg-alt"}
      id="journey"
      aria-labelledby="journey-heading"
    >
      <div className="container">

        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="flex items-end justify-between mb-20">
              <div>
                <span className="label-meta block mb-4">03 / Journey</span>
                <h2
                  id="journey-heading"
                  className="font-display font-bold tracking-tighter text-text-primary uppercase"
                  style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
                >
                  Building in Public.
                </h2>
              </div>
              {entries.length > 0 && (
                <Link
                  href="/journey"
                  className="hidden sm:flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
                >
                  ALL ENTRIES <ArrowRight size={14} strokeWidth={2} />
                </Link>
              )}
            </div>
          </SlideUp>
        )}

        {/* Timeline */}
        {entries.length > 0 ? (
          <div className="relative">
            {/* Gradient connector line */}
            <div
              className="absolute left-[3px] md:left-[3px] top-2 bottom-10 w-px"
              style={{
                background: "linear-gradient(to bottom, var(--color-accent) 0%, var(--color-border) 40%, transparent 100%)"
              }}
              aria-hidden
            />

            <StaggerContainer staggerDelay={0.12} className="space-y-14 pl-8 md:pl-12">
              {entries.map((entry) => (
                <StaggerItem key={entry._id}>
                  <JourneyTimelineEntry entry={entry} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : (
          <SlideUp delay={0.1}>
            <div className="py-20 border border-border border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
              <div
                className="font-display font-bold tracking-tighter text-text-tertiary mb-4 select-none"
                style={{ fontSize: "clamp(48px, 8vw, 100px)" }}
                aria-hidden
              >
                —
              </div>
              <h3 className="font-display font-bold text-[28px] text-text-primary mb-4 tracking-tight">
                THE JOURNEY STARTS HERE.
              </h3>
              <p className="text-[16px] text-text-secondary max-w-md leading-relaxed">
                Document what I learn, build, break and understand.
              </p>
            </div>
          </SlideUp>
        )}

        {/* CTA */}
        <SlideUp delay={0.2} className="mt-16">
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
          >
            EXPLORE JOURNEY <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}

// ── JOURNEY TIMELINE ENTRY ────────────────────────────────────

function JourneyTimelineEntry({ entry }: { entry: JourneyEntry }) {
  return (
    <Link
      href={`/journey/${entry._id}`}
      className="group relative block"
      aria-label={`Read journey entry: ${entry.title}`}
    >
      {/* Connector dot */}
      <div
        className="absolute -left-[37px] md:-left-[53px] top-2 w-[7px] h-[7px] rounded-full bg-bg border-2 border-border group-hover:border-accent group-hover:bg-accent transition-all duration-300"
        aria-hidden
      />

      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-16">

        {/* Large editorial date */}
        <div className="w-36 shrink-0 pt-1">
          <span
            className="font-mono tracking-widest uppercase text-text-tertiary group-hover:text-text-secondary transition-colors duration-200 block"
            style={{ fontSize: "clamp(11px, 1.2vw, 13px)" }}
          >
            {formatDate(entry.date, "mono")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          {entry.topic && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
                {entry.topic}
              </span>
            </div>
          )}

          <h3
            className="font-display font-semibold text-text-primary tracking-tight mb-3 group-hover:text-accent transition-colors duration-200"
            style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}
          >
            {entry.title}
          </h3>

          <p className="text-[16px] text-text-secondary leading-relaxed max-w-2xl">
            {entry.summary}
          </p>

          {/* Read more indicator */}
          <span className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-semibold tracking-widest uppercase text-text-tertiary group-hover:text-accent transition-colors duration-200">
            Read entry <ArrowRight size={10} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>

      </div>
    </Link>
  );
}


