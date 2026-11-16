import { connectDB } from "@/lib/mongodb";
import { Career } from "@/lib/models/Career";
import { publicOptions, withPublicCors } from "@/lib/publicCors";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const item = await Career.findOne({ slug, active: true }).lean();
    if (!item) return withPublicCors({ error: "Not found" }, { status: 404 });
    return withPublicCors({ item });
  }

  const items = await Career.find({ active: true }).sort({ updatedAt: -1 }).lean();
  return withPublicCors({ items });
}
