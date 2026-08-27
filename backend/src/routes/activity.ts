import { Router } from "express";
import { getActivityLogs } from "../controllers/activityController";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/activity (admin-only)
router.get("/", authenticate, getActivityLogs);

export default router;
