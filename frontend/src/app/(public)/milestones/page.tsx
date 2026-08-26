import type { Metadata } from "next";
import { MilestonesSection } from "@/components/portfolio/MilestonesSection";
import { PublicPageHeader, PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Milestones",
  description: "Progress milestones in Gautam's software engineering journey — from Git to full-stack systems and cloud.",
};

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getMilestones() {
  try {
    const res = await fetch(`${API_BASE}/api/milestones`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function MilestonesPage() {
  const milestones = await getMilestones();

  return (
    <PublicPageShell>
      <PublicPageHeader
        eyebrow="06 / Achievements"
        title="Milestones"
        subtitle="Key progress markers, certifications, and technical accomplishments achieved on the path to software mastery."
      />
      <MilestonesSection milestones={milestones} hideHeader={true} />
    </PublicPageShell>
  );
}
