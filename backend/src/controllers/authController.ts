import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken, setAuthCookie, clearAuthCookie, AuthRequest } from "../middleware/auth";

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // req.body already validated by Zod middleware (LoginSchema)
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether the email exists
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(String(user._id));
    setAuthCookie(res, token);

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
export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
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
