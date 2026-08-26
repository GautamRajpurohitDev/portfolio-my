import mongoose, { Schema, Document, Model } from "mongoose";

// ── Sub-schemas ───────────────────────────────────────────────

const SocialLinkSchema = new Schema(
  { label: { type: String, default: "" }, url: { type: String, default: "" },
    enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 } },
  { _id: false }
);

const NavItemSchema = new Schema(
  { label: { type: String, default: "" }, href: { type: String, default: "/" },
    enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 },
    external: { type: Boolean, default: false }, highlighted: { type: Boolean, default: false } },
  { _id: false }
);

const CtaSchema = new Schema(
  { label: { type: String, default: "" }, url: { type: String, default: "/" },
    enabled: { type: Boolean, default: true }, external: { type: Boolean, default: false } },
  { _id: false }
);

const EyebrowItemSchema = new Schema(
  { text: { type: String, default: "" }, icon: { type: String, default: "" },
    enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 } },
  { _id: false }
);

const PageSectionSchema = new Schema(
  {
    id:            { type: String, required: true },
    type:          { type: String, required: true },  // hero | about | currentlyLearning | journey | projects | skills | certificates | milestones | updates | contact
    enabled:       { type: Boolean, default: true },
    order:         { type: Number,  required: true },
    title:         { type: String,  default: "" },    // optional override
    subtitle:      { type: String,  default: "" },    // optional override
    layoutVariant: { type: String,  default: "default" },
    themeVariant:  { type: String,  default: "default" },
    config:        { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

// Valid layout variants per section type
export const SECTION_LAYOUT_VARIANTS: Record<string, string[]> = {
  hero:             ["default"],
  about:            ["default"],
  currentlyLearning:["default"],
  journey:          ["timeline", "cards", "compact"],
  projects:         ["grid", "featured-first", "editorial-list"],
  skills:           ["grouped", "grid", "minimal-list"],
  certificates:     ["grid", "list"],
  milestones:       ["timeline", "cards"],
  updates:          ["feed", "cards"],
  contact:          ["default"],
};

// ── Main Interface ────────────────────────────────────────────

export interface ISettings extends Document {
  // Identity (Legacy - kept for backwards compatibility)
  identity: {
    name: string; displayName: string; role: string; headline: string;
    shortBio: string; longBio: string; location: string;
    profileImage: string; availability: string; email: string;
  };

  // About / Profile
  about: {
    profileImage: string;
    name: string;
    shortIntro: string;
    personalStatement: string;
    location: string;
    education: string;
    currentFocus: string;
    interests: string[];
    areasExploring: Array<{ title: string; description: string; order: number }>;
    timeline: Array<{ year: string; title: string; description: string; order: number }>;
  };

  // Hero section (full CMS)
  hero: {
    // Content
    headlineLines: string[];
    subtitle:      string;
    eyebrow: Array<{ text: string; icon: string; enabled: boolean; order: number }>;
    ctaPrimary:   { label: string; url: string; enabled: boolean; external: boolean };
    ctaSecondary: { label: string; url: string; enabled: boolean; external: boolean };
    // Visual
    backgroundImage: string;
    heroImage:       string;
    overlayOpacity:  number;   // 0–1
    // Effects
    effects: {
      liquidCursor:    boolean;
      liquidIntensity: string;  // none | subtle | medium | strong
      cursorSize:      number;
      hoverScale:      number;
      rippleEnabled:   boolean;
      rippleIntensity: string;
      parallax:        boolean;
      glow:            boolean;
      grain:           boolean;
      animation:       boolean;
    };
    // Publish state for hero specifically
    status:    string;  // draft | published
    visible:   boolean;
  };

  // Currently learning
  currentlyLearning: { primary: string; primaryDescription: string; next: string; roadmap: string[] };

  // Social links
  socials: {
    github:   { label: string; url: string; enabled: boolean; order: number };
    linkedin: { label: string; url: string; enabled: boolean; order: number };
    x:        { label: string; url: string; enabled: boolean; order: number };
    email:    { label: string; url: string; enabled: boolean; order: number };
    other:    Array<{ label: string; url: string; enabled: boolean; order: number }>;
  };

  // Navigation
  navigation: Array<{ label: string; href: string; enabled: boolean; order: number; external: boolean; highlighted: boolean }>;

  // Footer
  footer: { tagline: string; copyright: string; enabled: boolean; showLinks: boolean; showSocials: boolean };

  // Contact
  contact: { email: string; formEnabled: boolean; successMessage: string; availabilityText: string };

  // Analytics
  analytics: { googleAnalyticsId: string; vercelAnalytics: boolean; customScript: string };

  // Indexing
  indexing: { indexable: boolean; maintenanceMode: boolean };

  // Section visibility
  visibility: {
    hero: boolean; about: boolean; journey: boolean; projects: boolean;
    skills: boolean; certificates: boolean; milestones: boolean; updates: boolean; contact: boolean;
  };

  // SEO
  seo: { siteTitle: string; titleSuffix: string; defaultDescription: string; keywords: string[]; ogImage: string; twitterHandle: string; favicon: string; canonicalUrl: string; ogTitle: string; ogDescription: string };

  // Resume
  resume: {
    fileUrl: string;
    fileName: string;
    version: string;
    uploadedAt: Date;
    published: boolean;
    isCurrent: boolean;
    fileSize: number;
    label: string;
  };

  // Page sections (ordered, configurable)
  sections: Array<{
    id:            string;
    type:          string;
    enabled:       boolean;
    order:         number;
    title:         string;
    subtitle:      string;
    layoutVariant: string;
    themeVariant:  string;
    config:        Record<string, any>;
  }>;
  // Appearance
  appearance: {
    theme: {
      preset: string; background: string; surface: string; text: string; mutedText: string; accent: string; border: string;
    };
    typography: {
      fontFamily: string; headingScale: number; bodyScale: number; letterSpacing: string;
    };
    motion: {
      global: boolean; pageTransitions: boolean; scrollReveals: boolean; heroEffects: boolean; liquidCursor: boolean; intensity: string;
    };
    cursor: { heroOnly: boolean };
    background: {
      grain: { enabled: boolean; intensity: string };
      grid: { enabled: boolean; intensity: string };
      glow: { enabled: boolean; intensity: string };
      particles: { enabled: boolean; intensity: string };
    };
  };

  // Config publishing
  published: boolean;

  // Legacy flat fields (backward compat)
  heroHeadline: string[]; heroSubtitle: string;
  githubUrl: string; linkedinUrl: string; xUrl: string;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────

const SettingsSchema = new Schema<ISettings>(
  {
    // ── Identity ──────────────────────────────────────────────
    identity: {
      name:         { type: String, default: "Gautam Rajpurohit" },
      displayName:  { type: String, default: "Gautam Rajpurohit" },
      role:         { type: String, default: "MCA Student" },
      headline:     { type: String, default: "Building software one layer at a time." },
      shortBio:     { type: String, default: "MCA student focused on building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly." },
      longBio:      { type: String, default: "" },
      location:     { type: String, default: "India" },
      profileImage: { type: String, default: "" },
      availability: { type: String, default: "learning", enum: ["open","learning","busy","unavailable"] },
      email:        { type: String, default: "" },
    },

    // ── Hero (full CMS) ───────────────────────────────────────
    hero: {
      // Content
      headlineLines: { type: [String], default: ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."] },
      subtitle:      { type: String, default: "MCA student focused on building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly." },
      eyebrow: {
        type: [EyebrowItemSchema],
        default: [
          { text: "BASED IN INDIA",             icon: "MapPin",       enabled: true, order: 1 },
          { text: "MCA STUDENT",                icon: "GraduationCap",enabled: true, order: 2 },
          { text: "SINCE 2026",                 icon: "Code2",        enabled: true, order: 3 },
          { text: "CURRENTLY LEARNING: GIT → C",icon: "Zap",          enabled: true, order: 4 },
        ],
      },
      ctaPrimary: {
        ...CtaSchema.obj,
        label:   { type: String, default: "View Projects" },
        url:     { type: String, default: "/projects" },
        enabled: { type: Boolean, default: true },
        external:{ type: Boolean, default: false },
      },
      ctaSecondary: {
        ...CtaSchema.obj,
        label:   { type: String, default: "Explore Journey" },
        url:     { type: String, default: "/journey" },
        enabled: { type: Boolean, default: true },
        external:{ type: Boolean, default: false },
      },
      // Visual
      backgroundImage: { type: String, default: "" },
      heroImage:       { type: String, default: "" },
      overlayOpacity:  { type: Number, default: 0.04 },
      // Effects
      effects: {
        liquidCursor:    { type: Boolean, default: true },
        liquidIntensity: { type: String,  default: "medium", enum: ["none","subtle","medium","strong"] },
        cursorSize:      { type: Number,  default: 36 },
        hoverScale:      { type: Number,  default: 2.5 },
        rippleEnabled:   { type: Boolean, default: true },
        rippleIntensity: { type: String,  default: "medium", enum: ["none","subtle","medium","strong"] },
        parallax:        { type: Boolean, default: false },
        glow:            { type: Boolean, default: true },
        grain:           { type: Boolean, default: true },
        animation:       { type: Boolean, default: true },
      },
      // State
      status:  { type: String, default: "published", enum: ["draft","published"] },
      visible: { type: Boolean, default: true },
    },

    // ── Currently Learning ────────────────────────────────────
    currentlyLearning: {
      primary:            { type: String, default: "Git & GitHub" },
      primaryDescription: { type: String, default: "Learning version control from first principles." },
      next:               { type: String, default: "C Programming" },
      roadmap:            [{ type: String }],
    },

    // ── Socials ───────────────────────────────────────────────
    socials: {
      github:   { label: { type: String, default: "GitHub" },   url: { type: String, default: "" }, enabled: { type: Boolean, default: true },  order: { type: Number, default: 1 } },
      linkedin: { label: { type: String, default: "LinkedIn" }, url: { type: String, default: "" }, enabled: { type: Boolean, default: true },  order: { type: Number, default: 2 } },
      x:        { label: { type: String, default: "X" },        url: { type: String, default: "" }, enabled: { type: Boolean, default: true },  order: { type: Number, default: 3 } },
      email:    { label: { type: String, default: "Email" },    url: { type: String, default: "" }, enabled: { type: Boolean, default: true },  order: { type: Number, default: 4 } },
      other:    { type: [SocialLinkSchema], default: [] },
    },

    // ── About / Profile ───────────────────────────────────────
    about: {
      profileImage:      { type: String, default: "" },
      name:              { type: String, default: "Gautam Rajpurohit" },
      shortIntro:        { type: String, default: "HEY. I'M GAUTAM." },
      personalStatement: { type: String, default: "I'm an MCA student deliberately rebuilding my programming and software engineering fundamentals..." },
      location:          { type: String, default: "INDIA" },
      education:         { type: String, default: "MCA" },
      currentFocus:      { type: String, default: "PROGRAMMING" },
      interests:         { type: [String], default: [] },
      areasExploring:    [{
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 }
      }],
      timeline:          [{
        year: { type: String, default: "" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 }
      }]
    },

    // ── Navigation ────────────────────────────────────────────
    navigation: {
      type: [NavItemSchema],
      default: [
        { label: "Home",     href: "/",         enabled: true, order: 1, external: false, highlighted: false },
        { label: "About",    href: "/about",     enabled: true, order: 2, external: false, highlighted: false },
        { label: "Roadmap",  href: "/roadmap",   enabled: true, order: 3, external: false, highlighted: false },
        { label: "Journey",  href: "/journey",   enabled: true, order: 4, external: false, highlighted: false },
        { label: "Projects", href: "/projects",  enabled: true, order: 5, external: false, highlighted: false },
        { label: "Skills",   href: "/skills",    enabled: true, order: 6, external: false, highlighted: false },
        { label: "Contact",  href: "/contact",   enabled: true, order: 7, external: false, highlighted: false },
      ],
    },

    // ── Footer ────────────────────────────────────────────────
    footer: {
      tagline:   { type: String, default: "Building software one layer at a time." },
      copyright: { type: String, default: "© 2026 Gautam Rajpurohit. All rights reserved." },
      enabled:   { type: Boolean, default: true },
      showLinks:   { type: Boolean, default: true },
      showSocials: { type: Boolean, default: true },
    },

    // ── Contact ───────────────────────────────────────────────
    contact: {
      email: { type: String, default: "" },
      formEnabled: { type: Boolean, default: true },
      successMessage: { type: String, default: "Thanks for reaching out! I'll get back to you soon." },
      availabilityText: { type: String, default: "I'm currently available for freelance work and new opportunities." },
    },

    // ── Analytics ─────────────────────────────────────────────
    analytics: {
      googleAnalyticsId: { type: String, default: "" },
      vercelAnalytics:   { type: Boolean, default: false },
      customScript:      { type: String, default: "" },
    },

    // ── Indexing ──────────────────────────────────────────────
    indexing: {
      indexable: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },

    // ── Section Visibility ────────────────────────────────────
    visibility: {
      hero:         { type: Boolean, default: true },
      about:        { type: Boolean, default: true },
      journey:      { type: Boolean, default: true },
      projects:     { type: Boolean, default: true },
      skills:       { type: Boolean, default: true },
      certificates: { type: Boolean, default: true },
      milestones:   { type: Boolean, default: true },
      updates:      { type: Boolean, default: true },
      contact:      { type: Boolean, default: true },
    },

    // ── SEO ───────────────────────────────────────────────────
    seo: {
      siteTitle:          { type: String, default: "Gautam Rajpurohit — Software Development Journey" },
      titleSuffix:        { type: String, default: "Gautam Rajpurohit" },
      defaultDescription: { type: String, default: "MCA student building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly." },
      keywords:           { type: [String], default: ["MCA","software development","programming","portfolio"] },
      ogImage:            { type: String, default: "" },
      twitterHandle:      { type: String, default: "" },
      favicon:            { type: String, default: "" },
      canonicalUrl:       { type: String, default: "" },
      ogTitle:            { type: String, default: "" },
      ogDescription:      { type: String, default: "" },
    },

    // ── Resume ────────────────────────────────────────────────
    resume: {
      fileUrl:    { type: String, default: "" },
      fileName:   { type: String, default: "" },
      version:    { type: String, default: "1.0" },
      uploadedAt: { type: Date, default: Date.now },
      published:  { type: Boolean, default: false },
      isCurrent:  { type: Boolean, default: true },
      fileSize:   { type: Number, default: 0 },
      label:      { type: String, default: "View Resume" },
    },

    published: { type: Boolean, default: true },

    // ── Page Sections ─────────────────────────────────────────
    sections: {
      type: [PageSectionSchema],
      default: [
        { id: "hero",             type: "hero",             enabled: true, order: 1,  title: "", subtitle: "", layoutVariant: "default",       themeVariant: "default", config: {} },
        { id: "about",            type: "about",            enabled: true, order: 2,  title: "", subtitle: "", layoutVariant: "default",       themeVariant: "default", config: {} },
        { id: "currentlyLearning",type: "currentlyLearning",enabled: true, order: 3,  title: "", subtitle: "", layoutVariant: "default",       themeVariant: "default", config: {} },
        { id: "projects",         type: "projects",         enabled: true, order: 4,  title: "", subtitle: "", layoutVariant: "grid",          themeVariant: "default", config: {} },
        { id: "journey",          type: "journey",          enabled: true, order: 5,  title: "", subtitle: "", layoutVariant: "timeline",      themeVariant: "default", config: {} },
        { id: "skills",           type: "skills",           enabled: false,order: 6,  title: "", subtitle: "", layoutVariant: "grouped",       themeVariant: "default", config: {} },
        { id: "certificates",     type: "certificates",     enabled: false,order: 7,  title: "", subtitle: "", layoutVariant: "grid",          themeVariant: "default", config: {} },
        { id: "milestones",       type: "milestones",       enabled: true, order: 8,  title: "", subtitle: "", layoutVariant: "timeline",      themeVariant: "default", config: {} },
        { id: "updates",          type: "updates",          enabled: false,order: 9,  title: "", subtitle: "", layoutVariant: "feed",          themeVariant: "default", config: {} },
        { id: "contact",          type: "contact",          enabled: true, order: 10, title: "", subtitle: "", layoutVariant: "default",       themeVariant: "default", config: {} },
      ],
    },

    // ── Appearance ────────────────────────────────────────────
    appearance: {
      theme: {
        preset:     { type: String, enum: ["default", "midnight", "minimal", "warm"], default: "default" },
        background: { type: String, default: "" },
        surface:    { type: String, default: "" },
        text:       { type: String, default: "" },
        mutedText:  { type: String, default: "" },
        accent:     { type: String, default: "" },
        border:     { type: String, default: "" },
      },
      typography: {
        fontFamily:    { type: String, default: "inter" },
        headingScale:  { type: Number, default: 1.0 },
        bodyScale:     { type: Number, default: 1.0 },
        letterSpacing: { type: String, default: "normal" },
      },
      motion: {
        global:          { type: Boolean, default: true },
        pageTransitions: { type: Boolean, default: true },
        scrollReveals:   { type: Boolean, default: true },
        heroEffects:     { type: Boolean, default: true },
        liquidCursor:    { type: Boolean, default: true },
        intensity:       { type: String, enum: ["subtle", "medium", "strong"], default: "medium" },
      },
      cursor: {
        heroOnly: { type: Boolean, default: true },
      },
      background: {
        grain:     { enabled: { type: Boolean, default: true },  intensity: { type: String, default: "medium" } },
        grid:      { enabled: { type: Boolean, default: false }, intensity: { type: String, default: "medium" } },
        glow:      { enabled: { type: Boolean, default: true },  intensity: { type: String, default: "medium" } },
        particles: { enabled: { type: Boolean, default: false }, intensity: { type: String, default: "medium" } },
      },
    },

    // ── Legacy flat fields ────────────────────────────────────
    heroHeadline: { type: [String], default: [] },
    heroSubtitle: { type: String,   default: "" },
    githubUrl:    { type: String,   default: "" },
    linkedinUrl:  { type: String,   default: "" },
    xUrl:         { type: String,   default: "" },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
