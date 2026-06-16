import { getManager } from "../../../lib/auth";
import { getChapters, saveChapters } from "../../../lib/store";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

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

  return Response.json({ ok: true });
}
