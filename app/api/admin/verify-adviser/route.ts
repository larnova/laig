import { getManager } from "../../../lib/auth";
import { getChapters, saveChapters } from "../../../lib/store";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** LAIG HQ marks a chapter adviser as verified (or revokes it). */
export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.isAdmin)
    return Response.json({ ok: false, error: "HQ admins only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const chapterId = str(body.chapterId);
  const adviserId = str(body.adviserId);
  const verified = body.verified === true;

  if (!chapterId || !adviserId)
    return Response.json({ ok: false, error: "Missing chapter or adviser." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  const adviser = chapter.advisers.find((a) => a.id === adviserId);
  if (!adviser) return Response.json({ ok: false, error: "Adviser not found." }, { status: 404 });

  adviser.verified = verified;
  await saveChapters(chapters);

  return Response.json({ ok: true, verified });
}
