import { Router } from "express";
import {
  getPublicProjects, getAllProjects, getProjectBySlug,
  createProject, updateProject, deleteProject, getAdminProjectById
} from "../controllers/projectsController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ProjectSchema, ProjectUpdateSchema } from "../lib/validation";

const router = Router();

// ── PUBLIC ────────────────────────────────────────────────────
// GET /api/projects/all   — all including drafts (admin)
// GET /api/projects/:slug — single project by slug
router.get("/",       getPublicProjects);
router.get("/all",       authenticate, getAllProjects);
router.get("/:slug",  getProjectBySlug);

// ── ADMIN (requires valid JWT cookie) ─────────────────────────
// POST /api/projects      — create new
router.get("/admin/:id", authenticate, getAdminProjectById);
router.post("/",         authenticate, validate(ProjectSchema),       createProject);
router.put("/:id",       authenticate, validate(ProjectUpdateSchema), updateProject);
router.delete("/:id",    authenticate, deleteProject);

export default router;
