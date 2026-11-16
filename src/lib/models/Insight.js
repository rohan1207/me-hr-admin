import mongoose, { Schema } from "mongoose";

const InsightSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    category: { type: String, default: "Insights" },
    readTime: { type: String, default: "5 min read" },
    heroImage: { type: String, default: "" },
    heroImagePublicId: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    body: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    seoKeywords: { type: [String], default: [] },
    seoCanonical: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Insight =
  mongoose.models.Insight || mongoose.model("Insight", InsightSchema);
