import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  timestamp: Date;
  event: string;
  resourceType: string;
  resourceId?: string;
  resourceTitle?: string;
  actor: string;
  result: "SUCCESS" | "FAILED";
  metadata?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    event: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
    },
    resourceTitle: {
      type: String,
    },
    actor: {
      type: String,
      default: "Admin",
    },
    result: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Auto-expire logs after 90 days or keep capped at ~5000 records
AuditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
