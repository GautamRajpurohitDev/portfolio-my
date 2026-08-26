import { Router } from "express";
import { login, logout, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { LoginSchema } from "../lib/validation";

const router = Router();

// POST /api/auth/login — validate body before controller runs
router.post("/login",  validate(LoginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me",      authenticate, getMe);

export default router;
