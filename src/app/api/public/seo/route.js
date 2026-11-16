import { connectDB } from "@/lib/mongodb";
import { SeoSettings } from "@/lib/models/SeoSettings";
import { SeoPage } from "@/lib/models/SeoPage";
import { SeoRedirect } from "@/lib/models/SeoRedirect";
import { ensureSeoSeeded, corsJson } from "@/lib/ensureSeo";

export async function OPTIONS() {
  return corsJson({ ok: true });
}

export async function GET(request) {
  await connectDB();
  await ensureSeoSeeded();
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  const settings = await SeoSettings.findOne({ key: "global" }).lean();

  if (path) {
    const raw = path.startsWith("/") ? path : `/${path}`;
    const bare = raw.replace(/\/+$/, "") || "/";
    const withSlash = bare === "/" ? "/" : `${bare}/`;
    const page = await SeoPage.findOne({
      active: true,
      path: { $in: [bare, withSlash, raw] },
    }).lean();
    return corsJson({ settings, page: page || null });
  }

  const [pages, redirects] = await Promise.all([
    SeoPage.find({ active: true }).sort({ path: 1 }).lean(),
    SeoRedirect.find({ active: true }).lean(),
  ]);

  return corsJson({ settings, pages, redirects });
}
