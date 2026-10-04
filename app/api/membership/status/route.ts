import { auth } from "@/auth";
import { rpc } from "@/lib/ams/supabase";
import { PaymentError } from "@/lib/payments/errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function fail(error: unknown) { return Response.json({ error: error instanceof Error ? error.message : "Membership status is unavailable." }, { status: error instanceof PaymentError ? error.status : 502, headers: { "Cache-Control": "no-store" } }); }
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    if (!email) throw new PaymentError(401, "Sign in to view membership status.");
    const result = await rpc("wcsa_member_portal", { p_email: email });
    return Response.json(result, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) { return fail(error); }
}
