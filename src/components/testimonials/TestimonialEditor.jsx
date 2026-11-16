"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ImageUpload from "@/components/ui/ImageUpload";

const empty = {
  headline: "",
  slug: "",
  tag: "",
  quote: "",
  name: "",
  role: "",
  place: "",
  avatar: "",
  avatarPublicId: "",
  order: 0,
  active: true,
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30";

export default function TestimonialEditor({ id }) {
  const router = useRouter();
  const isNew = !id || id === "new";
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/testimonials/${id}`);
      const data = await res.json();
      if (res.ok) setForm({ ...empty, ...data.item });
      else setError(data.error || "Not found");
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
      const payload = { ...form, active: Boolean(form.active) };
      const res = await fetch(
        isNew ? "/api/testimonials" : `/api/testimonials/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (isNew) router.replace(`/testimonials/${data.item._id}`);
      else {
        setForm({ ...empty, ...data.item });
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
        title={isNew ? "New testimonial" : "Edit testimonial"}
        subtitle="Checked = Active (shown on site). Unchecked = Draft."
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
          <span className="block text-sm font-semibold text-slate-900">Active testimonial</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            When checked, this quote appears on the public website.
          </span>
        </span>
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Headline">
          <input className={inputCls} value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        </Field>
        <Field label="Tag">
          <input className={inputCls} value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="e.g. Resident HR, Manufacturing" />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Quote">
            <textarea className={inputCls} rows={5} value={form.quote} onChange={(e) => set("quote", e.target.value)} />
          </Field>
        </div>
        <Field label="Name">
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Role">
          <input className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)} />
        </Field>
        <Field label="Place">
          <input className={inputCls} value={form.place} onChange={(e) => set("place", e.target.value)} />
        </Field>
        <Field label="Display order">
          <input
            type="number"
            className={inputCls}
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Slug">
          <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
        <div className="lg:col-span-2">
          <ImageUpload
            label="Avatar (optional)"
            value={form.avatar}
            folder="me-hr/testimonials"
            onChange={({ url, publicId }) => {
              set("avatar", url);
              set("avatarPublicId", publicId);
            }}
          />
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
