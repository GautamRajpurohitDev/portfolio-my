import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth";

const router = Router();

// ── Storage configuration ─────────────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists at startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename strictly to prevent path traversal
    const ext      = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext);
    // Strip everything except alphanumeric, then slice
    const safeBasename = basename.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 40) || "upload";
    const name = `${Date.now()}-${safeBasename}${ext}`;
    
    // Explicitly check for traversal attempts in originalName just in case
    if (file.originalname.includes("..") || file.originalname.includes("/")) {
      return cb(new Error("Invalid filename"), "");
    }
    
    cb(null, name);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ALLOWED_MIME = [
    "image/jpeg", "image/jpg", "image/png", "image/gif",
    "image/webp", "image/avif",
    "video/mp4", "video/webm", "video/ogg",
  ];
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// Middleware to handle multer errors gracefully
const uploadMiddleware = (req: Request, res: Response, next: import("express").NextFunction) => {
  const uploadSingle = upload.single("file");
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ success: false, message: "File is too large. Maximum size is 50MB." });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ── POST /api/upload ──────────────────────────────────────────
// Upload a single file. Returns { success, url, filename }.
router.post("/", authenticate, uploadMiddleware, (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file received." });
      return;
    }

    const host = `${req.protocol}://${req.get("host")}`;
    const url  = `${host}/uploads/${req.file.filename}`;

    res.status(201).json({
      success:  true,
      url,
      filename: req.file.filename,
      size:     req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
});

// ── DELETE /api/upload/:filename ─────────────────────────────
// Remove an uploaded file from disk.
router.delete("/:filename", authenticate, (req: Request, res: Response) => {
  try {
    const filename = String(req.params.filename);
    // Basic path-traversal guard
    if (filename.includes("..") || filename.includes("/")) {
      res.status(400).json({ success: false, message: "Invalid filename." });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "File deleted." });
    } else {
      // If file doesn't exist, treat as success (idempotent)
      res.json({ success: true, message: "File already deleted." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Delete failed" });
  }
});

export default router;
