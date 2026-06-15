import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import bootcampRoutes from "./routes/bootcampRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import User from "./models/User.js";
import Course from "./models/Course.js";
import Workshop from "./models/Workshop.js";
import Bootcamp from "./models/Bootcamp.js";
import Transaction from "./models/Transaction.js";
import { protect, adminOnly } from "./middleware/authMiddleware.js";
import { createOrder, verifyPayment, getMyTransactions, getAllTransactions } from "./controllers/paymentController.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/bootcamps", bootcampRoutes);
app.use("/api/users", userRoutes);

// Payment routes
app.post("/api/payments/create-order", protect, createOrder);
app.post("/api/payments/verify",       protect, verifyPayment);
app.get("/api/payments/history",       protect, getMyTransactions);
app.get("/api/admin/payments",         protect, adminOnly, getAllTransactions);

// Recent enrollments for admin overview
app.get("/api/admin/enrollments/recent", protect, adminOnly, async (req, res) => {
  try {
    const txs = await Transaction.find({ status: "paid" })
      .sort({ createdAt: -1 }).limit(10)
      .populate("user", "name email");
    res.json(txs);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.get("/api/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const [users, courses, workshops, bootcamps, revenueAgg, enrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Workshop.countDocuments(),
      Bootcamp.countDocuments(),
      Transaction.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Transaction.countDocuments({ status: "paid" }),
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    res.json({ users, courses, workshops, bootcamps, revenue, enrollments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));