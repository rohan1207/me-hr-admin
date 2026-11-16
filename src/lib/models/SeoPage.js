import mongoose, { Schema } from "mongoose";

const SeoPageSchema = new Schema(
  {
    path: { type: String, required: true, unique: true, index: true },
    label: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    canonicalPath: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    ogType: { type: String, default: "website" },
    robots: {
      type: String,
      default: "index,follow",
    },
    jsonLd: { type: String, default: "" },
    h1: { type: String, default: "" },
    focusKeyword: { type: String, default: "" },
    aeoSummary: { type: String, default: "" },
    faqSchema: {
      type: [
        {
          question: String,
          answer: String,
        },
      ],
      default: [],
    },
    noIndex: { type: Boolean, default: false },
    priority: { type: Number, default: 0.7 },
    changefreq: { type: String, default: "weekly" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SeoPage =
  mongoose.models.SeoPage || mongoose.model("SeoPage", SeoPageSchema);
