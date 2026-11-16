import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AdminUser } from "@/lib/models/AdminUser";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME || "Me@hradmin";
  const password = process.env.ADMIN_PASSWORD || "Mehrpune@2027";
  let user = await AdminUser.findOne({ username });
  if (!user) {
    user = await AdminUser.create({
      username,
      passwordHash: await hashPassword(password),
      name: "me-HR Admin",
    });
  }
  return user;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await ensureAdmin();

    if (user.username !== username) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSessionToken({
      sub: String(user._id),
      username: user.username,
      name: user.name,
    });

    const res = NextResponse.json({
      ok: true,
      user: { username: user.username, name: user.name },
    });
    return setSessionCookie(res, token);
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
