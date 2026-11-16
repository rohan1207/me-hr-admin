import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Career } from "@/lib/models/Career";
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
      { title: new RegExp(q, "i") },
      { location: new RegExp(q, "i") },
      { company: new RegExp(q, "i") },
    ];
  }
  const items = await Career.find(filter).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await request.json();
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    let slug = makeSlug(body.slug || title);
    if (await Career.findOne({ slug })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const active = Boolean(body.active);
    const doc = await Career.create({
      slug,
      company: body.company || "me-HR",
      title,
      subtitle: body.subtitle || "",
      location: body.location || "Pune",
      experience: body.experience || "",
      type: body.type || "Full-time",
      salary: body.salary || "",
      industry: body.industry || "",
      reportingTo: body.reportingTo || "",
      about: body.about || "",
      summary: body.summary || "",
      sections: Array.isArray(body.sections) ? body.sections : [],
      active,
      status: active ? "published" : "draft",
      publishedAt: active ? new Date() : undefined,
    });
    return NextResponse.json({ item: doc }, { status: 201 });
  } catch (err) {
    console.error("career create", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
