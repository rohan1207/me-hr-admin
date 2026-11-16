"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  Search,
  Globe,
  FileCode2,
  Route,
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const TABS = [
  { id: "pages", label: "Page SEO", icon: Search },
  { id: "global", label: "Global & tracking", icon: Globe },
  { id: "aeo", label: "AEO / LLMs", icon: Sparkles },
  { id: "robots", label: "robots.txt", icon: FileCode2 },
  { id: "redirects", label: "Redirects", icon: Route },
  { id: "publish", label: "Publish & hosting", icon: Download },
];

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b5f58]/30";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

function scorePage(p) {
  let score = 0;
  const checks = [];
  const titleLen = (p.title || "").length;
  const descLen = (p.description || "").length;
  if (titleLen >= 30 && titleLen <= 65) {
    score += 25;
    checks.push({ ok: true, text: `Title length OK (${titleLen})` });
  } else {
    checks.push({ ok: false, text: `Title length ${titleLen} (aim 30–65)` });
  }
  if (descLen >= 110 && descLen <= 170) {
    score += 25;
    checks.push({ ok: true, text: `Meta description OK (${descLen})` });
  } else {
    checks.push({ ok: false, text: `Description length ${descLen} (aim 110–170)` });
  }
  if (p.focusKeyword) {
    score += 15;
    checks.push({ ok: true, text: "Focus keyword set" });
    if ((p.title || "").toLowerCase().includes(String(p.focusKeyword).toLowerCase())) {
      score += 10;
      checks.push({ ok: true, text: "Focus keyword in title" });
    } else checks.push({ ok: false, text: "Add focus keyword into title" });
  } else checks.push({ ok: false, text: "Set a focus keyword" });
  if ((p.keywords || []).length >= 3) {
    score += 10;
    checks.push({ ok: true, text: "Keyword list present" });
  } else checks.push({ ok: false, text: "Add at least 3 keywords" });
  if (p.canonicalPath) {
    score += 5;
    checks.push({ ok: true, text: "Canonical set" });
  }
  if (p.aeoSummary) {
    score += 10;
    checks.push({ ok: true, text: "AEO summary present" });
  } else checks.push({ ok: false, text: "Add AEO / answer-style summary" });
  return { score: Math.min(100, score), checks };
}

