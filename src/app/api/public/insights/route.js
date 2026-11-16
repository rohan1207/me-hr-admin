import { connectDB } from "@/lib/mongodb";
import { Insight } from "@/lib/models/Insight";
import { publicOptions, withPublicCors } from "@/lib/publicCors";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const item = await Insight.findOne({
      slug,
      status: "published",
      noIndex: { $ne: true },
    }).lean();
    if (!item) return withPublicCors({ error: "Not found" }, { status: 404 });
    return withPublicCors({ item });
  }

  const items = await Insight.find({ status: "published", noIndex: { $ne: true } })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .lean();

  return withPublicCors({ items });
}
