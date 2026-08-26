import type { Metadata } from "next";
import { RoadmapClientPage } from "./RoadmapClientPage";

// ── Types ─────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getRoadmapData() {
  try {
    const res = await fetch(`${API_BASE}/api/roadmap`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Programming Mastery Roadmap",
  description:
    "A structured path from programming fundamentals to software engineering, systems, cloud, cybersecurity and AI. Building depth one layer at a time.",
  openGraph: {
    title: "Programming Mastery Roadmap — Gautam Rajpurohit",
    description:
      "A structured path from programming fundamentals to software engineering, systems, cloud, cybersecurity and AI.",
  },
};

// ── Server Component ──────────────────────────────────────────

export default async function RoadmapPage() {
  const [roadmapData, settings] = await Promise.all([getRoadmapData(), getSettings()]);

  return (
    <RoadmapClientPage
      initialData={roadmapData}
      currentlyLearning={settings?.currentlyLearning ?? null}
    />
  );
}
