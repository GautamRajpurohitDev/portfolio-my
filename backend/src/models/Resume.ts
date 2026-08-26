import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResume extends Document {
  fileUrl: string;
  fileName: string;
  version: string;
  uploadedAt: Date;
  published: boolean;
  isCurrent: boolean;
  fileSize: number;
  label: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    fileUrl:    { type: String, required: true, trim: true },
    fileName:   { type: String, required: true, trim: true },
    version:    { type: String, default: "1.0", trim: true },
    uploadedAt: { type: Date, default: Date.now },
    published:  { type: Boolean, default: true },
    isCurrent:  { type: Boolean, default: true },
    fileSize:   { type: Number, default: 0 },
    label:      { type: String, default: "View Resume", trim: true },
    notes:      { type: String, default: "" },
  },
  { timestamps: true }
);

export const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
