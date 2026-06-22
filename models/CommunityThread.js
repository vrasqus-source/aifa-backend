import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  author:   { type: String, default: "Anonymous" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tag:      { type: String, default: "General" },
  replies:  [{ author: String, text: String, createdAt: { type: Date, default: Date.now } }],
  views:    { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model("CommunityThread", schema);
