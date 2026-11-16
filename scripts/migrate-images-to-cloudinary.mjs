/**
 * Upload seeded local hero images to Cloudinary and rewrite MongoDB URLs.
 * Usage: node scripts/migrate-images-to-cloudinary.mjs
 */
import fs from "fs";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore */
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const repo = path.resolve(root, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[t.slice(0, i).trim()] = v;
  }
}

loadEnv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const SEARCH_ROOTS = [
  path.join(repo, "Nextjs_website", "public"),
  path.join(repo, "public"),
  path.join(root, "public"),
];

function findLocalFile(rel) {
  const clean = rel.replace(/^\//, "");
  for (const base of SEARCH_ROOTS) {
    const full = path.join(base, clean);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function uploadFile(filePath, folder, publicId) {
  return cloudinary.uploader.upload(filePath, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
}

async function migrateCollection(db, name, folder) {
  const col = db.collection(name);
  const docs = await col.find({}).toArray();
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const doc of docs) {
    const src = doc.heroImage || "";
    if (!src) {
      skipped += 1;
      continue;
    }
    if (src.includes("res.cloudinary.com")) {
      skipped += 1;
      continue;
    }
    if (!src.startsWith("/")) {
      skipped += 1;
      continue;
    }

    const local = findLocalFile(src);
    if (!local) {
      console.warn(`MISS ${name} ${doc.slug || doc._id}: ${src}`);
      missing += 1;
      continue;
    }

    const publicId = path.basename(src, path.extname(src));
    const result = await uploadFile(local, folder, publicId);
    await col.updateOne(
      { _id: doc._id },
      {
        $set: {
          heroImage: result.secure_url,
          heroImagePublicId: result.public_id,
        },
      }
    );
    console.log(`OK  ${name} ${doc.slug || doc._id} → ${result.secure_url}`);
    updated += 1;
  }

  return { updated, skipped, missing };
}

async function main() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error("FAIL: Cloudinary env vars missing");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
    dbName: process.env.MONGODB_DB || "me-hr-admin",
    tlsAllowInvalidCertificates:
      process.env.MONGODB_TLS_INSECURE === "1" ||
      process.env.MONGODB_TLS_INSECURE === "true",
  });

  const db = mongoose.connection.db;
  console.log("Cloudinary ping…");
  console.log(await cloudinary.api.ping());

  const insights = await migrateCollection(db, "insights", "me-hr/insights");
  const cases = await migrateCollection(db, "casestudies", "me-hr/case-studies");

  console.log("");
  console.log("DONE");
  console.log("  insights:", insights);
  console.log("  casestudies:", cases);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
