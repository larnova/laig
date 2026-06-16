import { getChapterForEmail, createMagicToken, normalizeEmail } from "../../../lib/store";
import { sendMagicLink } from "../../../lib/email";
import { isAdmin } from "../../../lib/auth";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function originFrom(request: Request): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = request.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  const proto = h.get("x-forwarded-proto") || (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  let email = "";
  try {
    email = normalizeEmail(String((await request.json()).email || ""));
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  // Ambassadors, exec members (manage a chapter), and HQ admins can sign in.
  const managed = await getChapterForEmail(email);
  if (managed || isAdmin(email)) {
    try {
      const token = await createMagicToken(email);
      const url = `${originFrom(request)}/api/auth/verify?token=${token}`;
      await sendMagicLink(email, url);
    } catch (err) {
      console.error("Failed to send magic link:", err);
      return Response.json(
        { ok: false, error: "Could not send the sign-in email. Try again." },
        { status: 500 }
      );
    }
  }

  // Respond identically whether or not the email is registered (no enumeration).
  return Response.json({
    ok: true,
    message: "If that email is registered with LAIG, a sign-in link is on its way.",
  });
}
