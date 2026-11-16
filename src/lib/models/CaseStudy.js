import mongoose, { Schema } from "mongoose";

const CaseStudySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    heroImage: { type: String, default: "" },
    heroImagePublicId: { type: String, default: "" },
    challenge: { type: String, default: "" },
    actions: { type: [String], default: [] },
    impact: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CaseStudy =
  mongoose.models.CaseStudy || mongoose.model("CaseStudy", CaseStudySchema);
