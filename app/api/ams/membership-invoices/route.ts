import { randomBytes } from "node:crypto";
import {
  registryIdentity,
  requireOrigin,
  paymentMode,
} from "@/lib/ams/registry-access";
import { rpc, tokenHash } from "@/lib/ams/supabase";
import { errorResponse, PaymentError } from "@/lib/payments/errors";
export const runtime = "nodejs";
export async function GET() {
  try {
    const actor = await registryIdentity();
    const invoices = await rpc("wcsa_registry_list_invoices", {
      ...actor,
      p_mode: paymentMode(),
    });
    return Response.json(
      { invoices },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(request: Request) {
  try {
    const actor = await registryIdentity();
    requireOrigin(request);
    const raw = await request.text();
    if (raw.length > 8000)
      throw new PaymentError(413, "Invoice request is too large.");
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new PaymentError(400, "Invalid invoice request.");
    }
    const text = (key: string) =>
      typeof body?.[key] === "string" ? body[key].trim() : "";
    const name = text("organisationName"),
      emis = text("emis"),
      email = text("email").toLowerCase(),
      review = text("reviewReference"),
      notes = text("reviewNotes");
    if (
      name.length < 2 ||
      name.length > 250 ||
      !/^\d{10}$/.test(emis) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      review.length < 3 ||
      review.length > 150 ||
      notes.length < 10 ||
      notes.length > 4000 ||
      body.reviewConfirmed !== true
    )
      throw new PaymentError(
        400,
        "Complete the school, payer and Registry review details, and confirm that review is complete.",
      );
    const token = randomBytes(32).toString("base64url");
    const invoice = await rpc("wcsa_registry_issue_invoice", {
      ...actor,
      p_name: name,
      p_emis: emis,
      p_email: email,
      p_review_reference: review,
      p_review_notes: notes,
      p_token_hash: tokenHash(token),
      p_mode: paymentMode(),
    });
    return Response.json(
      { invoice, paymentCode: token },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
