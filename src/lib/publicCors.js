import { NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function withPublicCors(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Access-Control-Allow-Origin", CORS["Access-Control-Allow-Origin"]);
  headers.set("Access-Control-Allow-Methods", CORS["Access-Control-Allow-Methods"]);
  headers.set("Access-Control-Allow-Headers", CORS["Access-Control-Allow-Headers"]);
  headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
  return NextResponse.json(data, { ...init, headers });
}

export function publicOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS,
  });
}
