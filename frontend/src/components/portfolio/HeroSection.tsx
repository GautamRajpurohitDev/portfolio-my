"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, ArrowDown,
  MapPin, GraduationCap, Code2, Zap, Star, BookOpen,
  Coffee, Globe, Terminal, Cpu, Layers, Award
} from "lucide-react";
import { heroSequence, ease, duration } from "@/lib/motion";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const LiquidHeroCursor = dynamic(
  () => import("@/components/cursor/LiquidHeroCursor"),
  { ssr: false, loading: () => null }
);

// ── Icon resolver ─────────────────────────────────────────────
// Maps icon name strings (stored in DB) to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  MapPin, GraduationCap, Code2, Zap, Star, BookOpen,
  Coffee, Globe, Terminal, Cpu, Layers, Award,
};

function resolveIcon(name: string) {
  return ICON_MAP[name] ?? Code2;
}

// ── Types ─────────────────────────────────────────────────────

export interface HeroConfig {
  headlineLines: string[];
  subtitle:      string;
  eyebrow: Array<{ text: string; icon: string; enabled: boolean; order: number }>;
  ctaPrimary:   { label: string; url: string; enabled: boolean; external: boolean };
  ctaSecondary: { label: string; url: string; enabled: boolean; external: boolean };
  backgroundImage: string;
  heroImage:       string;
  overlayOpacity:  number;
  effects: {
    liquidCursor:    boolean;
    liquidIntensity: string;
    cursorSize:      number;
    hoverScale:      number;
    rippleEnabled:   boolean;
    rippleIntensity: string;
    parallax:        boolean;
    glow:            boolean;
    grain:           boolean;
    animation:       boolean;
  };
  status:  string;
  visible: boolean;
}

// Defaults if API returns nothing
const DEFAULT_CONFIG: HeroConfig = {
  headlineLines: ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."],
  subtitle: "MCA student focused on building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly.",
  eyebrow: [
    { text: "BASED IN INDIA",             icon: "MapPin",       enabled: true, order: 1 },
    { text: "MCA STUDENT",                icon: "GraduationCap",enabled: true, order: 2 },
    { text: "SINCE 2026",                 icon: "Code2",        enabled: true, order: 3 },
    { text: "CURRENTLY LEARNING: GIT → C",icon: "Zap",          enabled: true, order: 4 },
  ],
  ctaPrimary:   { label: "View Projects",   url: "/projects", enabled: true, external: false },
  ctaSecondary: { label: "Explore Journey", url: "/journey",  enabled: true, external: false },
  backgroundImage: "",
  heroImage:       "",
  overlayOpacity:  0.04,
  effects: {
    liquidCursor: true, liquidIntensity: "medium",
    cursorSize: 36, hoverScale: 2.5,
    rippleEnabled: true, rippleIntensity: "medium",
    parallax: false, glow: true, grain: true, animation: true,
  },
  status:  "published",
  visible: true,
};

interface HeroSectionProps {
  config?: HeroConfig | null;
  resume?: {
    fileUrl?: string;
    fileName?: string;
    published?: boolean;
    label?: string;
  } | null;
}

