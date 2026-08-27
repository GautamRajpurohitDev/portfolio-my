import { AuditLog } from "../models/AuditLog";

export interface LogAuditOptions {
  event: string;
  resourceType: "Auth" | "Project" | "Journey" | "Update" | "Skill" | "Certificate" | "Milestone" | "Media" | "Resume" | "Settings" | "Security";
  resourceId?: string;
  resourceTitle?: string;
  actor?: string;
  result?: "SUCCESS" | "FAILED";
  metadata?: Record<string, any>;
}

export async function logAudit(options: LogAuditOptions): Promise<void> {
  try {
    // Sanitize metadata to never store passwords, secrets, or sensitive tokens
    const safeMetadata: Record<string, any> = {};
    if (options.metadata) {
      for (const [key, val] of Object.entries(options.metadata)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("password") ||
          lowerKey.includes("secret") ||
          lowerKey.includes("jwt") ||
          lowerKey.includes("token") ||
          lowerKey.includes("cookie") ||
          lowerKey.includes("auth")
        ) {
          continue; // skip sensitive fields
        }
        safeMetadata[key] = typeof val === "string" ? val.slice(0, 300) : val;
      }
    }

    await AuditLog.create({
      event: options.event,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      resourceTitle: options.resourceTitle,
      actor: options.actor || "Admin",
      result: options.result || "SUCCESS",
      metadata: safeMetadata,
    });
  } catch (error) {
    // Silent fail for non-blocking logging
    console.error("[AuditLog Error]", error);
  }
}
