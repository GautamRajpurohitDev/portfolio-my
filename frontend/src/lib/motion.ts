/**
 * Motion system — all animation variants and timing tokens.
 * Import these centrally; never define inline animations elsewhere.
 */

import { Variants } from "framer-motion";

// ── DURATION TOKENS ──────────────────────────────────────────
export const duration = {
  micro:    0.15,
  fast:     0.25,
  normal:   0.35,
  slow:     0.55,
  large:    0.75,
  page:     0.45,
} as const;

// ── EASING TOKENS ────────────────────────────────────────────
export const ease = {
  out:          [0.0,  0.0,  0.2, 1.0] as [number, number, number, number],
  inOut:        [0.4,  0.0,  0.2, 1.0] as [number, number, number, number],
  editorial:    [0.22, 1.0,  0.36, 1.0] as [number, number, number, number],
  spring:       { type: "spring" as const, stiffness: 300, damping: 30 },
  springGentle: { type: "spring" as const, stiffness: 180, damping: 24 },
} as const;

// ── STAGGER TOKENS ───────────────────────────────────────────
export const stagger = {
  micro:  0.04,
  fast:   0.08,
  normal: 0.12,
  slow:   0.18,
} as const;

// ── DISTANCE TOKENS ──────────────────────────────────────────
export const distance = {
  sm:  12,
  md:  24,
  lg:  40,
  xl:  60,
} as const;

// ── ANIMATION VARIANTS ───────────────────────────────────────

/** Simple opacity fade in */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.out },
  },
};

/** Slide up + fade */
export const slideUp: Variants = {
  hidden:  { opacity: 0, y: distance.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.editorial },
  },
};

/** Slide up smaller distance for cards */
export const slideUpCard: Variants = {
  hidden:  { opacity: 0, y: distance.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.editorial },
  },
};

/** Text line reveal — wraps each line in overflow-hidden parent */
export const revealLine: Variants = {
  hidden:  { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: duration.large, ease: ease.editorial },
  },
};

/** Image clip-path reveal from bottom */
export const imageReveal: Variants = {
  hidden:  { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: duration.large, ease: ease.editorial },
  },
};

/** Scale in from slightly smaller */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: ease.editorial },
  },
};

/** Stagger container — orchestrates children */
export const staggerContainer = (
  staggerDelay = stagger.normal,
  delayChildren = 0
): Variants => ({
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/** Page transition — used by PageTransition component */
export const pageVariants: Variants = {
  initial:  { opacity: 0, y: 16 },
  animate:  {
    opacity: 1,
    y: 0,
    transition: { duration: duration.page, ease: ease.editorial },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: duration.fast, ease: ease.out },
  },
};

/** Hero metadata row */
export const heroMeta: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.out, delay: 0.3 },
  },
};

/** Horizontal slide from left */
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.slow, ease: ease.editorial },
  },
};

/** Horizontal slide from right */
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.slow, ease: ease.editorial },
  },
};

/** Draw line (for timeline/borders) */
export const drawLine: Variants = {
  hidden:  { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: duration.slow, ease: ease.editorial },
  },
};

/** Number count up — use with MotionValue */
export const countUp = {
  duration: duration.slow,
  ease: ease.editorial,
};

/** Hero sequence delays (ms converted to seconds) */
export const heroSequence = {
  navbar:      0.1,
  meta:        0.3,
  headline1:   0.5,
  headline2:   0.65,
  headline3:   0.8,
  headline4:   0.95,
  subtitle:    1.2,
  cta:         1.45,
  scroll:      1.7,
} as const;

/** Hover variants for cards */
export const cardHover = {
  rest:  { scale: 1,    y: 0,  transition: { duration: duration.fast,   ease: ease.out } },
  hover: { scale: 1.01, y: -4, transition: { duration: duration.normal, ease: ease.editorial } },
};

/** Image zoom on hover */
export const imageZoom = {
  rest:  { scale: 1,    transition: { duration: duration.slow, ease: ease.out } },
  hover: { scale: 1.04, transition: { duration: duration.slow, ease: ease.editorial } },
};
