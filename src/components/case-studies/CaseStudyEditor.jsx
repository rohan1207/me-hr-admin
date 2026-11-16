"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ImageUpload from "@/components/ui/ImageUpload";
import RichTextEditor from "@/components/editor/RichTextEditor";

const empty = {
  title: "",
  slug: "",
  heroImage: "",
  heroImagePublicId: "",
  challenge: "",
  actionsText: "",
  impact: "",
  bodyHtml: "",
  status: "draft",
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30";

export default function CaseStudyEditor({ id }) {
  const router = useRouter();
  const isNew = !id || id === "new";
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/case-studies/${id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          ...empty,
          ...data.item,
          actionsText: (data.item.actions || []).join("\n"),
        });
      } else setError(data.error || "Not found");
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
        title: form.title,
        slug: form.slug,
        heroImage: form.heroImage,
        heroImagePublicId: form.heroImagePublicId,
        challenge: form.challenge,
        actions: form.actionsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        impact: form.impact,
        bodyHtml: form.bodyHtml,
        status: statusOverride || form.status,
      };
      const res = await fetch(
        isNew ? "/api/case-studies" : `/api/case-studies/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (isNew) router.replace(`/case-studies/${data.item._id}`);
      else {
        setForm({
          ...empty,
          ...data.item,
          actionsText: (data.item.actions || []).join("\n"),
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
        title={isNew ? "New case study" : "Edit case study"}
        subtitle="Challenge, actions, impact, optional long-form body and hero image."
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
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="The challenge">
            <textarea className={inputCls} rows={4} value={form.challenge} onChange={(e) => set("challenge", e.target.value)} />
          </Field>
          <Field label="What me-HR did (one action per line)">
            <textarea className={inputCls} rows={6} value={form.actionsText} onChange={(e) => set("actionsText", e.target.value)} />
          </Field>
          <Field label="The impact">
            <textarea className={inputCls} rows={4} value={form.impact} onChange={(e) => set("impact", e.target.value)} />
          </Field>
          <Field label="Optional extended body">
            <RichTextEditor value={form.bodyHtml} onChange={(html) => set("bodyHtml", html)} />
          </Field>
        </div>
        <div className="space-y-4">
          <ImageUpload
            value={form.heroImage}
            folder="me-hr/case-studies"
            onChange={({ url, publicId }) => {
              set("heroImage", url);
              set("heroImagePublicId", publicId);
            }}
          />
          <Field label="Slug">
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
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
