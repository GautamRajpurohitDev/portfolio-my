import { Request, Response } from "express";
import { Media } from "../models/Media";
import { Settings } from "../models/Settings";
import { Project } from "../models/Project";
import { JourneyEntry as Journey } from "../models/JourneyEntry";
import { Update } from "../models/Update";
import { Certificate } from "../models/Certificate";
import { storage } from "../lib/storage";
import crypto from "crypto";

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "No files uploaded" });
      return;
    }

    const uploadedRecords = [];

    for (const file of files) {
      // Validate size based on type
      const isVideo = file.mimetype.startsWith("video/");
      if (isVideo && file.size > VIDEO_MAX_SIZE) {
        throw new Error(`Video ${file.originalname} exceeds 50MB limit`);
      } else if (!isVideo && file.size > IMAGE_MAX_SIZE) {
        throw new Error(`Image ${file.originalname} exceeds 10MB limit`);
      }

      // Generate unique filename
      const ext = file.originalname.split(".").pop();
      const uniqueId = crypto.randomBytes(8).toString("hex");
      const filename = `${uniqueId}-${Date.now()}.${ext}`;

      // Save via abstract storage
      const url = await storage.save(filename, file.buffer, file.mimetype);

      // Create DB record
      const media = await Media.create({
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        alt: file.originalname,
      });

      uploadedRecords.push(media);
    }

    res.status(201).json({ success: true, data: uploadedRecords });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMedia(req: Request, res: Response): Promise<void> {
  try {
    const type = req.query.type as string; // 'image', 'video', 'document'
    const search = req.query.search as string;

    const query: any = {};
    if (type === "image") query.mimeType = { $regex: "^image/" };
    else if (type === "video") query.mimeType = { $regex: "^video/" };
    else if (type === "document") query.mimeType = { $regex: "^application/" };

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: "i" } },
        { alt: { $regex: search, $options: "i" } },
      ];
    }

    const media = await Media.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: media });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateMedia(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { alt, originalName } = req.body;

    const media = await Media.findByIdAndUpdate(
      id,
      { alt, originalName },
      { new: true, runValidators: true }
    );

    if (!media) {
      res.status(404).json({ success: false, message: "Media not found" });
      return;
    }

    res.json({ success: true, data: media });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteMedia(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      res.status(404).json({ success: false, message: "Media not found" });
      return;
    }

    // --- Soft Reference Check (Option A) ---
    // Search for the URL across common collections
    const url = media.url;
    
    const settings = await Settings.findOne({ $text: { $search: `"${url}"` } }).catch(() => null);
    // If text index doesn't exist, we can fallback to JSON stringify check on the whole doc, 
    // but a simpler way is to just query known fields if possible, or use a naive string search on serialized docs.
    // For absolute safety without deep querying every field, we will check known image fields.

    // A more robust check without text indexes:
    const inSettings = await Settings.findOne({
      $or: [
        { "identity.profileImage": url },
        { "hero.backgroundImage": url },
        { "hero.heroImage": url },
        { "seo.ogImage": url },
      ]
    });

    const inProjects = await Project.findOne({
      $or: [{ coverImage: url }, { "content.body": { $regex: url } }]
    });

    const inJourney = await Journey.findOne({
      "media.url": url
    });

    const inUpdates = await Update.findOne({
      "content.body": { $regex: url }
    });

    const inCertificates = await Certificate.findOne({
      imageUrl: url
    });

    if (inSettings || inProjects || inJourney || inUpdates || inCertificates) {
      res.status(409).json({ 
        success: false, 
        message: "Cannot delete media because it is currently in use across the portfolio. Please remove it from the respective section first." 
      });
      return;
    }

    // Delete file
    await storage.delete(media.filename);

    // Delete DB record
    await Media.findByIdAndDelete(id);

    res.json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
