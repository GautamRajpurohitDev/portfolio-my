import { z } from "zod";

// ── AUTH ──────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:    z.string().min(1, "Admin ID is required"),
  password: z.string().min(1, "Password is required"),
});

// ── SHARED ────────────────────────────────────────────────────

const MediaAttachmentZodSchema = z.object({
  url: z.string(),
  mimeType: z.string(),
  alt: z.string().optional().default(""),
  order: z.number().int().optional().default(0),
});

// ── PROJECT ───────────────────────────────────────────────────

export const ProjectSchema = z.object({
  title:            z.string().min(1, "Title is required").max(200),
  slug:             z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only").optional(),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  content:          z.string().optional().default(""),
  problem:          z.string().optional().default(""),
  solution:         z.string().optional().default(""),
  architecture:     z.string().optional().default(""),
  features:         z.string().optional().default(""),
  challenges:       z.string().optional().default(""),
  lessonsLearned:   z.string().optional().default(""),
  status:           z.enum(["idea", "in-progress", "completed", "archived"]).default("idea"),
  category:         z.string().optional().default("other"),
  technologies:     z.array(z.string()).optional().default([]),
  featured:         z.boolean().optional().default(false),
  published:        z.boolean().optional().default(false),
  order:            z.number().int().optional().default(0),
  githubUrl:        z.string().url("Invalid GitHub URL").optional().or(z.literal("")).default(""),
  liveUrl:          z.string().url("Invalid live URL").optional().or(z.literal("")).default(""),
  media:            z.array(MediaAttachmentZodSchema).optional().default([]),
}).strict();

export const ProjectUpdateSchema = ProjectSchema.partial().strict();

// ── JOURNEY ENTRY ─────────────────────────────────────────────

export const JourneyEntrySchema = z.object({
  date:                z.coerce.date(),
  title:               z.string().min(1, "Title is required").max(200),
  topic:               z.string().min(1, "Topic is required").max(100),
  summary:             z.string().min(1, "Summary is required").max(500),
  content:             z.string().optional().default(""),
  media:               z.array(MediaAttachmentZodSchema).optional().default([]),
  
  // Legacy fields
  learned:             z.string().optional().default(""),
  built:               z.string().optional().default(""),
  problems:            z.string().optional().default(""),
  solved:              z.string().optional().default(""),
  nextStep:            z.string().optional().default(""),
  
  githubUrl:           z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  relatedCertificate:  z.string().optional().nullable().default(null),
  featured:            z.boolean().optional().default(false),
  published:           z.boolean().optional().default(false),
  order:               z.number().int().optional().default(0),
}).strict();

export const JourneyEntryUpdateSchema = JourneyEntrySchema.partial().strict();

// ── SKILL ─────────────────────────────────────────────────────

export const SkillSchema = z.object({
  name:        z.string().min(1, "Name is required").max(100),
  category:    z.enum(["programming","cs-fundamentals","web","databases","systems","cloud","ai-ml","mobile","tools"]),
  status:      z.enum([
    "not-started","in-progress","practicing","review","completed","optional","paused",
    "learning","familiar","proficient","advanced","planned"
  ]).default("not-started"),
  progress:    z.number().min(0).max(100).optional().default(0),
  description: z.string().optional().default(""),
  icon:        z.string().optional().default(""),
  published:   z.boolean().optional().default(true),
  featured:    z.boolean().optional().default(false),
  order:       z.number().int().optional().default(0),
  media:       z.array(MediaAttachmentZodSchema).optional().default([]),
});

export const SkillUpdateSchema = SkillSchema.partial();

// ── CERTIFICATE ───────────────────────────────────────────────

export const CertificateSchema = z.object({
  title:         z.string().min(1).max(200),
  provider:      z.string().min(1).max(100),
  credentialId:  z.string().optional().default(""),
  credentialUrl: z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  date:          z.coerce.date(),
  media:         z.array(MediaAttachmentZodSchema).optional().default([]),
  description:   z.string().optional().default(""),
  featured:      z.boolean().optional().default(false),
  published:     z.boolean().optional().default(true),
  order:         z.number().int().optional().default(0),
}).strict();

