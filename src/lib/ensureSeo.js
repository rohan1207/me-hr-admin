import { SeoSettings } from "@/lib/models/SeoSettings";
import { SeoPage } from "@/lib/models/SeoPage";
import { DEFAULT_GLOBAL, DEFAULT_SEO_PAGES } from "@/lib/seoDefaults";

export async function ensureSeoSeeded() {
  const settings = await SeoSettings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: DEFAULT_GLOBAL },
    { upsert: true, new: true }
  );

  const count = await SeoPage.countDocuments();
  if (count === 0) {
    try {
      await SeoPage.insertMany(
        DEFAULT_SEO_PAGES.map((p) => ({
          ...p,
          canonicalPath: p.path,
          ogTitle: p.title,
          ogDescription: p.description,
        })),
        { ordered: false }
      );
    } catch (err) {
      // Parallel requests may race on first seed — ignore duplicate key
      if (err?.code !== 11000 && !String(err?.message || "").includes("E11000")) {
        throw err;
      }
    }
  }

  return settings;
}

export function corsJson(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return Response.json(data, { ...init, headers });
}

export function corsText(body, contentType = "text/plain; charset=utf-8", init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", contentType);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return new Response(body, { ...init, headers });
}
