import { Request, Response } from "express";
import { RoadmapPhase } from "../models/RoadmapPhase";
import { RoadmapDomain } from "../models/RoadmapDomain";
import { RoadmapTopic } from "../models/RoadmapTopic";
import { RoadmapTask } from "../models/RoadmapTask";
import { Settings } from "../models/Settings";

// ── HELPER ────────────────────────────────────────────────────

function err(res: Response, status: number, message: string) {
  res.status(status).json({ success: false, message });
}

// ── PUBLIC SUMMARY ────────────────────────────────────────────
// Returns phases + domains (no tasks) — used by /roadmap public page

export async function getPublicRoadmap(_req: Request, res: Response): Promise<void> {
  try {
    const phases = await RoadmapPhase.find({ published: true })
      .sort({ order: 1, number: 1 })
      .select("-__v");

    const phaseIds = phases.map((p) => p._id);

    const domains = await RoadmapDomain.find({ phase: { $in: phaseIds }, published: true })
      .sort({ order: 1 })
      .populate("dependencies", "title _id")
      .select("-__v");

    const topics = await RoadmapTopic.find({ phase: { $in: phaseIds }, published: true })
      .sort({ order: 1 })
      .select("domain phase title status progress subtopics order");

    res.json({ success: true, data: { phases, domains, topics } });
  } catch (e: any) {
    console.error("[roadmap:getPublicRoadmap]", e?.message, e);
    err(res, 500, "Server error");
  }
}

// ── PUBLIC CURRENT FOCUS ──────────────────────────────────────
// Returns the currently in-progress phase + its domains
// Used by homepage to auto-sync without duplicating data in Settings

export async function getCurrentFocus(_req: Request, res: Response): Promise<void> {
  try {
    const settingsDoc = await Settings.findOne({});
    const cl = settingsDoc?.currentlyLearning;

    let phase: any = null;

    // 1. Explicit reference from Settings
    if (cl?.currentLearningPhaseId) {
      try {
        phase = await RoadmapPhase.findById(cl.currentLearningPhaseId).select("-__v");
      } catch { /* ignore invalid id */ }
    }

    // 2. Fallback: Prioritize explicitly in-progress phase
    if (!phase) {
      phase = await RoadmapPhase.findOne({ status: "in-progress", published: true })
        .sort({ order: 1, number: 1 })
        .select("-__v");
    }

    // 3. Fallback: check practicing, review, up-next
    if (!phase) {
      phase = await RoadmapPhase.findOne({
        status: { $in: ["practicing", "review", "up-next"] },
        published: true,
      })
        .sort({ order: 1, number: 1 })
        .select("-__v");
    }

    // 4. Fallback: get the first published phase
    if (!phase) {
      phase = await RoadmapPhase.findOne({ published: true })
        .sort({ order: 1, number: 1 })
        .select("-__v");
    }

    if (!phase) {
      res.json({ success: true, data: null });
      return;
    }

    const domains = await RoadmapDomain.find({ phase: phase._id, published: true })
      .sort({ order: 1 })
      .select("title status progress description");

    // Find "up-next" phase for the homepage banner
    let nextPhase: any = null;
    if (cl?.nextPhaseId) {
      try {
        nextPhase = await RoadmapPhase.findById(cl.nextPhaseId).select("title number subtitle");
      } catch { /* ignore invalid id */ }
    }
    if (!nextPhase) {
      nextPhase = await RoadmapPhase.findOne({
        published: true,
        order: { $gt: phase.order },
      })
        .sort({ order: 1, number: 1 })
        .select("title number subtitle");
    }

    res.json({
      success: true,
      data: {
        phase,
        domains,
        upNext: nextPhase ? nextPhase.title : (cl?.next || null),
      },
    });
  } catch (e: any) {
    console.error("[roadmap:getCurrentFocus]", e?.message, e);
    err(res, 500, "Server error");
  }
}

// ── ADMIN FULL TREE ───────────────────────────────────────────

