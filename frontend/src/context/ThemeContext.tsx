"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (event?: React.MouseEvent | { clientX: number; clientY: number } | HTMLElement) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from DOM attribute set by pre-hydration inline script or localStorage
    const domTheme = document.documentElement.getAttribute("data-theme") as Theme | null;
    const stored = (typeof window !== "undefined" ? localStorage.getItem("theme") : null) as Theme | null;
    const initial: Theme =
      domTheme === "light" || domTheme === "dark"
        ? domTheme
        : stored === "light" || stored === "dark"
        ? stored
        : "dark";

    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  const applyThemeToDOM = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const setTheme = (nextTheme: Theme) => {
    applyThemeToDOM(nextTheme);
  };

  const toggleTheme = (trigger?: React.MouseEvent | { clientX: number; clientY: number } | HTMLElement) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // 1. Check for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      applyThemeToDOM(nextTheme);
      return;
    }

    // 2. Resolve origin coordinates (x, y)
    let x = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let y = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    if (trigger) {
      if ("currentTarget" in trigger && trigger.currentTarget) {
        const rect = (trigger.currentTarget as HTMLElement).getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if ("clientX" in trigger && typeof trigger.clientX === "number") {
        x = trigger.clientX;
        y = trigger.clientY;
      } else if (trigger instanceof HTMLElement) {
        const rect = trigger.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 3. Use View Transitions API if available
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const transition = (document as any).startViewTransition(() => {
        applyThemeToDOM(nextTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 1200,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
      return;
    }

    // 4. Fallback for browsers without View Transitions API
    if (typeof window !== "undefined" && window.document) {
      const doc = window.document;
      const overlay = doc.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.left = `${x}px`;
      overlay.style.top = `${y}px`;
      overlay.style.width = "0px";
      overlay.style.height = "0px";
      overlay.style.borderRadius = "50%";
      overlay.style.backgroundColor = nextTheme === "light" ? "#F6F4EF" : "#0A0A0A";
      overlay.style.zIndex = "999999";
      overlay.style.pointerEvents = "none";
      overlay.style.transform = "translate(-50%, -50%)";
      overlay.style.transition =
        "width 1200ms cubic-bezier(0.16, 1, 0.3, 1), height 1200ms cubic-bezier(0.16, 1, 0.3, 1)";

      doc.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.width = `${maxRadius * 2}px`;
        overlay.style.height = `${maxRadius * 2}px`;
      });

      setTimeout(() => {
        applyThemeToDOM(nextTheme);
        setTimeout(() => {
          overlay.remove();
        }, 50);
      }, 1180);
      return;
    }

    applyThemeToDOM(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
