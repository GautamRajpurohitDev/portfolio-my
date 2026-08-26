import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { RoadmapStatus } from "./RoadmapPhase";

// ── ROADMAP DOMAIN MODEL ─────────────────────────────────────

export interface IRoadmapDomain extends Document {
  phase: Types.ObjectId;
  title: string;
  description: string;
  status: RoadmapStatus;
  progress: number;           // 0–100
  order: number;
  icon: string;
  color: string;
  dependencies: Types.ObjectId[];  // other domains this depends on
  notes: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapDomainSchema = new Schema<IRoadmapDomain>(
  {
    phase:        { type: Schema.Types.ObjectId, ref: "RoadmapPhase", required: true },
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: "" },
    status:       {
      type: String,
      enum: ["not-started","up-next","in-progress","practicing","review","completed","optional","paused"],
      default: "not-started",
    },
    progress:     { type: Number, default: 0, min: 0, max: 100 },
    order:        { type: Number, default: 0 },
    icon:         { type: String, default: "Layers" },
    color:        { type: String, default: "" },
    dependencies: [{ type: Schema.Types.ObjectId, ref: "RoadmapDomain" }],
    notes:        { type: String, default: "" },
    published:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoadmapDomainSchema.index({ phase: 1, order: 1 });

export const RoadmapDomain: Model<IRoadmapDomain> =
  mongoose.models.RoadmapDomain ||
  mongoose.model<IRoadmapDomain>("RoadmapDomain", RoadmapDomainSchema);
