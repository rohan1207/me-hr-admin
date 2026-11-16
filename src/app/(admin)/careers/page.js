"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CareersListPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ status, ...(q ? { q } : {}) });
    const res = await fetch(`/api/careers?${params}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function toggleActive(item) {
    await fetch(`/api/careers/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this career opening?")) return;
    await fetch(`/api/careers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Careers"
        subtitle="Manage job openings. Active checkbox publishes to the public Careers page; unchecked stays draft."
        actions={
          <Link
            href="/careers/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Add opening
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search openings…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button" onClick={load} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium">
          Search
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-slate-500">Loading…</td></tr>
              )}
              {!loading && !items.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-slate-500">No openings yet. Seed from Dashboard or add one.</td></tr>
              )}
              {items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(item.active)}
                      onChange={() => toggleActive(item)}
                      title={item.active ? "Active — uncheck to draft" : "Draft — check to publish"}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-400">/{item.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.company}</td>
                  <td className="px-4 py-3 text-slate-600">{item.location}</td>
                  <td className="px-4 py-3 text-slate-600">{item.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/careers/${item._id}`} className="rounded-lg p-2 hover:bg-slate-100">
                        <Pencil size={15} />
                      </Link>
                      <button type="button" onClick={() => remove(item._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
