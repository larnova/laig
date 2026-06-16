import { NextResponse } from "next/server";
import { consumeMagicToken, createSession } from "../../../lib/store";
import { SESSION_COOKIE } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// Relative redirect: the browser resolves it against the URL it actually
// requested (e.g. https://laig.larnova.co/...), so we never leak Netlify's
// deploy-permalink host — and the one-time token is dropped from the URL.
function redirectTo(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const email = token ? await consumeMagicToken(token) : null;

  if (!email) return redirectTo("/manage?error=invalid");

  const sessionId = await createSession(email);
  const res = redirectTo("/manage");
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
