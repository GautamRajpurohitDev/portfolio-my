// TypeScript type definitions for all content models

export interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  features?: string;
  challenges?: string;
  lessonsLearned?: string;
  status: "idea" | "in-progress" | "completed" | "archived";
  category: string;
  technologies: string[];
  featured: boolean;
  published: boolean;
  order: number;
  githubUrl?: string;
  liveUrl?: string;
  media: { url: string; mimeType: string; alt: string; order: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface JourneyEntry {
  _id: string;
  date: string;
  title: string;
  topic: string;
  summary: string;
  content?: string;
  media?: { url: string; mimeType: string; alt: string; order: number }[];
  learned?: string;
  built?: string;
  problems?: string;
  solved?: string;
  nextStep?: string;
  githubUrl?: string;
  relatedCertificate?: string | null;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type SkillStatus =
  | "not-started"
  | "in-progress"
  | "practicing"
  | "review"
  | "completed"
  | "optional"
  | "paused"
  | "learning"
  | "familiar"
  | "proficient"
  | "advanced"
  | "planned";

export interface Skill {
  _id: string;
  name: string;
  category:
    | "programming"
    | "cs-fundamentals"
    | "web"
    | "databases"
    | "systems"
    | "cloud"
    | "ai-ml"
    | "mobile"
    | "tools";
  status: SkillStatus;
  progress?: number;
  description?: string;
  icon?: string;
  published: boolean;
  featured: boolean;
  order: number;
  media?: { url: string; mimeType: string; alt: string; order: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  fileUrl: string;
  fileName: string;
  version: string;
  uploadedAt: string;
  published: boolean;
  isCurrent: boolean;
  fileSize: number;
  label: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  title: string;
  provider: string;
  credentialId?: string;
  credentialUrl?: string;
  date: string;
  media?: { url: string; mimeType: string; alt: string; order: number }[];
  description?: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  status: "planned" | "in-progress" | "completed";
  category?: string;
  icon?: string;
  published: boolean;
  featured: boolean;
  order: number;
  media?: { url: string; mimeType: string; alt: string; order: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface Update {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  media?: { url: string; mimeType: string; alt: string; order: number }[];
  date: string;
  tags: string[];
  coverImage?: string;
  linkedinUrl?: string;
  xUrl?: string;
  githubUrl?: string;
  relatedProject?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  about: {
    profileImage: string;
    name: string;
    shortIntro: string;
    personalStatement: string;
    location: string;
    education: string;
    currentFocus: string;
    interests: string[];
    areasExploring: { title: string; description: string; order: number }[];
    timeline: { year: string; title: string; description: string; order: number }[];
  };
  currentlyLearning: {
    primary: string;
    primaryDescription: string;
    next: string;
    roadmap: string[];
  };
  appearance?: {
    theme: { preset: string; background: string; surface: string; text: string; mutedText: string; accent: string; border: string; };
    typography: { fontFamily: string; headingScale: number; bodyScale: number; letterSpacing: string; };
    motion: { global: boolean; pageTransitions: boolean; scrollReveals: boolean; heroEffects: boolean; liquidCursor: boolean; intensity: string; };
    cursor: { heroOnly: boolean; };
    background: {
      grain: { enabled: boolean; intensity: string; };
      grid: { enabled: boolean; intensity: string; };
      glow: { enabled: boolean; intensity: string; };
      particles: { enabled: boolean; intensity: string; };
    };
  };
  footer?: {
    tagline: string;
    copyright: string;
    enabled: boolean;
    showLinks: boolean;
    showSocials: boolean;
  };
  contact?: {
    email: string;
    formEnabled: boolean;
    successMessage: string;
    availabilityText: string;
  };
  analytics?: {
    googleAnalyticsId: string;
    vercelAnalytics: boolean;
    customScript: string;
  };
  indexing?: {
    indexable: boolean;
    maintenanceMode: boolean;
  };
  seo?: {
    siteTitle: string;
    titleSuffix: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
    twitterHandle: string;
    favicon: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
  };
  heroHeadline: string[];
  heroSubtitle: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  email?: string;
  updatedAt: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: "admin";
  lastLogin?: string;
}

// ── ROADMAP TYPES ─────────────────────────────────────────────

export type RoadmapStatus =
  | "not-started"
  | "up-next"
  | "in-progress"
  | "practicing"
  | "review"
  | "completed"
  | "optional"
  | "paused";

export interface RoadmapResource {
  title: string;
  url: string;
  type: "Documentation" | "Course" | "Book" | "Practice" | "Video" | "Project";
  provider: string;
  notes: string;
  order: number;
}

export interface RoadmapPhase {
  _id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  learningObjectives: string[];
  prerequisites: string[];
  status: RoadmapStatus;
  progress: number;
  order: number;
  icon: string;
  color: string;
  isOptional: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapDomain {
  _id: string;
  phase: string | RoadmapPhase;
  title: string;
  description: string;
  status: RoadmapStatus;
  progress: number;
  order: number;
  icon: string;
  color: string;
  dependencies: string[] | RoadmapDomain[];
  notes: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTopic {
  _id: string;
  domain: string | RoadmapDomain;
  phase: string | RoadmapPhase;
  title: string;
  description: string;
  subtopics: string[];
  status: RoadmapStatus;
  progress: number;
  order: number;
  resources: RoadmapResource[];
  notes: string;
  practiceCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTask {
  _id: string;
  topic: string | RoadmapTopic;
  domain: string | RoadmapDomain;
  phase: string | RoadmapPhase;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  actualHours: number;
  practiceCount: number;
  resources: RoadmapResource[];
  notes: string;
  linkedProject: string | null;
  linkedMilestone: string | null;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
