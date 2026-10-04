import { errorResponse, PaymentError, verifySignature } from "@/lib/payments/paystack";
import { settleMembership } from "@/lib/payments/settle-membership";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 65536) throw new PaymentError(413, "Event is too large.");
    if (!verifySignature(raw, request.headers.get("x-paystack-signature"))) throw new PaymentError(401, "Invalid webhook signature.");
    let event; try { event = JSON.parse(raw); } catch { throw new PaymentError(400, "Invalid event."); }
    if (event?.event === "charge.success" && typeof event.data?.reference === "string" && event.data.reference.startsWith("wcsa-")) {
      const result = await settleMembership(event.data.reference);
      if (!result.paid) throw new PaymentError(502, "Payment verification pending.");
    }
    return Response.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
