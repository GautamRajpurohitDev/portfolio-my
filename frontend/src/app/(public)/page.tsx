import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { AboutSnapshotSection } from "@/components/portfolio/AboutSnapshotSection";
import { CurrentlyLearningSection } from "@/components/portfolio/CurrentlyLearningSection";
import { JourneyPreviewSection } from "@/components/portfolio/JourneyPreviewSection";
import { RoadmapPreviewSection } from "@/components/portfolio/RoadmapPreviewSection";
import { ProjectsPreviewSection } from "@/components/portfolio/ProjectsPreviewSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { MilestonesSection } from "@/components/portfolio/MilestonesSection";
import { BuildLogSection } from "@/components/portfolio/BuildLogSection";
import { CredentialsSection } from "@/components/portfolio/CredentialsSection";
import { DirectionSection } from "@/components/portfolio/DirectionSection";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { cookies } from "next/headers";

// ── Server-side fetch helpers ─────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSiteConfig(draft = false) {
  try {
    let url = `${API_BASE}/api/settings`;
    const headers: Record<string, string> = {};

    if (draft) {
      url = `${API_BASE}/api/settings/admin?draft=true`;
      const cookieStore = await cookies();
      const authCookie =
        cookieStore.get("token")?.value ||
        cookieStore.get("auth_token")?.value;
      if (authCookie) headers["Cookie"] = `token=${authCookie}`;
    }

    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

async function getCollection(endpoint: string, preview = false, limit?: number) {
  try {
    let url = `${API_BASE}/api/${endpoint}`;
    if (limit) url += `${url.includes("?") ? "&" : "?"}limit=${limit}`;
    const headers: Record<string, string> = {};

    if (preview) {
      const cookieStore = await cookies();
      const authCookie =
        cookieStore.get("token")?.value ||
        cookieStore.get("auth_token")?.value;
      if (authCookie) headers["Cookie"] = `token=${authCookie}`;
    }

    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

// ── SEO Metadata ──────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title:
      config?.seo?.siteTitle ||
      "Gautam Rajpurohit — Software Development Journey",
    description:
      config?.seo?.defaultDescription ||
      "MCA student building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly.",
    openGraph: {
      title:
        config?.seo?.siteTitle ||
        "Gautam Rajpurohit — Software Development Journey",
      description:
        config?.seo?.defaultDescription ||
        "MCA student building strong programming fundamentals, software engineering skills, and real-world projects.",
      type: "website",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
};

export default async function HomePage({ searchParams }: Props) {
  const resolvedParams = searchParams && typeof (searchParams as any).then === "function"
    ? await searchParams
    : (searchParams as { [key: string]: string | string[] | undefined } | undefined);
  const isPreview = resolvedParams?.preview === "true";
  const config = await getSiteConfig(isPreview);

  // ── Parallel data fetches — with performance limits ──────────
  const [
    projects,
    journey,
    milestones,
    skills,
    certificates,
    roadmapCurrent,
    roadmapPhases,
    updates,
  ] = await Promise.all([
    getCollection("projects", isPreview, 4),
    getCollection("journey", isPreview, 5),
    getCollection("milestones", isPreview),
    getCollection("skills", isPreview),
    getCollection("certificates", isPreview, 4),
    getCollection("roadmap/current", isPreview),
    getCollection("roadmap/phases", isPreview),
    getCollection("updates", isPreview, 3),
  ]);

  // ── Build the currentlyLearning config ────────────────────────
  // Merge live roadmap data with Settings, prioritizing active domain progress
  const baseConfig = config?.currentlyLearning || {};
  const activeDomain = roadmapCurrent?.domains?.find((d: any) => d.status === "in-progress") || roadmapCurrent?.domains?.[0];
  
  const domainProgress = Number(activeDomain?.progress);
  const phaseProgress = Number(roadmapCurrent?.phase?.progress);
  const settingsProgress = Number(baseConfig.progress);

  const selectedProgress = (!isNaN(domainProgress) && domainProgress > 0)
    ? domainProgress
    : (!isNaN(phaseProgress) && phaseProgress > 0)
    ? phaseProgress
    : (!isNaN(settingsProgress) && settingsProgress > 0)
    ? settingsProgress
    : 89;

  const safeProgress = Math.min(100, Math.max(0, selectedProgress));

  const learningConfig = {
    primary:     activeDomain?.title                            || roadmapCurrent?.phase?.title || baseConfig.primary || "Git & GitHub",
    description: activeDomain?.description
                 || roadmapCurrent?.phase?.description
                 || roadmapCurrent?.phase?.subtitle
                 || baseConfig.primaryDescription
                 || baseConfig.description
                 || "Learning version control from first principles.",
    progress: safeProgress,
    next:     roadmapCurrent?.upNext                             || baseConfig.next         || "Pseudocode → C",
    roadmap:  roadmapCurrent?.domains?.slice(0, 6).map((d: any) => d.title)
              || baseConfig.roadmap
              || ["Pseudocode & Logic", "C Programming", "C++ Fundamentals", "Data Structures & Algorithms"],
  };

  // ── Default section order ─────────────────────────────────────
  const defaultSections = [
    { type: "hero",              enabled: true, id: "hero"              },
    { type: "about",             enabled: true, id: "about"             },
    { type: "currentlyLearning", enabled: true, id: "currentlyLearning" },
    { type: "journey",           enabled: true, id: "journey"           },
    { type: "roadmapPreview",    enabled: true, id: "roadmapPreview"    },
    { type: "projects",          enabled: true, id: "projects"          },
    { type: "skills",            enabled: true, id: "skills"            },
    { type: "milestones",        enabled: true, id: "milestones"        },
    { type: "buildLog",          enabled: true, id: "buildLog"          },
    { type: "credentials",       enabled: true, id: "credentials"       },
    { type: "direction",         enabled: true, id: "direction"         },
    { type: "contact",           enabled: true, id: "contact"           },
  ];

  const sectionsToRender: any[] = config?.sections?.length
    ? config.sections.filter((s: any) => s.enabled)
    : defaultSections;

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-accent focus:text-bg focus:rounded-md focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <main id="main-content">
        {sectionsToRender.map((section: any) => {
          switch (section.type) {
            case "hero":
              return (
                <HeroSection
                  key={section.id}
                  config={
                    config?.hero?.status === "published" || isPreview
                      ? config.hero
                      : null
                  }
                  resume={config?.resume}
                />
              );

            case "about":
              return (
                <AboutSnapshotSection
                  key={section.id}
                  config={config?.about ?? null}
                />
              );

            case "currentlyLearning":
              return (
                <CurrentlyLearningSection
                  key={section.id}
                  config={learningConfig || null}
                />
              );

            case "journey":
              return (
                <JourneyPreviewSection
                  key={section.id}
                  journey={journey}
                />
              );

            case "roadmapPreview":
              return (
                <RoadmapPreviewSection
                  key={section.id}
                  phases={roadmapPhases}
                  currentPhase={roadmapCurrent}
                />
              );

            case "projects":
              return (
                <ProjectsPreviewSection
                  key={section.id}
                  projects={projects}
                />
              );

            case "skills":
              return (
                <SkillsSection
                  key={section.id}
                  skills={skills}
                />
              );

            case "milestones":
              return (
                <MilestonesSection
                  key={section.id}
                  milestones={milestones}
                />
              );

            case "buildLog":
              return (
                <BuildLogSection
                  key={section.id}
                  updates={updates}
                />
              );

            case "credentials":
              return (
                <CredentialsSection
                  key={section.id}
                  certificates={certificates}
                />
              );

            case "direction":
              return (
                <DirectionSection
                  key={section.id}
                  config={config?.about ?? null}
                />
              );

            case "contact":
              return (
                <ContactSection
                  key={section.id}
                  config={config?.contact ?? null}
                />
              );

            default:
              return null;
          }
        })}
      </main>
    </>
  );
}
