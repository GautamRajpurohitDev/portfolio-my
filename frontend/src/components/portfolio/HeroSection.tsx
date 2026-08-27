"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
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
  ctaPrimary?:   { label: string; url: string; enabled: boolean; external: boolean };
  ctaSecondary?: { label: string; url: string; enabled: boolean; external: boolean };
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

const DEFAULT_CONFIG: HeroConfig = {
  headlineLines: ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."],
  subtitle: "MCA student focused on building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly.",
  eyebrow: [
    { text: "BASED IN INDIA",             icon: "MapPin",       enabled: true, order: 1 },
    { text: "MCA STUDENT",                icon: "GraduationCap",enabled: true, order: 2 },
    { text: "SINCE 2026",                 icon: "Code2",        enabled: true, order: 3 },
    { text: "CURRENTLY LEARNING: GIT → C",icon: "Zap",          enabled: true, order: 4 },
  ],
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
  resume?: any;
}

export function HeroSection({ config: rawConfig }: HeroSectionProps) {
  const config       = rawConfig ?? DEFAULT_CONFIG;
  const shouldReduce = useReducedMotion();
  const sectionRef   = useRef<HTMLElement>(null);
  const animEnabled  = config.effects?.animation !== false && !shouldReduce;

  const makeMotion = (delay: number) =>
    !animEnabled ? {} : {
      initial: { opacity: 0, y: 14 },
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

  // Group 1: General Profile items; Group 2: Live status item (last)
  const profileItems = activeEyebrow.slice(0, -1);
  const liveStatusItem = activeEyebrow.length > 0 ? activeEyebrow[activeEyebrow.length - 1] : null;

  const heroLines = config.headlineLines?.length ? config.headlineLines : DEFAULT_CONFIG.headlineLines;

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      aria-label="Hero"
    >
      {/* Liquid cursor — strictly desktop (lg+) only */}
      {config.effects?.liquidCursor !== false && (
        <div className="hidden lg:block pointer-events-none" aria-hidden>
          <LiquidHeroCursor heroRef={sectionRef} />
        </div>
      )}

      {/* ── VISUAL BACKGROUND LAYER (Z-0) ────────────────────── */}
      <div className="hero-visual-layer absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
        <HeroBackground
          backgroundImage={config.backgroundImage}
          overlayOpacity={config.overlayOpacity}
          glowEnabled={config.effects?.glow !== false}
          grainEnabled={config.effects?.grain !== false}
        />
        {/* Controlled secondary GR sculptural watermark */}
        <DecoText animEnabled={animEnabled} />
      </div>

      {/* ── HERO CONTENT LAYER (Z-10) ─────────────────────────── */}
      <div className="container relative z-10">
        <div className="w-full max-w-4xl">

          {/* ── LAYER 2: METADATA (2 intentional rows on mobile) ── */}
          <motion.div
            {...makeMotion(heroSequence.meta)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2.5 gap-x-6 mb-5 sm:mb-6"
          >
            {/* Row 1: Profile attributes */}
            <div className="flex flex-wrap items-center gap-x-3.5 sm:gap-x-6 gap-y-1 font-mono text-[10.5px] sm:text-[11px] tracking-[0.15em] uppercase text-text-secondary">
              {profileItems.map(({ icon, text }, idx) => {
                const Icon = resolveIcon(icon);
                return (
                  <span key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
                    <Icon size={11} strokeWidth={2} className="text-accent shrink-0" />
                    <span>{text}</span>
                  </span>
                );
              })}
            </div>

            {/* Row 2: Live status badge */}
            {liveStatusItem && (
              <div className="flex items-center gap-2 font-mono text-[10.5px] sm:text-[11px] tracking-[0.15em] uppercase text-text-secondary sm:ml-auto whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulseAccent_2s_ease-in-out_infinite] shrink-0" />
                <span>{liveStatusItem.text}</span>
              </div>
            )}
          </motion.div>

          {/* ── LAYER 3: HEADLINE (Solid tightly stacked block) ─── */}
          <h1
            className="font-display font-bold leading-[0.86] tracking-tighter mb-7 sm:mb-8 w-full max-w-none lg:max-w-[880px]"
            style={{ fontSize: "clamp(48px, 12.5vw, 124px)" }}
            aria-label={heroLines.join(" ")}
          >
            {heroLines.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block pr-2"
                  {...makeLineMotion(heroSequence.headline1 + i * 0.12)}
                  style={{ letterSpacing: "-0.035em" }}
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

          {/* ── LAYER 3B: SUBTITLE DESCRIPTION ──────────────────── */}
          <div className="w-full max-w-none sm:max-w-[720px]">
            <motion.p
              {...makeMotion(heroSequence.subtitle)}
              className="text-[16px] sm:text-[18px] lg:text-[19.5px] text-text-secondary leading-[1.5] font-body"
            >
              {config.subtitle || DEFAULT_CONFIG.subtitle}
            </motion.p>

            {/* ── LAYER 4: SCROLL CUE (Discovery cue) ─────────────── */}
            <motion.div
              {...makeMotion(heroSequence.scroll)}
              className="mt-5 sm:mt-6 flex items-center gap-2"
              aria-hidden
            >
              <motion.div
                animate={animEnabled ? { y: [0, 4, 0] } : {}}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: heroSequence.scroll + 0.5 }}
                className="inline-flex items-center justify-center leading-none"
              >
                <ArrowDown size={13} strokeWidth={1.5} className="text-text-tertiary" />
              </motion.div>
              <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-text-tertiary leading-none">
                Scroll to explore
              </span>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── BACKGROUND ────────────────────────────────────────────────

function HeroBackground({ backgroundImage, overlayOpacity, glowEnabled, grainEnabled }: {
  backgroundImage: string; overlayOpacity: number; glowEnabled: boolean; grainEnabled: boolean;
}) {
  return (
    <>
      {/* Custom background image */}
      {backgroundImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div className="absolute inset-0" style={{ background: `rgba(246,244,239,${overlayOpacity ?? 0.04})` }} />
        </>
      )}

      {/* Default: dot grid */}
      {!backgroundImage && (
        <div
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, var(--hero-dot-color, rgba(240,237,232,0.25)) 1px, transparent 1px)`, backgroundSize: "40px 40px" }}
        />
      )}

      {/* Glow — top right */}
      {glowEnabled && (
        <div
          className="absolute -top-36 right-0 rounded-full pointer-events-none transition-all duration-300"
          style={{
            width: "var(--ambient-glow-top-size, 550px)",
            height: "var(--ambient-glow-top-size, 550px)",
            opacity: "var(--ambient-glow-top-opacity, 0.035)",
            background: "radial-gradient(circle, var(--ambient-glow-color, #E9C43A) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Glow — bottom left */}
      {glowEnabled && (
        <div
          className="absolute bottom-0 -left-36 rounded-full pointer-events-none transition-all duration-300"
          style={{
            width: "var(--ambient-glow-bottom-size, 400px)",
            height: "var(--ambient-glow-bottom-size, 400px)",
            opacity: "var(--ambient-glow-bottom-opacity, 0.025)",
            background: "radial-gradient(circle, var(--ambient-glow-color, #E9C43A) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Horizontal divider line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border opacity-60" />

      {/* Film grain */}
      {grainEnabled && (
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }} />
      )}
    </>
  );
}

// ── DECO TEXT (Secondary Typographic Sculpture — Background Layer) ─

function DecoText({ animEnabled }: { animEnabled: boolean }) {
  return (
    <div className="block absolute bottom-4 right-[-30px] sm:right-[-10px] lg:right-4 pointer-events-none overflow-hidden select-none z-0" aria-hidden>
      <motion.span
        initial={animEnabled ? { opacity: 0, x: 30 } : {}}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="block font-display font-bold text-text-primary"
        style={{
          fontSize: "clamp(110px, 28vw, 240px)",
          lineHeight: "0.85",
          letterSpacing: "-0.04em",
          opacity: "var(--hero-deco-opacity, 0.035)" as any,
          transform: "translateX(6%) translateY(4%)",
          userSelect: "none",
        }}
      >
        GR
      </motion.span>
    </div>
  );
}
