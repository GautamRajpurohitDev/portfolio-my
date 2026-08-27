import { Router } from "express";
import { getSecurityStatus } from "../controllers/securityController";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/security/status (admin-only)
router.get("/status", authenticate, getSecurityStatus);

export default router;
