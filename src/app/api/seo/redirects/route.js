import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SeoRedirect } from "@/lib/models/SeoRedirect";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const items = await SeoRedirect.find().sort({ fromPath: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await request.json();
    const fromPath = String(body.fromPath || "").trim();
    const toPath = String(body.toPath || "").trim();
    if (!fromPath || !toPath) {
      return NextResponse.json({ error: "fromPath and toPath required" }, { status: 400 });
    }
    const item = await SeoRedirect.create({
      fromPath,
      toPath,
      statusCode: Number(body.statusCode || 301),
      active: body.active !== false,
      note: body.note || "",
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("seo redirect", err);
    return NextResponse.json({ error: "Failed to create redirect" }, { status: 500 });
  }
}
