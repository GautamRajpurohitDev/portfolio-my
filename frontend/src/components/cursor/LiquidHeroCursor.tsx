"use client";

/**
 * LiquidHeroCursor
 *
 * Owned by HeroSection on the homepage ("/") only.
 * Activates ONLY while the hero section is in the viewport.
 * Uses IntersectionObserver to start/stop the RAF loop and toggle .hero-cursor-active.
 *
 * Lifecycle:
 *   hero enters viewport (on "/")  → add .hero-cursor-active to body, start RAF
 *   hero leaves viewport / route != "/" → remove .hero-cursor-active, restore native cursor, stop RAF
 *
 * Elements:
 *   dot   — 10px gold filled circle, tracks pointer instantly (no lerp)
 *   ring  — 36px gold bordered ring, fast spring trailing
 *   canvas — click ripples in gold, constrained to hero rect
 *
 * All secondary pages (/about, /skills, /roadmap, /journey, /projects, /contact, /admin/*)
 * have native browser cursor active and liquid cursor completely inactive.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Feature detection ─────────────────────────────────────────
function canUse(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.innerWidth < 1024) return false;
  return true;
}

const HOVER_SEL =
  "a[href], button, input, textarea, select, label[for], [role='button'], [role='link']";

interface Ripple { x: number; y: number; t0: number; }
const RIPPLE_MS = 500;
const RIPPLE_R  = 52;

function spring(pos: number, target: number, vel: number): [number, number] {
  const f   = (target - pos) * 0.22;
  const nv  = (vel + f) * 0.70;
  return [pos + nv, nv];
}

interface Props {
  /** Ref to the hero <section> element — used for IntersectionObserver */
  heroRef: React.RefObject<HTMLElement | null>;
}

export default function LiquidHeroCursor({ heroRef }: Props) {
  const pathname  = usePathname();
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Strictly active on homepage only
  const isHomepage = pathname === "/";

  useEffect(() => {
    // Clean any legacy injected style tags that might have persisted in head
    const legacyHide = document.getElementById("lhc-hide");
    if (legacyHide) legacyHide.remove();
    const legacyLcHide = document.getElementById("lc-hide");
    if (legacyLcHide) legacyLcHide.remove();

    if (!isHomepage || !canUse()) {
      document.body.classList.remove("hero-cursor-active");
      document.documentElement.classList.remove("hero-cursor-active");
      return;
    }

    // ── Mutable closure state ──────────────────────────────────
    let px = -200, py = -200;          // actual pointer
    let rx = -200, ry = -200;          // spring ring position
    let rvx = 0, rvy = 0;             // spring velocity
    let hover   = false;
    let active  = false;              // hero currently visible?
    let opacity = 0;                  // cursor opacity (0→1 fade-in)
    const ripples: Ripple[] = [];
    let rafId = 0;

    function enableHeroCursor() {
      document.body.classList.add("hero-cursor-active");
    }

    function disableHeroCursor() {
      document.body.classList.remove("hero-cursor-active");
      document.documentElement.classList.remove("hero-cursor-active");
      const dot  = dotRef.current;
      const ring = ringRef.current;
      if (dot)  dot.style.opacity  = "0";
      if (ring) ring.style.opacity = "0";
    }

    // ── Canvas sizing ──────────────────────────────────────────
    const canvas = canvasRef.current;

    function resizeCanvas() {
      if (!canvas || !heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      canvas.width  = r.width;
      canvas.height = r.height;
    }

    // ── Pointer events ─────────────────────────────────────────
    function onMove(e: PointerEvent) {
      if (!active) return;
      px    = e.clientX;
      py    = e.clientY;
      hover = !!(document.elementFromPoint(px, py)?.closest(HOVER_SEL));
      if (rx === -200) { rx = px; ry = py; }
    }

    function onDown(e: PointerEvent) {
      if (!active) return;
      const hero = heroRef.current;
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      if (
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top  && e.clientY <= r.bottom
      ) {
        ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() });
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // ── RAF loop ───────────────────────────────────────────────
    function tick() {
      const dot  = dotRef.current;
      const ring = ringRef.current;

      if (active) {
        opacity = Math.min(1, opacity + 0.08);
      } else {
        opacity = Math.max(0, opacity - 0.08);
      }

      const op = opacity;

      // Dot tracking
      if (dot) {
        dot.style.transform = `translate3d(${px}px,${py}px,0)`;
        dot.style.opacity   = String(op * (hover ? 0.65 : 1));
        dot.style.scale     = hover ? "0.7" : "1";
      }

      // Ring tracking
      [rx, rvx] = spring(rx, px, rvx);
      [ry, rvy] = spring(ry, py, rvy);
      if (ring) {
        const sc = hover ? 1.65 : 1;
        ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${sc})`;
        ring.style.opacity   = String(op * 0.85);
      }

      // Canvas ripples
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

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    // ── IntersectionObserver ───────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasActive = active;
        active = entry.isIntersecting && entry.intersectionRatio > 0.15;

        if (active && !wasActive) {
          enableHeroCursor();
          resizeCanvas();
        } else if (!active && wasActive) {
          disableHeroCursor();
          ripples.length = 0;
        }
      },
      { threshold: [0, 0.15, 0.5, 1.0] }
    );

    const hero = heroRef.current;
    if (hero) observer.observe(hero);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resizeCanvas);
      disableHeroCursor();
    };
  }, [isHomepage, heroRef]);

  if (!isHomepage) return null;

  return (
    <>
      {/* SVG liquid filter */}
      <svg aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="lhc-liquid" x="-40%" y="-40%" width="180%" height="180%">
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

      {/* Canvas for hero ripples */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position:      "absolute",
          inset:         0,
          zIndex:        20,
          pointerEvents: "none",
        }}
      />

      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          zIndex:          9_000_002,
          pointerEvents:   "none",
          willChange:      "transform, opacity",
          width:           "10px",
          height:          "10px",
          marginTop:       "-5px",
          marginLeft:      "-5px",
          borderRadius:    "50%",
          backgroundColor: "#e8c547",
          boxShadow:       "0 0 0 2px rgba(232,197,71,0.18), 0 0 8px 2px rgba(232,197,71,0.3)",
          transform:       "translate3d(-200px,-200px,0)",
          opacity:         "0",
        }}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          zIndex:        9_000_001,
          pointerEvents: "none",
          willChange:    "transform, opacity",
          width:         "36px",
          height:        "36px",
          marginTop:     "-18px",
          marginLeft:    "-18px",
          borderRadius:  "50%",
          border:        "1.5px solid rgba(232,197,71,0.60)",
          filter:        "url(#lhc-liquid)",
          transform:     "translate3d(-200px,-200px,0)",
          opacity:       "0",
        }}
      />
    </>
  );
}
