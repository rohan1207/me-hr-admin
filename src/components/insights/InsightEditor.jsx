"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ImageUpload from "@/components/ui/ImageUpload";
import RichTextEditor from "@/components/editor/RichTextEditor";

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Insights",
  readTime: "5 min read",
  heroImage: "",
  heroImagePublicId: "",
  bodyHtml: "",
  featured: false,
  popular: false,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  seoCanonical: "",
  noIndex: false,
};

export default function InsightEditor({ id }) {
  const router = useRouter();
  const isNew = !id || id === "new";
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/insights/${id}`);
      const data = await res.json();
      if (res.ok) setForm({ ...empty, ...data.item });
      else setError(data.error || "Not found");
      setLoading(false);
    })();
  }, [id, isNew]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(statusOverride) {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        status: statusOverride || form.status,
      };
      const res = await fetch(isNew ? "/api/insights" : `/api/insights/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (isNew) router.replace(`/insights/${data.item._id}`);
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
        title={isNew ? "New insight" : "Edit insight"}
        subtitle="Write with the rich text editor. Upload a hero image to Cloudinary. Save as draft or publish."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => save("draft")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save("published")}
              className="rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
            >
              {saving ? "Saving…" : "Publish"}
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30"
              required
            />
          </Field>
          <Field label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30"
            />
          </Field>
          <Field label="Body">
            <RichTextEditor
              value={form.bodyHtml}
              onChange={(html) => set("bodyHtml", html)}
              placeholder="Write the full insight article…"
            />
          </Field>
        </div>

        <div className="space-y-4">
          <ImageUpload
            value={form.heroImage}
            folder="me-hr/insights"
            onChange={({ url, publicId }) => {
              set("heroImage", url);
              set("heroImagePublicId", publicId);
            }}
          />
          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30"
              placeholder="auto-from-title if empty"
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30"
            >
              <option>Insights</option>
              <option>Events & engagement</option>
              <option>Updates</option>
            </select>
          </Field>
          <Field label="Read time">
            <input
              value={form.readTime}
              onChange={(e) => set("readTime", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.popular}
              onChange={(e) => set("popular", e.target.checked)}
            />
            Popular
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">Article SEO</p>
            <div className="space-y-3">
              <Field label="SEO title override">
                <input
                  value={form.seoTitle}
                  onChange={(e) => set("seoTitle", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                  placeholder="Defaults to article title"
                />
              </Field>
              <Field label="SEO description">
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => set("seoDescription", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                  placeholder="Defaults to excerpt"
                />
              </Field>
              <Field label="SEO keywords (comma-separated)">
                <input
                  value={(form.seoKeywords || []).join(", ")}
                  onChange={(e) =>
                    set(
                      "seoKeywords",
                      e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean)
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.noIndex}
                  onChange={(e) => set("noIndex", e.target.checked)}
                />
                noindex this article
              </label>
            </div>
          </div>
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
