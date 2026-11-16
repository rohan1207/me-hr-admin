import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AnalyticsEvent } from "@/lib/models/AnalyticsEvent";
import { Insight } from "@/lib/models/Insight";
import { CaseStudy } from "@/lib/models/CaseStudy";

function deviceFromUa(ua = "") {
  if (/mobile/i.test(ua) && !/ipad|tablet/i.test(ua)) return "mobile";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mozilla|chrome|safari|firefox|edg/i.test(ua)) return "desktop";
  return "unknown";
}

const ALLOWED = new Set([
  "pageview",
  "click",
  "cta_click",
  "nav_click",
  "outbound",
  "form_start",
  "form_submit",
  "scroll_depth",
  "exit",
  "session_start",
]);

export async function POST(request) {
  try {
    const body = await request.json();
    const type = String(body.type || "");
    if (!ALLOWED.has(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const path = String(body.path || "/").slice(0, 500);
    const ua = request.headers.get("user-agent") || body.userAgent || "";

    await connectDB();
    await AnalyticsEvent.create({
      type,
      path,
      title: String(body.title || "").slice(0, 300),
      referrer: String(body.referrer || "").slice(0, 500),
      label: String(body.label || "").slice(0, 200),
      href: String(body.href || "").slice(0, 500),
      element: String(body.element || "").slice(0, 120),
      scrollDepth: typeof body.scrollDepth === "number" ? body.scrollDepth : undefined,
      sessionId: String(body.sessionId || "").slice(0, 80),
      visitorId: String(body.visitorId || "").slice(0, 80),
      userAgent: ua.slice(0, 400),
      device: deviceFromUa(ua),
      meta: body.meta && typeof body.meta === "object" ? body.meta : {},
    });

    // Increment content views for insight / case-study pages
    if (type === "pageview") {
      const insightMatch = path.match(/\/media\/([^/?#]+)/);
      if (insightMatch) {
        await Insight.updateOne({ slug: insightMatch[1] }, { $inc: { views: 1 } });
      }
      const caseMatch = path.match(/\/case-studies\/([^/?#]+)/);
      if (caseMatch) {
        await CaseStudy.updateOne({ slug: caseMatch[1] }, { $inc: { views: 1 } });
      }
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (err) {
    console.error("analytics track", err);
    return NextResponse.json({ error: "Track failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
