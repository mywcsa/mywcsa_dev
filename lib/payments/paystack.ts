import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

import { PaymentError } from "./errors";
import {
  usesSupabase,
  supabaseConfig,
  claimInvoice,
  lookupInvoice,
  saveCheckout,
  settleInvoice,
  enforceCheckoutRate,
} from "../ams/supabase";
export { PaymentError, errorResponse } from "./errors";
export type Invoice = {
  reference: string;
  status: "approved_for_payment" | "paid";
  initiative: string;
  category: string;
  year: string;
  amount: number;
  currency: string;
  email: string;
  organisationName: string;
  expiresAt: string;
  mode?: string;
  checkoutUrl?: string | null;
  checkoutPending?: boolean;
};
function config() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  const mode = process.env.PAYSTACK_MODE;
  const origin = process.env.MEMBERSHIP_PUBLIC_ORIGIN;
  const ams = process.env.WCSA_AMS_API_URL;
  const amsKey = process.env.WCSA_AMS_API_KEY;
  if (
    !key ||
    !["live", "test"].includes(mode || "") ||
    !key.startsWith(mode === "live" ? "sk_live_" : "sk_test_") ||
    !origin ||
    (!usesSupabase() && (!ams || !amsKey))
  )
    throw new PaymentError(
      503,
      "Payments are awaiting the secure gateway and AMS invoice configuration. Please contact Registry.",
    );
  const publicUrl = new URL(origin);
  const amsUrl = !usesSupabase() && ams ? new URL(ams) : null;
  if (usesSupabase()) supabaseConfig();
  if (
    publicUrl.protocol !== "https:" ||
    (amsUrl && amsUrl.protocol !== "https:") ||
    publicUrl.username ||
    publicUrl.password ||
    amsUrl?.username ||
    amsUrl?.password ||
    publicUrl.pathname !== "/" ||
    publicUrl.search ||
    publicUrl.hash ||
    amsUrl?.search ||
    amsUrl?.hash
  )
    throw new PaymentError(503, "Payment configuration is unavailable.");
  return {
    key,
    mode,
    origin: publicUrl.origin,
    ams: ams?.replace(/\/$/, ""),
    amsKey,
  };
}
async function jsonRequest(
  url: string,
  key: string,
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new PaymentError(
      502,
      "The payment service is temporarily unavailable. Please try again or contact Registry.",
    );
  return response.json();
}
async function ams(path: string, method = "GET", body?: unknown) {
  const c = config();
  return jsonRequest(`${c.ams}${path}`, c.amsKey!, method, body);
}
function invoice(value: unknown): Invoice {
  const v = value as Invoice | null;
  if (
    !v ||
    !/^wcsa-[A-Za-z0-9-]{16,100}$/.test(v.reference || "") ||
    !["approved_for_payment", "paid"].includes(v.status) ||
    v.initiative !== "WCSSA" ||
    v.category !== "School" ||
    v.year !== "2027" ||
    v.amount !== 35000 ||
    v.currency !== "ZAR" ||
    typeof v.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ||
    typeof v.organisationName !== "string" ||
    !Number.isFinite(Date.parse(v.expiresAt))
  )
    throw new PaymentError(
      403,
      "A valid Registry-approved 2027 school invoice is required. Other membership fees have not been configured.",
    );
  return v;
}
export function verifySignature(body: string, signature: string | null) {
  const key = config().key;
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", key).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export async function checkout(
  token: unknown,
  origin: string | null,
  clientAddress = "unknown",
) {
  const c = config();
  if (origin !== c.origin)
    throw new PaymentError(
      403,
      "Please open the payment link on the official membership portal.",
    );
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{32,256}$/.test(token))
    throw new PaymentError(
      400,
      "Enter the valid payment code supplied by Registry.",
    );
  // AMS atomically claims the approved invoice and returns its persisted reference.
  // Client drafts, amounts and categories are never used to establish eligibility.
  if (usesSupabase()) await enforceCheckoutRate(clientAddress);
  const bill = invoice(
    usesSupabase()
      ? await claimInvoice(token, c.mode!)
      : await ams("/payment-invoices/claim", "POST", { token }),
  );
  if (bill.status === "paid")
    throw new PaymentError(
      409,
      "This invoice has already been paid. Please request your receipt from Registry.",
    );
  if (Date.parse(bill.expiresAt) <= Date.now())
    throw new PaymentError(
      403,
      "This payment link has expired. Please request a new one from Registry.",
    );
  if (bill.mode && bill.mode !== c.mode)
    throw new PaymentError(
      403,
      "Invoice payment mode does not match the gateway.",
    );
  if (bill.checkoutUrl) return { url: checkoutUrl(bill.checkoutUrl) };
  if (bill.checkoutPending)
    throw new PaymentError(
      409,
      "Checkout is already being prepared. Please wait 30 seconds and try again.",
    );
  const result = await jsonRequest(
    "https://api.paystack.co/transaction/initialize",
    c.key,
    "POST",
    {
      email: bill.email,
      amount: 35000,
      currency: "ZAR",
      reference: bill.reference,
      callback_url: `${c.origin}/membership/payments/return`,
    },
  );
  const url = result?.data?.authorization_url;
  if (!result?.status || typeof url !== "string")
    throw new PaymentError(
      502,
      "Checkout could not be opened. Please contact Registry before retrying.",
    );
  const checkoutAddress = checkoutUrl(url);
  if (usesSupabase()) {
    const saved = await saveCheckout(bill.reference, checkoutAddress, c.mode!);
    if (!saved.saved)
      throw new PaymentError(
        409,
        "The invoice changed while checkout was opening. Contact Registry before paying.",
      );
  }
  return { url: checkoutAddress };
}
function checkoutUrl(value: string) {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "checkout.paystack.com" ||
    parsed.username ||
    parsed.password ||
    parsed.port
  )
    throw new PaymentError(502, "Checkout could not be opened.");
  return parsed.href;
}

