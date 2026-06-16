import { getManager } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// Lightweight auth probe for the nav. The session cookie is httpOnly, so the
// client can't read it directly — it asks here instead.
export async function GET() {
  const mgr = await getManager();
  return Response.json(
    { signedIn: !!mgr, isAdmin: mgr?.isAdmin ?? false, role: mgr?.role ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
