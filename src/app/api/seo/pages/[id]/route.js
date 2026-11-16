import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SeoPage } from "@/lib/models/SeoPage";
import { requireAdmin } from "@/lib/auth";

export async function GET(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const item = await SeoPage.findById(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const item = await SeoPage.findById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const fields = [
      "path",
      "label",
      "title",
      "description",
      "keywords",
      "canonicalPath",
      "ogTitle",
      "ogDescription",
      "ogImage",
      "ogType",
      "robots",
      "jsonLd",
      "h1",
      "focusKeyword",
      "aeoSummary",
      "faqSchema",
      "noIndex",
      "priority",
      "changefreq",
      "active",
    ];
    for (const key of fields) {
      if (body[key] !== undefined) item[key] = body[key];
    }
    if (item.noIndex) item.robots = "noindex,follow";
    await item.save();
    return NextResponse.json({ item });
  } catch (err) {
    console.error("seo page update", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  await SeoPage.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
