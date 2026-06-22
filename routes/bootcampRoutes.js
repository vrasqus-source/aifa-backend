import express from "express";
import {
  getBootcamps, enrollBootcamp,
  createBootcamp, deleteBootcamp,
} from "../controllers/bootcampController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import Bootcamp from "../models/Bootcamp.js";
import BootcampSession from "../models/BootcampSession.js";
import BootcampProject from "../models/BootcampProject.js";
import BootcampAnnouncement from "../models/BootcampAnnouncement.js";

const router = express.Router();

router.get("/", getBootcamps);
router.post("/:id/enroll", protect, enrollBootcamp);

// Admin routes
router.post("/", protect, adminOnly, createBootcamp);
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bootcamp) return res.status(404).json({ message: "Not found" });
    res.json(bootcamp);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.delete("/:id", protect, adminOnly, deleteBootcamp);

// ── Sessions ─────────────────────────────────────────────────
router.get("/:id/sessions", async (req, res) => {
  try {
    const sessions = await BootcampSession.find({ bootcamp: req.params.id }).sort({ no: 1 });
    res.json(sessions);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.post("/:id/sessions", protect, adminOnly, async (req, res) => {
  try {
    const session = await BootcampSession.create({ bootcamp: req.params.id, ...req.body });
    res.status(201).json(session);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put("/:id/sessions/:sid", protect, adminOnly, async (req, res) => {
  try {
    const session = await BootcampSession.findByIdAndUpdate(req.params.sid, req.body, { new: true });
    if (!session) return res.status(404).json({ message: "Not found" });
    res.json(session);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.delete("/:id/sessions/:sid", protect, adminOnly, async (req, res) => {
  try {
    await BootcampSession.findByIdAndDelete(req.params.sid);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
});

// ── Projects ──────────────────────────────────────────────────
router.get("/:id/projects", async (req, res) => {
  try {
    const projects = await BootcampProject.find({ bootcamp: req.params.id });
    res.json(projects);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.post("/:id/projects", protect, adminOnly, async (req, res) => {
  try {
    const project = await BootcampProject.create({ bootcamp: req.params.id, ...req.body });
    res.status(201).json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put("/:id/projects/:pid", protect, adminOnly, async (req, res) => {
  try {
    const project = await BootcampProject.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.delete("/:id/projects/:pid", protect, adminOnly, async (req, res) => {
  try {
    await BootcampProject.findByIdAndDelete(req.params.pid);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
});

// ── Announcements ─────────────────────────────────────────────
// /all must come before /:aid to avoid route collision
router.get("/:id/announcements/all", protect, adminOnly, async (req, res) => {
  try {
    const announcements = await BootcampAnnouncement.find({ bootcamp: req.params.id }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.get("/:id/announcements", async (req, res) => {
  try {
    const announcements = await BootcampAnnouncement.find({ bootcamp: req.params.id, status: "PUBLISHED" }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.post("/:id/announcements", protect, adminOnly, async (req, res) => {
  try {
    const announcement = await BootcampAnnouncement.create({ bootcamp: req.params.id, ...req.body });
    res.status(201).json(announcement);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put("/:id/announcements/:aid", protect, adminOnly, async (req, res) => {
  try {
    const announcement = await BootcampAnnouncement.findByIdAndUpdate(req.params.aid, req.body, { new: true });
    if (!announcement) return res.status(404).json({ message: "Not found" });
    res.json(announcement);
  } catch { res.status(500).json({ message: "Server error" }); }
});

router.delete("/:id/announcements/:aid", protect, adminOnly, async (req, res) => {
  try {
    await BootcampAnnouncement.findByIdAndDelete(req.params.aid);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
});

export default router;
