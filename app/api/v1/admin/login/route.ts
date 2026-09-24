import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, createAdminSession, verifyAdminKey } from "../../../../../lib/demo-auth";

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 4_096) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const body = await req.json().catch(() => ({ key: "" })) as { key?: unknown };
  const key = String(body.key ?? "");
  if (key.length > 512 || !verifyAdminKey(key)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: session.maxAge });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
