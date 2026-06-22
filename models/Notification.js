import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:   { type: String, required: true },
  message: { type: String, default: "" },
  type:    { type: String, enum: ["session","announcement","resource","payment","general"], default: "general" },
  isRead:  { type: Boolean, default: false },
  link:    { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
