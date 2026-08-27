# Gautam Rajpurohit — Developer Portfolio & Editorial CMS

> A high-performance, editorial software engineering portfolio and custom content management system built with Next.js 16 (React 19), Express, TypeScript, MongoDB Atlas, and an integrated NVIDIA-powered AI assistant.

---

## 🏛️ System Architecture

```text
portfolio-my/
│
├── README.md               # Project overview, quickstart & documentation map
├── Architecture.md         # Full technical specifications & data flow architecture
├── Phases.md               # Development roadmap, milestones & changelog
├── memory.md               # Architectural decisions, UI tokens & persistent knowledge
├── SECURITY_AUDIT.md       # Security controls, auth verification & hardening checklists
├── workflow.txt            # System workflows & operational notes
├── .gitignore              # Repository-wide gitignore protection
│
├── backend/                # Express 4 + TypeScript REST API Server (Port 4000)
│   ├── src/
│   │   ├── controllers/    # Route controllers (Auth, Projects, Journey, Content, Chat, etc.)
│   │   ├── middleware/     # Auth verification (JWT), validation (Zod), upload (Multer)
│   │   ├── models/         # Mongoose schemas (User, Project, Journey, Roadmap, etc.)
│   │   ├── routes/         # Express API routers
│   │   ├── lib/            # DB connection, validation schemas, LLM retrieval
│   │   ├── scripts/        # Database seed & migration utilities
│   │   └── index.ts        # Server entry point
│   ├── public/             # Static file storage & uploads
│   ├── .env.example        # Backend environment variable template
│   ├── .gitignore          # Backend ignore rules
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/               # Next.js 16 + React 19 Client & Admin (Port 3000)
    ├── src/
    │   ├── app/            # App Router ((public) visitor shell + /admin CMS)
    │   ├── components/     # UI design system, portfolio sections, theme toggles, cursor
    │   ├── context/        # React contexts (AuthContext, ThemeContext)
    │   ├── lib/            # Utility functions, API clients, motion variants
    │   └── types/          # TypeScript interfaces
    ├── public/             # Static assets, fonts, icons
    ├── .gitignore          # Frontend ignore rules
    ├── package.json
    ├── next.config.ts
    └── tsconfig.json
```

---

## ✨ Features

- **Editorial UI Design System:** Custom typography (Clash Grotesk, Inter, JetBrains Mono) with structured spacing, technical metadata badges, and refined micro-interactions.
- **Dual Theme System:** Default Black / Dark theme with an alternate Warm-White / Light theme, featuring an origin-centered **1200ms circular expand transition** powered by the View Transitions API.
- **Interactive Liquid Cursor:** Physics-driven hero cursor with fluid ring displacement and dynamic contrast adaptation across dark and light modes.
- **Ask Gautam AI Assistant:** Native homepage conversational assistant powered by NVIDIA NIM (`nvidia/nemotron-3-ultra-550b-a55b`) with grounded knowledge retrieval and fast-path rule answers.
- **Full Headless Admin CMS:** Protected console (`/admin`) for managing Projects, Learning Roadmap, Milestones, Daily Journey logs, Certificates, Media, and site settings.
- **Enterprise Security:** HTTP-Only secure JWT cookies, bcrypt password hashing, CSRF origin verification, rate-limiting, and sanitized input validation via Zod.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18+ (Node 20 recommended)
- MongoDB instance (local or MongoDB Atlas connection string)
- NVIDIA NIM API key (for the AI Chatbot)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET, NVIDIA_API_KEY, etc.

# Seed initial admin account and default settings
npm run seed

# Start development server
npm run dev
# Server runs at http://localhost:4000
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install

# Start Next.js development server
npm run dev
# Public site runs at http://localhost:3000
# Admin CMS runs at http://localhost:3000/admin
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 4, TypeScript, Zod, Multer, Helmet, CORS |
| **Database** | MongoDB Atlas, Mongoose 8 ODM |
| **AI / LLM** | NVIDIA NIM API (`nvidia/nemotron-3-ultra-550b-a55b`), OpenAI SDK |
| **Security** | JWT (HTTP-only cookies), bcryptjs, rate-limiting, CSRF origin guards |

---

## 📖 Detailed Documentation

- 📘 [Architecture Specifications](file:///Architecture.md) — Technical system design, collection schemas, and request lifecycles.
- 📋 [Phases & Milestones](file:///Phases.md) — Step-by-step implementation history and roadmap.
- 🧠 [System Memory](file:///memory.md) — Persistent design tokens, context notes, and system rules.
- 🛡️ [Security Audit](file:///SECURITY_AUDIT.md) — Comprehensive security assessment, checklist, and verification.

---

## 📄 License

MIT © [Gautam Rajpurohit](https://gautamrajpurohit.dev)
