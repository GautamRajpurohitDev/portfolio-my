import multer from "multer";
import path from "path";

// We use memory storage here because we want to intercept the buffer
// and pass it to our abstract `storage.ts` provider.
const storage = multer.memoryStorage();

// File limits based on implementation plan
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB absolute max (we'll filter image vs video in the route)
};

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    "video/mp4",
    "video/webm",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});
