# System Architecture & Technical Specifications

This document defines the complete software architecture, directory structure, data flows, security controls, and source-of-truth mappings for the Gautam Rajpurohit Portfolio & Editorial CMS.

---

## 1. System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER                                       │
│                                                                                  │
│   Public Visitor (Desktop / Mobile)               Admin Console (/admin)         │
│   ├── Next.js 16 App Router (Turbopack)           ├── Next.js 16 React 19 Forms  │
│   ├── Framer Motion & Responsive Layouts          ├── TanStack Table Data Grid   │
│   ├── LiquidHeroCursor (Hero scoped)              ├── Command Palette (Cmd+K)    │
│   ├── Ask Gautam (First-Person Persona)           ├── Draft Recovery & Autosave  │
│   └── Public Page Shell (.public-page-header)     └── Activity & Security Studio │
└─────────────────────────┬───────────────────────────────────┬────────────────────┘
                          │ HTTP Public Read                  │ HTTP-Only Cookie JWT
                          ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 API SERVER TIER                                  │
│                                                                                  │
│   Express 4 + TypeScript Application (Port 4000)                                 │
│   ├── Security Stack: Helmet, CORS, Rate Limit, Morgan, CSRF Origin Guard        │
│   ├── Middlewares: authenticate (JWT Cookie Verify), Multer Upload               │
│   ├── Audit Logging: Append-Only Immutable AuditLog Model (No secrets logged)    │
│   ├── Validation: Zod Schema Validators (Request Payloads & Query Params)        │
│   ├── AI Synthesis: Ask Gautam NVIDIA Nemotron 3 Ultra LLM Integration           │
│   └── Controllers: Auth, Projects, Journey, Skills, Content, Resume, Media,      │
│                    Roadmap, Activity, Security, Health                           │
└─────────────────────────┬───────────────────────────────────┬────────────────────┘
                          │ Mongoose ODM                      │ Storage Provider
                          ▼                                   ▼
