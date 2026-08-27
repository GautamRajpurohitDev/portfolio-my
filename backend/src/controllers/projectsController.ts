import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Revision } from "../models/Revision";
import { logAudit } from "../lib/audit";

// GET /api/projects — public, published only
export async function getPublicProjects(_req: Request, res: Response): Promise<void> {
  try {
    const projects = await Project.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/projects/all — admin, all including drafts
export async function getAllProjects(_req: Request, res: Response): Promise<void> {
  try {
    const projects = await Project.find({}).sort({ order: 1, createdAt: -1 }).select("-__v");
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/projects/admin/:id — admin, single project with draft support
export async function getAdminProjectById(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.findById(req.params.id).select("-__v");
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }
    
    // Check for draft if requested
    if (req.query.draft === "true") {
      const draft = await Revision.findOne({ entityId: req.params.id, entityType: "Project", status: "draft" });
      if (draft && draft.snapshot) {
        res.json({ success: true, data: { ...project.toObject(), ...draft.snapshot, _isDraft: true } });
        return;
      }
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/projects/:slug — public, by slug
export async function getProjectBySlug(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true });
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/projects — admin only
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.create(req.body);
    await logAudit({
      event: "PROJECT_CREATED",
      resourceType: "Project",
      resourceId: String(project._id),
      resourceTitle: project.title,
      result: "SUCCESS",
      metadata: { published: project.published },
    });
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    await logAudit({
      event: "PROJECT_CREATED",
      resourceType: "Project",
      resourceTitle: req.body?.title || "Untitled Project",
      result: "FAILED",
      metadata: { error: error.message },
    });
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "A project with this slug already exists" });
      return;
    }
    res.status(400).json({ success: false, message: error.message || "Validation error" });
  }
}

// PUT /api/projects/:id — admin only
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const action = req.query.action as string;

    if (action === "draft") {
      await Revision.findOneAndUpdate(
        { entityId: req.params.id, entityType: "Project", status: "draft" },
        { snapshot: req.body },
      );
      await logAudit({
        event: "PROJECT_DRAFT_SAVED",
        resourceType: "Project",
        resourceId: String(req.params.id),
        resourceTitle: req.body?.title,
        result: "SUCCESS",
      });
      res.json({ success: true, message: "Draft saved successfully" });
      return;
    }

    if (action === "publish") {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!project) {
        res.status(404).json({ success: false, message: "Project not found" });
        return;
      }
      
      await Revision.create({
        entityId: String(req.params.id),
        entityType: "Project",
        status: "published",
        snapshot: req.body
      });

      await Revision.findOneAndDelete({ entityId: req.params.id, entityType: "Project", status: "draft" });
      
      await logAudit({
        event: project.published ? "PROJECT_PUBLISHED" : "PROJECT_UNPUBLISHED",
        resourceType: "Project",
        resourceId: String(project._id),
        resourceTitle: project.title,
        result: "SUCCESS",
        metadata: { published: project.published },
      });

      res.json({ success: true, data: project });
      return;
    }

    // Default legacy update
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    await logAudit({
      event: "PROJECT_UPDATED",
      resourceType: "Project",
      resourceId: String(project._id),
      resourceTitle: project.title,
      result: "SUCCESS",
    });

    res.json({ success: true, data: project });
  } catch (error: any) {
    await logAudit({
      event: "PROJECT_UPDATED",
      resourceType: "Project",
      resourceId: String(req.params.id),
      result: "FAILED",
      metadata: { error: error.message },
    });
    res.status(400).json({ success: false, message: error.message || "Update failed" });
  }
}

// DELETE /api/projects/:id — admin only
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    await logAudit({
      event: "PROJECT_DELETED",
      resourceType: "Project",
      resourceId: String(project._id),
      resourceTitle: project.title,
      result: "SUCCESS",
    });

    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}
