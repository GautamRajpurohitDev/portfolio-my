import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./lib/db";
import authRoutes     from "./routes/auth";
import projectRoutes  from "./routes/projects";
import journeyRoutes  from "./routes/journey";
import contentRoutes  from "./routes/content";
import mediaRoutes    from "./routes/media";
import uploadRoutes   from "./routes/upload";
import dashboardRoutes from "./routes/dashboard";
import roadmapRoutes   from "./routes/roadmap";
import resumeRoutes    from "./routes/resume";
import chatRoutes      from "./routes/chat";
import activityRoutes  from "./routes/activity";
import securityRoutes  from "./routes/security";
import { requireCsrf } from "./middleware/auth";
import path           from "path";
import fs             from "fs";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ── SECURITY MIDDLEWARE ───────────────────────────────────────

app.disable("x-powered-by"); // Hide Express

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"], // Add your image sources
    },
  },
}));

app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,   // Allow cookies
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting — global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000,
  message: { success: false, message: "Too many requests, please slow down." }
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 5000,
  message: { success: false, message: "Too many login attempts, try again later." }
});

app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Apply CSRF protection globally for state-changing routes under /api
app.use("/api", requireCsrf);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

import mongoose from "mongoose";

// Serve uploaded files as static assets
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── HEALTH CHECK ──────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isAiConfigured = Boolean(
    process.env.NVIDIA_API_KEY &&
    process.env.NVIDIA_API_KEY.trim().length > 0 &&
    process.env.NVIDIA_API_KEY !== "mock_key"
  );
  const isMediaAvailable = fs.existsSync(UPLOADS_DIR);
  const isAuthReady = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0);
  const modelName = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

  res.json({
    success: true,
    message: "Gautam Portfolio API is running ✓",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    services: {
      frontend: {
        status: "operational",
        detail: "Next.js 16 Web App",
      },
      api: {
        status: "operational",
        detail: `Express 4 (Port ${PORT})`,
      },
      database: {
        status: isDbConnected ? "connected" : "disconnected",
        detail: isDbConnected ? "MongoDB Atlas (Ready)" : "Database Disconnected",
      },
      auth: {
        status: isAuthReady ? "configured" : "unconfigured",
        detail: isAuthReady ? "JWT Cookie Authentication" : "JWT Secret Missing",
      },
      mediaStorage: {
        status: isMediaAvailable ? "accessible" : "unavailable",
        detail: isMediaAvailable ? "Uploads Storage Ready" : "Uploads Dir Missing",
      },
      nvidiaAi: {
        status: isAiConfigured ? "configured" : "not-configured",
        provider: "NVIDIA",
        model: modelName,
        detail: isAiConfigured ? modelName : "NVIDIA_API_KEY Missing",
      },
    },
    uptime: Math.floor(process.uptime()),
  });
});

// ── API ROUTES ────────────────────────────────────────────────

app.use("/api/auth",     authLimiter, authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/journey",  journeyRoutes);
app.use("/api",          contentRoutes);   // skills, certs, milestones, updates, settings
app.use("/api/upload",   uploadRoutes);    // legacy file upload/delete
app.use("/api/media",    mediaRoutes);     // new media library
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roadmap",   roadmapRoutes);
app.use("/api/resume",    resumeRoutes);
app.use("/api/chat",      chatRoutes);
app.use("/api/activity",  activityRoutes);
app.use("/api/security",  securityRoutes);

app.use("/uploads", express.static(UPLOADS_DIR));

// ── 404 HANDLER ───────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── START ─────────────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend running → http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Frontend:    ${process.env.FRONTEND_URL || "http://localhost:3000"}\n`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
