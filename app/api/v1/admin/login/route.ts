import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, createAdminSession, verifyAdminKey } from "../../../../../lib/demo-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ key: "" })) as { key?: unknown };
  if (!verifyAdminKey(String(body.key ?? ""))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
