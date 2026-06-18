import mongoose from 'mongoose';

const platformConfigSchema = new mongoose.Schema({
  key:      { type: String, required: true, unique: true },
  value:    { type: String, default: "" },
  group:    { type: String, default: "general" },
  label:    { type: String },
  isSecret: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('PlatformConfig', platformConfigSchema);
