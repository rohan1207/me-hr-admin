import { connectDB } from "@/lib/mongodb";
import { CaseStudy } from "@/lib/models/CaseStudy";
import { publicOptions, withPublicCors } from "@/lib/publicCors";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const item = await CaseStudy.findOne({ slug, status: "published" }).lean();
    if (!item) return withPublicCors({ error: "Not found" }, { status: 404 });
    return withPublicCors({ item });
  }

  const items = await CaseStudy.find({ status: "published" })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .lean();

  return withPublicCors({ items });
}
