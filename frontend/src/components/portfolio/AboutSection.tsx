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
  
  const metaGrid = [
    { label: "LOCATION", value: config.location },
    { label: "EDUCATION", value: config.education },
    { label: "CURRENT FOCUS", value: config.currentFocus },
  ].filter(i => i.value);

  const areas = config.areasExploring?.length > 0 
    ? [...config.areasExploring].sort((a, b) => a.order - b.order) 
    : [];

  return (
    <section className={hideHeader ? "py-16 md:py-24" : "section border-t border-border"} id="about" aria-labelledby="about-heading">
      <div className="container">

        {!hideHeader && (
          <>
            {/* Section Label */}
            <SlideUp>
              <span className="label-meta mb-4 block">01 — About</span>
            </SlideUp>

            {/* Main Statement */}
            <SlideUp delay={0.05}>
              <h2
                id="about-heading"
                className="font-display font-bold text-display-lg leading-tight tracking-tighter text-text-primary mb-16"
              >
                {shortIntro}
              </h2>
            </SlideUp>
          </>
        )}

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">

          {/* Left — Bio */}
          <SlideUp delay={0.1} className="lg:col-span-7">
            <div className="space-y-5 text-[17px] lg:text-[19px] leading-relaxed text-text-secondary whitespace-pre-line">
              {personalStatement}
            </div>
          </SlideUp>

          {/* Right — Metadata grid */}
          <SlideUp delay={0.15} className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden border border-border">
              {metaGrid.map(({ label, value }) => (
                <div key={label} className="bg-bg-card p-6">
                  <span className="label-meta block mb-2">{label}</span>
                  <span className="font-display font-semibold text-[15px] tracking-wide text-text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </SlideUp>
        </div>

        {/* ── AREAS EXPLORING ─────────────────────────────────── */}
        <SlideUp delay={0.2}>
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-border">
            <h3 className="font-display font-semibold text-heading-xl text-text-primary">
              AREAS I'M EXPLORING
            </h3>
            <Link
              href="/skills"
              className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide uppercase text-text-secondary hover:text-accent transition-colors duration-200"
            >
              Full skills <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
        </SlideUp>

        <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border border border-border rounded-lg overflow-hidden">
          {areas.map(({ title, description }) => (
            <StaggerItem key={title}>
              <div className="bg-bg-card p-6 h-full hover:bg-bg-elevated transition-colors duration-300 group">
                <span
                  className="block w-2 h-2 rounded-full bg-accent mb-4 group-hover:scale-125 transition-transform duration-300"
                  aria-hidden
                />
                <h4 className="font-display font-semibold text-[15px] text-text-primary mb-2">
                  {title}
                </h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* ── TIMELINE ────────────────────────────────────────── */}
        {config?.timeline && config.timeline.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border">
            <SlideUp>
              <h3 className="font-display font-semibold text-heading-xl text-text-primary mb-12">
                TIMELINE
              </h3>
            </SlideUp>
            <div className="space-y-12">
              {[...config.timeline]
                .sort((a, b) => a.order - b.order)
                .map((item, i) => (
                  <SlideUp key={item.title + i} delay={0.1 + i * 0.05} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-8">
                    <div className="text-text-muted font-mono tracking-widest text-sm pt-1">
                      {item.year}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-lg text-text-primary mb-2">
                        {item.title}
                      </h4>
                      <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
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
