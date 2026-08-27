"use client";

import { SlideUp } from "@/components/motion/MotionPrimitives";
import { cn } from "@/lib/utils";
import { Skill } from "@/types";

interface SkillsSectionProps {
  skills?: Skill[];
  hideHeader?: boolean;
}

const CATEGORY_MAP: Record<string, { label: string; order: number }> = {
  "programming":     { label: "PROGRAMMING LANGUAGES", order: 1 },
  "cs-fundamentals": { label: "CORE FUNDAMENTALS",     order: 2 },
  "systems":         { label: "SYSTEMS & CLI",         order: 3 },
  "web":             { label: "WEB ARCHITECTURE",      order: 4 },
  "databases":       { label: "DATA & STORAGE",        order: 5 },
  "cloud":           { label: "CLOUD & DEVOPS",        order: 6 },
  "ai-ml":           { label: "AI & INTELLIGENCE",     order: 7 },
  "tools":           { label: "DEVELOPMENT WORKFLOW",  order: 8 },
};

// Fallback categorization by skill name if category field is empty or generic
function categorizeSkill(skill: Skill): string {
  const name = skill.name.toLowerCase();
  if (name.includes("c++") || name === "c" || name.includes("python") || name.includes("java")) return "programming";
  if (name.includes("structure") || name.includes("algorithm")) return "cs-fundamentals";
  if (name.includes("linux")) return "systems";
  if (name.includes("html") || name.includes("react") || name.includes("node") || name.includes("javascript")) return "web";
  if (name.includes("mongo") || name.includes("sql") || name.includes("database")) return "databases";
  if (name.includes("cloud") || name.includes("devops")) return "cloud";
  if (name.includes("ai") || name.includes("machine learning")) return "ai-ml";
  if (name.includes("git")) return "tools";
  return skill.category || "programming";
}

export function SkillsSection({ skills = [], hideHeader = false }: SkillsSectionProps) {
  const publishedSkills = skills.filter((s) => s.published !== false);

  // 1. Separate Active Foundation from Roadmap
  const inProgressSkills = publishedSkills.filter(
    (s) => s.status === "in-progress" || s.status === "learning" || s.status === "practicing"
  );

  const roadmapSkills = publishedSkills.filter(
    (s) => s.status !== "in-progress" && s.status !== "learning" && s.status !== "practicing" && s.status !== "completed"
  );

  // Group roadmap skills by category
  const groups: Record<string, Skill[]> = {};
  roadmapSkills.forEach((skill) => {
    const cat = categorizeSkill(skill);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(skill);
  });

  const sortedCategories = Object.keys(groups).sort(
    (a, b) => (CATEGORY_MAP[a]?.order || 99) - (CATEGORY_MAP[b]?.order || 99)
  );

  return (
    <section
      className={hideHeader ? "py-12 md:py-20 bg-bg" : "section border-t border-border bg-bg"}
      id="skills"
      aria-labelledby="skills-heading"
    >
      <div className="container">
        
        {/* Header */}
        {!hideHeader && (
          <SlideUp>
            <div className="max-w-3xl mb-14 sm:mb-16">
              <span className="label-meta block mb-3 text-accent">
                05 / Technical Stack & Roadmap
              </span>
              <h2
                id="skills-heading"
                className="font-display font-bold tracking-tighter text-text-primary uppercase mb-4"
                style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
              >
                What I'm Actually Working With.
              </h2>
              <p className="text-[16px] sm:text-[18px] text-text-secondary leading-relaxed font-body">
                An authentic, verified record of technical capabilities — only what is actively practiced from first principles or planned on the curriculum. No fabricated expertise.
              </p>
            </div>
          </SlideUp>
        )}

        {/* ── 01 / FOUNDATION IN PROGRESS ─────────────────────────── */}
        {inProgressSkills.length > 0 && (
          <div className="mb-16 sm:mb-20">
            <SlideUp>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <h3 className="font-mono text-xs tracking-widest text-text-primary uppercase">
                  01 / FOUNDATION IN PROGRESS
                </h3>
              </div>
            </SlideUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {inProgressSkills.map((skill) => {
                const progressVal = typeof skill.progress === "number" && skill.progress > 0 ? skill.progress : 89;
                return (
                  <SlideUp key={skill._id} delay={0.05}>
                    <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border hover:border-accent/40 transition-colors">
                      <div className="flex items-baseline justify-between gap-4 mb-3">
                        <h4 className="font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                          {skill.name}
                        </h4>
                        <span className="font-mono font-bold text-xl sm:text-2xl text-accent tabular-nums">
                          {progressVal}%
                        </span>
                      </div>

                      <p className="text-[14px] sm:text-[15px] text-text-secondary mb-6 leading-relaxed">
                        {skill.description ||
                          "Version control fundamentals, branching strategies, commit hygiene, merging, rebasing, and GitHub collaboration workflows from first principles."}
                      </p>

                      {/* Unified Progress Bar */}
                      <div className="w-full h-1.5 bg-border-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-text-tertiary">
                        <span>ACTIVE CURRICULUM</span>
                        <span className="text-accent">IN PROGRESS</span>
                      </div>
                    </div>
                  </SlideUp>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 02 / ON THE ROADMAP ─────────────────────────────────── */}
        {sortedCategories.length > 0 && (
          <div>
            <SlideUp>
              <div className="flex items-center gap-3 mb-8 pb-3 border-b border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                <h3 className="font-mono text-xs tracking-widest text-text-primary uppercase">
                  02 / ON THE ROADMAP
                </h3>
              </div>
            </SlideUp>

            {/* Editorial Multi-Column List Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
              {sortedCategories.map((catKey, idx) => {
                const catInfo = CATEGORY_MAP[catKey] || { label: catKey.toUpperCase() };
                const catSkills = groups[catKey] || [];

                return (
                  <SlideUp key={catKey} delay={0.04 * idx}>
                    <div className="flex flex-col">
                      {/* Structural Heading */}
                      <div className="pb-2.5 mb-3 border-b border-border flex items-baseline justify-between">
                        <h4 className="font-mono text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
                          {catInfo.label}
                        </h4>
                        <span className="font-mono text-[10px] text-text-tertiary">
                          {String(catSkills.length).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Editorial Rows with Thin Dividers */}
                      <div className="divide-y divide-border/60">
                        {catSkills.map((skill) => (
                          <div
                            key={skill._id}
                            className="py-2.5 flex items-center justify-between gap-3 text-left group hover:pl-1 transition-all"
                          >
                            <span className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors">
                              {skill.name}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary">
                              PLANNED
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SlideUp>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
