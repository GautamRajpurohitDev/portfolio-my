import type { Metadata } from "next";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { PublicPageHeader, PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Technical Skills & Roadmap",
  description: "An authentic, verified record of technical capabilities — only what is actively practiced or planned from first principles.",
};

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSkills() {
  try {
    const res = await fetch(`${API_BASE}/api/skills`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <PublicPageShell>
      <PublicPageHeader
        eyebrow="05 / Capabilities"
        title="Technical Stack"
        subtitle="An authentic record of technical capabilities — only what is actively practiced from first principles or planned on the roadmap."
      />
      <SkillsSection skills={skills} hideHeader={true} />
    </PublicPageShell>
  );
}