export function HeroSection({ config: rawConfig, resume }: HeroSectionProps) {
  const config       = rawConfig ?? DEFAULT_CONFIG;
  const shouldReduce = useReducedMotion();
  const sectionRef   = useRef<HTMLElement>(null);
  const animEnabled  = config.effects?.animation !== false && !shouldReduce;

  const makeMotion = (delay: number) =>
    !animEnabled ? {} : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.normal, ease: ease.editorial, delay },
    };

  const makeLineMotion = (delay: number) =>
    !animEnabled ? {} : {
      initial: { y: "110%", opacity: 0 },
      animate: { y: "0%",   opacity: 1 },
      transition: { duration: duration.large, ease: ease.editorial, delay },
    };

  // Active eyebrow items, sorted by order
  const activeEyebrow = (config.eyebrow ?? DEFAULT_CONFIG.eyebrow)
    .filter((e) => e.enabled)
    .sort((a, b) => a.order - b.order);

  const heroLines = config.headlineLines?.length ? config.headlineLines : DEFAULT_CONFIG.headlineLines;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Liquid cursor — only when enabled in config */}
      {config.effects?.liquidCursor !== false && (
        <LiquidHeroCursor heroRef={sectionRef} />
      )}

      {/* Background */}
      <HeroBackground
        backgroundImage={config.backgroundImage}
        overlayOpacity={config.overlayOpacity}
        glowEnabled={config.effects?.glow !== false}
        grainEnabled={config.effects?.grain !== false}
      />

      <div className="container relative z-10">
        <div className="pt-32 pb-24 lg:pt-40 lg:pb-32">

          {/* ── EYEBROW / METADATA ROW ──────────────────────────── */}
          <motion.div
            {...makeMotion(heroSequence.meta)}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-12"
          >
            {activeEyebrow.map(({ icon, text }, idx) => {
              const Icon = resolveIcon(icon);
              // Last item gets the "live status" treatment (pulse dot + ml-auto)
              const isLast = idx === activeEyebrow.length - 1;
              return (
                <span
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary",
                    isLast && "ml-auto"
                  )}
                >
                  {isLast ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulseAccent_2s_ease-in-out_infinite]" />
                  ) : (
                    <Icon size={12} strokeWidth={2} className="text-accent" />
                  )}
                  {text}
                </span>
              );
            })}
          </motion.div>

          {/* ── HERO HEADLINE ───────────────────────────────────── */}
          <h1
            className="font-display font-bold leading-none tracking-tighter mb-8"
            style={{ fontSize: "clamp(68px, 10vw, 148px)" }}
            aria-label={heroLines.join(" ")}
          >
            {heroLines.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block"
                  {...makeLineMotion(heroSequence.headline1 + i * 0.15)}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {/* Last line: last char gets accent color */}
                  {i === heroLines.length - 1 && line.length > 0 ? (
                    <>
                      {line.slice(0, -1)}
                      <span className="text-accent">{line.slice(-1)}</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* ── SUBTITLE + CTA ──────────────────────────────────── */}
          <div className="max-w-2xl">
            <motion.p
              {...makeMotion(heroSequence.subtitle)}
              className="text-[18px] lg:text-[20px] text-text-secondary leading-relaxed mb-12"
            >
              {config.subtitle || DEFAULT_CONFIG.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...makeMotion(heroSequence.cta)}
              className="flex flex-wrap items-center gap-4"
            >
              {config.ctaPrimary?.enabled !== false && (
                <Link
                  href={config.ctaPrimary?.url || "/projects"}
                  target={config.ctaPrimary?.external ? "_blank" : undefined}
                  rel={config.ctaPrimary?.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-7 py-4 rounded-pill",
                    "bg-accent text-bg font-semibold text-[14px] tracking-wide uppercase",
                    "hover:bg-accent/90 active:scale-[0.98]",
                    "transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  )}
                >
                  {config.ctaPrimary?.label || "View Projects"}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              )}

              {config.ctaSecondary?.enabled !== false && (
                <Link
                  href={config.ctaSecondary?.url || "/journey"}
                  target={config.ctaSecondary?.external ? "_blank" : undefined}
                  rel={config.ctaSecondary?.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-7 py-4 rounded-pill",
                    "border border-border text-text-primary font-semibold text-[14px] tracking-wide uppercase",
                    "hover:border-border-hover hover:text-text-primary",
                    "transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  )}
                >
                  {config.ctaSecondary?.label || "Explore Journey"}
                  <ArrowRight size={16} strokeWidth={2} className="text-text-secondary" />
                </Link>
              )}

              {resume?.published && resume?.fileUrl && (
                <a
                  href={resume.fileUrl.startsWith("http") ? resume.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${resume.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Official Curriculum Vitae / Resume (PDF opens in new tab)"
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 rounded-pill",
                    "border border-primary/40 bg-primary/[0.04] text-primary font-semibold text-[14px] tracking-wide uppercase",
                    "hover:bg-primary/[0.08] hover:border-primary/60",
                    "transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  )}
                >
                  {resume.label || "View Resume"}
                  <ArrowRight size={15} strokeWidth={2} className="text-primary -rotate-45" />
                </a>
              )}
            </motion.div>
          </div>

          {/* ── SCROLL INDICATOR ────────────────────────────────── */}
          <motion.div
            {...makeMotion(heroSequence.scroll)}
            className="mt-20 flex items-center gap-3"
            aria-hidden
          >
            <motion.div
              animate={animEnabled ? { y: [0, 6, 0] } : {}}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: heroSequence.scroll + 0.5 }}
            >
              <ArrowDown size={18} strokeWidth={1.5} className="text-text-tertiary" />
            </motion.div>
            <span className="font-mono text-[11px] tracking-widest uppercase text-text-tertiary">
              Scroll to explore
            </span>
          </motion.div>

        </div>
      </div>

      {/* Large decorative text behind */}
      <DecoText animEnabled={animEnabled} />
    </section>
  );
}

// ── BACKGROUND ────────────────────────────────────────────────

function HeroBackground({ backgroundImage, overlayOpacity, glowEnabled, grainEnabled }: {
  backgroundImage: string; overlayOpacity: number; glowEnabled: boolean; grainEnabled: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Custom background image */}
      {backgroundImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOpacity ?? 0.04})` }} />
        </>
      )}

      {/* Default: dot grid */}
      {!backgroundImage && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(circle, #f0ede8 1px, transparent 1px)`, backgroundSize: "40px 40px" }}
        />
      )}

      {/* Glow — top right */}
      {glowEnabled && (
        <div
          className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #e8c547 0%, transparent 70%)" }}
        />
      )}

      {/* Glow — bottom left */}
      {glowEnabled && (
        <div
          className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #e8c547 0%, transparent 70%)" }}
        />
      )}

      {/* Horizontal divider line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border opacity-50" />

      {/* Film grain */}
      {grainEnabled && (
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }} />
      )}
    </div>
  );
}

// ── DECO TEXT ─────────────────────────────────────────────────

function DecoText({ animEnabled }: { animEnabled: boolean }) {
  return (
    <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden select-none" aria-hidden>
      <motion.span
        initial={animEnabled ? { opacity: 0, x: 40 } : {}}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="block font-display font-bold text-text-primary"
        style={{ fontSize: "clamp(120px, 20vw, 280px)", lineHeight: "1", letterSpacing: "-0.04em", opacity: 0.015, transform: "translateX(20%)", userSelect: "none" }}
      >
        GR
      </motion.span>
    </div>
  );
}
