import type { Metadata } from "next";
import { AboutSection } from "@/components/portfolio/AboutSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { PublicPageHeader, PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "About",
  description: "MCA student building strong programming fundamentals from first principles. Learn about Gautam's background, education, and engineering direction.",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSiteConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

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

export default async function AboutPage() {
  const [config, skills] = await Promise.all([getSiteConfig(), getSkills()]);
  
  return (
    <PublicPageShell>
      <PublicPageHeader
        eyebrow="01 / About"
        title="About Me"
        subtitle={config?.about?.shortIntro || "MCA student building strong programming fundamentals from first principles."}
      />
      <AboutSection config={config?.about} hideHeader={true} />
      <SkillsSection skills={skills} />
    </PublicPageShell>
  );
}
