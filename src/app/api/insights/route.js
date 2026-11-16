import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Insight } from "@/lib/models/Insight";
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
      { excerpt: new RegExp(q, "i") },
      { category: new RegExp(q, "i") },
    ];
  }

  const items = await Insight.find(filter).sort({ updatedAt: -1 }).lean();
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
    const exists = await Insight.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;

    const status = body.status === "published" ? "published" : "draft";
    const doc = await Insight.create({
      slug,
      title,
      excerpt: body.excerpt || "",
      category: body.category || "Insights",
      readTime: body.readTime || "5 min read",
      heroImage: body.heroImage || "",
      heroImagePublicId: body.heroImagePublicId || "",
      bodyHtml: body.bodyHtml || "",
      body: Array.isArray(body.body) ? body.body : [],
      featured: Boolean(body.featured),
      popular: Boolean(body.popular),
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      seoKeywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
      seoCanonical: body.seoCanonical || "",
      noIndex: Boolean(body.noIndex),
    });

    return NextResponse.json({ item: doc }, { status: 201 });
  } catch (err) {
    console.error("insight create", err);
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 });
  }
}
