import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { RoadmapStatus } from "./RoadmapPhase";

// ── ROADMAP TOPIC MODEL ──────────────────────────────────────

export interface IRoadmapResource {
  title: string;
  url: string;
  type: "Documentation" | "Course" | "Book" | "Practice" | "Video" | "Project";
  provider: string;
  notes: string;
  order: number;
}

export interface IRoadmapTopic extends Document {
  domain: Types.ObjectId;
  phase: Types.ObjectId;
  title: string;
  description: string;
  subtopics: string[];          // list of subtopic strings
  status: RoadmapStatus;
  progress: number;             // 0–100
  order: number;
  resources: IRoadmapResource[];
  notes: string;
  practiceCount: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IRoadmapResource>(
  {
    title:    { type: String, default: "" },
    url:      { type: String, default: "" },
    type:     { type: String, enum: ["Documentation","Course","Book","Practice","Video","Project"], default: "Documentation" },
    provider: { type: String, default: "" },
    notes:    { type: String, default: "" },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

const RoadmapTopicSchema = new Schema<IRoadmapTopic>(
  {
    domain:        { type: Schema.Types.ObjectId, ref: "RoadmapDomain", required: true },
    phase:         { type: Schema.Types.ObjectId, ref: "RoadmapPhase",  required: true },
    title:         { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    subtopics:     { type: [String], default: [] },
    status:        {
      type: String,
      enum: ["not-started","up-next","in-progress","practicing","review","completed","optional","paused"],
      default: "not-started",
    },
    progress:      { type: Number, default: 0, min: 0, max: 100 },
    order:         { type: Number, default: 0 },
    resources:     { type: [ResourceSchema], default: [] },
    notes:         { type: String, default: "" },
    practiceCount: { type: Number, default: 0 },
    published:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoadmapTopicSchema.index({ domain: 1, order: 1 });
RoadmapTopicSchema.index({ phase: 1 });

export const RoadmapTopic: Model<IRoadmapTopic> =
  mongoose.models.RoadmapTopic ||
  mongoose.model<IRoadmapTopic>("RoadmapTopic", RoadmapTopicSchema);
