import { getManager } from "../../../lib/auth";
import { getChapters, saveChapters } from "../../../lib/store";
import { sendChapterApproved } from "../../../lib/email";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function originFrom(request: Request): string {
  const explicit = process.env.SITE_URL || process.env.URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const h = request.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  const proto = h.get("x-forwarded-proto") || (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

/** LAIG HQ approves a pending chapter request, making it live. */
export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.isAdmin)
    return Response.json({ ok: false, error: "HQ admins only." }, { status: 403 });

  const chapterId = str((await request.json().catch(() => ({}))).chapterId);
  if (!chapterId)
    return Response.json({ ok: false, error: "Missing chapter." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter)
    return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  chapter.status = "approved";
  await saveChapters(chapters);

  // Notify the ambassador — best-effort, never fail the approval over email.
  try {
    const firstName = chapter.ambassadorName.split(" ")[0] || "";
    await sendChapterApproved(
      chapter.ambassadorEmail,
      firstName,
      chapter.university,
      `${originFrom(request)}/manage`
    );
  } catch (err) {
    console.error("Approval email failed:", err);
  }

  return Response.json({ ok: true });
}
