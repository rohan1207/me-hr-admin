import mongoose, { Schema } from "mongoose";

const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const CareerSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    company: { type: String, default: "me-HR" },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    location: { type: String, default: "Pune" },
    experience: { type: String, default: "" },
    type: { type: String, default: "Full-time" },
    salary: { type: String, default: "" },
    industry: { type: String, default: "" },
    reportingTo: { type: String, default: "" },
    about: { type: String, default: "" },
    summary: { type: String, default: "" },
    sections: { type: [SectionSchema], default: [] },
    /** Active = published on careers page; unchecked = draft */
    active: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date },
    applications: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CareerSchema.pre("save", function syncStatus(next) {
  this.status = this.active ? "published" : "draft";
  if (this.active && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export const Career =
  mongoose.models.Career || mongoose.model("Career", CareerSchema);