export async function settle(reference: string) {
  if (!/^wcsa-[A-Za-z0-9-]{16,100}$/.test(reference))
    throw new PaymentError(400, "Invalid payment reference.");
  const c = config();
  const bill = invoice(
    usesSupabase()
      ? await lookupInvoice(reference, c.mode!)
      : await ams(
          `/payment-invoices/by-reference/${encodeURIComponent(reference)}`,
        ),
  );
  if (bill.reference !== reference)
    throw new PaymentError(
      403,
      "Payment reference does not match the approved invoice.",
    );
  const result = await jsonRequest(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    c.key,
  );
  const payment = result?.data;
  if (!result?.status || payment?.status !== "success") return { paid: false };
  if (
    payment.reference !== bill.reference ||
    payment.amount !== bill.amount ||
    payment.currency !== bill.currency ||
    payment.domain !== c.mode ||
    payment.customer?.email?.toLowerCase() !== bill.email.toLowerCase() ||
    !Number.isSafeInteger(payment.id) ||
    !Number.isFinite(Date.parse(payment.paid_at))
  )
    throw new PaymentError(
      403,
      "Payment details do not match the Registry-approved invoice. Please contact Registry.",
    );
  // AMS must atomically settle once per reference and transaction ID, persist the
  // receipt, then publish membership state to its separate organisation interfaces.
  const verified = {
    transactionId: String(payment.id),
    amount: payment.amount,
    currency: payment.currency,
    mode: payment.domain,
    paidAt: payment.paid_at,
  };
  const saved = usesSupabase()
    ? await settleInvoice(reference, verified)
    : await ams(
        `/payment-invoices/${encodeURIComponent(reference)}/settle`,
        "POST",
        { reference, provider: "paystack", ...verified },
      );
  if (saved?.status !== "paid")
    throw new PaymentError(
      502,
      "Payment was received but Registry confirmation is pending. Do not pay again; contact Registry.",
    );
  return { paid: true };
}
