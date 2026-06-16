import { cookies } from "next/headers";
import { consumeMagicToken, createSession } from "../../../lib/store";
import { SESSION_COOKIE } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const email = token ? await consumeMagicToken(token) : null;

  const base = new URL(request.url).origin;
  if (!email) {
    return Response.redirect(`${base}/manage?error=invalid`, 303);
  }

  const sessionId = await createSession(email);
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return Response.redirect(`${base}/manage`, 303);
}