export const CertificateUpdateSchema = CertificateSchema.partial().strict();

// ── MILESTONE ─────────────────────────────────────────────────

export const MilestoneSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().optional().default(""),
  date:        z.coerce.date(),
  status:      z.enum(["planned","in-progress","completed"]).default("planned"),
  category:    z.string().optional().default("general"),
  icon:        z.string().optional().default(""),
  published:   z.boolean().optional().default(true),
  featured:    z.boolean().optional().default(false),
  order:       z.number().int().optional().default(0),
  media:       z.array(MediaAttachmentZodSchema).optional().default([]),
}).strict();

export const MilestoneUpdateSchema = MilestoneSchema.partial().strict();

// ── UPDATE (BUILD LOG) ────────────────────────────────────────

export const UpdateSchema = z.object({
  title:          z.string().min(1).max(200),
  slug:           z.string().regex(/^[a-z0-9-]+$/).optional(),
  summary:        z.string().min(1).max(400),
  content:        z.string().optional().default(""),
  media:          z.array(MediaAttachmentZodSchema).optional().default([]),
  date:           z.coerce.date(),
  tags:           z.array(z.string()).optional().default([]),
  coverImage:     z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  linkedinUrl:    z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  xUrl:           z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  githubUrl:      z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  relatedProject: z.string().optional().nullable().default(null),
  published:      z.boolean().optional().default(false),
}).strict();

export const UpdateUpdateSchema = UpdateSchema.partial().strict();

// ── SETTINGS / PORTFOLIO CONFIG ───────────────────────────────

const SocialLinkEntrySchema = z.object({
  label:   z.string().optional().default(""),
  url:     z.string().optional().default(""),
  enabled: z.boolean().optional().default(true),
  order:   z.number().int().optional().default(0),
});

const NavItemEntrySchema = z.object({
  label:       z.string().min(1),
  href:        z.string().min(1),
  enabled:     z.boolean().optional().default(true),
  order:       z.number().int().optional().default(0),
  external:    z.boolean().optional().default(false),
  highlighted: z.boolean().optional().default(false),
});

const CtaEntrySchema = z.object({
  label:    z.string().optional().default(""),
  url:      z.string().optional().default("/"),
  enabled:  z.boolean().optional().default(true),
  external: z.boolean().optional().default(false),
});

const EyebrowEntrySchema = z.object({
  text:    z.string().optional().default(""),
  icon:    z.string().optional().default(""),
  enabled: z.boolean().optional().default(true),
  order:   z.number().int().optional().default(0),
});

const intensityEnum = z.enum(["none","subtle","medium","strong"]).optional().default("medium");

