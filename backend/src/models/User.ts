import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// ── USER MODEL ───────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "admin";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email:     { type: String, required: true, unique: true, trim: true },
    password:  { type: String, required: true, minlength: 4 },
    name:      { type: String, required: true, trim: true },
    role:      { type: String, enum: ["admin"], default: "admin" },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