export default function SeoAdminPage() {
  const [tab, setTab] = useState("pages");
  const [settings, setSettings] = useState(null);
  const [pages, setPages] = useState([]);
  const [redirects, setRedirects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const selected = useMemo(
    () => pages.find((p) => p._id === selectedId) || null,
    [pages, selectedId]
  );
  const audit = useMemo(() => (selected ? scorePage(selected) : null), [selected]);

  async function load() {
    setError("");
    const [sRes, pRes, rRes] = await Promise.all([
      fetch("/api/seo/settings"),
      fetch("/api/seo/pages"),
      fetch("/api/seo/redirects"),
    ]);
    const s = await sRes.json();
    const p = await pRes.json();
    const r = await rRes.json();
    if (!sRes.ok) throw new Error(s.error || "Failed settings");
    if (!pRes.ok) throw new Error(p.error || "Failed pages");
    setSettings(s.settings);
    setPages(p.items || []);
    setRedirects(r.items || []);
    if (!selectedId && p.items?.[0]?._id) setSelectedId(p.items[0]._id);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  }

  async function saveSettings(patch) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/seo/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSettings(data.settings);
      flash("Global SEO saved — live on public API");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePage(patch) {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/seo/pages/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setPages((list) => list.map((p) => (p._id === data.item._id ? data.item : p)));
      flash("Page SEO saved — frontend will pick this up from the admin API");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function addPage() {
    const path = prompt("New page path (e.g. /media/new-article-slug)", "/");
    if (!path) return;
    const res = await fetch("/api/seo/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, label: path, title: "" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create");
      return;
    }
    setPages((list) => [...list, data.item].sort((a, b) => a.path.localeCompare(b.path)));
    setSelectedId(data.item._id);
    flash("Page added");
  }

  async function addRedirect() {
    const fromPath = prompt("From path", "/old-page");
    const toPath = prompt("To path", "/");
    if (!fromPath || !toPath) return;
    const res = await fetch("/api/seo/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromPath, toPath, statusCode: 301 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setRedirects((list) => [...list, data.item]);
  }

  const filtered = pages.filter((p) => {
    if (!q) return true;
    const hay = `${p.path} ${p.label} ${p.title} ${p.focusKeyword}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title="SEO & AEO management"
        subtitle="Agency-ready controls for titles, metas, keywords, robots.txt, llms.txt, schema, redirects and answer-engine optimisation. Changes publish via the public SEO API (no code deploy for page meta)."
      />

      {message && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium ${
                active
                  ? "bg-[#0b5f58] text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "pages" && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter pages…"
                className={input}
              />
              <button
                type="button"
                onClick={addPage}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                <Plus size={14} /> Add path
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {filtered.map((p) => {
                const s = scorePage(p).score;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setSelectedId(p._id)}
                    className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                      selectedId === p._id ? "bg-[#e6f7f4] text-[#0b5f58]" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{p.label || p.path}</span>
                      <span className="text-[11px] text-slate-500">{s}</span>
                    </div>
                    <p className="truncate text-xs text-slate-400">{p.path}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {selected ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.label || selected.path}</h2>
                  <p className="text-sm text-slate-500">{selected.path}</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => savePage(selected)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Save size={15} /> {saving ? "Saving…" : "Save page SEO"}
                </button>
              </div>

              {audit && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    On-page SEO score: {audit.score}/100
                  </p>
                  <ul className="space-y-1">
                    {audit.checks.map((c) => (
                      <li key={c.text} className="flex items-start gap-2 text-xs text-slate-600">
                        {c.ok ? (
                          <CheckCircle2 size={14} className="mt-0.5 text-emerald-600" />
                        ) : (
                          <AlertTriangle size={14} className="mt-0.5 text-amber-500" />
                        )}
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Label">
                  <input
                    className={input}
                    value={selected.label || ""}
                    onChange={(e) =>
                      setPages((list) =>
                        list.map((p) =>
                          p._id === selected._id ? { ...p, label: e.target.value } : p
                        )
                      )
                    }
                  />
                </Field>
                <Field label="Focus keyword">
                  <input
                    className={input}
                    value={selected.focusKeyword || ""}
                    onChange={(e) =>
                      setPages((list) =>
                        list.map((p) =>
                          p._id === selected._id ? { ...p, focusKeyword: e.target.value } : p
                        )
                      )
                    }
                  />
                </Field>
              </div>

              <Field label={`SEO title (${(selected.title || "").length} chars)`}>
                <input
                  className={input}
                  value={selected.title || ""}
                  onChange={(e) =>
                    setPages((list) =>
                      list.map((p) =>
                        p._id === selected._id ? { ...p, title: e.target.value } : p
                      )
                    )
                  }
                />
              </Field>

              <Field label={`Meta description (${(selected.description || "").length} chars)`}>
                <textarea
                  className={input}
                  rows={3}
                  value={selected.description || ""}
                  onChange={(e) =>
                    setPages((list) =>
                      list.map((p) =>
                        p._id === selected._id ? { ...p, description: e.target.value } : p
                      )
                    )
                  }
                />
              </Field>

              <Field label="Keywords (comma-separated)">
                <textarea
                  className={input}
                  rows={2}
                  value={(selected.keywords || []).join(", ")}
                  onChange={(e) =>
                    setPages((list) =>
                      list.map((p) =>
                        p._id === selected._id
                          ? {
                              ...p,
                              keywords: e.target.value
                                .split(",")
                                .map((x) => x.trim())
                                .filter(Boolean),
                            }
                          : p
                      )
                    )
                  }
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Canonical path">
                  <input
                    className={input}
                    value={selected.canonicalPath || ""}
                    onChange={(e) =>
                      setPages((list) =>
                        list.map((p) =>
                          p._id === selected._id ? { ...p, canonicalPath: e.target.value } : p
                        )
                      )
                    }
                  />
                </Field>
                <Field label="Robots">
                  <select
                    className={input}
                    value={selected.robots || "index,follow"}
                    onChange={(e) =>
                      setPages((list) =>
                        list.map((p) =>
                          p._id === selected._id
                            ? {
                                ...p,
                                robots: e.target.value,
                                noIndex: e.target.value.includes("noindex"),
                              }
                            : p
                        )
                      )
                    }
                  >
                    <option value="index,follow">index,follow</option>
                    <option value="noindex,follow">noindex,follow</option>
                    <option value="index,nofollow">index,nofollow</option>
                    <option value="noindex,nofollow">noindex,nofollow</option>
                  </select>
                </Field>
              </div>

              <Field label="OG image URL (Cloudinary or absolute)">
                <input
                  className={input}
                  value={selected.ogImage || ""}
                  onChange={(e) =>
                    setPages((list) =>
                      list.map((p) =>
                        p._id === selected._id ? { ...p, ogImage: e.target.value } : p
                      )
                    )
                  }
                />
              </Field>

              <Field label="AEO answer summary (2–3 sentences for AI / featured snippets)">
                <textarea
                  className={input}
                  rows={3}
                  value={selected.aeoSummary || ""}
                  onChange={(e) =>
                    setPages((list) =>
                      list.map((p) =>
                        p._id === selected._id ? { ...p, aeoSummary: e.target.value } : p
                      )
                    )
                  }
                />
              </Field>

              <Field label="Custom JSON-LD (optional, raw JSON)">
                <textarea
                  className={`${input} font-mono text-xs`}
                  rows={6}
                  value={selected.jsonLd || ""}
                  onChange={(e) =>
                    setPages((list) =>
                      list.map((p) =>
                        p._id === selected._id ? { ...p, jsonLd: e.target.value } : p
                      )
                    )
                  }
                />
              </Field>
            </div>
          ) : (
            <p className="text-slate-500">Select a page</p>
          )}
        </div>
      )}

      {tab === "global" && settings && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => saveSettings(settings)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Save size={15} /> Save global
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Site name">
              <input
                className={input}
                value={settings.siteName || ""}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </Field>
            <Field label="Site URL">
              <input
                className={input}
                value={settings.siteUrl || ""}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              />
            </Field>
            <Field label="GA4 Measurement ID">
              <input
                className={input}
                value={settings.gaMeasurementId || ""}
                onChange={(e) => setSettings({ ...settings, gaMeasurementId: e.target.value })}
              />
            </Field>
            <Field label="GTM ID (optional)">
              <input
                className={input}
                value={settings.gtmId || ""}
                onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
              />
            </Field>
            <Field label="Google site verification meta content">
              <input
                className={input}
                value={settings.googleSiteVerification || ""}
                onChange={(e) =>
                  setSettings({ ...settings, googleSiteVerification: e.target.value })
                }
              />
            </Field>
            <Field label="Bing site verification">
              <input
                className={input}
                value={settings.bingSiteVerification || ""}
                onChange={(e) =>
                  setSettings({ ...settings, bingSiteVerification: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Default description">
            <textarea
              className={input}
              rows={3}
              value={settings.defaultDescription || ""}
              onChange={(e) => setSettings({ ...settings, defaultDescription: e.target.value })}
            />
          </Field>
          <Field label="Default OG image">
            <input
              className={input}
              value={settings.defaultOgImage || ""}
              onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
            />
          </Field>
          <Field label="Organization JSON-LD">
            <textarea
              className={`${input} font-mono text-xs`}
              rows={12}
              value={settings.organizationJsonLd || ""}
              onChange={(e) => setSettings({ ...settings, organizationJsonLd: e.target.value })}
            />
          </Field>
        </div>
      )}

      {tab === "aeo" && settings && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            Answer Engine Optimisation (AEO) and LLM discoverability: keep{" "}
            <code className="rounded bg-slate-100 px-1">llms.txt</code> accurate, allow AI bots in
            robots.txt, and write clear answer-style page summaries + FAQ schema on service pages.
          </p>
          <Field label="Agency AEO playbook notes">
            <textarea
              className={input}
              rows={5}
              value={settings.aeoNotes || ""}
              onChange={(e) => setSettings({ ...settings, aeoNotes: e.target.value })}
            />
          </Field>
          <Field label="llms.txt (served at public SEO API)">
            <textarea
              className={`${input} font-mono text-xs`}
              rows={16}
              value={settings.llmsTxt || ""}
              onChange={(e) => setSettings({ ...settings, llmsTxt: e.target.value })}
            />
          </Field>
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveSettings({ aeoNotes: settings.aeoNotes, llmsTxt: settings.llmsTxt })
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Save size={15} /> Save AEO / llms.txt
          </button>
        </div>
      )}

      {tab === "robots" && settings && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Field label="robots.txt">
            <textarea
              className={`${input} font-mono text-xs`}
              rows={18}
              value={settings.robotsTxt || ""}
              onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
            />
          </Field>
          <button
            type="button"
            disabled={saving}
            onClick={() => saveSettings({ robotsTxt: settings.robotsTxt })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b5f58] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Save size={15} /> Save robots.txt
          </button>
        </div>
      )}

      {tab === "redirects" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex justify-between">
            <p className="text-sm text-slate-600">
              Manage 301/302 maps here. On static IIS hosting, export the rewrite rules from Publish
              tab (or proxy via admin). On Vercel/Node hosts, redirects can be applied at the edge.
            </p>
            <button
              type="button"
              onClick={addRedirect}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2">From</th>
                <th className="py-2">To</th>
                <th className="py-2">Code</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r._id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{r.fromPath}</td>
                  <td className="py-2 font-mono text-xs">{r.toPath}</td>
                  <td className="py-2">{r.statusCode}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        await fetch(`/api/seo/redirects/${r._id}`, { method: "DELETE" });
                        setRedirects((list) => list.filter((x) => x._id !== r._id));
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!redirects.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-slate-500">
                    No redirects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "publish" && settings && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">How SEO stays live (true, not fake)</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>
              Deploy this <strong>admin</strong> app on Vercel (Node). Page titles/descriptions/keywords
              are read by the public website from{" "}
              <code className="rounded bg-slate-100 px-1">/api/public/seo</code>.
            </li>
            <li>
              Set <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_ADMIN_API_URL</code> on the
              public site build to your Vercel admin URL (one-time).
            </li>
            <li>
              For <strong>robots.txt / llms.txt / sitemap.xml</strong> on static IIS: either (a) IIS
              reverse-proxy those paths to the admin public SEO endpoints, or (b) download the files
              below and upload to wwwroot when robots/llms change.
            </li>
            <li>
              Insights / careers / case studies body content is already CMS-driven from this admin —
              no developer needed for content publishing.
            </li>
          </ol>

          <div className="grid gap-3 md:grid-cols-3">
            <a
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50"
              href="/api/public/seo/robots"
              target="_blank"
              rel="noreferrer"
            >
              Open live robots.txt API
            </a>
            <a
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50"
              href="/api/public/seo/llms"
              target="_blank"
              rel="noreferrer"
            >
              Open live llms.txt API
            </a>
            <a
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50"
              href="/api/public/seo/sitemap"
              target="_blank"
              rel="noreferrer"
            >
              Open live sitemap.xml API
            </a>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="mb-2 font-semibold text-slate-800">IIS rewrite example (proxy to admin)</p>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono">{`<rule name="seo-robots" stopProcessing="true">
  <match url="^robots\\.txt$" />
  <action type="Rewrite" url="https://YOUR-ADMIN.vercel.app/api/public/seo/robots" />
</rule>`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
