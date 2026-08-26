"use client";

import { SlideUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionPrimitives";
import { cn } from "@/lib/utils";
import { Skill, SkillStatus } from "@/types";
import { Sparkles, Layers, CheckCircle2, Clock, Compass } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  "programming":     "Programming Languages",
  "cs-fundamentals": "CS Fundamentals",
  "web":             "Web Development",
  "databases":       "Databases",
  "systems":         "Systems & OS",
  "cloud":           "Cloud & DevOps",
  "ai-ml":           "AI & Machine Learning",
  "mobile":          "Mobile Development",
  "tools":           "Tools & Workflow",
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; border: string; text: string; bg: string }> = {
  "in-progress": { label: "IN PROGRESS", dot: "bg-accent", border: "border-accent/40", text: "text-accent", bg: "bg-accent/5" },
  "learning":    { label: "IN PROGRESS", dot: "bg-accent", border: "border-accent/40", text: "text-accent", bg: "bg-accent/5" },
  "practicing":  { label: "PRACTICING",  dot: "bg-amber-400", border: "border-amber-400/40", text: "text-amber-400", bg: "bg-amber-400/5" },
  "review":      { label: "REVIEW",      dot: "bg-blue-400", border: "border-blue-400/40", text: "text-blue-400", bg: "bg-blue-400/5" },
  "completed":   { label: "COMPLETED",   dot: "bg-emerald-400", border: "border-emerald-400/40", text: "text-emerald-400", bg: "bg-emerald-400/5" },
  "not-started": { label: "PLANNED",     dot: "bg-text-tertiary", border: "border-border/60", text: "text-text-secondary", bg: "bg-white/[0.01]" },
  "planned":     { label: "PLANNED",     dot: "bg-text-tertiary", border: "border-border/60", text: "text-text-secondary", bg: "bg-white/[0.01]" },
  "optional":    { label: "OPTIONAL",    dot: "bg-purple-400", border: "border-purple-400/40", text: "text-purple-400", bg: "bg-purple-400/5" },
  "paused":      { label: "PAUSED",      dot: "bg-zinc-500", border: "border-zinc-500/40", text: "text-zinc-400", bg: "bg-zinc-500/5" },
};

interface SkillsSectionProps {
  skills?: Skill[];
  hideHeader?: boolean;
}

export function SkillsSection({ skills = [], hideHeader = false }: SkillsSectionProps) {
  const publishedSkills = skills.filter((s) => s.published);

  // 1. Separate into genuine buckets
  const inProgressSkills = publishedSkills.filter(
    (s) => s.status === "in-progress" || s.status === "learning" || s.status === "practicing"
  );

  const completedSkills = publishedSkills.filter(
    (s) => s.status === "completed"
  );

  const roadmapSkills = publishedSkills.filter(
    (s) => s.status !== "in-progress" && s.status !== "learning" && s.status !== "practicing" && s.status !== "completed"
  );

  // Group roadmap skills by category
  const roadmapGroups = roadmapSkills.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category || "tools";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <section
      className={hideHeader ? "py-12 md:py-16 bg-bg" : "section border-t border-border bg-bg"}
      id="skills"
      aria-labelledby="skills-heading"
    >
      <div className="container">
        
        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="max-w-3xl mb-14">
              <span className="label-meta block mb-3 text-accent font-mono text-[11px] uppercase tracking-widest">
                06 / Technical Focus & Roadmap
              </span>
              <h2
                id="skills-heading"
                className="font-display font-bold tracking-tighter text-text-primary uppercase mb-4"
                style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
              >
                What I'm Actually Working With.
              </h2>
              <p className="text-body-lg text-text-secondary leading-relaxed font-body">
                An authentic, verified record of technical capabilities — only what is actively practiced or planned from first principles. No fabricated expertise.
              </p>
            </div>
          </SlideUp>
        )}

        {/* ── 01 / IN PROGRESS ────────────────────────────────────── */}
        {inProgressSkills.length > 0 && (
          <div className="mb-14">
            <SlideUp>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/60">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <h3 className="font-mono text-xs tracking-widest text-text-primary uppercase">
                  01 / FOUNDATION IN PROGRESS
                </h3>
              </div>
            </SlideUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressSkills.map((skill) => {
                const progressVal = typeof skill.progress === "number" && skill.progress > 0 ? skill.progress : 89;
                return (
                  <SlideUp key={skill._id} delay={0.05}>
                    <div className="p-6 rounded-2xl bg-bg-card border border-accent/30 bg-accent/[0.02] relative overflow-hidden transition-all duration-300 hover:border-accent/60">
                      
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-accent/80 block mb-1">
                            {CATEGORY_LABELS[skill.category] || skill.category}
                          </span>
                          <h4 className="font-display font-bold text-2xl text-text-primary tracking-tight">
                            {skill.name}
                          </h4>
                        </div>
                        <span className="font-mono font-bold text-2xl text-accent">
                          {progressVal}%
                        </span>
                      </div>

                      {/* Description if any */}
                      {skill.description && (
                        <p className="text-sm text-text-secondary mb-5 leading-relaxed font-body">
                          {skill.description}
                        </p>
                      )}

                      {/* Animated Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                  </SlideUp>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 02 / COMPLETED (Only if explicitly marked) ─────────── */}
        {completedSkills.length > 0 && (
          <div className="mb-14">
            <SlideUp>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/60">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <h3 className="font-mono text-xs tracking-widest text-text-primary uppercase">
                  02 / COMPLETED CAPABILITIES
                </h3>
              </div>
            </SlideUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="p-4 rounded-xl bg-bg-card border border-emerald-400/30 flex items-center justify-between gap-3"
                >
                  <span className="font-medium text-text-primary text-sm">{skill.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 03 / ON THE ROADMAP ─────────────────────────────────── */}
        {roadmapSkills.length > 0 && (
          <div>
            <SlideUp>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/60">
                <Compass size={14} className="text-text-muted" />
                <h3 className="font-mono text-xs tracking-widest text-text-primary uppercase">
                  {completedSkills.length > 0 ? "03 / ON THE ROADMAP" : "02 / ON THE ROADMAP"}
                </h3>
              </div>
            </SlideUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(roadmapGroups).map(([catKey, catSkills], idx) => (
                <SlideUp key={catKey} delay={0.05 * idx}>
                  <div className="p-5 rounded-xl bg-bg-card border border-border/60 flex flex-col justify-between h-full">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-text-muted mb-4 pb-2 border-b border-border/40 flex items-center justify-between">
                        <span>{CATEGORY_LABELS[catKey] || catKey}</span>
                        <span className="text-[10px] text-text-tertiary">{catSkills.length}</span>
                      </h4>
                      <div className="space-y-2.5">
                        {catSkills.map((skill) => (
                          <div
                            key={skill._id}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-border/40 hover:border-border/80 transition-colors"
                          >
                            <span className="text-sm font-medium text-text-secondary">{skill.name}</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary px-1.5 py-0.5 rounded bg-white/[0.03]">
                              Planned
                            </span>
                          </div>
                        ))}
                      </div>
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
