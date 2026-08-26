import { Router } from "express";
import {
  getPublicResume,
  getAllResumes,
  createResume,
  updateResume,
  deleteResume,
} from "../controllers/resumeController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ResumeSchema, ResumeUpdateSchema } from "../lib/validation";

const router = Router();

// Public route: get current published resume
router.get("/", getPublicResume);

// Admin routes
router.get("/all", authenticate, getAllResumes);
router.post("/", authenticate, validate(ResumeSchema), createResume);
router.put("/:id", authenticate, validate(ResumeUpdateSchema), updateResume);
router.delete("/:id", authenticate, deleteResume);

export default router;
