import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Testimonial } from "@/lib/models/Testimonial";

export async function GET() {
  await connectDB();
  const items = await Testimonial.find({ active: true })
    .sort({ order: 1, updatedAt: -1 })
    .lean();
  return NextResponse.json({ items });
}
