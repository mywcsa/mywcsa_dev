import { NextResponse } from "next/server";
import { CamsAccessError, camsInsert, requireCamsStaff } from "@/lib/cams/access";

export const dynamic = "force-dynamic";
const tables = ["organisations", "assets", "staff_access"] as const;

export async function POST(request: Request) {
  try {
    const me = await requireCamsStaff();
    const body = await request.json().catch(() => null) as { table?: string; row?: Record<string, unknown> } | null;
    const table = tables.find(t => t === body?.table);
    if (!table || !body?.row || typeof body.row !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(body.row)) if (typeof v === "string" && v.trim() && v.length < 300) clean[k] = v.trim();
    if (table === "organisations") clean.ref = "ORG-" + Date.now().toString().slice(-7);
    const saved = await camsInsert(me.email, table, clean);
    return NextResponse.json({ ok: true, record: saved }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof CamsAccessError ? e.status : 500;
    return NextResponse.json({ error: e instanceof CamsAccessError ? e.message : "Unexpected error." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
