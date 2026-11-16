import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Career } from "@/lib/models/Career";

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const item = await Career.findOne({ slug, active: true }).lean();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  }

  const items = await Career.find({ active: true }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ items });
}
