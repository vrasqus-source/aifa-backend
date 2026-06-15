import mongoose from "mongoose";

const bootcampSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  price: { type: Number, required: true },
  duration: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  seats: { type: Number, default: 30 },
  syllabus: [{ week: Number, topic: String }],
  instructors: [{ name: String, bio: String, image: String }],
  enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Bootcamp", bootcampSchema);
