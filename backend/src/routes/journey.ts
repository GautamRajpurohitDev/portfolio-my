import { Router } from "express";
import {
  getPublicJourney, getAllJourney, getJourneyById,
  createJourneyEntry, updateJourneyEntry, deleteJourneyEntry,
} from "../controllers/journeyController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { JourneyEntrySchema, JourneyEntryUpdateSchema } from "../lib/validation";

const router = Router();

// ── PUBLIC ────────────────────────────────────────────────────
router.get("/",      getPublicJourney);

// ── ADMIN ─────────────────────────────────────────────────────
// IMPORTANT: /all must be registered BEFORE /:id to prevent Express
// from matching the literal string "all" as the :id parameter.
router.get("/all",    authenticate, getAllJourney);
router.get("/:id",   getJourneyById);
router.post("/",      authenticate, validate(JourneyEntrySchema),       createJourneyEntry);
router.put("/:id",    authenticate, validate(JourneyEntryUpdateSchema), updateJourneyEntry);
router.delete("/:id", authenticate, deleteJourneyEntry);

export default router;
