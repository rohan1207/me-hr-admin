import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Insight } from "@/lib/models/Insight";

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const item = await Insight.findOne({ slug, status: "published" }).lean();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  }

  const items = await Insight.find({ status: "published" })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .lean();

  return NextResponse.json({ items });
}
