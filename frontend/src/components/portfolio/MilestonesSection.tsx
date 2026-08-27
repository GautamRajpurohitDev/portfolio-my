"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Milestone {
  _id: string;
  title: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
  date?: string;
  category: string;
  order: number;
}

interface MilestonesSectionProps {
  milestones?: Milestone[];
  hideHeader?: boolean;
}

export function MilestonesSection({ milestones = [], hideHeader = false }: MilestonesSectionProps) {
  const publishedMilestones = milestones.filter((m) => (m as any).published !== false);
  const sorted = [...publishedMilestones].sort((a, b) => a.order - b.order);

  return (
    <section
      className={hideHeader ? "py-12 md:py-20 bg-bg" : "section border-t border-border bg-bg"}
      id="milestones"
      aria-labelledby="milestones-heading"
    >
      <div className="container">

        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="flex items-end justify-between mb-16 pb-4 border-b border-border">
              <div>
                <span className="label-meta block mb-3 text-accent">06 / Milestones</span>
                <h2
                  id="milestones-heading"
                  className="font-display font-bold tracking-tighter text-text-primary uppercase"
                  style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
                >
                  Verified Progress.
                </h2>
              </div>
              {sorted.length > 0 && (
                <Link
                  href="/milestones"
                  className="hidden sm:flex items-center gap-2 text-[12px] font-mono font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200 shrink-0"
                >
                  All Milestones <ArrowRight size={13} strokeWidth={2} />
                </Link>
              )}
            </div>
          </SlideUp>
        )}

        {sorted.length > 0 ? (
          <div className="divide-y divide-border">
            {sorted.map((milestone, idx) => {
              const isActive = milestone.status === "in-progress";
              const isCompleted = milestone.status === "completed";

              return (
                <SlideUp key={milestone._id} delay={0.04 * idx}>
                  <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-baseline">
                    {/* Status / Category Column */}
                    <div className="md:col-span-3 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent animate-pulse" : isCompleted ? "bg-success" : "bg-text-tertiary"}`} />
                      <span className={`font-mono text-[11px] uppercase tracking-widest ${isActive ? "text-accent font-semibold" : "text-text-tertiary"}`}>
                        {isActive ? "IN PROGRESS" : isCompleted ? "COMPLETED" : "PLANNED"}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="md:col-span-9">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-display font-bold text-lg sm:text-xl text-text-primary">
                          {milestone.title}
                        </h3>
                        {milestone.date && (
                          <span className="font-mono text-[11px] text-text-tertiary">
                            {new Date(milestone.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      {milestone.description && (
                        <p className="text-[14px] text-text-secondary leading-relaxed max-w-2xl font-body">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                </SlideUp>
              );
            })}
          </div>
        ) : (
          <SlideUp delay={0.1}>
            <div className="py-20 border border-border rounded-2xl text-center bg-bg-card p-8">
              <span className="font-mono text-xs uppercase tracking-widest text-text-tertiary block mb-2">
                ROADMAP VERIFICATION
              </span>
              <h3 className="font-display font-bold text-2xl text-text-primary mb-3 uppercase">
                Milestones Are Being Established.
              </h3>
              <p className="text-[15px] text-text-secondary max-w-md mx-auto leading-relaxed">
                Each verified milestone marks a demonstrable leap in technical ability and architecture.
              </p>
            </div>
          </SlideUp>
        )}

      </div>
    </section>
  );
}
