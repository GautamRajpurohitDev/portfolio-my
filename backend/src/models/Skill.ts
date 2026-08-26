import mongoose, { Schema, Document, Model } from "mongoose";

export type SkillCategory =
  | "programming"
  | "cs-fundamentals"
  | "web"
  | "databases"
  | "systems"
  | "cloud"
  | "ai-ml"
  | "mobile"
  | "tools";

export type SkillStatus =
  | "not-started"
  | "in-progress"
  | "practicing"
  | "review"
  | "completed"
  | "optional"
  | "paused"
  | "learning"
  | "familiar"
  | "proficient"
  | "advanced"
  | "planned";

export interface ISkill extends Document {
  name: string;
  category: SkillCategory;
  status: SkillStatus;
  progress: number;
  description: string;
  icon: string;
  published: boolean;
  featured: boolean;
  order: number;
  media: Array<{ url: string; mimeType: string; alt: string; order: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAttachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    mimeType: { type: String, default: "image/png" },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SkillSchema = new Schema<ISkill>(
  {
    name:      { type: String, required: true, trim: true },
    category:  { type: String, enum: ["programming","cs-fundamentals","web","databases","systems","cloud","ai-ml","mobile","tools"], required: true },
    status:    {
      type: String,
      enum: [
        "not-started", "in-progress", "practicing", "review", "completed", "optional", "paused",
        "learning", "familiar", "proficient", "advanced", "planned"
      ],
      default: "not-started"
    },
    progress:  { type: Number, min: 0, max: 100, default: 0 },
    description: { type: String, default: "" },
    icon:      { type: String, default: "" },
    published: { type: Boolean, default: true },
    featured:  { type: Boolean, default: false },
    order:     { type: Number, default: 0 },
    media:     { type: [MediaAttachmentSchema], default: [] },
  },
  { timestamps: true }
);

export const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);
