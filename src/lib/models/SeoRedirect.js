import mongoose, { Schema } from "mongoose";

const SeoRedirectSchema = new Schema(
  {
    fromPath: { type: String, required: true, unique: true, index: true },
    toPath: { type: String, required: true },
    statusCode: { type: Number, default: 301, enum: [301, 302, 307, 308] },
    active: { type: Boolean, default: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SeoRedirect =
  mongoose.models.SeoRedirect || mongoose.model("SeoRedirect", SeoRedirectSchema);
