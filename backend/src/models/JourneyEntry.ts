import mongoose, { Schema, Document, Model } from "mongoose";

// ── JOURNEY ENTRY MODEL ──────────────────────────────────────

export interface IJourneyEntry extends Document {
  date: Date;
  title: string;
  topic: string;
  summary: string;
  content: string; // Replaces learned, built, problems, solved, nextStep
  media: Array<{ url: string; mimeType: string; alt: string; order: number }>;
  
  // Legacy fields (kept for backward compatibility with existing data, but UI will use `content`)
  learned?: string;
  built?: string;
  problems?: string;
  solved?: string;
  nextStep?: string;
  
  githubUrl: string;
  relatedCertificate?: mongoose.Types.ObjectId;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAttachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const JourneyEntrySchema = new Schema<IJourneyEntry>(
  {
    date:                { type: Date, required: true },
    title:               { type: String, required: true, trim: true },
    topic:               { type: String, required: true, trim: true },
    summary:             { type: String, required: true, maxlength: 500 },
    content:             { type: String, default: "" },
    media:               { type: [MediaAttachmentSchema], default: [] },
    
    // Legacy fields
    learned:             { type: String, default: "" },
    built:               { type: String, default: "" },
    problems:            { type: String, default: "" },
    solved:              { type: String, default: "" },
    nextStep:            { type: String, default: "" },
    
    githubUrl:           { type: String, default: "" },
    relatedCertificate:  { type: Schema.Types.ObjectId, ref: "Certificate", default: null },
    featured:            { type: Boolean, default: false },
    published:           { type: Boolean, default: false },
    order:               { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const JourneyEntry: Model<IJourneyEntry> =
  mongoose.models.JourneyEntry ||
  mongoose.model<IJourneyEntry>("JourneyEntry", JourneyEntrySchema);
