import { Router } from "express";
import { getDashboardOverview } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = Router();

// ── ADMIN ONLY ────────────────────────────────────────────────
router.get("/overview", authenticate, getDashboardOverview);

export default router;
