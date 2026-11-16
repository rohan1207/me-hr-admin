import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Testimonial } from "@/lib/models/Testimonial";
import { requireAdmin } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const filter = {};
  if (status === "active") filter.active = true;
  if (status === "draft") filter.active = false;
  if (q) {
    filter.$or = [
      { name: new RegExp(q, "i") },
      { headline: new RegExp(q, "i") },
      { quote: new RegExp(q, "i") },
      { tag: new RegExp(q, "i") },
    ];
  }
  const items = await Testimonial.find(filter).sort({ order: 1, updatedAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await request.json();
    const headline = String(body.headline || "").trim();
    const name = String(body.name || "").trim();
    if (!headline || !name) {
      return NextResponse.json(
        { error: "Headline and name are required" },
        { status: 400 }
      );
    }
    let slug = makeSlug(body.slug || `${name}-${headline}`);
    if (await Testimonial.findOne({ slug })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const active = body.active !== false;
    const doc = await Testimonial.create({
      slug,
      tag: body.tag || "",
      headline,
      quote: body.quote || "",
      name,
      role: body.role || "",
      place: body.place || "",
      avatar: body.avatar || "",
      avatarPublicId: body.avatarPublicId || "",
      order: Number(body.order) || 0,
      active,
      status: active ? "published" : "draft",
    });
    return NextResponse.json({ item: doc }, { status: 201 });
  } catch (err) {
    console.error("testimonial create", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
