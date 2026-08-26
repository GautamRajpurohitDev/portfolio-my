import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getPublicRoadmap, getAdminRoadmap, getCurrentFocus,
  getPublicPhases, getAllPhases, createPhase, updatePhase, deletePhase,
  getPublicDomains, getAllDomains, createDomain, updateDomain, deleteDomain,
  getPublicTopics, getAllTopics, createTopic, updateTopic, deleteTopic,
  getAllTasks, createTask, updateTask, deleteTask,
} from "../controllers/roadmapController";

const router = Router();

// ── FULL TREE ─────────────────────────────────────────────────
router.get("/",        getPublicRoadmap);             // public summary
router.get("/all",     authenticate, getAdminRoadmap); // admin full tree
router.get("/current", getCurrentFocus);               // auto-sync: in-progress phase

// ── PHASES ────────────────────────────────────────────────────
router.get("/phases",     getPublicPhases);
router.get("/phases/all", authenticate, getAllPhases);
router.post("/phases",        authenticate, createPhase);
router.put("/phases/:id",     authenticate, updatePhase);
router.delete("/phases/:id",  authenticate, deletePhase);

// ── DOMAINS ───────────────────────────────────────────────────
router.get("/domains",     getPublicDomains);
router.get("/domains/all", authenticate, getAllDomains);
router.post("/domains",        authenticate, createDomain);
router.put("/domains/:id",     authenticate, updateDomain);
router.delete("/domains/:id",  authenticate, deleteDomain);

// ── TOPICS ────────────────────────────────────────────────────
router.get("/topics",     getPublicTopics);
router.get("/topics/all", authenticate, getAllTopics);
router.post("/topics",        authenticate, createTopic);
router.put("/topics/:id",     authenticate, updateTopic);
router.delete("/topics/:id",  authenticate, deleteTopic);

// ── TASKS — Admin only ────────────────────────────────────────
router.get("/tasks/all",     authenticate, getAllTasks);
router.post("/tasks",        authenticate, createTask);
router.put("/tasks/:id",     authenticate, updateTask);
router.delete("/tasks/:id",  authenticate, deleteTask);

export default router;
