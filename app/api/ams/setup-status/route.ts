import { registryIdentity, paymentMode } from "@/lib/ams/registry-access";
import { rpc } from "@/lib/ams/supabase";
import { errorResponse } from "@/lib/payments/errors";
export const runtime = "nodejs";
export async function GET() {
  try {
    const actor = await registryIdentity();
    const schema = await rpc<{ schemaVersion: string }>("wcsa_setup_status");
    let registryAccess = false;
    try {
      await rpc("wcsa_registry_list_invoices", {
        ...actor,
        p_mode: paymentMode(),
      });
      registryAccess = true;
    } catch {
      /* Keep setup details private; no invoices exposed. */
    }
    const mode = paymentMode();
    const key = process.env.PAYSTACK_SECRET_KEY;
    return Response.json(
      {
        database: "connected",
        staffEmail: actor.p_actor,
        microsoftTenantId: actor.p_tenant,
        schemaVersion: schema.schemaVersion,
        mode,
        registryAccess,
        paystackConfigured: Boolean(
          key?.startsWith(mode === "live" ? "sk_live_" : "sk_test_"),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
