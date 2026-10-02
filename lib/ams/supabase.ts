import "server-only";
import { createHmac, createHash } from "node:crypto";
import { PaymentError } from "../payments/errors";
export function usesSupabase() {
  return Boolean(process.env.SUPABASE_URL || process.env.SUPABASE_SECRET_KEY);
}
export function supabaseConfig() {
  const origin = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!origin || !secret?.startsWith("sb_secret_"))
    throw new PaymentError(
      503,
      "The AMS database settings are incomplete. Contact Registry.",
    );
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new PaymentError(503, "The AMS database URL is invalid.");
  }
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9]+\.supabase\.co$/.test(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new PaymentError(503, "Use the Supabase project base URL for AMS.");
  return { origin: url.origin, secret };
}
export async function rpc<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  if (!/^wcsa_[a-z_]+$/.test(name))
    throw new PaymentError(500, "Invalid AMS operation.");
  const c = supabaseConfig();
  const response = await fetch(`${c.origin}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: c.secret, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  if (!response.ok) {
    if (data?.code === "42501")
      throw new PaymentError(
        403,
        "Registry permission is required for this operation.",
      );
    if (data?.code === "23505")
      throw new PaymentError(
        409,
        "This school or review already has a membership invoice for the selected year and mode. Check existing invoices before trying again.",
      );
    if (data?.code === "22023")
      throw new PaymentError(
        403,
        "The payment code or invoice details are invalid, expired or do not match. Contact Registry.",
      );
    if (data?.code === "PGRST202" || data?.code === "42P01")
      throw new PaymentError(
        503,
        "The AMS database tables have not been installed. Complete the Supabase SQL setup.",
      );
    throw new PaymentError(
      502,
      "The AMS database could not complete the operation. Contact Registry before retrying.",
    );
  }
  return data as T;
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function claimInvoice(token: string, mode: string) {
  return rpc("wcsa_claim_invoice", {
    p_token_hash: tokenHash(token),
    p_mode: mode,
  });
}
export function lookupInvoice(reference: string, mode: string) {
  return rpc("wcsa_lookup_invoice", { p_reference: reference, p_mode: mode });
}
export function saveCheckout(reference: string, url: string, mode: string) {
  return rpc<{ saved: boolean }>("wcsa_save_checkout", {
    p_reference: reference,
    p_url: url,
    p_mode: mode,
  });
}
export function settleInvoice(
  reference: string,
  payment: {
    transactionId: string;
    amount: number;
    currency: string;
    mode: string;
    paidAt: string;
  },
) {
  return rpc<{ status: string; receiptNumber: string }>("wcsa_settle_invoice", {
    p_reference: reference,
    p_transaction_id: payment.transactionId,
    p_amount: payment.amount,
    p_currency: payment.currency,
    p_mode: payment.mode,
    p_paid_at: payment.paidAt,
  });
}

export async function enforceCheckoutRate(address: string) {
  const c = supabaseConfig();
  const bucket = createHmac("sha256", c.secret)
    .update(address.slice(0, 200))
    .digest("hex");
  const allowed = await rpc<boolean>("wcsa_payment_rate_limit", {
    p_bucket: bucket,
  });
  if (!allowed)
    throw new PaymentError(
      429,
      "Too many checkout attempts. Wait one minute before trying again.",
    );
}
