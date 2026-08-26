import type { Metadata } from "next";
import { ProjectsPreviewSection } from "@/components/portfolio/ProjectsPreviewSection";
import { PublicPageHeader, PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Projects",
  description: "Real software systems built from first principles — no fake demos, only published when genuinely functional and complete.",
};

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getProjects() {
  try {
    const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PublicPageShell>
      <PublicPageHeader
        eyebrow="04 / Showcase"
        title="Selected Projects"
        subtitle="Real software systems built from first principles. Only published when genuine and functional."
      />
      <ProjectsPreviewSection projects={projects} hideHeader={true} />
    </PublicPageShell>
  );
}
