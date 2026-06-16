import { cookies } from "next/headers";
import { deleteSession } from "../../../lib/store";
import { SESSION_COOKIE } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (id) await deleteSession(id);
  store.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
