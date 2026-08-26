import { Router } from "express";
import { uploadMedia, getMedia, updateMedia, deleteMedia } from "../controllers/mediaController";
import { upload } from "../middleware/upload";
import { authenticate } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all media routes (unless you want public reading)
// Currently, all media library operations should be admin-only. The actual images are served via the static express server, not this route.
router.use(authenticate);

router.post("/", upload.array("files", 10), uploadMedia);
router.get("/", getMedia);
router.put("/:id", updateMedia);
router.delete("/:id", deleteMedia);

export default router;
