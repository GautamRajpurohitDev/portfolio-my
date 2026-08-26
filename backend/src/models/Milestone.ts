import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMilestone extends Document {
  title: string;
  description: string;
  date: Date;
  status: "planned" | "in-progress" | "completed";
  category: string;
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

const MilestoneSchema = new Schema<IMilestone>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    date:        { type: Date, required: true },
    status:      { type: String, enum: ["planned","in-progress","completed"], default: "planned" },
    category:    { type: String, default: "general" },
    icon:        { type: String, default: "" },
    published:   { type: Boolean, default: true },
    featured:    { type: Boolean, default: false },
    order:       { type: Number, default: 0 },
    media:       { type: [MediaAttachmentSchema], default: [] },
  },
  { timestamps: true }
);

export const Milestone: Model<IMilestone> =
  mongoose.models.Milestone ||
  mongoose.model<IMilestone>("Milestone", MilestoneSchema);