export async function getAdminRoadmap(_req: Request, res: Response): Promise<void> {
  try {
    const phases  = await RoadmapPhase.find({}).sort({ order: 1, number: 1 }).select("-__v");
    const domains = await RoadmapDomain.find({}).sort({ order: 1 })
      .populate("dependencies", "title _id")
      .select("-__v");
    const topics  = await RoadmapTopic.find({}).sort({ order: 1 }).select("-__v");
    const tasks   = await RoadmapTask.find({}).sort({ order: 1 })
      .populate("linkedProject",   "title slug _id")
      .populate("linkedMilestone", "title _id")
      .select("-__v");

    res.json({ success: true, data: { phases, domains, topics, tasks } });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── PHASES — PUBLIC ───────────────────────────────────────────

export async function getPublicPhases(_req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapPhase.find({ published: true }).sort({ order: 1, number: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── PHASES — ADMIN ────────────────────────────────────────────

export async function getAllPhases(_req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapPhase.find({}).sort({ order: 1, number: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

export async function createPhase(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapPhase.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function updatePhase(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapPhase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { err(res, 404, "Phase not found"); return; }
    res.json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function deletePhase(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapPhase.findByIdAndDelete(req.params.id);
    if (!data) { err(res, 404, "Phase not found"); return; }
    // Cascade delete children
    const domains = await RoadmapDomain.find({ phase: req.params.id }).select("_id");
    const domainIds = domains.map((d) => d._id);
    await RoadmapTopic.deleteMany({ domain: { $in: domainIds } });
    await RoadmapTask.deleteMany({ domain: { $in: domainIds } });
    await RoadmapDomain.deleteMany({ phase: req.params.id });
    res.json({ success: true, message: "Phase and all children deleted" });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── DOMAINS — PUBLIC ──────────────────────────────────────────

export async function getPublicDomains(req: Request, res: Response): Promise<void> {
  try {
    const filter: Record<string, unknown> = { published: true };
    if (req.query.phase) filter.phase = req.query.phase;
    const data = await RoadmapDomain.find(filter)
      .sort({ order: 1 })
      .populate("dependencies", "title _id")
      .select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── DOMAINS — ADMIN ───────────────────────────────────────────

export async function getAllDomains(req: Request, res: Response): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.phase) filter.phase = req.query.phase;
    const data = await RoadmapDomain.find(filter)
      .sort({ order: 1 })
      .populate("dependencies", "title _id")
      .populate("phase", "title number _id")
      .select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

export async function createDomain(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapDomain.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function updateDomain(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapDomain.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { err(res, 404, "Domain not found"); return; }
    res.json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function deleteDomain(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapDomain.findByIdAndDelete(req.params.id);
    if (!data) { err(res, 404, "Domain not found"); return; }
    await RoadmapTopic.deleteMany({ domain: req.params.id });
    await RoadmapTask.deleteMany({ domain: req.params.id });
    res.json({ success: true, message: "Domain and all children deleted" });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── TOPICS — PUBLIC ───────────────────────────────────────────

export async function getPublicTopics(req: Request, res: Response): Promise<void> {
  try {
    const filter: Record<string, unknown> = { published: true };
    if (req.query.domain) filter.domain = req.query.domain;
    if (req.query.phase)  filter.phase  = req.query.phase;
    const data = await RoadmapTopic.find(filter).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── TOPICS — ADMIN ────────────────────────────────────────────

export async function getAllTopics(req: Request, res: Response): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.domain) filter.domain = req.query.domain;
    if (req.query.phase)  filter.phase  = req.query.phase;
    const data = await RoadmapTopic.find(filter)
      .sort({ order: 1 })
      .populate("domain", "title _id")
      .populate("phase",  "title number _id")
      .select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

export async function createTopic(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapTopic.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function updateTopic(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapTopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { err(res, 404, "Topic not found"); return; }
    res.json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function deleteTopic(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapTopic.findByIdAndDelete(req.params.id);
    if (!data) { err(res, 404, "Topic not found"); return; }
    await RoadmapTask.deleteMany({ topic: req.params.id });
    res.json({ success: true, message: "Topic and tasks deleted" });
  } catch {
    err(res, 500, "Server error");
  }
}

// ── TASKS — ADMIN ONLY ────────────────────────────────────────

export async function getAllTasks(req: Request, res: Response): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.topic)  filter.topic  = req.query.topic;
    if (req.query.domain) filter.domain = req.query.domain;
    if (req.query.phase)  filter.phase  = req.query.phase;
    const data = await RoadmapTask.find(filter)
      .sort({ order: 1 })
      .populate("linkedProject",   "title slug _id")
      .populate("linkedMilestone", "title _id")
      .select("-__v");
    res.json({ success: true, data });
  } catch {
    err(res, 500, "Server error");
  }
}

export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapTask.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapTask.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { err(res, 404, "Task not found"); return; }
    res.json({ success: true, data });
  } catch (e: any) {
    err(res, 400, e.message);
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const data = await RoadmapTask.findByIdAndDelete(req.params.id);
    if (!data) { err(res, 404, "Task not found"); return; }
    res.json({ success: true, message: "Task deleted" });
  } catch {
    err(res, 500, "Server error");
  }
}
