import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType:  { type: String, enum: ["flat", "percent"], default: "flat" },
  discountValue: { type: Number, required: true },
  maxUses:       { type: Number, default: 0 },
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
