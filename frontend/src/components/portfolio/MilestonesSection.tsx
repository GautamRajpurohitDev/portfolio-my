"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
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

const STATUS_CONFIG = {
  "completed":   { icon: CheckCircle, color: "text-success",       border: "border-success",      bg: "bg-success/10"  },
  "in-progress": { icon: Clock,       color: "text-accent",        border: "border-accent",       bg: "bg-accent/10"   },
  "planned":     { icon: Circle,      color: "text-text-tertiary", border: "border-border-muted", bg: "bg-bg-card"     },
};

export function MilestonesSection({ milestones = [], hideHeader = false }: MilestonesSectionProps) {
  const sorted = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <section
      className={hideHeader ? "py-12 md:py-16 bg-bg-alt" : "section border-t border-border bg-bg-alt"}
      id="milestones"
      aria-labelledby="milestones-heading"
    >
      <div className="container">

        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="flex items-end justify-between mb-4 pb-4 border-b border-border">
              <div>
                <span className="label-meta block mb-4">07 / Milestones</span>
                <h2
                  id="milestones-heading"
                  className="font-display font-bold tracking-tighter text-text-primary uppercase"
                  style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
                >
                  Progress Over Perfection.
                </h2>
              </div>
              {sorted.length > 0 && (
                <Link
                  href="/milestones"
                  className="hidden sm:flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-text-secondary hover:text-accent transition-colors duration-200 shrink-0 mb-1"
                >
                  ALL MILESTONES <ArrowRight size={14} strokeWidth={2} />
                </Link>
              )}
            </div>
          </SlideUp>
        )}

        {sorted.length > 0 ? (
          <>
            <div className="relative mt-12">
              <div
                className="absolute left-[19px] top-5 bottom-5 w-px bg-border hidden md:block"
                aria-hidden
              />
              <StaggerContainer staggerDelay={0.07} className="space-y-3">
                {sorted.map((milestone) => (
                  <StaggerItem key={milestone._id}>
                    <MilestoneItem milestone={milestone} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
            <SlideUp delay={0.2} className="mt-12 sm:hidden">
              <Link
                href="/milestones"
                className="flex items-center justify-center gap-2 w-full py-4 border border-border rounded-xl text-[13px] font-semibold tracking-wide uppercase text-text-secondary"
              >
                ALL MILESTONES <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </SlideUp>
          </>
        ) : (
          <SlideUp delay={0.1}>
            <div className="mt-12 py-20 border border-border border-dashed rounded-2xl flex flex-col items-center text-center">
              <div className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary mb-6">
                No milestones yet
              </div>
              <h3
                className="font-display font-bold text-text-primary tracking-tight mb-3"
                style={{ fontSize: "clamp(24px, 3vw, 32px)" }}
              >
                The milestones are being set.
              </h3>
              <p className="text-[16px] text-text-secondary max-w-sm leading-relaxed">
                Each one will mark a real moment of progress.
              </p>
            </div>
          </SlideUp>
        )}

      </div>
    </section>
  );
}

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const config = STATUS_CONFIG[milestone.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-5 p-5 rounded-xl border transition-colors duration-300",
        config.border,
        config.bg,
        milestone.status === "planned" && "opacity-60"
      )}
      role="listitem"
    >
      <span className={cn("shrink-0 mt-0.5 bg-bg-card rounded-full p-1", config.color)} aria-hidden>
        <Icon size={20} strokeWidth={1.5} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h3 className={cn(
            "font-display font-semibold text-[18px] tracking-tight",
            milestone.status === "planned" ? "text-text-tertiary" : "text-text-primary"
          )}>
            {milestone.title}
          </h3>
          {milestone.category && (
            <span className="tag text-[10px]">{milestone.category}</span>
          )}
          {milestone.date && (
            <span className="font-mono text-[11px] text-text-tertiary ml-auto">
              {new Date(milestone.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        {milestone.description && (
          <p className="text-[14px] text-text-secondary leading-relaxed">{milestone.description}</p>
        )}
      </div>

      <span className={cn(
        "shrink-0 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full border",
        config.color,
        config.border
      )}>
        {milestone.status === "in-progress" ? "IN PROGRESS" : milestone.status.toUpperCase()}
      </span>
    </div>
  );
}
