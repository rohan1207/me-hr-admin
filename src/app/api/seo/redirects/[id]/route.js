import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SeoRedirect } from "@/lib/models/SeoRedirect";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const item = await SeoRedirect.findByIdAndUpdate(id, body, { new: true });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { id } = await params;
  await SeoRedirect.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
