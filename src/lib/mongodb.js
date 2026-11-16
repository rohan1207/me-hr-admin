import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore */
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment");
}

/** @type {{ conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null }} */
const globalWithMongo = global;

if (!globalWithMongo._mongo) {
  globalWithMongo._mongo = { conn: null, promise: null };
}

const DB_NAME = process.env.MONGODB_DB || "me-hr-admin";

function mongoOptions() {
  const allowInvalid =
    process.env.MONGODB_TLS_INSECURE === "1" ||
    process.env.MONGODB_TLS_INSECURE === "true";
  return {
    bufferCommands: false,
    family: 4,
    serverSelectionTimeoutMS: 20000,
    dbName: DB_NAME,
    ...(allowInvalid ? { tlsAllowInvalidCertificates: true } : {}),
  };
}

export async function connectDB() {
  if (globalWithMongo._mongo.conn) {
    // Drop stale HMR / env-reload connections pointed at the wrong DB
    if (globalWithMongo._mongo.conn.connection?.name === DB_NAME) {
      return globalWithMongo._mongo.conn;
    }
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
    globalWithMongo._mongo.conn = null;
    globalWithMongo._mongo.promise = null;
  }

  if (!globalWithMongo._mongo.promise) {
    globalWithMongo._mongo.promise = mongoose.connect(MONGODB_URI, mongoOptions());
  }

  try {
    globalWithMongo._mongo.conn = await globalWithMongo._mongo.promise;
  } catch (err) {
    globalWithMongo._mongo.promise = null;
    throw err;
  }
  return globalWithMongo._mongo.conn;
}
