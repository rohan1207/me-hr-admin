import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AnalyticsEvent } from "@/lib/models/AnalyticsEvent";
import { Insight } from "@/lib/models/Insight";
import { CaseStudy } from "@/lib/models/CaseStudy";
import { Career } from "@/lib/models/Career";
import { Testimonial } from "@/lib/models/Testimonial";
import { requireAdmin } from "@/lib/auth";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const range = Number(searchParams.get("days") || 30);
  const since = daysAgo(Number.isFinite(range) ? range : 30);

  const [
    insightCount,
    caseCount,
    careerActive,
    careerDraft,
    testimonialActive,
    testimonialDraft,
    pageviews,
    clicks,
    sessions,
    visitors,
    topPages,
    topClicks,
    deviceBreakdown,
    dailyViews,
    scrollExits,
    topInsights,
    topCases,
    formSubmits,
  ] = await Promise.all([
    Insight.countDocuments(),
    CaseStudy.countDocuments(),
    Career.countDocuments({ active: true }),
    Career.countDocuments({ active: false }),
    Testimonial.countDocuments({ active: true }),
    Testimonial.countDocuments({ active: false }),
    AnalyticsEvent.countDocuments({ type: "pageview", createdAt: { $gte: since } }),
    AnalyticsEvent.countDocuments({
      type: { $in: ["click", "cta_click", "nav_click"] },
      createdAt: { $gte: since },
    }),
    AnalyticsEvent.distinct("sessionId", {
      type: "pageview",
      createdAt: { $gte: since },
      sessionId: { $ne: "" },
    }).then((a) => a.length),
    AnalyticsEvent.distinct("visitorId", {
      type: "pageview",
      createdAt: { $gte: since },
      visitorId: { $ne: "" },
    }).then((a) => a.length),
    AnalyticsEvent.aggregate([
      { $match: { type: "pageview", createdAt: { $gte: since } } },
      { $group: { _id: "$path", views: { $sum: 1 }, title: { $last: "$title" } } },
      { $sort: { views: -1 } },
      { $limit: 12 },
    ]),
    AnalyticsEvent.aggregate([
      {
        $match: {
          type: { $in: ["click", "cta_click", "nav_click"] },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { path: "$path", label: "$label" },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: 12 },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { type: "pageview", createdAt: { $gte: since } } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { type: "pageview", createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AnalyticsEvent.aggregate([
      {
        $match: {
          type: { $in: ["exit", "scroll_depth"] },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: "$path",
          exits: {
            $sum: { $cond: [{ $eq: ["$type", "exit"] }, 1, 0] },
          },
          avgScroll: { $avg: "$scrollDepth" },
          samples: { $sum: 1 },
        },
      },
      { $sort: { exits: -1 } },
      { $limit: 10 },
    ]),
    Insight.find().sort({ views: -1 }).limit(8).select("title slug views status").lean(),
    CaseStudy.find().sort({ views: -1 }).limit(8).select("title slug views status").lean(),
    AnalyticsEvent.countDocuments({
      type: "form_submit",
      createdAt: { $gte: since },
    }),
  ]);

  return NextResponse.json({
    rangeDays: range,
    since,
    totals: {
      insights: insightCount,
      caseStudies: caseCount,
      careersActive: careerActive,
      careersDraft: careerDraft,
      testimonialsActive: testimonialActive,
      testimonialsDraft: testimonialDraft,
      pageviews,
      clicks,
      sessions,
      visitors,
      formSubmits,
    },
    topPages,
    topClicks,
    deviceBreakdown,
    dailyViews,
    dropoffs: scrollExits,
    topInsights,
    topCases,
  });
}
