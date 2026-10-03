import "server-only";
import { createHmac, createHash } from "node:crypto";
import { PaymentError } from "../payments/errors";

function first(...values: Array<string | undefined>) {
  return values.find(value => value && value.trim())?.trim();
}

export function usesSupabase() {
  return Boolean(
    first(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    first(
      process.env.SUPABASE_SECRET_KEY,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_SERVICE_ROLE_SECRET,
    ),
  );
}

export function supabaseConfig() {
  // Vercel's Supabase integration commonly supplies NEXT_PUBLIC_SUPABASE_URL and
  // a server-side service-role/secret variable. Keep the original MyWCSA names
  // supported as well so existing deployments do not break.
  const origin = first(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL);
  const secret = first(
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_ROLE_SECRET,
  );

  if (!origin)
    throw new PaymentError(503, "The Supabase project URL is not available to the MyWCSA server.");
  if (!secret)
    throw new PaymentError(503, "The Supabase server credential is not available to the MyWCSA server.");

  // Supabase supports both the current sb_secret_ key format and legacy
  // service_role JWTs. These credentials remain server-only and are never sent
  // to the browser.
  if (!(secret.startsWith("sb_secret_") || secret.startsWith("eyJ")))
    throw new PaymentError(503, "The configured Supabase server credential format is not supported.");

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new PaymentError(503, "The configured Supabase project URL is invalid.");
  }
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    (url.pathname !== "/" && url.pathname !== "") ||
    url.search ||
    url.hash
  )
    throw new PaymentError(503, "The configured Supabase URL must be the project base URL.");
  return { origin: url.origin, secret };
}

export async function rpc<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  if (!/^wcsa_[a-z_]+$/.test(name))
    throw new PaymentError(500, "Invalid AMS operation.");
  const c = supabaseConfig();
  let response: Response;
  try {
    response = await fetch(`${c.origin}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: c.secret,
        Authorization: `Bearer ${c.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new PaymentError(503, "MyWCSA could not connect to the Supabase AMS database.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401)
      throw new PaymentError(503, "The MyWCSA Supabase server credential was rejected.");
    if (data?.code === "42501")
      throw new PaymentError(403, "Registry permission is required for this operation.");
    if (data?.code === "23505")
      throw new PaymentError(409, "This record already exists in AMS. Refresh the page and check the existing record before trying again.");
    if (data?.code === "22023")
      throw new PaymentError(400, data?.message || "AMS rejected the submitted information.");
    if (data?.code === "PGRST202" || data?.code === "42P01" || data?.code === "42883")
      throw new PaymentError(503, `The required AMS database function ${name} is not available in the connected Supabase project.`);
    throw new PaymentError(502, data?.message ? `AMS database error: ${String(data.message).slice(0, 180)}` : "The AMS database could not complete the operation.");
  }
  return data as T;
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function claimInvoice(token: string, mode: string) {
  return rpc("wcsa_claim_invoice", { p_token_hash: tokenHash(token), p_mode: mode });
}
export function lookupInvoice(reference: string, mode: string) {
  return rpc("wcsa_lookup_invoice", { p_reference: reference, p_mode: mode });
}
export function saveCheckout(reference: string, url: string, mode: string) {
  return rpc<{ saved: boolean }>("wcsa_save_checkout", { p_reference: reference, p_url: url, p_mode: mode });
}
export function settleInvoice(
  reference: string,
  payment: { transactionId: string; amount: number; currency: string; mode: string; paidAt: string },
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
  const bucket = createHmac("sha256", c.secret).update(address.slice(0, 200)).digest("hex");
  const allowed = await rpc<boolean>("wcsa_payment_rate_limit", { p_bucket: bucket });
  if (!allowed)
    throw new PaymentError(429, "Too many checkout attempts. Wait one minute before trying again.");
}
