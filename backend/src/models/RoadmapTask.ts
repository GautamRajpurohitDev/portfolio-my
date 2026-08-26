import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { RoadmapStatus } from "./RoadmapPhase";
import type { IRoadmapResource } from "./RoadmapTopic";

// ── ROADMAP TASK MODEL ───────────────────────────────────────

export interface IRoadmapTask extends Document {
  topic: Types.ObjectId;
  domain: Types.ObjectId;
  phase: Types.ObjectId;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  actualHours: number;
  practiceCount: number;
  resources: IRoadmapResource[];
  notes: string;
  linkedProject: Types.ObjectId | null;
  linkedMilestone: Types.ObjectId | null;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskResourceSchema = new Schema(
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

const RoadmapTaskSchema = new Schema<IRoadmapTask>(
  {
    topic:           { type: Schema.Types.ObjectId, ref: "RoadmapTopic",  required: true },
    domain:          { type: Schema.Types.ObjectId, ref: "RoadmapDomain", required: true },
    phase:           { type: Schema.Types.ObjectId, ref: "RoadmapPhase",  required: true },
    title:           { type: String, required: true, trim: true },
    description:     { type: String, default: "" },
    status:          {
      type: String,
      enum: ["not-started","up-next","in-progress","practicing","review","completed","optional","paused"],
      default: "not-started",
    },
    priority:        { type: String, enum: ["low","medium","high","critical"], default: "medium" },
    estimatedHours:  { type: Number, default: 0 },
    actualHours:     { type: Number, default: 0 },
    practiceCount:   { type: Number, default: 0 },
    resources:       { type: [TaskResourceSchema], default: [] },
    notes:           { type: String, default: "" },
    linkedProject:   { type: Schema.Types.ObjectId, ref: "Project",   default: null },
    linkedMilestone: { type: Schema.Types.ObjectId, ref: "Milestone", default: null },
    order:           { type: Number, default: 0 },
    published:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoadmapTaskSchema.index({ topic: 1, order: 1 });
RoadmapTaskSchema.index({ domain: 1 });
RoadmapTaskSchema.index({ phase: 1 });

export const RoadmapTask: Model<IRoadmapTask> =
  mongoose.models.RoadmapTask ||
  mongoose.model<IRoadmapTask>("RoadmapTask", RoadmapTaskSchema);
