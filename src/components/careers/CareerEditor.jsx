"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";

const empty = {
  title: "",
  slug: "",
  company: "me-HR",
  subtitle: "",
  location: "Pune",
  experience: "",
  type: "Full-time",
  salary: "",
  industry: "",
  reportingTo: "",
  about: "",
  summary: "",
  sectionsJson: "[]",
  active: false,
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30";

export default function CareerEditor({ id }) {
  const router = useRouter();
  const isNew = !id || id === "new";
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/careers/${id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          ...empty,
          ...data.item,
          sectionsJson: JSON.stringify(data.item.sections || [], null, 2),
        });
      } else setError(data.error || "Not found");
      setLoading(false);
    })();
  }, [id, isNew]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      let sections = [];
      try {
        sections = JSON.parse(form.sectionsJson || "[]");
        if (!Array.isArray(sections)) throw new Error("Sections must be an array");
      } catch {
        throw new Error("Sections JSON is invalid. Use [{ \"title\": \"...\", \"items\": [\"...\"] }]");
      }

      const payload = {
        title: form.title,
        slug: form.slug,
        company: form.company,
        subtitle: form.subtitle,
        location: form.location,
        experience: form.experience,
        type: form.type,
        salary: form.salary,
        industry: form.industry,
        reportingTo: form.reportingTo,
        about: form.about,
        summary: form.summary,
        sections,
        active: Boolean(form.active),
      };

      const res = await fetch(isNew ? "/api/careers" : `/api/careers/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (isNew) router.replace(`/careers/${data.item._id}`);
      else {
        setForm({
          ...empty,
          ...data.item,
          sectionsJson: JSON.stringify(data.item.sections || [], null, 2),
        });
        alert("Saved");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <PageHeader
        title={isNew ? "New career opening" : "Edit career opening"}
        subtitle="Checked = Active (published on careers page). Unchecked = Draft (hidden)."
        actions={
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <label className="mb-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="checkbox"
          checked={Boolean(form.active)}
          onChange={(e) => set("active", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">Active opening</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            When checked, this role appears on the public Careers page. Unchecked keeps it as draft.
          </span>
        </span>
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Job title">
          <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Company">
          <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} />
        </Field>
        <Field label="Location">
          <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Type">
          <input className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)} />
        </Field>
        <Field label="Experience">
          <input className={inputCls} value={form.experience} onChange={(e) => set("experience", e.target.value)} />
        </Field>
        <Field label="Salary">
          <input className={inputCls} value={form.salary} onChange={(e) => set("salary", e.target.value)} />
        </Field>
        <Field label="Industry">
          <input className={inputCls} value={form.industry} onChange={(e) => set("industry", e.target.value)} />
        </Field>
        <Field label="Slug">
          <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Subtitle">
            <input className={inputCls} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Summary">
            <textarea className={inputCls} rows={4} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="About">
            <textarea className={inputCls} rows={3} value={form.about} onChange={(e) => set("about", e.target.value)} />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label='Sections JSON (array of { "title", "items": [] })'>
            <textarea
              className={`${inputCls} font-mono text-[12px]`}
              rows={12}
              value={form.sectionsJson}
              onChange={(e) => set("sectionsJson", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
