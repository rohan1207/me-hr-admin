import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Insight } from "@/lib/models/Insight";
import { requireAdmin } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";

async function findByIdOrSlug(id) {
  if (id.match(/^[a-f\d]{24}$/i)) {
    return Insight.findById(id);
  }
  return Insight.findOne({ slug: id });
}

export async function GET(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const item = await findByIdOrSlug(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const item = await findByIdOrSlug(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    if (body.title != null) item.title = String(body.title).trim();
    if (body.excerpt != null) item.excerpt = body.excerpt;
    if (body.category != null) item.category = body.category;
    if (body.readTime != null) item.readTime = body.readTime;
    if (body.heroImage != null) item.heroImage = body.heroImage;
    if (body.heroImagePublicId != null) item.heroImagePublicId = body.heroImagePublicId;
    if (body.bodyHtml != null) item.bodyHtml = body.bodyHtml;
    if (Array.isArray(body.body)) item.body = body.body;
    if (body.featured != null) item.featured = Boolean(body.featured);
    if (body.popular != null) item.popular = Boolean(body.popular);
    if (body.slug) item.slug = makeSlug(body.slug);

    if (body.status === "published" || body.status === "draft") {
      item.status = body.status;
      if (body.status === "published" && !item.publishedAt) {
        item.publishedAt = new Date();
      }
    }
    if (body.seoTitle != null) item.seoTitle = body.seoTitle;
    if (body.seoDescription != null) item.seoDescription = body.seoDescription;
    if (Array.isArray(body.seoKeywords)) item.seoKeywords = body.seoKeywords;
    if (body.seoCanonical != null) item.seoCanonical = body.seoCanonical;
    if (body.noIndex != null) item.noIndex = Boolean(body.noIndex);

    await item.save();
    return NextResponse.json({ item });
  } catch (err) {
    console.error("insight update", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const item = await findByIdOrSlug(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await item.deleteOne();
  return NextResponse.json({ ok: true });
}
