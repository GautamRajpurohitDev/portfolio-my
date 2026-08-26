import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificate extends Document {
  title: string;
  provider: string;
  credentialId: string;
  credentialUrl: string;
  date: Date;
  media: Array<{ url: string; mimeType: string; alt: string; order: number }>;
  description: string;
  featured: boolean;
  published: boolean;
  order: number;
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

const CertificateSchema = new Schema<ICertificate>(
  {
    title:         { type: String, required: true, trim: true },
    provider:      { type: String, required: true, trim: true },
    credentialId:  { type: String, default: "" },
    credentialUrl: { type: String, default: "" },
    date:          { type: Date, required: true },
    media:         { type: [MediaAttachmentSchema], default: [] },
    description:   { type: String, default: "" },
    featured:      { type: Boolean, default: false },
    published:     { type: Boolean, default: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);
