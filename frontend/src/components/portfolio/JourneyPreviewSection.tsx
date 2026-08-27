"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
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
  const publishedEntries = journey.filter((j) => (j as any).published !== false);
  const entries = publishedEntries.slice(0, 5);

  return (
    <section
      className={hideHeader ? "py-16 sm:py-20 md:py-24 bg-bg" : "section border-t border-border bg-bg"}
      id="journey"
      aria-labelledby="journey-heading"
    >
      <div className="container">

        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="flex items-end justify-between mb-16 pb-4 border-b border-border">
              <div>
                <span className="label-meta block mb-3 text-accent">03 / Journal</span>
                <h2
                  id="journey-heading"
                  className="font-display font-bold tracking-tighter text-text-primary uppercase"
                  style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
                >
                  Building In Public.
                </h2>
              </div>
              {entries.length > 0 && (
                <Link
                  href="/journey"
                  className="hidden sm:flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
                >
                  All Entries <ArrowRight size={13} strokeWidth={2} />
                </Link>
              )}
            </div>
          </SlideUp>
        )}

        {/* Timeline List (Open Editorial Layout) */}
        {entries.length > 0 ? (
          <div className="divide-y divide-border">
            {entries.map((entry, idx) => (
              <SlideUp key={entry._id} delay={0.05 * idx}>
                <div className="py-9 sm:py-11 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-12 items-baseline group">
                  {/* Date Column */}
                  <div className="md:col-span-3">
                    <span className="font-mono text-[12px] uppercase tracking-widest text-text-tertiary block">
                      {formatDate(entry.date, "mono")}
                    </span>
                    {entry.topic && (
                      <span className="font-mono text-[11px] text-accent mt-1.5 block">
                        {entry.topic}
                      </span>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className="md:col-span-9">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary group-hover:text-accent transition-colors mb-2.5 sm:mb-3">
                      <Link href={`/journey/${entry._id}`}>
                        {entry.title}
                      </Link>
                    </h3>
                    <p className="text-[15px] text-text-secondary leading-relaxed max-w-3xl font-body">
                      {entry.summary}
                    </p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        ) : (
          <SlideUp delay={0.1}>
            <div className="py-20 border border-border rounded-2xl text-center bg-bg-card p-8">
              <span className="font-mono text-xs uppercase tracking-widest text-text-tertiary block mb-2">
                JOURNAL
              </span>
              <h3 className="font-display font-bold text-2xl text-text-primary mb-3 uppercase">
                The Journey Starts Here.
              </h3>
              <p className="text-[15px] text-text-secondary max-w-md mx-auto leading-relaxed">
                Every entry records a real milestone in programming fundamentals, problem solving, and architecture.
              </p>
            </div>
          </SlideUp>
        )}

        {/* Mobile Link */}
        {!hideHeader && entries.length > 0 && (
          <SlideUp delay={0.2} className="mt-10 sm:hidden">
            <Link
              href="/journey"
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-border rounded-xl text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-text-primary"
            >
              All Entries <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </SlideUp>
        )}

      </div>
    </section>
  );
}
