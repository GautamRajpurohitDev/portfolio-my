import { Request, Response } from "express";
import { AuditLog } from "../models/AuditLog";

// GET /api/activity — admin only
export async function getActivityLogs(req: Request, res: Response): Promise<void> {
  try {
    const {
      type,
      result,
      search,
      page = "1",
      limit = "25",
    } = req.query as {
      type?: string;
      result?: string;
      search?: string;
      page?: string;
      limit?: string;
    };

    const query: any = {};

    if (type && type !== "all") {
      if (type === "content") {
        query.resourceType = { $in: ["Project", "Journey", "Update", "Skill", "Certificate", "Milestone"] };
      } else if (type === "media") {
        query.resourceType = { $in: ["Media", "Resume"] };
      } else if (type === "auth") {
        query.resourceType = "Auth";
      } else if (type === "settings") {
        query.resourceType = "Settings";
      } else if (type === "security") {
        query.resourceType = { $in: ["Auth", "Security"] };
      }
    }

    if (result && result !== "all") {
      query.result = result.toUpperCase();
    }

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { event: regex },
        { resourceTitle: regex },
        { resourceType: regex },
        { actor: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Activity log fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity logs" });
  }
}
