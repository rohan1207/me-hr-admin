import mongoose, { Schema } from "mongoose";

const SeoSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true },
    siteName: { type: String, default: "me-HR" },
    siteUrl: { type: String, default: "https://www.me-hr.com" },
    defaultTitle: { type: String, default: "" },
    defaultDescription: { type: String, default: "" },
    defaultKeywords: { type: [String], default: [] },
    defaultOgImage: { type: String, default: "/logo1.png" },
    twitterHandle: { type: String, default: "" },
    googleSiteVerification: { type: String, default: "" },
    bingSiteVerification: { type: String, default: "" },
    gaMeasurementId: { type: String, default: "G-VQYS9NB7V8" },
    gtmId: { type: String, default: "" },
    robotsTxt: { type: String, default: "" },
    llmsTxt: { type: String, default: "" },
    organizationJsonLd: { type: String, default: "" },
    aeoNotes: { type: String, default: "" },
    sitemapExtraUrls: {
      type: [
        {
          path: String,
          changefreq: { type: String, default: "monthly" },
          priority: { type: Number, default: 0.5 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const SeoSettings =
  mongoose.models.SeoSettings || mongoose.model("SeoSettings", SeoSettingsSchema);
