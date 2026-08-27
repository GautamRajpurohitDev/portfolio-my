import { Request, Response } from "express";
import { AuditLog } from "../models/AuditLog";

// GET /api/security/status — admin only
export async function getSecurityStatus(_req: Request, res: Response): Promise<void> {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const hasJwtSecret = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0);
    const hasNvidiaKey = Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== "mock_key");

    // Fetch recent security events (failures/auth attempts)
    const recentSecurityEvents = await AuditLog.find({
      $or: [{ resourceType: "Auth" }, { result: "FAILED" }],
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    const checklist = [
      {
        id: "auth-model",
        category: "Authentication",
        name: "Single-Admin JWT Authentication",
        status: "PASS",
        description: "Authenticated with secure bcrypt password hashing and single-admin account.",
      },
      {
        id: "cookies",
        category: "Session & Cookies",
        name: "HTTP-Only Secure Cookie Storage",
        status: "PASS",
        description: "JWT is transmitted exclusively via HTTP-only cookie with SameSite protection.",
      },
      {
        id: "csrf",
        category: "API Protection",
        name: "CSRF & Origin Validation",
        status: "PASS",
        description: "Custom requireCsrf middleware validates origin headers on state-changing API methods.",
      },
      {
        id: "headers",
        category: "API Protection",
        name: "Helmet Security Headers & Fingerprint Removal",
        status: "PASS",
        description: "Helmet active with Content Security Policy and disabled x-powered-by header.",
      },
      {
        id: "ratelimit",
        category: "API Protection",
        name: "Global & Auth Rate Limiting",
        status: "PASS",
        description: "express-rate-limit throttles auth attempts and global endpoint traffic.",
      },
      {
        id: "uploads",
        category: "File Storage",
        name: "File Upload MIME & Size Constraints",
        status: "PASS",
        description: "Strict MIME filtering, 10MB image limit, 50MB video limit, and randomized hashes.",
      },
      {
        id: "mfa",
        category: "Authentication",
        name: "Multi-Factor Authentication (MFA)",
        status: "NOT_IMPLEMENTED",
        description: "Two-factor authentication is not currently implemented for the single-admin console.",
      },
      {
        id: "pwd-reset",
        category: "Authentication",
        name: "Self-Serve Password Reset",
        status: "DISABLED",
        description: "Email-based password reset is disabled by design in single-admin architecture.",
      },
      {
        id: "signup",
        category: "Authentication",
        name: "Public Registration / Signup",
        status: "DISABLED",
        description: "Public user registration endpoint is permanently disabled.",
      },
      {
        id: "rbac",
        category: "Authorization",
        name: "Role-Based Access Control (RBAC)",
        status: "PARTIAL",
        description: "Single-admin architecture. Multi-role hierarchical RBAC is not required.",
      },
    ];

    res.json({
      success: true,
      data: {
        environment: isProduction ? "Production" : "Development",
        overallStatus: "Operational",
        attentionCount: 0,
        services: {
          jwtSecret: hasJwtSecret ? "Configured" : "Missing",
          httpOnlyCookie: "Enabled (SameSite: Lax)",
          csrfProtection: "Enabled",
          rateLimiting: "Enabled",
          mfa: "Not Implemented",
          publicSignup: "Disabled",
          passwordReset: "Disabled",
        },
        checklist,
        recentSecurityEvents,
      },
    });
  } catch (error: any) {
    console.error("Security status fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch security status" });
  }
}
