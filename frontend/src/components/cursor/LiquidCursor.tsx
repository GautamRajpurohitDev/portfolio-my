"use client";

/**
 * LiquidCursor — Rebuilt from scratch
 *
 * Priority order:
 *   1. Dot tracks pointer instantly (no lerp on dot)
 *   2. Ring follows with a fast spring (barely perceptible lag)
 *   3. Liquid distortion is subtle — secondary to tracking
 *   4. Debug overlay in dev mode to confirm coordinates
 *
 * Never hidden when idle.
 * No mix-blend-mode.
 * Gold color — visible on black, white, and image backgrounds.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Feature detection ─────────────────────────────────────────
function canUseCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.innerWidth < 1024) return false;
  return true;
}

// Only strictly interactive elements trigger hover expansion
const HOVER_SEL = "a[href], button, input, textarea, select, label[for], [role='button'], [role='link']";

// ── Ripple ────────────────────────────────────────────────────
interface Ripple { x: number; y: number; t0: number; }
const RIPPLE_MS = 500;
const RIPPLE_R  = 54;

// ── Spring one axis ───────────────────────────────────────────
// Returns [new_position, new_velocity]
function spring(pos: number, target: number, vel: number): [number, number] {
  const F    = (target - pos) * 0.22;   // stiffness
  const nVel = (vel + F) * 0.70;        // damping
  return [pos + nVel, nVel];
}

export default function LiquidCursor() {
  const pathname  = usePathname();
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dbgRef    = useRef<HTMLPreElement>(null);

  // Guard: no cursor in admin
  const inAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (inAdmin)          return;
    if (!canUseCursor())  return;

    // ── State ──────────────────────────────────────────────────
    // Pointer (direct)
    let px = -200, py = -200;
    // Ring spring
    let rx = -200, ry = -200, rvx = 0, rvy = 0;
    // Hover flag
    let hover = false;
    // Ripples
    const ripples: Ripple[] = [];
    // RAF
    let rafId = 0;

    // ── Canvas ─────────────────────────────────────────────────
    const canvas = canvasRef.current!;
    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── Pointer events ─────────────────────────────────────────
    function onMove(e: PointerEvent) {
      px    = e.clientX;
      py    = e.clientY;
      hover = !!(document.elementFromPoint(px, py)?.closest(HOVER_SEL));
      // Snap ring on first movement so there's no dramatic leap
      if (rx === -200) { rx = px; ry = py; }
    }

    function onDown(e: PointerEvent) {
      ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    }

    // Use window so we catch moves outside any specific element
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    // ── RAF loop ───────────────────────────────────────────────
    function tick() {
      const dot  = dotRef.current;
      const ring = ringRef.current;

      // 1 ── Dot: instant, no lerp ───────────────────────────
      if (dot) {
        dot.style.transform = `translate3d(${px}px,${py}px,0)`;
        // Dot gets slightly smaller on hover (ring takes over visually)
        dot.style.scale     = hover ? "0.7" : "1";
      }

      // 2 ── Ring: fast spring ───────────────────────────────
      [rx, rvx] = spring(rx, px, rvx);
      [ry, rvy] = spring(ry, py, rvy);

      if (ring) {
        const sc = hover ? 1.65 : 1;
        ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${sc})`;
      }

      // 3 ── Canvas ripples ───────────────────────────────────
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const now = performance.now();
          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            const t = (now - r.t0) / RIPPLE_MS;
            if (t >= 1) { ripples.splice(i, 1); continue; }
            const ease   = 1 - (1 - t) ** 3;
            const radius = ease * RIPPLE_R;
            const alpha  = (1 - t) * 0.6;
            ctx.beginPath();
            ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(232,197,71,${alpha})`;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
          }
        }
      }

      // 4 ── Debug overlay (dev only) ─────────────────────────
      const dbg = dbgRef.current;
      if (dbg) {
        dbg.textContent =
          `Pointer  ${Math.round(px)}, ${Math.round(py)}\n` +
          `Ring     ${Math.round(rx)}, ${Math.round(ry)}`;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
    };
  }, [inAdmin]);

  // Don't render DOM nodes in admin at all
  if (inAdmin) return null;

  const isDev = process.env.NODE_ENV === "development";

  return (
    <>
      {/* Subtle SVG liquid filter for ring only */}
      <svg aria-hidden style={{ position: "fixed", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="lc-liquid" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.70"
              numOctaves="2"
              seed="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Canvas: click ripples */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        9_000_000,
          pointerEvents: "none",
        }}
      />

      {/*
        Dot — THE primary position indicator.
        Instant tracking. Gold fill + soft glow.
        Never hidden.
      */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          zIndex:          9_000_002,
          pointerEvents:   "none",
          willChange:      "transform",
          // Center the 10 × 10 element on the exact pointer
          width:           "10px",
          height:          "10px",
          marginTop:       "-5px",
          marginLeft:      "-5px",
          borderRadius:    "50%",
          backgroundColor: "#e8c547",
          boxShadow:       "0 0 0 2px rgba(232,197,71,0.2), 0 0 8px 2px rgba(232,197,71,0.35)",
          // Start off-screen until first pointermove
          transform:       "translate3d(-200px,-200px,0)",
        }}
      />

      {/*
        Ring — spring-lagged, liquid-distorted.
        Visible at all times.
        Gold border (no blend mode).
      */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          zIndex:        9_000_001,
          pointerEvents: "none",
          willChange:    "transform",
          // Center the 36 × 36 ring on the spring position
          width:         "36px",
          height:        "36px",
          marginTop:     "-18px",
          marginLeft:    "-18px",
          borderRadius:  "50%",
          border:        "1.5px solid rgba(232,197,71,0.55)",
          // Subtle liquid distortion on the trailing ring only
          filter:        "url(#lc-liquid)",
          // Start off-screen
          transform:     "translate3d(-200px,-200px,0)",
        }}
      />

      {/* Debug coordinate overlay — development only */}
      {isDev && (
        <pre
          ref={dbgRef}
          aria-hidden
          style={{
            position:        "fixed",
            bottom:          14,
            left:            14,
            zIndex:          9_000_003,
            pointerEvents:   "none",
            backgroundColor: "rgba(0,0,0,0.80)",
            color:           "#e8c547",
            fontFamily:      "JetBrains Mono, monospace",
            fontSize:        "10px",
            lineHeight:      1.7,
            padding:         "5px 9px",
            borderRadius:    "6px",
            border:          "1px solid rgba(232,197,71,0.2)",
          }}
        />
      )}
    </>
  );
}
