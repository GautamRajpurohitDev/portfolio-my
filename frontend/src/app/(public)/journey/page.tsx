import type { Metadata } from "next";
import { JourneyPreviewSection } from "@/components/portfolio/JourneyPreviewSection";
import { PublicPageHeader, PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Learning Journey & Daily Journal",
  description: "A public, verified record of Gautam's software engineering journey — from Git fundamentals to systems, DSA, and beyond.",
};

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getJourney() {
  try {
    const res = await fetch(`${API_BASE}/api/journey`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function JourneyPage() {
  const journey = await getJourney();

  return (
    <PublicPageShell>
      <PublicPageHeader
        eyebrow="03 / Journal"
        title="Learning Journey"
        subtitle="A public record of learning. Every entry is real — documenting what was learned, built, and solved each day."
      />
      <JourneyPreviewSection journey={journey} hideHeader={true} />
    </PublicPageShell>
  );
}
