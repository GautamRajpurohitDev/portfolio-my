import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRevision extends Document {
  entityId: string;       // String representation of ObjectId, or "settings" for singleton
  entityType: string;     // e.g., 'Project', 'Settings', 'JourneyEntry'
  snapshot: any;          // The actual JSON data of the document
  status: "draft" | "published"; // Whether this is an unpublished draft or a historical published version
  createdAt: Date;
  updatedAt: Date;
}

const RevisionSchema = new Schema<IRevision>(
  {
    entityId:   { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    snapshot:   { type: Schema.Types.Mixed, required: true },
    status:     { type: String, enum: ["draft", "published"], required: true },
  },
  { timestamps: true }
);

// We want to easily find the single "draft" for an entity if it exists
RevisionSchema.index({ entityId: 1, entityType: 1, status: 1 });

export const Revision: Model<IRevision> =
  mongoose.models.Revision || mongoose.model<IRevision>("Revision", RevisionSchema);
