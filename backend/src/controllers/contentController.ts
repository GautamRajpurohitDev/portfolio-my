import { Request, Response } from "express";
import { Skill } from "../models/Skill";
import { Certificate } from "../models/Certificate";
import { Milestone } from "../models/Milestone";
import { Update } from "../models/Update";
import { Settings } from "../models/Settings";
import { Revision } from "../models/Revision";

// ── SKILLS ────────────────────────────────────────────────────

export async function getPublicSkills(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Skill.find({ published: true }).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function getAllSkills(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Skill.find({}).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function createSkill(req: Request, res: Response): Promise<void> {
  try {
    const data = await Skill.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function updateSkill(req: Request, res: Response): Promise<void> {
  try {
    const data = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { res.status(404).json({ success: false, message: "Skill not found" }); return; }
    res.json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function deleteSkill(req: Request, res: Response): Promise<void> {
  try {
    const data = await Skill.findByIdAndDelete(req.params.id);
    if (!data) { res.status(404).json({ success: false, message: "Skill not found" }); return; }
    res.json({ success: true, message: "Skill deleted" });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

// ── CERTIFICATES ──────────────────────────────────────────────

export async function getPublicCertificates(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Certificate.find({ published: true }).sort({ order: 1, date: -1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function getAllCertificates(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Certificate.find({}).sort({ order: 1, date: -1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function createCertificate(req: Request, res: Response): Promise<void> {
  try {
    const data = await Certificate.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function updateCertificate(req: Request, res: Response): Promise<void> {
  try {
    const data = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { res.status(404).json({ success: false, message: "Certificate not found" }); return; }
    res.json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function deleteCertificate(req: Request, res: Response): Promise<void> {
  try {
    const data = await Certificate.findByIdAndDelete(req.params.id);
    if (!data) { res.status(404).json({ success: false, message: "Certificate not found" }); return; }
    res.json({ success: true, message: "Certificate deleted" });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

// ── MILESTONES ────────────────────────────────────────────────

export async function getPublicMilestones(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Milestone.find({ published: true }).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function getAllMilestones(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Milestone.find({}).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function createMilestone(req: Request, res: Response): Promise<void> {
  try {
    const data = await Milestone.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function updateMilestone(req: Request, res: Response): Promise<void> {
  try {
    const data = await Milestone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { res.status(404).json({ success: false, message: "Milestone not found" }); return; }
    res.json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function deleteMilestone(req: Request, res: Response): Promise<void> {
  try {
    const data = await Milestone.findByIdAndDelete(req.params.id);
    if (!data) { res.status(404).json({ success: false, message: "Milestone not found" }); return; }
    res.json({ success: true, message: "Milestone deleted" });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

// ── UPDATES (BUILD LOG) ───────────────────────────────────────

export async function getPublicUpdates(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Update.find({ published: true }).sort({ date: -1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function getAllUpdates(_req: Request, res: Response): Promise<void> {
  try {
    const data = await Update.find({}).sort({ date: -1 }).select("-__v");
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function getUpdateBySlug(req: Request, res: Response): Promise<void> {
  try {
    const data = await Update.findOne({ slug: req.params.slug, published: true })
      .populate("relatedProject", "title slug");
    if (!data) { res.status(404).json({ success: false, message: "Update not found" }); return; }
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

export async function createUpdate(req: Request, res: Response): Promise<void> {
  try {
    const data = await Update.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "An update with this slug already exists" });
      return;
    }
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateUpdate(req: Request, res: Response): Promise<void> {
  try {
    const data = await Update.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) { res.status(404).json({ success: false, message: "Update not found" }); return; }
    res.json({ success: true, data });
  } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
}

export async function deleteUpdate(req: Request, res: Response): Promise<void> {
  try {
    const data = await Update.findByIdAndDelete(req.params.id);
    if (!data) { res.status(404).json({ success: false, message: "Update not found" }); return; }
    res.json({ success: true, message: "Update deleted" });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
}

// ── PORTFOLIO CONFIG (SETTINGS) ───────────────────────────────

/** Shared helper: upsert and return the singleton settings document */
async function getOrCreate() {
  let settings = await Settings.findOne({});
  if (!settings) settings = await Settings.create({});
  return settings;
}

/**
 * GET /api/settings  (public)
 * Returns only public-safe fields. Strips admin-only data (email in identity,
 * admin notes, etc.) and respects the `published` flag.
 */
export async function getSettings(_req: Request, res: Response): Promise<void> {
  try {
    const s = await getOrCreate();

    // If config is unpublished, return safe defaults so the site still renders
    if (!s.published) {
      res.json({ success: true, data: null, unpublished: true });
      return;
    }

    // Public-safe projection — omit private email in identity (expose via socials.email.url instead)
    const pub = {
      identity: {
        name:         s.identity?.name,
        displayName:  s.identity?.displayName,
        role:         s.identity?.role,
        headline:     s.identity?.headline,
        shortBio:     s.identity?.shortBio,
        longBio:      s.identity?.longBio,
        location:     s.identity?.location,
        profileImage: s.identity?.profileImage,
        availability: s.identity?.availability,
        // NOTE: private email not exposed — use socials.email.url for contact
      },
      about:             s.about,
      appearance:        s.appearance,
      hero:              s.hero,
      currentlyLearning: s.currentlyLearning,
      socials:           s.socials,
      navigation:        s.navigation?.filter((n: any) => n.enabled).sort((a: any, b: any) => a.order - b.order),
      footer:            s.footer,
      resume:            s.resume,
      visibility:        s.visibility,
      seo:               s.seo,
      sections:          s.sections?.filter((sec: any) => sec.enabled).sort((a: any, b: any) => a.order - b.order),
      // Legacy fields (keep for existing consumers)
      heroHeadline:      s.heroHeadline?.length ? s.heroHeadline : s.hero?.headlineLines,
      heroSubtitle:      s.heroSubtitle || s.hero?.subtitle,
      githubUrl:         s.githubUrl || s.socials?.github?.url,
      linkedinUrl:       s.linkedinUrl || s.socials?.linkedin?.url,
      xUrl:              s.xUrl || s.socials?.x?.url,
      email:             s.identity?.email || s.socials?.email?.url,
    };

    res.json({ success: true, data: pub });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/settings/admin  (protected)
 * Returns the full document including all fields.
 * If ?draft=true, returns the draft snapshot if it exists.
 */
export async function getAdminSettings(req: Request, res: Response): Promise<void> {
  try {
    const s = await getOrCreate();
    
    // Check for draft if requested
    if (req.query.draft === "true") {
      const draft = await Revision.findOne({ entityId: "settings", entityType: "Settings", status: "draft" });
      if (draft && draft.snapshot) {
        res.json({ success: true, data: { ...s.toObject(), ...draft.snapshot, _isDraft: true } });
        return;
      }
    }

    res.json({ success: true, data: s });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * PUT /api/settings  (protected)
 * Deep-merges the incoming body into the settings document (if publish) or saves a draft.
 */
export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await getOrCreate();
    const action = req.query.action as string;

    if (action === "draft") {
      // Upsert a Draft revision
      await Revision.findOneAndUpdate(
        { entityId: "settings", entityType: "Settings", status: "draft" },
        { snapshot: req.body },
        { upsert: true, new: true }
      );
      res.json({ success: true, message: "Draft saved successfully" });
      return;
    }

    if (action === "publish") {
      // 1. Update the actual settings
      const updated = await Settings.findByIdAndUpdate(
        settings._id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      // 2. Save a historical 'published' revision
      await Revision.create({
        entityId: "settings",
        entityType: "Settings",
        status: "published",
        snapshot: req.body
      });

      // 3. Clear any existing draft
      await Revision.findOneAndDelete({ entityId: "settings", entityType: "Settings", status: "draft" });

      res.json({ success: true, data: updated });
      return;
    }

    // Default legacy behavior (if no action provided, just update)
    const updated = await Settings.findByIdAndUpdate(
      settings._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

