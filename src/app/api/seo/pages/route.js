import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SeoPage } from "@/lib/models/SeoPage";
import { requireAdmin } from "@/lib/auth";
import { ensureSeoSeeded } from "@/lib/ensureSeo";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  await ensureSeoSeeded();
  const items = await SeoPage.find().sort({ path: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await request.json();
    const path = String(body.path || "").trim();
    if (!path.startsWith("/")) {
      return NextResponse.json({ error: "path must start with /" }, { status: 400 });
    }
    const exists = await SeoPage.findOne({ path });
    if (exists) {
      return NextResponse.json({ error: "Path already exists" }, { status: 409 });
    }
    const item = await SeoPage.create({
      path,
      label: body.label || path,
      title: body.title || "",
      description: body.description || "",
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      canonicalPath: body.canonicalPath || path,
      ogTitle: body.ogTitle || body.title || "",
      ogDescription: body.ogDescription || body.description || "",
      ogImage: body.ogImage || "",
      ogType: body.ogType || "website",
      robots: body.robots || "index,follow",
      jsonLd: body.jsonLd || "",
      h1: body.h1 || "",
      focusKeyword: body.focusKeyword || "",
      aeoSummary: body.aeoSummary || "",
      faqSchema: Array.isArray(body.faqSchema) ? body.faqSchema : [],
      noIndex: Boolean(body.noIndex),
      priority: Number(body.priority ?? 0.7),
      changefreq: body.changefreq || "weekly",
      active: body.active !== false,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("seo page create", err);
    return NextResponse.json({ error: "Failed to create SEO page" }, { status: 500 });
  }
}
