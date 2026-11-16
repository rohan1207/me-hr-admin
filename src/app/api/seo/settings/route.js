import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SeoSettings } from "@/lib/models/SeoSettings";
import { requireAdmin } from "@/lib/auth";
import { ensureSeoSeeded } from "@/lib/ensureSeo";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const settings = await ensureSeoSeeded();
  return NextResponse.json({ settings });
}

export async function PUT(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    await ensureSeoSeeded();
    const body = await request.json();
    const allowed = [
      "siteName",
      "siteUrl",
      "defaultTitle",
      "defaultDescription",
      "defaultKeywords",
      "defaultOgImage",
      "twitterHandle",
      "googleSiteVerification",
      "bingSiteVerification",
      "gaMeasurementId",
      "gtmId",
      "robotsTxt",
      "llmsTxt",
      "organizationJsonLd",
      "aeoNotes",
      "sitemapExtraUrls",
    ];
    const $set = {};
    for (const key of allowed) {
      if (body[key] !== undefined) $set[key] = body[key];
    }
    const settings = await SeoSettings.findOneAndUpdate(
      { key: "global" },
      { $set },
      { new: true }
    );
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("seo settings", err);
    return NextResponse.json({ error: "Failed to save SEO settings" }, { status: 500 });
  }
}
