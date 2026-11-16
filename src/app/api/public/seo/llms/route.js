import { connectDB } from "@/lib/mongodb";
import { SeoSettings } from "@/lib/models/SeoSettings";
import { ensureSeoSeeded, corsText } from "@/lib/ensureSeo";

export async function OPTIONS() {
  return corsText("");
}

export async function GET() {
  await connectDB();
  await ensureSeoSeeded();
  const settings = await SeoSettings.findOne({ key: "global" }).lean();
  return corsText(settings?.llmsTxt || "");
}
