import { Router } from "express";
import {
  getPublicSkills, getAllSkills, createSkill, updateSkill, deleteSkill,
  getPublicCertificates, getAllCertificates, createCertificate, updateCertificate, deleteCertificate,
  getPublicMilestones, getAllMilestones, createMilestone, updateMilestone, deleteMilestone,
  getPublicUpdates, getAllUpdates, getUpdateBySlug, createUpdate, updateUpdate, deleteUpdate,
  getSettings, getAdminSettings, updateSettings,
} from "../controllers/contentController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  SkillSchema, SkillUpdateSchema,
  CertificateSchema, CertificateUpdateSchema,
  MilestoneSchema, MilestoneUpdateSchema,
  UpdateSchema, UpdateUpdateSchema,
  SettingsSchema,
} from "../lib/validation";

const router = Router();

// ── SKILLS ────────────────────────────────────────────────────
router.get("/skills",         getPublicSkills);
router.get("/skills/all",     authenticate, getAllSkills);
router.post("/skills",        authenticate, validate(SkillSchema),       createSkill);
router.put("/skills/:id",     authenticate, validate(SkillUpdateSchema), updateSkill);
router.delete("/skills/:id",  authenticate, deleteSkill);

// ── CERTIFICATES ──────────────────────────────────────────────
router.get("/certificates",        getPublicCertificates);
router.get("/certificates/all",    authenticate, getAllCertificates);
router.post("/certificates",       authenticate, validate(CertificateSchema),       createCertificate);
router.put("/certificates/:id",    authenticate, validate(CertificateUpdateSchema), updateCertificate);
router.delete("/certificates/:id", authenticate, deleteCertificate);

// ── MILESTONES ────────────────────────────────────────────────
router.get("/milestones",        getPublicMilestones);
router.get("/milestones/all",    authenticate, getAllMilestones);
router.post("/milestones",       authenticate, validate(MilestoneSchema),       createMilestone);
router.put("/milestones/:id",    authenticate, validate(MilestoneUpdateSchema), updateMilestone);
router.delete("/milestones/:id", authenticate, deleteMilestone);

// ── UPDATES ───────────────────────────────────────────────────
router.get("/updates",          getPublicUpdates);
router.get("/updates/all",      authenticate, getAllUpdates);
router.get("/updates/:slug",    getUpdateBySlug);
router.post("/updates",         authenticate, validate(UpdateSchema),       createUpdate);
router.put("/updates/:id",      authenticate, validate(UpdateUpdateSchema), updateUpdate);
router.delete("/updates/:id",   authenticate, deleteUpdate);

// ── SETTINGS / PORTFOLIO CONFIG ──────────────────────────────
router.get("/settings",        getSettings);                                        // public
router.get("/settings/admin",  authenticate, getAdminSettings);                    // full admin
router.put("/settings",        authenticate, validate(SettingsSchema), updateSettings);

export default router;
