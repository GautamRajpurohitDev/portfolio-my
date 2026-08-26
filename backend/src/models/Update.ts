import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUpdate extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  media: Array<{ url: string; mimeType: string; alt: string; order: number }>;
  date: Date;
  tags: string[];
  coverImage: string;
  linkedinUrl: string;
  xUrl: string;
  githubUrl: string;
  relatedProject?: mongoose.Types.ObjectId;
  published: boolean;
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

const UpdateSchema = new Schema<IUpdate>(
  {
    title:          { type: String, required: true, trim: true },
    slug:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary:        { type: String, required: true, maxlength: 400 },
    content:        { type: String, default: "" },
    media:          { type: [MediaAttachmentSchema], default: [] },
    date:           { type: Date, required: true },
    tags:           [{ type: String }],
    coverImage:     { type: String, default: "" },
    linkedinUrl:    { type: String, default: "" },
    xUrl:           { type: String, default: "" },
    githubUrl:      { type: String, default: "" },
    relatedProject: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    published:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate slug from title on new documents
UpdateSchema.pre("validate", async function () {
  if (this.isNew && this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export const Update: Model<IUpdate> =
  mongoose.models.Update || mongoose.model<IUpdate>("Update", UpdateSchema);
