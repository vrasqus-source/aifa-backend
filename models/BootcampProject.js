import mongoose from "mongoose";

const bootcampProjectSchema = new mongoose.Schema({
  bootcamp:     { type: mongoose.Schema.Types.ObjectId, ref: "Bootcamp", required: true },
  no:           { type: String, default: "" },
  title:        { type: String, required: true },
  desc:         { type: String, default: "" },
  requirements: [String],
  resources:    [{ name: String, size: String, type: String }],
}, { timestamps: true });

export default mongoose.model("BootcampProject", bootcampProjectSchema);
