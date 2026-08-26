# Project Memory & Durable Architectural State

This document maintains persistent, durable project-level memory. It records immutable facts, design decisions, actual learning metrics, and core constraints for future AI agents and developers.

---

## 1. Project Identity

- **Project Name**: Gautam Rajpurohit Portfolio & Editorial CMS
- **Developer**: Gautam Rajpurohit (MCA Student, India)
- **Core Purpose**: An authentic, verifiable software engineering portfolio and learning journal built from first principles. Replaces generic static portfolios with a live, database-driven Editorial CMS reflecting real learning progress, projects, and systems knowledge.
- **Core Philosophy**: **Zero Fabricated Expertise.** No claiming technologies as "mastered" or "completed" until genuinely practiced and built into real applications.

---

## 2. Technology Stack & Key Libraries

- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";`), CSS Custom Properties design system, custom typography (Clash Grotesk, JetBrains Mono, Inter).
- **Motion**: Framer Motion (orchestrated page transitions, fluid reveal lines, spring-damped liquid cursor).
- **Backend**: Node.js, Express 4, TypeScript (`strict: true`).
- **Database**: MongoDB with Mongoose ODM.
- **Validation**: Zod (shared schemas for API requests and frontend forms).
- **Authentication**: JWT signed via environment secrets, delivered strictly via HTTP-only SameSite cookies.
- **Forms**: React Hook Form with `@hookform/resolvers/zod`.

---

## 3. Current Authentic Learning & Skills State

| Domain / Skill | Status | Progress (%) | Notes |
|---|---|---|---|
| **Git & GitHub** | `in-progress` | **89%** | Active foundation: version control, branching, rebasing, PR workflows. |
| **C Programming** | `not-started` | **0%** | Planned on Roadmap (Phase 01 / CS Fundamentals). |
| **C++ & OOP** | `not-started` | **0%** | Planned on Roadmap. |
| **Data Structures & Algorithms** | `not-started` | **0%** | Planned on Roadmap. |
| **HTML5 & CSS3** | `not-started` | **0%** | Planned on Roadmap. |
| **JavaScript (ES6+)** | `not-started` | **0%** | Planned on Roadmap. |
| **React & Next.js** | `not-started` | **0%** | Planned on Roadmap. |
| **Node.js & Express** | `not-started` | **0%** | Planned on Roadmap. |
| **MongoDB & Mongoose** | `not-started` | **0%** | Planned on Roadmap. |
| **Linux CLI & Systems** | `not-started` | **0%** | Planned on Roadmap. |
| **Python** | `not-started` | **0%** | Planned on Roadmap. |
| **Java** | `not-started` | **0%** | Planned on Roadmap. |
| **Cloud & DevOps (Docker/AWS)** | `not-started` | **0%** | Planned on Roadmap. |
| **Cybersecurity Foundations** | `not-started` | **0%** | Planned on Roadmap. |
| **AI / Machine Learning** | `not-started` | **0%** | Planned on Roadmap. |
| **Generative AI & LLM Systems** | `not-started` | **0%** | Planned on Roadmap. |

> **Single Source of Truth Rule:**
> `Git & GitHub` is the **only** skill currently marked `in-progress` (89%). All other 15 skills must remain `not-started` (0%) on public pages until explicitly changed by the developer via the Admin CMS.

---

## 4. Key Architectural Decisions (DO NOT REVERSE)

1. **Decoupled Skill Progress from Status**:
   - `Skill` has separate `status` (`SkillStatus` enum) and `progress: number` (0–100). A skill is only "completed" when explicitly marked completed in Admin.
2. **Hero-Only Liquid Cursor**:
   - The custom liquid cursor must only activate when the homepage (`/`) hero section is visible.
   - It is controlled via the scoped `.hero-cursor-active` class.
   - Global `cursor: none` is strictly forbidden to ensure standard mouse pointer visibility across all secondary pages (`/about`, `/roadmap`, `/skills`, `/projects`, `/journey`, `/contact`, `/admin/*`).
3. **Shared Public Page Shell**:
   - All secondary pages must use `<PublicPageShell>` and `.public-page-header` with an inner `.container`.
   - Never use arbitrary inline margins (`pt-24`) that collide with the fixed navbar (~76–80px).
4. **Single-Admin CMS Scope**:
   - Public user registration/signup is deliberately disabled.
   - Only the authorized portfolio owner possesses an admin account.
   - Do not implement public registration or password reset workflows without explicit instructions.
5. **Cookie-Based JWT Delivery**:
   - JWT tokens are never returned in JSON payloads and never stored in `localStorage` or `sessionStorage`.
   - All protected routes read JWT exclusively from the secure HTTP-only `token` cookie.
6. **Resume Versioning & Fallback**:
   - Only one resume is flagged `isCurrent: true`. Uploading a new version archives the older version.
   - If no resume is published, the Navbar and Hero buttons are safely omitted rather than pointing to broken links.

---

## 5. Known Rules & Constraints

- **No Fake Skills**: Never mark HTML, CSS, JavaScript, or Linux as completed unless explicitly updated from Admin.
- **Roadmap ≠ Completed Skills**: The 17-Phase Roadmap represents the strategic learning trajectory, not completed coursework.
- **Published Content Only on Public Routes**: Draft entries in `Project`, `JourneyEntry`, `Update`, `Skill`, and `Resume` must never leak into public API projections.
- **Server-Side Authorization**: Never trust client-supplied roles or headers. The backend `authMiddleware` validates cookie authenticity on every mutating request.
- **Never Commit Secrets**: No raw passwords, JWT secrets, MongoDB credentials, or production API keys in repository files or memory documents.

---

## 6. Security Advisory Notes

- **Admin Credential Rotation Required**: Prior to production deployment, update default development admin passwords and rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`.
- **Production Media Provider**: For production scale, transition from local disk storage (`LocalStorageProvider`) to an S3 or Cloudinary provider with pre-signed upload URLs.
