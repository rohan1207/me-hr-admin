import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CaseStudy } from "@/lib/models/CaseStudy";
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
  if (status && status !== "all") filter.status = status;
  if (q) {
    filter.$or = [
      { title: new RegExp(q, "i") },
      { challenge: new RegExp(q, "i") },
    ];
  }
  const items = await CaseStudy.find(filter).sort({ updatedAt: -1 }).lean();
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
    if (await CaseStudy.findOne({ slug })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const status = body.status === "published" ? "published" : "draft";
    const doc = await CaseStudy.create({
      slug,
      title,
      heroImage: body.heroImage || "",
      heroImagePublicId: body.heroImagePublicId || "",
      challenge: body.challenge || "",
      actions: Array.isArray(body.actions) ? body.actions : [],
      impact: body.impact || "",
      bodyHtml: body.bodyHtml || "",
      status,
      publishedAt: status === "published" ? new Date() : undefined,
    });
    return NextResponse.json({ item: doc }, { status: 201 });
  } catch (err) {
    console.error("case study create", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
