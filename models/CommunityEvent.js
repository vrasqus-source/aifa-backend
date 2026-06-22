import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title:     { type: String, required: true },
  type:      { type: String, default: "Workshop" },
  mode:      { type: String, default: "ONLINE" },
  date:      { type: Date },
  startTime: { type: String, default: "" },
  duration:  { type: String, default: "2" },
  capacity:  { type: Number, default: 50 },
  link:      { type: String, default: "" },
  openRSVP:  { type: Boolean, default: true },
  featured:  { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("CommunityEvent", schema);
