import mongoose, { Schema } from "mongoose";

const AnalyticsEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "pageview",
        "click",
        "cta_click",
        "nav_click",
        "outbound",
        "form_start",
        "form_submit",
        "scroll_depth",
        "exit",
        "session_start",
      ],
      required: true,
      index: true,
    },
    path: { type: String, required: true, index: true },
    title: { type: String, default: "" },
    referrer: { type: String, default: "" },
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    element: { type: String, default: "" },
    scrollDepth: { type: Number },
    sessionId: { type: String, index: true },
    visitorId: { type: String, index: true },
    userAgent: { type: String, default: "" },
    device: { type: String, enum: ["mobile", "tablet", "desktop", "unknown"], default: "unknown" },
    country: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ createdAt: -1 });
AnalyticsEventSchema.index({ path: 1, type: 1, createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ||
  mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