export const SettingsSchema = z.object({
  // ── Identity ─────────────────────────────────────────────
  identity: z.object({
    name:         z.string().optional(),
    displayName:  z.string().optional(),
    role:         z.string().optional(),
    headline:     z.string().optional(),
    shortBio:     z.string().optional(),
    longBio:      z.string().optional(),
    location:     z.string().optional(),
    profileImage: z.string().optional().default(""),
    availability: z.enum(["open","learning","busy","unavailable"]).optional(),
    email:        z.string().optional().default(""),
  }).optional(),

  // ── About / Profile ──────────────────────────────────────
  about: z.object({
    profileImage:      z.string().optional().default(""),
    name:              z.string().optional().default(""),
    shortIntro:        z.string().optional().default(""),
    personalStatement: z.string().optional().default(""),
    location:          z.string().optional().default(""),
    education:         z.string().optional().default(""),
    currentFocus:      z.string().optional().default(""),
    interests:         z.array(z.string()).optional().default([]),
    areasExploring:    z.array(z.object({
      title: z.string().optional().default(""),
      description: z.string().optional().default(""),
      order: z.number().int().optional().default(0),
    })).optional().default([]),
    timeline:          z.array(z.object({
      year: z.string().optional().default(""),
      title: z.string().optional().default(""),
      description: z.string().optional().default(""),
      order: z.number().int().optional().default(0),
    })).optional().default([]),
  }).optional(),

  // ── Hero (full CMS) ──────────────────────────────────────
  hero: z.object({
    headlineLines:   z.array(z.string()).optional(),
    subtitle:        z.string().optional(),
    eyebrow:         z.array(EyebrowEntrySchema).optional(),
    ctaPrimary:      CtaEntrySchema.optional(),
    ctaSecondary:    CtaEntrySchema.optional(),
    backgroundImage: z.string().optional().default(""),
    heroImage:       z.string().optional().default(""),
    overlayOpacity:  z.number().min(0).max(1).optional(),
    effects: z.object({
      liquidCursor:    z.boolean().optional(),
      liquidIntensity: intensityEnum,
      cursorSize:      z.number().min(8).max(120).optional(),
      hoverScale:      z.number().min(1).max(10).optional(),
      rippleEnabled:   z.boolean().optional(),
      rippleIntensity: intensityEnum,
      parallax:        z.boolean().optional(),
      glow:            z.boolean().optional(),
      grain:           z.boolean().optional(),
      animation:       z.boolean().optional(),
    }).optional(),
    status:  z.enum(["draft","published"]).optional(),
    visible: z.boolean().optional(),
  }).optional(),

  // ── Currently Learning ────────────────────────────────────
  currentlyLearning: z.object({
    currentLearningSkillId:     z.string().nullable().optional(),
    currentLearningPhaseId:     z.string().nullable().optional(),
    nextPhaseId:                z.string().nullable().optional(),
    primary:                    z.string().optional().default("Git & GitHub"),
    primaryDescription:         z.string().optional().default(""),
    next:                       z.string().optional().default(""),
    roadmap:                    z.array(z.string()).optional().default([]),
    displayTitleOverride:       z.string().optional().default(""),
    displayDescriptionOverride: z.string().optional().default(""),
  }).optional(),

  // ── Socials ───────────────────────────────────────────────
  socials: z.object({
    github:   SocialLinkEntrySchema.optional(),
    linkedin: SocialLinkEntrySchema.optional(),
    x:        SocialLinkEntrySchema.optional(),
    email:    SocialLinkEntrySchema.optional(),
    other:    z.array(SocialLinkEntrySchema).optional().default([]),
  }).optional(),

  // ── Navigation ────────────────────────────────────────────
  navigation: z.array(NavItemEntrySchema).optional(),

  // ── Footer ────────────────────────────────────────────────
  footer: z.object({
    tagline:   z.string().optional(),
    copyright: z.string().optional(),
    enabled:   z.boolean().optional(),
    showLinks:   z.boolean().optional(),
    showSocials: z.boolean().optional(),
  }).optional(),

  // ── Contact ───────────────────────────────────────────────
  contact: z.object({
    email: z.string().optional().default(""),
    formEnabled: z.boolean().optional().default(true),
    successMessage: z.string().optional().default("Thanks for reaching out! I'll get back to you soon."),
    availabilityText: z.string().optional().default("I'm currently available for freelance work and new opportunities."),
  }).optional(),

  // ── Analytics ─────────────────────────────────────────────
  analytics: z.object({
    googleAnalyticsId: z.string().optional().default(""),
    vercelAnalytics:   z.boolean().optional().default(false),
    customScript:      z.string().optional().default(""),
  }).optional(),

  // ── Indexing ──────────────────────────────────────────────
  indexing: z.object({
    indexable: z.boolean().optional().default(true),
    maintenanceMode: z.boolean().optional().default(false),
  }).optional(),

  // ── Visibility ────────────────────────────────────────────
  visibility: z.object({
    hero:         z.boolean().optional(),
    about:        z.boolean().optional(),
    journey:      z.boolean().optional(),
    projects:     z.boolean().optional(),
    skills:       z.boolean().optional(),
    certificates: z.boolean().optional(),
    milestones:   z.boolean().optional(),
    updates:      z.boolean().optional(),
    contact:      z.boolean().optional(),
  }).optional(),

  // ── SEO ───────────────────────────────────────────────────
  seo: z.object({
    siteTitle:          z.string().optional(),
    titleSuffix:        z.string().optional(),
    defaultDescription: z.string().optional(),
    keywords:           z.array(z.string()).optional(),
    ogImage:            z.string().optional().default(""),
    twitterHandle:      z.string().optional().default(""),
    favicon:            z.string().optional().default(""),
    canonicalUrl:       z.string().optional().default(""),
    ogTitle:            z.string().optional().default(""),
    ogDescription:      z.string().optional().default(""),
  }).optional(),

  // ── Resume ────────────────────────────────────────────────
  resume: z.object({
    fileUrl:    z.string().optional().default(""),
    fileName:   z.string().optional().default(""),
    version:    z.string().optional().default("1.0"),
    uploadedAt: z.coerce.date().optional(),
    published:  z.boolean().optional().default(false),
    isCurrent:  z.boolean().optional().default(true),
    fileSize:   z.number().optional().default(0),
    label:      z.string().optional().default("View Resume"),
  }).optional(),

  // Publishing flag
  published: z.boolean().optional(),

  // ── Page Sections ────────────────────────────────────────
  sections: z.array(z.object({
    id:            z.string(),
    type:          z.string(),
    enabled:       z.boolean().optional().default(true),
    order:         z.number().int(),
    title:         z.string().optional().default(""),
    subtitle:      z.string().optional().default(""),
    layoutVariant: z.string().optional().default("default"),
    themeVariant:  z.string().optional().default("default"),
    config:        z.record(z.string(), z.any()).optional().default({}),
  })).optional(),

  // ── Appearance ───────────────────────────────────────────
  appearance: z.object({
    theme: z.object({
      preset:     z.enum(["default", "midnight", "minimal", "warm"]).optional().default("default"),
      background: z.string().optional().default(""),
      surface:    z.string().optional().default(""),
      text:       z.string().optional().default(""),
      mutedText:  z.string().optional().default(""),
      accent:     z.string().optional().default(""),
      border:     z.string().optional().default(""),
    }).optional(),
    typography: z.object({
      fontFamily:    z.string().optional().default("inter"),
      headingScale:  z.number().optional().default(1.0),
      bodyScale:     z.number().optional().default(1.0),
      letterSpacing: z.string().optional().default("normal"),
    }).optional(),
    motion: z.object({
      global:          z.boolean().optional().default(true),
      pageTransitions: z.boolean().optional().default(true),
      scrollReveals:   z.boolean().optional().default(true),
      heroEffects:     z.boolean().optional().default(true),
      liquidCursor:    z.boolean().optional().default(true),
      intensity:       z.enum(["subtle", "medium", "strong"]).optional().default("medium"),
    }).optional(),
    cursor: z.object({
      heroOnly: z.boolean().optional().default(true),
    }).optional(),
    background: z.object({
      grain:     z.object({ enabled: z.boolean().optional().default(true),  intensity: z.string().optional().default("medium") }).optional(),
      grid:      z.object({ enabled: z.boolean().optional().default(false), intensity: z.string().optional().default("medium") }).optional(),
      glow:      z.object({ enabled: z.boolean().optional().default(true),  intensity: z.string().optional().default("medium") }).optional(),
      particles: z.object({ enabled: z.boolean().optional().default(false), intensity: z.string().optional().default("medium") }).optional(),
    }).optional(),
  }).optional(),

  // ── Legacy flat fields (backward compat) ─────────────────
  heroHeadline: z.array(z.string()).optional(),
  heroSubtitle: z.string().optional(),
  githubUrl:    z.string().url().optional().or(z.literal("")),
  linkedinUrl:  z.string().url().optional().or(z.literal("")),
  xUrl:         z.string().url().optional().or(z.literal("")),
  email:        z.string().email().optional().or(z.literal("")),
});

