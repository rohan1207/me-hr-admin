import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const require = createRequire(import.meta.url);

function loadAsCjs(rel) {
  const abs = path.join(root, rel);
  let src = fs.readFileSync(abs, "utf8");
  src = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/import\s+[^;]+;/g, "")
    .replace(/export\s+\{[^}]+\}\s+from\s+[^;]+;/g, "")
    .replace(/export\s+\{[^}]+\};/g, "")
    .replace(/export\s+const\s+/g, "exports.")
    .replace(/export\s+default\s+/g, "exports.default = ");
  const tmp = path.join(__dirname, `_tmp_${path.basename(rel)}.cjs`);
  fs.writeFileSync(tmp, src);
  delete require.cache[require.resolve(tmp)];
  const mod = require(tmp);
  fs.unlinkSync(tmp);
  return mod;
}

const IMAGE_MAP = {
  "structured-hr": "/insights/structured-hr.webp",
  "fractional-hr": "/insights/resident-hr.webp",
  "engagement-culture": "/insights/engagement.webp",
  "payroll-compliance": "/insights/payroll.webp",
  "performance-systems": "/insights/performance.webp",
  "on-demand-hr": "/insights/on-demand.webp",
  "workplace-moments": "/insights/workplace-moments.webp",
  "hr-lifecycle": "/insights/lifecycle.webp",
};

const jobs = loadAsCjs("src/data/jobOpenings.js").jobOpenings;

const contentRaw = fs.readFileSync(path.join(root, "src/data/content.js"), "utf8");

function extractBalancedArray(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`Marker not found: ${marker}`);
  const bracketStart = src.indexOf("[", start);
  let depth = 0;
  for (let i = bracketStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        const literal = src.slice(bracketStart, i + 1);
        return Function(`"use strict"; return (${literal});`)();
      }
    }
  }
  throw new Error(`Unbalanced array for ${marker}`);
}

const posts = extractBalancedArray(contentRaw, "posts: [");
const caseStudies = extractBalancedArray(contentRaw, "export const caseStudies = [");

const testimonialsBlockStart = contentRaw.indexOf("testimonials: {");
if (testimonialsBlockStart < 0) throw new Error("testimonials block not found");
const testimonialItems = extractBalancedArray(
  contentRaw.slice(testimonialsBlockStart),
  "items: ["
);

const insights = posts.map((p) => ({
  slug: p.id,
  title: p.title,
  excerpt: p.excerpt || "",
  category: p.category || "Insights",
  readTime: p.readTime || "5 min read",
  heroImage: IMAGE_MAP[p.id] || "",
  body: p.body || [],
  bodyHtml: (p.body || []).map((para) => `<p>${para}</p>`).join("\n"),
  featured: !!p.featured,
  popular: !!p.popular,
  status: "published",
  publishedAt: new Date().toISOString(),
}));

const cases = caseStudies.map((c) => ({
  slug: c.id,
  title: c.title,
  heroImage: String(c.image || "").replace(/\.(jpg|jpeg|png)$/i, ".webp"),
  challenge: c.challenge || "",
  actions: c.actions || [],
  impact: c.impact || "",
  bodyHtml: "",
  status: "published",
  publishedAt: new Date().toISOString(),
}));

const careers = jobs.map((j) => ({
  slug: j.id,
  company: j.company || "me-HR",
  title: j.title,
  subtitle: j.subtitle || "",
  location: j.location || "",
  experience: j.experience || "",
  type: j.type || "",
  salary: j.salary || "",
  industry: j.industry || "",
  reportingTo: j.reportingTo || "",
  about: j.about || "",
  summary: j.summary || "",
  sections: j.sections || [],
  active: true,
  status: "published",
  publishedAt: new Date().toISOString(),
}));

// aboutContent.testimonials.items — ids like t1..t8
const testimonials = (testimonialItems || [])
  .filter((t) => t && t.id && t.headline && t.quote)
  .map((t, i) => ({
    slug: t.id,
    tag: t.tag || "",
    headline: t.headline,
    quote: t.quote,
    name: t.name || "",
    role: t.role || "",
    place: t.place || "",
    order: i + 1,
    active: true,
    status: "published",
  }));

const out = path.join(__dirname, "../src/data/seed-content.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  JSON.stringify({ insights, cases, careers, testimonials }, null, 2)
);
console.log(
  `Seed ready → insights:${insights.length} cases:${cases.length} careers:${careers.length} testimonials:${testimonials.length}`
);
