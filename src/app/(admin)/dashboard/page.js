"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  Eye,
  MousePointerClick,
  Newspaper,
  FolderKanban,
  BriefcaseBusiness,
  MessageSquareQuote,
  Users,
  FileCheck2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  async function load(range = days) {
    setError("");
    try {
      const res = await fetch(`/api/analytics/summary?days=${range}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  async function seedContent() {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Seed failed");
      await load(days);
      alert(
        `Seeded ${json.seeded.insights} insights, ${json.seeded.caseStudies} case studies, ${json.seeded.careers} careers, ${json.seeded.testimonials || 0} testimonials.`
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setSeeding(false);
    }
  }

  const t = data?.totals || {};

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Website performance, content inventory, clicks, page views and drop-off signals."
        actions={
          <div className="flex flex-wrap gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              type="button"
              onClick={seedContent}
              disabled={seeding}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {seeding ? "Seeding…" : "Seed existing content"}
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}. If this is a fresh install, click <strong>Seed existing content</strong> after MongoDB is connected.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Page views" value={t.pageviews ?? "—"} hint={`${days}d window`} icon={Eye} />
        <StatCard label="Clicks" value={t.clicks ?? "—"} hint="CTA + nav + UI clicks" icon={MousePointerClick} />
        <StatCard label="Sessions" value={t.sessions ?? "—"} hint="Unique session IDs" icon={Users} />
        <StatCard label="Form submits" value={t.formSubmits ?? "—"} hint="Contact / careers forms" icon={FileCheck2} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Insights" value={t.insights ?? "—"} icon={Newspaper} />
        <StatCard label="Case studies" value={t.caseStudies ?? "—"} icon={FolderKanban} />
        <StatCard label="Testimonials" value={t.testimonialsActive ?? "—"} hint={`${t.testimonialsDraft ?? 0} draft`} icon={MessageSquareQuote} />
        <StatCard label="Careers active" value={t.careersActive ?? "—"} icon={BriefcaseBusiness} />
        <StatCard label="Careers draft" value={t.careersDraft ?? "—"} icon={BriefcaseBusiness} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Traffic over time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyViews || []}>
                <defs>
                  <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b5f58" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0b5f58" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#0b5f58" fill="url(#views)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Top pages by views</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data?.topPages || []).map((p) => ({
                  path: p._id,
                  views: p.views,
                }))}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="path" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#14c4ad" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Where users click">
          <Table
            headers={["Page", "Label", "Clicks"]}
            rows={(data?.topClicks || []).map((r) => [
              r._id?.path || "—",
              r._id?.label || "—",
              r.clicks,
            ])}
          />
        </Panel>
        <Panel title="Drop-off & scroll depth">
          <Table
            headers={["Page", "Exits", "Avg scroll %"]}
            rows={(data?.dropoffs || []).map((r) => [
              r._id,
              r.exits,
              r.avgScroll != null ? Math.round(r.avgScroll) : "—",
            ])}
          />
        </Panel>
        <Panel title="Insights performance">
          <Table
            headers={["Title", "Status", "Views"]}
            rows={(data?.topInsights || []).map((r) => [
              r.title,
              r.status,
              r.views || 0,
            ])}
          />
        </Panel>
        <Panel title="Case study performance">
          <Table
            headers={["Title", "Status", "Views"]}
            rows={(data?.topCases || []).map((r) => [
              r.title,
              r.status,
              r.views || 0,
            ])}
          />
        </Panel>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Device mix</h2>
        <div className="flex flex-wrap gap-2">
          {(data?.deviceBreakdown || []).map((d) => (
            <span
              key={d._id}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {d._id || "unknown"}: {d.count}
            </span>
          ))}
          {!data?.deviceBreakdown?.length && (
            <p className="text-sm text-slate-500">
              No analytics yet. Add the tracker to the public site to start collecting visits and clicks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  if (!rows?.length) {
    return <p className="text-sm text-slate-500">No data in this range yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            {headers.map((h) => (
              <th key={h} className="pb-2 pr-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-3 text-slate-700">
                  <span className="line-clamp-2">{String(cell)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