// ── ROADMAP ───────────────────────────────────────────────────

const RoadmapStatusEnum = z.enum([
  "not-started","up-next","in-progress","practicing","review","completed","optional","paused"
]);

const RoadmapResourceZodSchema = z.object({
  title:    z.string().optional().default(""),
  url:      z.string().optional().default(""),
  type:     z.enum(["Documentation","Course","Book","Practice","Video","Project"]).optional().default("Documentation"),
  provider: z.string().optional().default(""),
  notes:    z.string().optional().default(""),
  order:    z.number().int().optional().default(0),
});

export const RoadmapPhaseSchema = z.object({
  number:             z.number().int().min(0),
  title:              z.string().min(1).max(200),
  subtitle:           z.string().optional().default(""),
  description:        z.string().optional().default(""),
  overview:           z.string().optional().default(""),
  learningObjectives: z.array(z.string()).optional().default([]),
  prerequisites:      z.array(z.string()).optional().default([]),
  status:             RoadmapStatusEnum.optional().default("not-started"),
  progress:           z.number().min(0).max(100).optional().default(0),
  order:              z.number().int().optional().default(0),
  icon:               z.string().optional().default("BookOpen"),
  color:              z.string().optional().default("#e8c547"),
  isOptional:         z.boolean().optional().default(false),
  published:          z.boolean().optional().default(true),
});

