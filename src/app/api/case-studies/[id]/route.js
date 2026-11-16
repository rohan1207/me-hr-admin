import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CaseStudy } from "@/lib/models/CaseStudy";
import { requireAdmin } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";

async function findDoc(id) {
  if (id.match(/^[a-f\d]{24}$/i)) return CaseStudy.findById(id);
  return CaseStudy.findOne({ slug: id });
}

export async function GET(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const item = await findDoc(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const item = await findDoc(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await request.json();
    if (body.title != null) item.title = String(body.title).trim();
    if (body.heroImage != null) item.heroImage = body.heroImage;
    if (body.heroImagePublicId != null) item.heroImagePublicId = body.heroImagePublicId;
    if (body.challenge != null) item.challenge = body.challenge;
    if (Array.isArray(body.actions)) item.actions = body.actions;
    if (body.impact != null) item.impact = body.impact;
    if (body.bodyHtml != null) item.bodyHtml = body.bodyHtml;
    if (body.slug) item.slug = makeSlug(body.slug);
    if (body.status === "published" || body.status === "draft") {
      item.status = body.status;
      if (body.status === "published" && !item.publishedAt) {
        item.publishedAt = new Date();
      }
    }
    await item.save();
    return NextResponse.json({ item });
  } catch (err) {
    console.error("case study update", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const item = await findDoc(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await item.deleteOne();
  return NextResponse.json({ ok: true });
}
