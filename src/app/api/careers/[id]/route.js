import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Career } from "@/lib/models/Career";
import { requireAdmin } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";

async function findDoc(id) {
  if (id.match(/^[a-f\d]{24}$/i)) return Career.findById(id);
  return Career.findOne({ slug: id });
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

    const fields = [
      "company",
      "title",
      "subtitle",
      "location",
      "experience",
      "type",
      "salary",
      "industry",
      "reportingTo",
      "about",
      "summary",
    ];
    for (const f of fields) {
      if (body[f] != null) item[f] = body[f];
    }
    if (body.title) item.title = String(body.title).trim();
    if (Array.isArray(body.sections)) item.sections = body.sections;
    if (body.slug) item.slug = makeSlug(body.slug);
    if (body.active != null) {
      item.active = Boolean(body.active);
      item.status = item.active ? "published" : "draft";
      if (item.active && !item.publishedAt) item.publishedAt = new Date();
    }

    await item.save();
    return NextResponse.json({ item });
  } catch (err) {
    console.error("career update", err);
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
