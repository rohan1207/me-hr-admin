import fs from "fs";
import dns from "dns";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
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
    env[t.slice(0, i).trim()] = v;
  }
  return env;
}

const env = loadEnv();
const user = encodeURIComponent(env.MONGODB_USERNAME || "rohanambhore07042003_db_user");
const pass = encodeURIComponent(env.MONGODB_PASSWORD || "");
const hosts = [
  "ac-bdjhtq0-shard-00-00.dgtpdoo.mongodb.net:27017",
  "ac-bdjhtq0-shard-00-01.dgtpdoo.mongodb.net:27017",
  "ac-bdjhtq0-shard-00-02.dgtpdoo.mongodb.net:27017",
].join(",");

const candidates = [
  {
    name: "directConnection single host + tls",
    uri: `mongodb://${user}:${pass}@ac-bdjhtq0-shard-00-00.dgtpdoo.mongodb.net:27017/me-hr-admin?tls=true&authSource=admin&directConnection=true`,
  },
  {
    name: "replicaSet atlas-3vlbxw-shard-0 + tls",
    uri: `mongodb://${user}:${pass}@${hosts}/me-hr-admin?tls=true&replicaSet=atlas-3vlbxw-shard-0&authSource=admin&retryWrites=true&w=majority`,
  },
  {
    name: "no replicaSet + tls (discover)",
    uri: `mongodb://${user}:${pass}@${hosts}/me-hr-admin?tls=true&authSource=admin&retryWrites=true&w=majority`,
  },
  {
    name: "env MONGODB_URI as-is",
    uri: env.MONGODB_URI,
  },
];

for (const c of candidates) {
  process.stdout.write(`\nTrying: ${c.name} … `);
  const client = new MongoClient(c.uri, {
    family: 4,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  try {
    await client.connect();
    const db = client.db("me-hr-admin");
    const cols = await db.listCollections().toArray();
    console.log("SUCCESS");
    console.log("  collections:", cols.map((x) => x.name).join(", ") || "(empty)");
    // print working URI pattern (mask password)
    const masked = c.uri.replace(pass, "***").replace(decodeURIComponent(pass), "***");
    console.log("  WORKING_URI=", masked);
    await client.close();
    process.exit(0);
  } catch (e) {
    console.log("FAIL");
    console.log(" ", e.message.split("\n")[0]);
    try {
      await client.close();
    } catch {
      /* ignore */
    }
  }
}

console.log("\nAll strategies failed.");
process.exit(1);
