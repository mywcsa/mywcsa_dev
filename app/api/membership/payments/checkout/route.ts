import { checkout, errorResponse, PaymentError } from "@/lib/payments/paystack";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 2048) throw new PaymentError(413, "Payment request is too large.");
    let body; try { body = JSON.parse(raw); } catch { throw new PaymentError(400, "Invalid payment request."); }
    const result = await checkout(body?.token, request.headers.get("origin"));
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
