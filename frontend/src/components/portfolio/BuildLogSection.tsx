"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ArrowRight, Rss } from "lucide-react";
import Link from "next/link";

interface Update {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
}

interface BuildLogSectionProps {
  updates?: Update[];
}

function formatUpdateDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric"
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}

export function BuildLogSection({ updates = [] }: BuildLogSectionProps) {
  const recent = updates.slice(0, 3);

  return (
    <section
      className="section border-t border-border"
      id="build-log"
      aria-labelledby="build-log-heading"
    >
      <div className="container">

        {/* Header */}
        <SlideUp>
          <div className="flex items-end justify-between mb-16 pb-4 border-b border-border">
            <div>
              <span className="label-meta block mb-4">08 / Build Log</span>
              <h2
                id="build-log-heading"
                className="font-display font-bold tracking-tighter text-text-primary uppercase"
                style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                What I've Been Working On.
              </h2>
            </div>
            {recent.length > 0 && (
              <Link
                href="/updates"
                className="hidden sm:flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
              >
                VIEW BUILD LOG <ArrowRight size={14} strokeWidth={2} />
              </Link>
            )}
          </div>
        </SlideUp>

        {recent.length > 0 ? (
          <StaggerContainer staggerDelay={0.1} className="space-y-0">
            {recent.map((update, i) => (
              <StaggerItem key={update._id}>
                <Link
                  href={`/updates/${update.slug}`}
                  className="group block border-b border-border py-8 hover:bg-bg-card transition-colors duration-300 -mx-4 md:-mx-8 px-4 md:px-8"
                  aria-label={`Read update: ${update.title}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">

                    {/* Date + index */}
                    <div className="md:col-span-2">
                      <span className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary block">
                        {formatUpdateDate(update.date)}
                      </span>
                      <span
                        className="font-display font-bold tracking-tighter text-text-tertiary/30 select-none hidden md:block mt-1"
                        style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-7">
                      {update.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {update.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="tag text-[10px]">{tag}</span>
                          ))}
                        </div>
                      )}
                      <h3
                        className="font-display font-semibold text-text-primary tracking-tight group-hover:text-accent transition-colors duration-200 mb-2"
                        style={{ fontSize: "clamp(18px, 2.2vw, 24px)" }}
                      >
                        {update.title}
                      </h3>
                      <p className="text-[15px] text-text-secondary leading-relaxed line-clamp-2">
                        {update.summary}
                      </p>
                    </div>

                    {/* Cover image if available */}
                    <div className="md:col-span-3 flex items-start justify-end">
                      {update.coverImage ? (
                        <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden bg-bg-elevated shrink-0">
                          <img
                            src={update.coverImage}
                            alt={update.title}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-widest uppercase text-text-tertiary group-hover:text-accent transition-colors duration-200 mt-1">
                          Read <ArrowRight size={10} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <SlideUp delay={0.1}>
            <div className="py-20 border border-border border-dashed rounded-2xl flex flex-col items-center text-center">
              <Rss size={32} strokeWidth={1} className="text-text-tertiary mb-4" />
              <h3
                className="font-display font-bold text-text-primary tracking-tight mb-3"
                style={{ fontSize: "clamp(22px, 2.5vw, 28px)" }}
              >
                BUILD LOG EMPTY
              </h3>
              <p className="text-[15px] text-text-secondary max-w-sm leading-relaxed">
                The first update will appear here.
              </p>
            </div>
          </SlideUp>
        )}

        <SlideUp delay={0.2} className="mt-12">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200"
          >
            VIEW BUILD LOG <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </SlideUp>

      </div>
    </section>
  );
}
