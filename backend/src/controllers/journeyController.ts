import { Request, Response } from "express";
import { JourneyEntry } from "../models/JourneyEntry";

export async function getPublicJourney(_req: Request, res: Response): Promise<void> {
  try {
    const entries = await JourneyEntry.find({ published: true })
      .sort({ date: -1 })
      .populate("relatedCertificate", "title provider")
      .select("-__v");
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getAllJourney(_req: Request, res: Response): Promise<void> {
  try {
    const entries = await JourneyEntry.find({})
      .sort({ date: -1 })
      .populate("relatedCertificate", "title provider")
      .select("-__v");
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getJourneyById(req: Request, res: Response): Promise<void> {
  try {
    const entry = await JourneyEntry.findOne({ _id: req.params.id, published: true })
      .populate("relatedCertificate", "title provider credentialUrl");
    if (!entry) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function createJourneyEntry(req: Request, res: Response): Promise<void> {
  try {
    const entry = await JourneyEntry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Validation error" });
  }
}

export async function updateJourneyEntry(req: Request, res: Response): Promise<void> {
  try {
    const entry = await JourneyEntry.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!entry) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.json({ success: true, data: entry });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Update failed" });
  }
}

export async function deleteJourneyEntry(req: Request, res: Response): Promise<void> {
  try {
    const entry = await JourneyEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}
