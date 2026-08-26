import mongoose, { Schema, Document, Model } from "mongoose";

// ── PROJECT MODEL ────────────────────────────────────────────

export interface IMediaAttachment {
  url: string;
  mimeType: string;
  alt: string;
  order: number;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  content: string; // Replaces problem, solution, architecture, etc.
  
  // Legacy fields
  problem?: string;
  solution?: string;
  architecture?: string;
  features?: string;
  challenges?: string;
  lessonsLearned?: string;

  status: "idea" | "in-progress" | "completed" | "archived";
  category: string;
  technologies: string[];
  featured: boolean;
  published: boolean;
  order: number;
  githubUrl: string;
  liveUrl: string;
  media: IMediaAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const MediaAttachmentSchema = new Schema<IMediaAttachment>(
  {
    url:      { type: String, required: true },
    mimeType: { type: String, default: "image/png" }, // default for backward compat
    alt:      { type: String, default: "" },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title:            { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    content:          { type: String, default: "" },
    
    // Legacy fields
    problem:          { type: String, default: "" },
    solution:         { type: String, default: "" },
    architecture:     { type: String, default: "" },
    features:         { type: String, default: "" },
    challenges:       { type: String, default: "" },
    lessonsLearned:   { type: String, default: "" },
    
    status:           { type: String, enum: ["idea", "in-progress", "completed", "archived"], default: "idea" },
    category:         { type: String, default: "other" },
    technologies:     [{ type: String }],
    featured:         { type: Boolean, default: false },
    published:        { type: Boolean, default: false },
    order:            { type: Number, default: 0 },
    githubUrl:        { type: String, default: "" },
    liveUrl:          { type: String, default: "" },
    media:            { type: [MediaAttachmentSchema], default: [] },
  },
  { timestamps: true }
);

// Auto-generate slug from title on new documents only
ProjectSchema.pre("validate", async function () {
  if (this.isNew && this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
