import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  alt: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename:     { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    mimeType:     { type: String, required: true },
    size:         { type: Number, required: true },
    url:          { type: String, required: true }, // Abstracted URL (e.g., /uploads/filename or https://cloudinary.com/...)
    thumbnailUrl: { type: String },
    width:        { type: Number },
    height:       { type: Number },
    duration:     { type: Number },
    alt:          { type: String, default: "" },
  },
  { timestamps: true }
);

export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
