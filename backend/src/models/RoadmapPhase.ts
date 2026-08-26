import mongoose, { Schema, Document, Model } from "mongoose";

// ── ROADMAP PHASE MODEL ──────────────────────────────────────

export type RoadmapStatus =
  | "not-started"
  | "up-next"
  | "in-progress"
  | "practicing"
  | "review"
  | "completed"
  | "optional"
  | "paused";

export interface IRoadmapPhase extends Document {
  number: number;           // 0–16 display order
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  learningObjectives: string[];
  prerequisites: string[];
  status: RoadmapStatus;
  progress: number;         // 0–100
  order: number;            // sort key
  icon: string;             // Lucide icon name
  color: string;            // hex or CSS colour token
  isOptional: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapPhaseSchema = new Schema<IRoadmapPhase>(
  {
    number:             { type: Number, required: true, min: 0 },
    title:              { type: String, required: true, trim: true },
    subtitle:           { type: String, default: "" },
    description:        { type: String, default: "" },
    overview:           { type: String, default: "" },
    learningObjectives: { type: [String], default: [] },
    prerequisites:      { type: [String], default: [] },
    status:             {
      type: String,
      enum: ["not-started","up-next","in-progress","practicing","review","completed","optional","paused"],
      default: "not-started",
    },
    progress:   { type: Number, default: 0, min: 0, max: 100 },
    order:      { type: Number, default: 0 },
    icon:       { type: String, default: "BookOpen" },
    color:      { type: String, default: "#e8c547" },
    isOptional: { type: Boolean, default: false },
    published:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoadmapPhaseSchema.index({ order: 1 });
RoadmapPhaseSchema.index({ number: 1 });

export const RoadmapPhase: Model<IRoadmapPhase> =
  mongoose.models.RoadmapPhase ||
  mongoose.model<IRoadmapPhase>("RoadmapPhase", RoadmapPhaseSchema);
