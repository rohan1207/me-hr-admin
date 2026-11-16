import mongoose, { Schema } from "mongoose";

const TestimonialSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    tag: { type: String, default: "" },
    headline: { type: String, required: true, trim: true },
    quote: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    place: { type: String, default: "" },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

TestimonialSchema.pre("save", function syncStatus(next) {
  this.status = this.active ? "published" : "draft";
  next();
});

export const Testimonial =
  mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
