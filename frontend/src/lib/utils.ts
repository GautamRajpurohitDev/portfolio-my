import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a URL-friendly slug from a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format a date in various styles */
export function formatDate(
  date: string | Date,
  format: "full" | "short" | "mono" | "year" = "full"
): string {
  const d = new Date(date);

  const options: Record<string, Intl.DateTimeFormatOptions> = {
    full:  { day: "2-digit", month: "long",  year: "numeric" },
    short: { day: "2-digit", month: "short", year: "numeric" },
    mono:  { day: "2-digit", month: "short", year: "numeric" },
    year:  { year: "numeric" },
  };

  if (format === "mono") {
    const day   = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year  = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  return d.toLocaleDateString("en-US", options[format]);
}

/** Truncate text to n characters */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

/** Get relative time string */
export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = [
    { label: "year",   seconds: 31536000 },
    { label: "month",  seconds: 2592000  },
    { label: "week",   seconds: 604800   },
    { label: "day",    seconds: 86400    },
    { label: "hour",   seconds: 3600     },
    { label: "minute", seconds: 60       },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

/** Status badge colors */
export const statusColors: Record<string, string> = {
  "idea":        "text-text-secondary border-border-muted",
  "in-progress": "text-accent border-accent",
  "completed":   "text-success border-success",
  "archived":    "text-text-tertiary border-border",
  "learning":    "text-accent border-accent",
  "familiar":    "text-success border-success",
  "proficient":  "text-text-primary border-border-hover",
  "advanced":    "text-text-primary border-accent",
  "planned":     "text-text-secondary border-border-muted",
  "published":   "text-success border-success",
  "draft":       "text-warning border-warning",
};

/** Stagger animation delay utility for lists */
export function staggerDelay(index: number, base = 0.1): number {
  return index * base;
}

/** Check if running in browser */
export const isBrowser = typeof window !== "undefined";

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Map a value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
