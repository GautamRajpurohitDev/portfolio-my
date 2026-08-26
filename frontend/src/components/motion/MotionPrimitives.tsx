"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { fadeIn, slideUp, slideUpCard, revealLine, staggerContainer, imageReveal, scaleIn } from "@/lib/motion";

interface FadeInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Simple fade-in component */
export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={shouldReduce ? {} : fadeIn}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface SlideUpProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  card?: boolean;
}

/** Slide up + fade in */
export function SlideUp({ children, className, delay = 0, card = false, ...props }: SlideUpProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={shouldReduce ? {} : (card ? slideUpCard : slideUp)}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

/** Stagger wrapper for lists of animated children */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.12,
  delayChildren = 0,
}: StaggerContainerProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={shouldReduce ? {} : (staggerContainer(staggerDelay as any, delayChildren as any) as any)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

/** Child of StaggerContainer */
export function StaggerItem({ children, className }: StaggerItemProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduce ? {} : slideUpCard}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

/** Reveal text line by line (overflow hidden masking) */
export function RevealText({
  children,
  className,
  delay = 0,
  tag: Tag = "span",
}: RevealTextProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <motion.span
        className="block"
        initial="hidden"
        animate="visible"
        variants={revealLine}
        transition={{ delay }}
        style={{ display: "block" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Clip-path reveal for images */
export function ImageReveal({ children, className, delay = 0 }: ImageRevealProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={shouldReduce ? {} : imageReveal}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Scale + fade in */
export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={shouldReduce ? {} : scaleIn}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
