import express from "express";
import {
  getBootcamps, enrollBootcamp,
  createBootcamp, updateBootcamp, deleteBootcamp,
} from "../controllers/bootcampController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBootcamps);
router.post("/:id/enroll", protect, enrollBootcamp);

// Admin routes
router.post("/", protect, adminOnly, createBootcamp);
router.put("/:id", protect, adminOnly, updateBootcamp);
router.delete("/:id", protect, adminOnly, deleteBootcamp);

export default router;
