"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export type BootState = "boot" | "loading" | "ready" | "exit" | "error";

interface SystemBootLoaderProps {
  isAdmin?: boolean;
  minDurationMs?: number;
}

const PUBLIC_STEPS = [
  { line: "BUILDING", step: "01 / 04" },
  { line: "SOFTWARE", step: "02 / 04" },
  { line: "ONE LAYER", step: "03 / 04" },
  { line: "AT A TIME.", step: "04 / 04" },
];

const ADMIN_STEPS = [
  { line: "INITIALIZING", step: "01 / 04" },
  { line: "WORKSPACE", step: "02 / 04" },
  { line: "SECURITY", step: "03 / 04" },
  { line: "READY.", step: "04 / 04" },
];

// Step percentages mapped to the 4 architectural layers
const STEP_PROGRESS = [25, 50, 75, 100];

export function SystemBootLoader({
  isAdmin: forcedIsAdmin,
  minDurationMs = 380,
}: SystemBootLoaderProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const isAdmin = forcedIsAdmin ?? (pathname?.startsWith("/admin") ?? false);

  const steps = isAdmin ? ADMIN_STEPS : PUBLIC_STEPS;

  const [bootState, setBootState] = useState<BootState>("boot");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Lightweight route transition indicator for internal navigation
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const prevPathRef = useRef<string>(pathname);
  const initialLoadRef = useRef<boolean>(true);

  // 1. Layered Editorial Master Boot Sequence with Real Document/Font Readiness
  useEffect(() => {
    let isCancelled = false;
    const startTime = Date.now();

    // Step sequence progression
    setActiveStepIndex(0);

    const t1 = setTimeout(() => {
      if (isCancelled) return;
      setActiveStepIndex(1);
    }, 110);

    const t2 = setTimeout(() => {
      if (isCancelled) return;
      setActiveStepIndex(2);
    }, 220);

    const t3 = setTimeout(() => {
      if (isCancelled) return;
      setActiveStepIndex(3);
    }, 330);

    // Wait for actual document & font readiness before transitioning to READY
    const checkActualReadinessAndExit = async () => {
      try {
        // Wait for document fonts if supported
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }

        // Wait for full window load if still loading
        if (typeof document !== "undefined" && document.readyState !== "complete") {
          await new Promise<void>((resolve) => {
            const onLoad = () => {
              window.removeEventListener("load", onLoad);
              resolve();
            };
            window.addEventListener("load", onLoad);
            // Fallback in case load event already fired
            setTimeout(resolve, 1500);
          });
        }
      } catch {
        // Continue gracefully
      }

      if (isCancelled) return;

      // Ensure minDurationMs has elapsed so sequence doesn't flash in 1 frame
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDurationMs - elapsed);

      setTimeout(() => {
        if (isCancelled) return;
        setBootState("ready");

        // Smooth dissolve and upward lift reveal
        const tExit = setTimeout(() => {
          if (isCancelled) return;
          setBootState("exit");
        }, 340);

        return () => clearTimeout(tExit);
      }, remaining);
    };

    checkActualReadinessAndExit();

    // Safety timeout: Never hang indefinitely
    const safetyTimeout = setTimeout(() => {
      if (bootState !== "exit") {
        setBootState("exit");
      }
    }, 4000);

    return () => {
      isCancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(safetyTimeout);
    };
  }, [isAdmin, minDurationMs]);

  // 2. Client-side Route Transition Indicator (Lightweight top gold bar)
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setIsNavigating(true);

      const navTimer = setTimeout(() => {
        setIsNavigating(false);
      }, 380);

      return () => clearTimeout(navTimer);
    }
  }, [pathname]);

  const handleRetry = () => {
    setBootState("boot");
    setActiveStepIndex(0);
    setTimeout(() => {
      setActiveStepIndex(1);
      setTimeout(() => {
        setActiveStepIndex(2);
        setTimeout(() => {
          setActiveStepIndex(3);
          setBootState("ready");
          setTimeout(() => setBootState("exit"), 300);
        }, 150);
      }, 150);
    }, 150);
  };

  const currentProgress = STEP_PROGRESS[activeStepIndex] ?? 25;

  return (
    <>
      {/* ── Top Viewport Route Transition Line (Lightweight for all internal navigation) ── */}
      <AnimatePresence>
        {isNavigating && bootState === "exit" && (
          <motion.div
            key="route-progress-bar"
            initial={{ scaleX: 0, opacity: 0.9 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "0% 50%" }}
            className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[99999] pointer-events-none shadow-[0_0_8px_var(--color-accent)]"
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* ── Fullscreen Master System Boot Experience ───────────────────────────── */}
      <AnimatePresence>
        {bootState !== "exit" && (
          <motion.aside
            key="system-boot-experience"
            role="status"
            aria-live="polite"
            aria-label="System Initializing"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0.25 } }
                : {
                    opacity: 0,
                    y: -8,
                    scale: 1.006,
                    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                  }
            }
            className="fixed inset-0 z-[999999] flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 select-none cursor-default overflow-hidden bg-bg text-text-primary"
            style={{
              backgroundColor: "var(--color-bg, #0a0a0a)",
            }}
          >
            {/* Ambient Technical Micro Texture Grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
              style={{
                backgroundImage: `radial-gradient(var(--color-text-primary) 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
              }}
              aria-hidden
            />

            {/* Subtle Vertical Scanning Sweep */}
            {!shouldReduceMotion && (
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "200%" }}
                transition={{
                  repeat: Infinity,
                  duration: 4.5,
                  ease: "linear",
                }}
                className="absolute inset-x-0 h-44 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent pointer-events-none"
                aria-hidden
              />
            )}

            {/* ── TOP HEADER: Brand & Technical Coordinate ────────────────────────── */}
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-[11px] font-mono tracking-[0.2em] text-text-tertiary uppercase z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] shrink-0" />
                <span className="font-display font-medium text-xs sm:text-[13px] tracking-[0.24em] text-text-primary uppercase">
                  GAUTAM RAJPUROHIT
                </span>
              </div>
              <span className="hidden sm:inline text-text-muted">
                {isAdmin ? "SYS // ADMIN_WORKSPACE" : "SYS // PORTFOLIO_CORE"}
              </span>
            </div>

            {/* ── CENTER: Oversized Layered Statement ───────────────────────────── */}
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center my-auto py-6 z-10">
              <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                {steps.map((item, idx) => {
                  const isVisible = idx <= activeStepIndex;
                  return (
                    <motion.div
                      key={item.line}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                      animate={{
                        opacity: isVisible ? 1 : 0.1,
                        y: isVisible ? 0 : shouldReduceMotion ? 0 : 4,
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`font-display uppercase tracking-[0.16em] sm:tracking-[0.2em] text-center transition-colors duration-200 ${
                        isVisible
                          ? "text-text-primary font-semibold text-2xl sm:text-4xl md:text-5xl lg:text-[50px] leading-tight"
                          : "text-text-tertiary/20 font-medium text-2xl sm:text-4xl md:text-5xl lg:text-[50px] leading-tight"
                      }`}
                    >
                      {item.line}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── BOTTOM SECTION: Progress Rule & Technical Metadata ────────────── */}
            <div className="w-full max-w-5xl mx-auto space-y-3.5 z-10 pb-1 sm:pb-2">
              {/* Phase Status Subheading */}
              <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] font-mono tracking-[0.22em] text-text-tertiary uppercase">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">01 /</span>
                  <span className="text-text-secondary">
                    {bootState === "ready"
                      ? "READY"
                      : bootState === "error"
                      ? "SYSTEM ERROR"
                      : "INITIALIZING"}
                  </span>
                </div>
                <span className="text-text-muted hidden sm:inline">
                  PORTFOLIO SYSTEM
                </span>
              </div>

              {/* Thin Editorial Progress Indicator: ──────────────────────●──── */}
              <div className="w-full h-[1.5px] bg-border-muted relative flex items-center">
                {/* Active Gold / Success Progress Line (Tied to sequence step & readiness) */}
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${
                    bootState === "ready"
                      ? "bg-success shadow-[0_0_8px_var(--color-success)]"
                      : "bg-accent shadow-[0_0_8px_var(--color-accent)]"
                  }`}
                  style={{ width: `${currentProgress}%` }}
                />

                {/* Active Traveling Dot ● */}
                <motion.div
                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 -ml-1 rounded-full pointer-events-none transition-all duration-300 ${
                    bootState === "ready"
                      ? "bg-success shadow-[0_0_8px_var(--color-success)]"
                      : "bg-accent shadow-[0_0_8px_var(--color-accent)]"
                  }`}
                  style={{
                    left: `${currentProgress}%`,
                  }}
                />
              </div>

              {/* Bottom Metadata & Step Counter: LOADING EXPERIENCE / 2026       01 / 04 */}
              <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-mono tracking-[0.2em] uppercase text-text-tertiary pt-0.5">
                <span>
                  {isAdmin
                    ? "ADMIN CONSOLE / 2026"
                    : "LOADING EXPERIENCE / 2026"}
                </span>

                <div className="flex items-center gap-2">
                  {bootState === "ready" ? (
                    <span className="flex items-center gap-1.5 text-success font-semibold tracking-[0.24em]">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      READY
                    </span>
                  ) : bootState === "error" ? (
                    <span className="flex items-center gap-1.5 text-error font-semibold">
                      <AlertTriangle size={11} />
                      FAILED
                    </span>
                  ) : (
                    <span className="text-text-secondary font-medium tabular-nums">
                      {steps[activeStepIndex]?.step ?? "01 / 04"}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Retry CTA */}
              {bootState === "error" && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-text-secondary font-mono">
                    Unable to reach the application server.
                  </span>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-accent text-[#0A0A0A] font-mono text-xs uppercase font-bold tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw size={11} /> RETRY
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
