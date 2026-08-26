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
│   ├── Framer Motion & Responsive Layouts          ├── React Hook Form + Zod      │
│   └── Public Page Shell (.public-page-header)     └── Studio / Desk Desktops     │
└─────────────────────────┬───────────────────────────────────┬────────────────────┘
                          │ HTTP Public Read                  │ HTTP-Only Cookie JWT
                          ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 API SERVER TIER                                  │
│                                                                                  │
│   Express 4 + TypeScript Application (Port 4000)                                 │
│   ├── Security Stack: Helmet, CORS, Rate Limit, Morgan, CSRF Origin Guard        │
│   ├── Middlewares: authMiddleware (JWT Cookie Verify), uploadMiddleware (Multer) │
│   ├── Validation: Zod Schema Validators (Request Payloads & Query Params)        │
│   └── Controllers: Auth, Projects, Journey, Skills, Content, Resume, Media, Roadmap │
└─────────────────────────┬───────────────────────────────────┬────────────────────┘
                          │ Mongoose ODM                      │ Storage Provider
                          ▼                                   ▼
┌──────────────────────────────────────────────┐   ┌───────────────────────────────┐
│               DATABASE TIER                  │   │        MEDIA STORAGE          │
│                                              │   │                               │
│   MongoDB Database Instance                  │   │   LocalStorageProvider        │
│   ├── Collections: users, projects, journey, │   │   ├── backend/public/uploads  │
│   │   skills, certificates, milestones,      │   │   └── Static route /uploads/* │
│   │   updates, resumes, roadmap_*, settings  │   │   (Future: S3 / Cloudinary)   │
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
│   │   │   │   ├── projects/     # Projects management desk
│   │   │   │   ├── journey/      # Journey journal desk
│   │   │   │   ├── skills/       # Skills matrix desk
│   │   │   │   ├── roadmap/      # Roadmap planner desk
│   │   │   │   ├── resume/       # Resume desk & PDF versioning
│   │   │   │   ├── certificates/ # Certifications desk
│   │   │   │   ├── milestones/   # Milestones desk
│   │   │   │   ├── updates/      # Build log updates desk
│   │   │   │   └── settings/     # Site settings & SEO desk
│   │   │   ├── globals.css       # Design system tokens & utilities
│   │   │   └── layout.tsx        # Root HTML layout & fonts
│   │   ├── components/
│   │   │   ├── admin/            # Admin forms, composer, media picker
│   │   │   ├── cursor/           # LiquidHeroCursor (hero-scoped)
│   │   │   ├── layout/           # PublicPageShell, PublicPageHeader, Footer
│   │   │   ├── motion/           # MotionPrimitives, PageTransition
│   │   │   ├── nav/              # Responsive Navbar & mobile drawer
│   │   │   ├── portfolio/        # Section components (Hero, About, etc.)
│   │   │   └── ui/               # SocialIcons and UI atoms
│   │   ├── context/              # AuthContext (login state)
│   │   ├── lib/                  # api.ts (Axios client), motion.ts, utils.ts
│   │   └── types/                # TypeScript interfaces (Project, Skill, Resume, etc.)
│   └── package.json
│
├── backend/                      # Express TypeScript API Server
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── contentController.ts
│   │   │   ├── journeyController.ts
│   │   │   ├── mediaController.ts
│   │   │   ├── projectsController.ts
│   │   │   ├── resumeController.ts
│   │   │   ├── roadmapController.ts
│   │   │   └── skillsController.ts
│   │   ├── lib/
│   │   │   ├── db.ts             # MongoDB connection singleton
│   │   │   └── validation.ts     # Zod request validation schemas
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT cookie verification & helpers
│   │   │   └── upload.ts         # Multer disk storage & MIME validation
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Project.ts
│   │   │   ├── JourneyEntry.ts
│   │   │   ├── Skill.ts
│   │   │   ├── RoadmapPhase.ts
│   │   │   ├── RoadmapDomain.ts
│   │   │   ├── RoadmapTopic.ts
│   │   │   ├── Resume.ts
│   │   │   ├── Settings.ts
│   │   │   └── ContentModels.ts  # Certificate, Milestone, Update
│   │   ├── routes/               # API route definitions
│   │   │   ├── auth.ts
│   │   │   ├── content.ts
│   │   │   ├── journey.ts
│   │   │   ├── media.ts
│   │   │   ├── projects.ts
│   │   │   ├── resume.ts
│   │   │   ├── roadmap.ts
│   │   │   ├── settings.ts
│   │   │   └── skills.ts
│   │   ├── scripts/              # Seed and data migration utilities
│   │   │   ├── seed.ts
│   │   │   ├── fixSkillsData.ts
│   │   │   └── seedSampleResume.ts
│   │   └── index.ts              # Express application bootstrap
│   └── package.json
│
├── Phases.md                     # Roadmap and phase verification lifecycle
├── memory.md                     # Durable project memory and facts
├── Architecture.md               # Technical architecture specifications (this document)
├── SECURITY_AUDIT.md             # 18-point security verification matrix
└── workflow.txt                  # Changelog archive
```

---

## 3. Data & Communication Flows

### A. Admin Mutation Flow
```text
Admin User Form Input (React Hook Form)
   │
   ▼
Zod Client Validation (frontend/src/lib/validation)
   │
   ▼
Axios POST/PUT (frontend/src/lib/api.ts) -> HTTP-Only Cookie
   │
   ▼
Origin / CORS Verification (backend/src/index.ts)
   │
   ▼
authMiddleware (backend/src/middleware/auth.ts) -> Verify JWT Cookie
   │
   ▼
Zod Server Validation (backend/src/lib/validation.ts)
   │
   ▼
Controller Action (e.g. projectsController.ts)
   │
   ▼
Mongoose Model & Hooks -> MongoDB Document Commit
   │
   ▼
JSON Success Response { success: true, data: { ... } }
```

### B. Public Read Flow
```text
Public Visitor Browser -> GET /skills
   │
   ▼
Next.js Server Component (frontend/src/app/(public)/skills/page.tsx)
   │
   ▼
Fetch GET /api/skills (Filtered for published: true)
   │
   ▼
Express Controller -> Skill.find({ published: true })
   │
   ▼
Next.js SSR / ISR Page Assembly with <PublicPageHeader> & <SkillsSection>
   │
   ▼
Hydrated HTML Rendered in Visitor Browser (0 fake skills)
```

---

## 4. Authentication Flow

1. **Login Request**: Admin submits email and password to `POST /api/auth/login`.
2. **Rate Limiting**: `express-rate-limit` throttles repeated login attempts from same IP.
3. **Credential Check**: User record retrieved by email; bcrypt compares hashed password (`bcrypt.compare`).
4. **Token Issuance**: Server signs JWT payload `{ userId, email, role: 'admin' }` with `JWT_SECRET`.
5. **Cookie Delivery**: Token is set in response header via HTTP-only, SameSite, Secure cookie (`token`).
6. **Authenticated Requests**: Subsequent API calls automatically include the `token` cookie.
7. **Session Invalidation**: `POST /api/auth/logout` clears the cookie immediately.

---

## 5. Publishing & Draft Lifecycle

```text
[ DRAFT ] ───────────► [ VALIDATE ] ───────────► [ PREVIEW ] ───────────► [ PUBLISH ]
(published: false)     (Zod schema check)        (Admin-only preview)     (published: true)
Hidden from public     Required fields valid     Live UI layout test      Exposed to public
```

---

## 6. Media Pipeline & Storage

- **Uploader**: Admin drags & drops file onto `MediaPicker` or Resume Desk.
- **Upload Middleware**: Multer checks MIME type and limits (Images: 10MB, Videos: 50MB, PDF: 10MB).
- **Sanitization**: Filenames are timestamped and stripped of path traversal characters (`..`, `/`, `\`).
- **Disk Storage**: File saved to `backend/public/uploads/<filename>`.
- **Public Serving**: Statically exposed via Express static router at `/uploads/<filename>`.
- **Database Link**: Document stores relative path string (`/uploads/<filename>`).

---

## 7. Security Architecture & Controls

| Security Domain | Strategy / Control | Status |
|---|---|---|
| **Authentication** | JWT stored exclusively in HTTP-only, SameSite cookies | **IMPLEMENTED** |
| **Password Hashing** | bcrypt with work factor salt (12 rounds) | **IMPLEMENTED** |
| **Input Validation** | Strict Zod schemas validating types, lengths, enums | **IMPLEMENTED** |
| **Rate Limiting** | `express-rate-limit` on login endpoint and general API | **IMPLEMENTED** |
| **HTTP Headers** | Helmet (X-Content-Type-Options, Frameguard, Hide Powered-By) | **IMPLEMENTED** |
| **CSRF / Origin** | SameSite cookies + Origin check on mutating endpoints | **IMPLEMENTED** |
| **Single-Admin Scope** | Public user registration intentionally disabled | **DISABLED** |
| **Password Reset** | Email reset disabled; manual admin credential rotation | **DISABLED** |
| **MFA (TOTP)** | Recommended future security roadmap addition | **PLANNED** |
| **Cloud Storage** | Transition from local disk to S3/Cloudinary | **PLANNED** |

---

## 8. Source-of-Truth Mapping

| Domain Data | Mongoose Model | Admin Route | Public Route |
|---|---|---|---|
| **Site Settings & SEO** | `Settings` | `/admin/settings` | Global Layout & `<head>` |
| **Projects Showcase** | `Project` | `/admin/projects` | `/projects`, `/` |
| **Learning Journal** | `JourneyEntry` | `/admin/journey` | `/journey`, `/` |
| **Skills Matrix** | `Skill` | `/admin/skills` | `/skills`, `/` |
| **17-Phase Roadmap** | `RoadmapPhase`, `Domain`, `Topic` | `/admin/roadmap` | `/roadmap`, `/` |
| **Resume & CV** | `Resume` | `/admin/resume` | Navbar, Hero, Footer |
| **Certifications** | `Certificate` | `/admin/certificates`| `/certificates` |
| **Milestones** | `Milestone` | `/admin/milestones` | `/milestones` |
| **Build Logs** | `Update` | `/admin/updates` | `/updates` |

---

## 9. Architectural Rules

1. **No Fake Expertise**: Only technologies genuinely practiced and demonstrated are marked in progress or completed.
2. **Server-Side Security**: All authorization and draft filtering occurs in Express controllers, never relying on client filtering.
3. **No Secrets in Frontend**: `NEXT_PUBLIC_*` environment variables must never contain secrets or private tokens.
4. **Hero-Scoped Cursor**: Liquid cursor activates only inside the homepage hero section via `.hero-cursor-active`.
5. **Universal Layout Offset**: All secondary pages use `<PublicPageShell>` with `.public-page-header` to guarantee safe distance below the fixed navbar.
