import { connectDB } from "@/lib/mongodb";
import { Testimonial } from "@/lib/models/Testimonial";
import { publicOptions, withPublicCors } from "@/lib/publicCors";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET() {
  await connectDB();
  const items = await Testimonial.find({ active: true })
    .sort({ order: 1, updatedAt: -1 })
    .lean();
  return withPublicCors({ items });
}
