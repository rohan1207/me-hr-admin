/**
 * Push seed-content.json into MongoDB.
 * Usage: npm run seed
 */
import fs from "fs";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Windows / some routers break Node's SRV DNS (querySrv ECONNREFUSED). Prefer public DNS.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore */
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("FAIL: admin/.env.local not found");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val; // last wins (Atlas URI overrides local)
  }
}

loadEnv();

let uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("FAIL: MONGODB_URI missing in .env.local");
  process.exit(1);
}

// Only for mongodb+srv://host/ without a DB path — never rewrite host:port lists
if (uri.startsWith("mongodb+srv://") && /mongodb\.net\/?(\?|$)/.test(uri)) {
  uri = uri.replace(/\.mongodb\.net\/?/, ".mongodb.net/me-hr-admin");
  console.log("INFO: appended database name me-hr-admin to SRV URI");
}

const seedPath = path.join(root, "src/data/seed-content.json");
if (!fs.existsSync(seedPath)) {
  console.error("FAIL: seed-content.json missing. Run: npm run seed:build");
  process.exit(1);
}
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const InsightSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const CaseStudySchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const CareerSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const TestimonialSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const AdminUserSchema = new mongoose.Schema(
  {
    username: String,
    passwordHash: String,
    name: String,
    role: String,
  },
  { timestamps: true }
);

const Insight = mongoose.models.Insight || mongoose.model("Insight", InsightSchema);
const CaseStudy = mongoose.models.CaseStudy || mongoose.model("CaseStudy", CaseStudySchema);
const Career = mongoose.models.Career || mongoose.model("Career", CareerSchema);
const Testimonial =
  mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
const AdminUser =
  mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

function upsertOps(rows, dateFields = []) {
  return (rows || []).map((row) => {
    const doc = { ...row };
    for (const f of dateFields) {
      if (doc[f]) doc[f] = new Date(doc[f]);
    }
    return {
      updateOne: {
        filter: { slug: row.slug },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    };
  });
}

async function main() {
  console.log("Connecting to MongoDB…");
  console.log(
    "URI kind:",
    uri.startsWith("mongodb+srv") ? "mongodb+srv (SRV)" : "mongodb (standard)"
  );
  try {
    const allowInvalid =
      process.env.MONGODB_TLS_INSECURE === "1" ||
      process.env.MONGODB_TLS_INSECURE === "true";
    await mongoose.connect(uri, {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 20000,
      dbName: process.env.MONGODB_DB || "me-hr-admin",
      ...(allowInvalid ? { tlsAllowInvalidCertificates: true } : {}),
    });
  } catch (err) {
    console.error("FAIL: could not connect to MongoDB");
    console.error(err.message);
    if (String(err.message).includes("querySrv") || String(err.message).includes("ECONNREFUSED")) {
      console.error("");
      console.error("Hint: On this PC Node cannot resolve mongodb+srv DNS.");
      console.error("Use a standard mongodb:// URI in .env.local (already preferred).");
      console.error("Also allow your IP in Atlas → Network Access.");
    }
    process.exit(1);
  }
  console.log("OK: connected");

  const username = process.env.ADMIN_USERNAME || "Me@hradmin";
  const password = process.env.ADMIN_PASSWORD || "Mehrpune@2027";
  let admin = await AdminUser.findOne({ username });
  if (!admin) {
    admin = await AdminUser.create({
      username,
      passwordHash: await bcrypt.hash(password, 12),
      name: "me-HR Admin",
      role: "admin",
    });
    console.log(`OK: created admin user ${username}`);
  } else {
    console.log(`OK: admin user exists (${username})`);
  }

  const counts = {
    insights: seed.insights?.length || 0,
    cases: seed.cases?.length || 0,
    careers: seed.careers?.length || 0,
    testimonials: seed.testimonials?.length || 0,
  };

  if (counts.insights) await Insight.bulkWrite(upsertOps(seed.insights, ["publishedAt"]));
  if (counts.cases) await CaseStudy.bulkWrite(upsertOps(seed.cases, ["publishedAt"]));
  if (counts.careers) await Career.bulkWrite(upsertOps(seed.careers, ["publishedAt"]));
  if (counts.testimonials) await Testimonial.bulkWrite(upsertOps(seed.testimonials));

  const [i, c, r, t] = await Promise.all([
    Insight.countDocuments(),
    CaseStudy.countDocuments(),
    Career.countDocuments(),
    Testimonial.countDocuments(),
  ]);

  console.log("");
  console.log("SUCCESS — data seeded into MongoDB");
  console.log(`  Insights:      ${i}  (from file: ${counts.insights})`);
  console.log(`  Case studies:  ${c}  (from file: ${counts.cases})`);
  console.log(`  Careers:       ${r}  (from file: ${counts.careers})`);
  console.log(`  Testimonials:  ${t}  (from file: ${counts.testimonials})`);
  console.log("");
  console.log("Open http://localhost:3001 and check each menu.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
