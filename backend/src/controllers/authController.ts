import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken, setAuthCookie, clearAuthCookie, AuthRequest } from "../middleware/auth";
import { logAudit } from "../lib/audit";

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // req.body already validated by Zod middleware (LoginSchema)
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await logAudit({
        event: "LOGIN_FAILURE",
        resourceType: "Auth",
        resourceTitle: "Authentication",
        actor: "Anonymous",
        result: "FAILED",
        metadata: { reason: "User not found", ip: req.ip },
      });
      // Don't reveal whether the email exists
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAudit({
        event: "LOGIN_FAILURE",
        resourceType: "Auth",
        resourceTitle: "Authentication",
        actor: user.name || "Admin",
        result: "FAILED",
        metadata: { reason: "Password mismatch", ip: req.ip },
      });
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(String(user._id));
    setAuthCookie(res, token);

    await logAudit({
      event: "LOGIN_SUCCESS",
      resourceType: "Auth",
      resourceTitle: "Admin Session",
      actor: user.name || "Admin",
      result: "SUCCESS",
      metadata: { ip: req.ip },
    });

    res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  await logAudit({
    event: "LOGOUT",
    resourceType: "Auth",
    resourceTitle: "Admin Session",
    actor: "Admin",
    result: "SUCCESS",
  });
  res.json({ success: true, message: "Logged out" });
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = req.user!;
  res.json({
    success: true,
    user: { id: user._id, email: user.email, name: user.name, role: user.role, lastLogin: user.lastLogin },
  });
}
