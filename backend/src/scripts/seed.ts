import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Settings } from "../models/Settings";
import dotenv from "dotenv";

dotenv.config();

async function seed(): Promise<void> {
  await connectDB();

  // ── Seed admin user ───────────────────────────────────────
  const email    = process.env.ADMIN_EMAIL    || "admin@gautam.dev";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("FATAL ERROR: ADMIN_PASSWORD environment variable is missing. Refusing to seed.");
  }
  const name     = "Gautam Rajpurohit";

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    await User.create({ email, password, name, role: "admin" });
    console.log(`✓ Admin user created: ${email}`);
  } else {
    console.log(`→ Admin user already exists: ${email}`);
  }

  // ── Seed default settings ─────────────────────────────────
  const existingSettings = await Settings.findOne({});
  if (!existingSettings) {
    await Settings.create({
      currentlyLearning: {
        primary:            "Git & GitHub",
        primaryDescription: "Learning version control from first principles — commits, branches, merge, rebase.",
        next:               "C Programming",
        roadmap:            ["C++", "Data Structures", "Algorithms", "System Design"],
      },
      heroHeadline: ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."],
      heroSubtitle: "MCA student building strong programming fundamentals from first principles.",
      githubUrl:   "https://github.com/gautamrajpurohit",
      linkedinUrl: "https://linkedin.com/in/gautamrajpurohit",
      xUrl:        "https://x.com/gautamrajpurohit",
      identity: { email: "gautam@gautam.dev" },
    } as any);
    console.log("✓ Default settings seeded");
  } else {
    console.log("→ Settings already exist");
  }

  console.log("\n✅ Seed complete. You can now start the server.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
