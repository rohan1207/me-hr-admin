import { connectDB } from "@/lib/mongodb";
import { SeoSettings } from "@/lib/models/SeoSettings";
import { SeoPage } from "@/lib/models/SeoPage";
import { Insight } from "@/lib/models/Insight";
import { CaseStudy } from "@/lib/models/CaseStudy";
import { ensureSeoSeeded, corsText } from "@/lib/ensureSeo";

export async function OPTIONS() {
  return corsText("", "application/xml; charset=utf-8");
}

function xmlEscape(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  await connectDB();
  await ensureSeoSeeded();
  const settings = await SeoSettings.findOne({ key: "global" }).lean();
  const base = (settings?.siteUrl || "https://www.me-hr.com").replace(/\/$/, "");

  const [pages, insights, cases] = await Promise.all([
    SeoPage.find({ active: true, noIndex: false }).lean(),
    Insight.find({ status: "published" }).select("slug updatedAt").lean(),
    CaseStudy.find({ status: "published" }).select("slug updatedAt").lean(),
  ]);

  const urls = [];

  for (const p of pages) {
    const loc = `${base}${p.path === "/" ? "/" : p.path.replace(/\/?$/, "/")}`;
    urls.push({
      loc,
      lastmod: p.updatedAt,
      changefreq: p.changefreq || "weekly",
      priority: p.priority ?? 0.7,
    });
  }

  for (const i of insights) {
    urls.push({
      loc: `${base}/media/${i.slug}/`,
      lastmod: i.updatedAt,
      changefreq: "monthly",
      priority: 0.6,
    });
  }

  for (const c of cases) {
    urls.push({
      loc: `${base}/case-studies/${c.slug}/`,
      lastmod: c.updatedAt,
      changefreq: "monthly",
      priority: 0.6,
    });
  }

  for (const extra of settings?.sitemapExtraUrls || []) {
    if (!extra?.path) continue;
    urls.push({
      loc: `${base}${extra.path.startsWith("/") ? extra.path : `/${extra.path}`}`,
      changefreq: extra.changefreq || "monthly",
      priority: extra.priority ?? 0.5,
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => {
    const last = u.lastmod ? new Date(u.lastmod).toISOString() : new Date().toISOString();
    return `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${last}</lastmod>
    <changefreq>${xmlEscape(u.changefreq)}</changefreq>
    <priority>${Number(u.priority).toFixed(1)}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

  return corsText(body, "application/xml; charset=utf-8");
}
