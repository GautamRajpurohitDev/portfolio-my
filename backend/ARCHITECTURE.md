# Backend Architecture Explanation

## What was built and WHY each piece exists

---

## Directory Structure

```
backend/src/
├── index.ts                  ← Entry point: starts Express, connects DB
├── lib/
│   ├── db.ts                 ← MongoDB singleton connection
│   └── validation.ts         ← All Zod schemas (one per resource)
├── middleware/
│   ├── auth.ts               ← JWT: read cookie → verify → attach user to req
│   └── validate.ts           ← Zod: parse req.body → reject or clean data
├── models/
│   ├── User.ts               ← Admin user (email + bcrypt password)
│   ├── Project.ts            ← Project with auto-slug on save
│   ├── JourneyEntry.ts       ← Daily learning log entries
│   ├── Skill.ts              ← Skills with category/status
│   ├── Certificate.ts        ← Certifications earned
│   ├── Milestone.ts          ← Progress milestones
│   ├── Update.ts             ← Build log posts
│   └── Settings.ts           ← Site-wide settings (singleton)
├── controllers/
│   ├── authController.ts     ← login, logout, getMe
│   ├── projectsController.ts ← CRUD for Projects
│   ├── journeyController.ts  ← CRUD for Journey Entries
│   ├── skillsController.ts   ← CRUD for Skills
│   └── contentController.ts  ← CRUD for Certs, Milestones, Updates, Settings
├── routes/
│   ├── auth.ts               ← POST /api/auth/login|logout, GET /api/auth/me
│   ├── projects.ts           ← GET|POST|PUT|DELETE /api/projects
│   ├── journey.ts            ← GET|POST|PUT|DELETE /api/journey
│   └── content.ts            ← All other resources
└── scripts/
    └── seed.ts               ← One-time setup: admin user + default settings
```

---

## How a Request Flows (Example: POST /api/projects)

```
Browser / Postman
      │
      ▼
[Express Rate Limiter]        ← Rejects if too many requests
      │
      ▼
[Helmet]                      ← Sets secure HTTP headers
      │
      ▼
[CORS]                        ← Only allows requests from localhost:3000
      │
      ▼
[Cookie Parser]               ← Makes req.cookies available
      │
      ▼
[authenticate middleware]     ← Reads "token" cookie
      │                         Verifies JWT signature
      │                         Finds user in MongoDB
      │                         Attaches user to req.user
      │                         → 401 if invalid/missing
      ▼
[validate(ProjectSchema)]     ← Runs Zod schema against req.body
      │                         Coerces types (e.g. "true" → true)
      │                         Fills in default values
      │                         → 400 with field errors if invalid
      ▼
[createProject controller]    ← Creates document in MongoDB
      │                         → 201 with new document
      ▼
Response sent to client
```

---

## Why HTTP-Only Cookies (not localStorage)?

localStorage is readable by any JavaScript on the page.
If a third-party script is compromised (XSS attack), it can steal your token.

HTTP-only cookies cannot be read by JavaScript at all —
only the browser sends them automatically with each request.

This is the correct approach for admin authentication.

---

## Why Zod AND Mongoose validation?

Mongoose validates data before saving to the database.
But Mongoose errors are hard to format and return as API responses.

Zod runs BEFORE Mongoose, in the middleware layer.
If Zod rejects the input, the controller never runs, the DB is never touched.
Zod also coerces types (e.g. date strings to Date objects) and fills defaults.

Result: Clean field-level errors returned to the client on any bad request.

---

## Why split models (not one ContentModels.ts)?

One file with 5+ schemas becomes unmaintainable.
When you're editing Skills, you don't want to scroll past Certificate code.
When Git shows a diff, you want "Skill.ts changed", not "ContentModels.ts changed".
It's also more professional — mirrors how real production codebases are organized.

---

## Before the backend is "done", you must do this

### Step 1: Create a real MongoDB database

1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Add your IP to the allowlist (or allow all: 0.0.0.0/0 for dev)
5. Click "Connect" → "Connect your application" → copy the URI
6. Paste the URI into backend/.env as MONGODB_URI=...
7. Replace <user> and <password> in the URI with your actual credentials

### Step 2: Change the admin password

In backend/.env:
  ADMIN_EMAIL=admin@gautam.dev
  ADMIN_PASSWORD=choose_a_strong_password_you_will_remember

### Step 3: Run the seed script

  cd backend
  npm run seed

Expected output:
  ✓ MongoDB connected: cluster0.xxxxx.mongodb.net
  ✓ Admin user created: admin@gautam.dev
  ✓ Default settings seeded
  ✅ Seed complete. You can now start the server.

### Step 4: Start the backend

  npm run dev

Expected output:
  🚀 Backend running → http://localhost:4000
     Environment: development
     Frontend:    http://localhost:3000

### Step 5: Test each of these with curl or Postman/Bruno

1. Health check:
   GET http://localhost:4000/api/health
   → should return { success: true, message: "..." }

2. Login (correct credentials):
   POST http://localhost:4000/api/auth/login
   Body: { "email": "admin@gautam.dev", "password": "your_password" }
   → should return { success: true, user: {...} } and set a cookie

3. Login (wrong password) — security test:
   POST http://localhost:4000/api/auth/login
   Body: { "email": "admin@gautam.dev", "password": "wrongpassword" }
   → must return 401, NOT 500

4. Get me (authenticated):
   GET http://localhost:4000/api/auth/me
   (with the cookie from step 2)
   → should return your user data

5. Get me (no cookie) — security test:
   GET http://localhost:4000/api/auth/me
   (without cookie)
   → must return 401 Not authenticated

6. Create a project (authenticated):
   POST http://localhost:4000/api/projects
   Body: {
     "title": "Test Project",
     "shortDescription": "A test project to verify the API works."
   }
   → should return 201 with the created project and auto-generated slug

7. Read published projects (public):
   GET http://localhost:4000/api/projects
   → returns [] because published is false by default

8. Read all projects (admin):
   GET http://localhost:4000/api/projects/all
   (with cookie)
   → returns the project you just created

9. Update the project:
   PUT http://localhost:4000/api/projects/<id from step 6>
   Body: { "published": true, "status": "in-progress" }
   → returns updated project

10. Read published projects again:
    GET http://localhost:4000/api/projects
    → now returns the project (it is published now)

11. Delete the project:
    DELETE http://localhost:4000/api/projects/<id>
    (with cookie)
    → returns { success: true, message: "Project deleted" }

12. Validation test — send bad data:
    POST http://localhost:4000/api/projects
    Body: { "title": "" }
    → must return 400 with "Title is required" in errors array

13. Protected route without auth:
    DELETE http://localhost:4000/api/projects/<any id>
    (WITHOUT cookie)
    → must return 401

If all 13 tests pass, the backend is working correctly.

---

## Recommended tool for API testing

Use Bruno (https://www.usebruno.com/) — free, open source, works offline.
Or Postman (https://postman.com) — more popular, requires account.

Both let you save a "collection" of requests and run them in order.
This is more useful than curl for development and debugging.
