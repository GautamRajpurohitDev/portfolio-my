import { connectDB } from "../lib/db";
import { Resume } from "../models/Resume";
import { Settings } from "../models/Settings";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function run() {
  await connectDB();

  // Create sample dummy PDF in uploads if not exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const samplePdfPath = path.join(uploadsDir, "Gautam_Rajpurohit_Resume.pdf");
  if (!fs.existsSync(samplePdfPath)) {
    fs.writeFileSync(samplePdfPath, "%PDF-1.4\n% Sample placeholder resume PDF for Gautam Rajpurohit\n%%EOF");
  }

  await Resume.deleteMany({});
  const resume = await Resume.create({
    fileUrl: "/uploads/Gautam_Rajpurohit_Resume.pdf",
    fileName: "Gautam_Rajpurohit_Resume.pdf",
    version: "1.0",
    uploadedAt: new Date(),
    published: true,
    isCurrent: true,
    fileSize: 1024 * 128, // 128 KB
    label: "View Resume",
    notes: "Official initial resume version",
  });

  await Settings.findOneAndUpdate(
    {},
    {
      $set: {
        "resume.fileUrl": "/uploads/Gautam_Rajpurohit_Resume.pdf",
        "resume.fileName": "Gautam_Rajpurohit_Resume.pdf",
        "resume.version": "1.0",
        "resume.uploadedAt": new Date(),
        "resume.published": true,
        "resume.isCurrent": true,
        "resume.fileSize": 1024 * 128,
        "resume.label": "View Resume",
      },
    },
    { upsert: true }
  );

  console.log("✓ Sample resume initialized and set as current published resume!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
