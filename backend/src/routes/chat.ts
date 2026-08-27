import { Router } from "express";
import rateLimit from "express-rate-limit";
import { handleChatMessage } from "../controllers/chatController";

const router = Router();

// Rate limiter: 25 requests per 15 minutes per IP
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 25 : 500,
  message: {
    success: false,
    message: "You have reached the chat rate limit. Please try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/chat
router.post("/", chatLimiter, handleChatMessage);

export default router;
