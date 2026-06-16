import { getManager } from "../../../lib/auth";
import { deleteChapter } from "../../../lib/store";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** LAIG HQ deletes a chapter (and its events) — e.g. rejecting a request. */
export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.isAdmin)
    return Response.json({ ok: false, error: "HQ admins only." }, { status: 403 });

  const chapterId = str((await request.json().catch(() => ({}))).chapterId);
  if (!chapterId)
    return Response.json({ ok: false, error: "Missing chapter." }, { status: 400 });

  await deleteChapter(chapterId);
  return Response.json({ ok: true });
}
