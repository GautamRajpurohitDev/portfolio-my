import { Request, Response } from "express";
import { Resume } from "../models/Resume";
import { Settings } from "../models/Settings";

// GET /api/resume (Public)
export async function getPublicResume(_req: Request, res: Response): Promise<void> {
  try {
    const current = await Resume.findOne({ isCurrent: true, published: true });
    if (!current) {
      // Fallback check settings.resume
      const settings = await Settings.findOne({});
      if (settings?.resume?.published && settings.resume.fileUrl) {
        res.json({ success: true, data: settings.resume });
        return;
      }
      res.json({ success: true, data: null });
      return;
    }
    res.json({ success: true, data: current });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/resume/all (Admin)
export async function getAllResumes(_req: Request, res: Response): Promise<void> {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/resume (Admin)
export async function createResume(req: Request, res: Response): Promise<void> {
  try {
    const { fileUrl, fileName, version, published = true, isCurrent = true, fileSize = 0, label = "View Resume", notes = "" } = req.body;

    if (isCurrent) {
      // Archive other versions as not current
      await Resume.updateMany({ isCurrent: true }, { $set: { isCurrent: false } });
    }

    const newResume = await Resume.create({
      fileUrl,
      fileName,
      version: version || "1.0",
      uploadedAt: new Date(),
      published,
      isCurrent,
      fileSize,
      label,
      notes,
    });

    if (isCurrent) {
      await Settings.findOneAndUpdate(
        {},
        {
          $set: {
            "resume.fileUrl": fileUrl,
            "resume.fileName": fileName,
            "resume.version": version || "1.0",
            "resume.uploadedAt": new Date(),
            "resume.published": published,
            "resume.isCurrent": true,
            "resume.fileSize": fileSize,
            "resume.label": label,
          },
        },
        { upsert: true }
      );
    }

    res.status(201).json({ success: true, data: newResume });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// PUT /api/resume/:id (Admin)
export async function updateResume(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.isCurrent) {
      await Resume.updateMany({ _id: { $ne: id }, isCurrent: true }, { $set: { isCurrent: false } });
    }

    const updated = await Resume.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Resume not found" });
      return;
    }

    if (updated.isCurrent) {
      await Settings.findOneAndUpdate(
        {},
        {
          $set: {
            "resume.fileUrl": updated.fileUrl,
            "resume.fileName": updated.fileName,
            "resume.version": updated.version,
            "resume.uploadedAt": updated.uploadedAt,
            "resume.published": updated.published,
            "resume.isCurrent": true,
            "resume.fileSize": updated.fileSize,
            "resume.label": updated.label,
          },
        }
      );
    }

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// DELETE /api/resume/:id (Admin)
export async function deleteResume(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resume = await Resume.findByIdAndDelete(id);
    if (!resume) {
      res.status(404).json({ success: false, message: "Resume not found" });
      return;
    }

    if (resume.isCurrent) {
      // Find latest remaining resume if any
      const latest = await Resume.findOne().sort({ createdAt: -1 });
      if (latest) {
        latest.isCurrent = true;
        await latest.save();
        await Settings.findOneAndUpdate(
          {},
          {
            $set: {
              "resume.fileUrl": latest.fileUrl,
              "resume.fileName": latest.fileName,
              "resume.version": latest.version,
              "resume.uploadedAt": latest.uploadedAt,
              "resume.published": latest.published,
              "resume.isCurrent": true,
              "resume.fileSize": latest.fileSize,
              "resume.label": latest.label,
            },
          }
        );
      } else {
        await Settings.findOneAndUpdate(
          {},
          {
            $set: {
              "resume.fileUrl": "",
              "resume.fileName": "",
              "resume.published": false,
              "resume.isCurrent": false,
            },
          }
        );
      }
    }

    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