┌──────────────────────────────────────────────┐   ┌───────────────────────────────┐
│               DATABASE TIER                  │   │        MEDIA STORAGE          │
│                                              │   │                               │
│   MongoDB Database Instance                  │   │   LocalStorageProvider        │
│   ├── Collections: users, projects, journey, │   │   ├── backend/public/uploads  │
│   │   skills, certificates, milestones,      │   │   └── Static route /uploads/* │
│   │   updates, resumes, roadmap_*,           │   │   (Future: S3 / Cloudinary)   │
│   │   auditlogs, settings                    │   │                               │
└──────────────────────────────────────────────┘   └───────────────────────────────┘
```

---

## 2. Directory Architecture

```text
portfolio-my/
├── frontend/                     # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                  # App Router
│   │   │   ├── (public)/         # Public visitor route group
│   │   │   │   ├── page.tsx      # Homepage (Hero, About, Skills, Roadmap, etc.)
│   │   │   │   ├── about/        # /about page
│   │   │   │   ├── roadmap/      # /roadmap page & RoadmapClientPage
│   │   │   │   ├── journey/      # /journey log page
│   │   │   │   ├── projects/     # /projects showcase page
│   │   │   │   ├── skills/       # /skills capabilities page
│   │   │   │   ├── contact/      # /contact collaboration page
│   │   │   │   └── milestones/   # /milestones achievement page
│   │   │   ├── admin/            # Protected Admin CMS route group
│   │   │   │   ├── page.tsx      # Control Center dashboard
│   │   │   │   ├── login/        # Admin authentication page
│   │   │   │   ├── projects/     # Projects management desk (TanStack Table)
│   │   │   │   ├── journey/      # Journey journal desk (TanStack Table)
│   │   │   │   ├── skills/       # Skills matrix desk (TanStack Table)
│   │   │   │   ├── roadmap/      # Roadmap planner desk (TanStack Table)
│   │   │   │   ├── resume/       # Resume desk & PDF versioning
│   │   │   │   ├── certificates/ # Certifications desk (TanStack Table)
│   │   │   │   ├── milestones/   # Milestones desk (TanStack Table)
│   │   │   │   ├── updates/      # Build log updates desk (TanStack Table)
│   │   │   │   ├── media/        # Media Asset Workspace (Grid & List Views)
│   │   │   │   ├── activity/     # Audit Log & Event Workspace
│   │   │   │   ├── security/     # Security Posture & Controls Center
│   │   │   │   └── settings/     # Site settings & SEO desk
│   │   │   ├── globals.css       # Design system tokens & utilities
│   │   │   └── layout.tsx        # Root HTML layout & fonts
│   │   ├── components/
│   │   │   ├── admin/            # Admin UI components
│   │   │   │   ├── forms/        # Standardized collection forms (Draft Recovery)
│   │   │   │   ├── media/        # MediaPicker, AssetDetailModal
│   │   │   │   └── ui/           # AdminDataTable, AdminPageHeader, AdminCommandPalette
│   │   │   ├── cursor/           # LiquidHeroCursor (hero-scoped)
│   │   │   ├── layout/           # PublicPageShell, PublicPageHeader, Footer
│   │   │   ├── motion/           # MotionPrimitives, PageTransition
│   │   │   ├── nav/              # Responsive Navbar & mobile drawer
│   │   │   ├── portfolio/        # Section components (Hero, About, AskGautamSection)
│   │   │   └── ui/               # SocialIcons and UI atoms
│   │   ├── context/              # AuthContext (login state), ThemeContext
│   │   ├── hooks/                # useDraftRecovery
│   │   ├── lib/                  # api.ts (Axios client), motion.ts, utils.ts
│   │   └── types/                # TypeScript interfaces (Project, Skill, Resume, etc.)
│   └── package.json
│
├── backend/                      # Express TypeScript API Server
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── activityController.ts # Paginated audit log queries
│   │   │   ├── authController.ts     # Login, logout, session with audit logging
│   │   │   ├── chatController.ts     # Ask Gautam AI fast-path & Nemotron synthesis
│   │   │   ├── contentController.ts
│   │   │   ├── journeyController.ts
│   │   │   ├── mediaController.ts    # Media upload, replace, reference-checked delete
│   │   │   ├── projectsController.ts # Projects CRUD with draft/publish revisions
│   │   │   ├── resumeController.ts
│   │   │   ├── roadmapController.ts
│   │   │   ├── securityController.ts # Verified security posture checklist
│   │   │   └── skillsController.ts
│   │   ├── lib/
│   │   │   ├── audit.ts          # logAudit helper (secret sanitization)
│   │   │   ├── db.ts             # MongoDB connection singleton
│   │   │   ├── storage.ts        # Storage abstraction
│   │   │   └── validation.ts     # Zod request validation schemas
│   │   ├── middleware/
│   │   │   ├── auth.ts           # authenticate (JWT Cookie), requireCsrf
│   │   │   └── upload.ts         # Multer MIME and size constraints
│   │   ├── models/               # Mongoose data models
│   │   │   ├── AuditLog.ts
│   │   │   ├── Certificate.ts
│   │   │   ├── JourneyEntry.ts
│   │   │   ├── Media.ts
│   │   │   ├── Milestone.ts
│   │   │   ├── Project.ts
│   │   │   ├── Resume.ts
│   │   │   ├── Revision.ts
│   │   │   ├── RoadmapDomain.ts
│   │   │   ├── RoadmapPhase.ts
│   │   │   ├── RoadmapTask.ts
│   │   │   ├── RoadmapTopic.ts
│   │   │   ├── Settings.ts
│   │   │   ├── Skill.ts
│   │   │   ├── Update.ts
│   │   │   └── User.ts
│   │   ├── routes/               # Express route declarations
│   │   └── index.ts              # Express application bootstrap & middleware stack
│   └── package.json
```

---

## 3. Data Flow & Security Boundaries

### 3.1 Public Read Flow
1. Visitors request public routes (`/`, `/projects`, `/roadmap`, `/skills`, etc.).
2. Next.js fetches data via `api.ts` from backend public endpoints (`/api/projects`, `/api/skills`, `/api/roadmap`, `/api/resume`).
3. Backend controllers filter database records using `{ published: true }`, ensuring draft items are invisible.
4. "Ask Gautam" queries `/api/chat`. Fast-path directly answers factual queries; LLM path synthesizes responses strictly from published documents via NVIDIA Nemotron (`nvidia/nemotron-3-ultra-550b-a55b`) in first-person without displaying technical model metadata in the public UI.

### 3.2 Admin CMS Mutating Flow
1. Admin authenticates via `/admin/login` $\rightarrow$ `POST /api/auth/login`.
2. Backend validates credentials with `bcrypt.compare` and issues signed JWT in an `httpOnly`, `SameSite=Strict`, `Secure` (production) cookie.
3. Server records `LOGIN_SUCCESS` in append-only `AuditLog`.
4. Admin edits content with draft protection (`useDraftRecovery` and `Revision` drafts).
5. State-changing requests (`POST`, `PUT`, `DELETE`) pass through `authenticate` and `requireCsrf` middleware.
6. Successful/failed mutations write sanitized events to `AuditLog`.

---

## 4. Operational Health & Diagnostics
- `GET /api/health`: Provides verified operational status for API server, database connection, JWT secret readiness, uploads directory, and NVIDIA AI configuration.
- `GET /api/security/status`: Provides verified architectural security controls checklist (single-admin auth, HTTP-only cookies, CSRF protection, Helmet security headers, rate limiting, and truthful reporting of disabled/unimplemented features).
- `GET /api/activity`: Provides paginated, searchable, categorized audit log feed for administrative review.
