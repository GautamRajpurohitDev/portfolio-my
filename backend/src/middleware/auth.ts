import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET environment variable is missing.");
}


export interface AuthRequest extends Request {
  user?: IUser;
}

// ── VERIFY JWT COOKIE ─────────────────────────────────────────

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token as string | undefined;

    if (!token) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again." });
  }
}

// ── CSRF PROTECTION MIDDLEWARE ────────────────────────────────
// Enforces strict Origin checking on state-changing requests
export function requireCsrf(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Allow GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  const expectedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

  if (!origin || !origin.startsWith(expectedOrigin)) {
    res.status(403).json({ success: false, message: "CSRF token mismatch or invalid Origin." });
    return;
  }

  next();
}

// ── GENERATE JWT TOKEN ────────────────────────────────────────

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
}

// ── SET AUTH COOKIE ───────────────────────────────────────────

export function setAuthCookie(res: Response, token: string): void {
  res.cookie("token", token, {
    httpOnly: true,                            // Not accessible via JS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",                        // Prevent CSRF by restricting cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000,           // 7 days
    path: "/",
  });
}

// ── CLEAR AUTH COOKIE ─────────────────────────────────────────

export function clearAuthCookie(res: Response): void {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
