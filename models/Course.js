import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  vimeoId: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  duration: { type: String, default: "" },
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String, default: "" },
  shortDesc:     { type: String, default: "" },
  image:         { type: String, default: "" },
  price:         { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  duration:      { type: String, default: "" },
  category:      { type: String, default: "AI & Machine Learning" },
  level:         { type: String, enum: ["Beginner","Intermediate","Advanced"], default: "Beginner" },
  language:      { type: String, default: "English" },
  instructor:    { type: String, default: "" },
  tags:          [String],
  lessons:       [lessonSchema],
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPublished:   { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