export const RoadmapPhaseUpdateSchema = RoadmapPhaseSchema.partial();

export const RoadmapDomainSchema = z.object({
  phase:        z.string().min(1, "Phase ID required"),
  title:        z.string().min(1).max(200),
  description:  z.string().optional().default(""),
  status:       RoadmapStatusEnum.optional().default("not-started"),
  progress:     z.number().min(0).max(100).optional().default(0),
  order:        z.number().int().optional().default(0),
  icon:         z.string().optional().default("Layers"),
  color:        z.string().optional().default(""),
  dependencies: z.array(z.string()).optional().default([]),
  notes:        z.string().optional().default(""),
  published:    z.boolean().optional().default(true),
});

export const RoadmapDomainUpdateSchema = RoadmapDomainSchema.partial();

export const RoadmapTopicSchema = z.object({
  domain:        z.string().min(1, "Domain ID required"),
  phase:         z.string().min(1, "Phase ID required"),
  title:         z.string().min(1).max(300),
  description:   z.string().optional().default(""),
  subtopics:     z.array(z.string()).optional().default([]),
  status:        RoadmapStatusEnum.optional().default("not-started"),
  progress:      z.number().min(0).max(100).optional().default(0),
  order:         z.number().int().optional().default(0),
  resources:     z.array(RoadmapResourceZodSchema).optional().default([]),
  notes:         z.string().optional().default(""),
  practiceCount: z.number().int().optional().default(0),
  published:     z.boolean().optional().default(true),
});

export const RoadmapTopicUpdateSchema = RoadmapTopicSchema.partial();

export const RoadmapTaskSchema = z.object({
  topic:           z.string().min(1, "Topic ID required"),
  domain:          z.string().min(1, "Domain ID required"),
  phase:           z.string().min(1, "Phase ID required"),
  title:           z.string().min(1).max(300),
  description:     z.string().optional().default(""),
  status:          RoadmapStatusEnum.optional().default("not-started"),
  priority:        z.enum(["low","medium","high","critical"]).optional().default("medium"),
  estimatedHours:  z.number().optional().default(0),
  actualHours:     z.number().optional().default(0),
  practiceCount:   z.number().int().optional().default(0),
  resources:       z.array(RoadmapResourceZodSchema).optional().default([]),
  notes:           z.string().optional().default(""),
  linkedProject:   z.string().optional().nullable().default(null),
  linkedMilestone: z.string().optional().nullable().default(null),
  order:           z.number().int().optional().default(0),
  published:       z.boolean().optional().default(true),
});

export const RoadmapTaskUpdateSchema = RoadmapTaskSchema.partial();

// ── RESUME ────────────────────────────────────────────────────

export const ResumeSchema = z.object({
  fileUrl:    z.string().min(1, "File URL is required"),
  fileName:   z.string().min(1, "File name is required"),
  version:    z.string().optional().default("1.0"),
  uploadedAt: z.coerce.date().optional(),
  published:  z.boolean().optional().default(true),
  isCurrent:  z.boolean().optional().default(true),
  fileSize:   z.number().optional().default(0),
  label:      z.string().optional().default("View Resume"),
  notes:      z.string().optional().default(""),
});

export const ResumeUpdateSchema = ResumeSchema.partial();
