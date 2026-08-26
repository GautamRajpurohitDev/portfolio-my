import { Request, Response } from "express";
import { Skill } from "../models/Skill";

export async function getPublicSkills(_req: Request, res: Response): Promise<void> {
  try {
    const skills = await Skill.find({ published: true }).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getAllSkills(_req: Request, res: Response): Promise<void> {
  try {
    const skills = await Skill.find({}).sort({ order: 1 }).select("-__v");
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function createSkill(req: Request, res: Response): Promise<void> {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Validation error" });
  }
}

export async function updateSkill(req: Request, res: Response): Promise<void> {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) {
      res.status(404).json({ success: false, message: "Skill not found" });
      return;
    }
    res.json({ success: true, data: skill });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Update failed" });
  }
}

export async function deleteSkill(req: Request, res: Response): Promise<void> {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      res.status(404).json({ success: false, message: "Skill not found" });
      return;
    }
    res.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}
