import { createHmac, timingSafeEqual } from "node:crypto";

export class PaymentError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export type Invoice = { reference: string; status: "approved_for_payment" | "paid"; initiative: string; category: string; year: string; amount: number; currency: string; email: string; organisationName: string; expiresAt: string };
function config() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  const mode = process.env.PAYSTACK_MODE;
  const origin = process.env.MEMBERSHIP_PUBLIC_ORIGIN;
  const ams = process.env.WCSA_AMS_API_URL;
  const amsKey = process.env.WCSA_AMS_API_KEY;
  if (!key || !["live", "test"].includes(mode || "") || !key.startsWith(mode === "live" ? "sk_live_" : "sk_test_") || !origin || !ams || !amsKey) throw new PaymentError(503, "Payments are awaiting the secure gateway and AMS invoice configuration. Please contact Registry.");
  const publicUrl = new URL(origin); const amsUrl = new URL(ams);
  if (publicUrl.protocol !== "https:" || amsUrl.protocol !== "https:" || publicUrl.username || publicUrl.password || amsUrl.username || amsUrl.password || publicUrl.pathname !== "/" || publicUrl.search || publicUrl.hash || amsUrl.search || amsUrl.hash) throw new PaymentError(503, "Payment configuration is unavailable.");
  return { key, mode, origin: publicUrl.origin, ams: ams.replace(/\/$/, ""), amsKey };
}
async function jsonRequest(url: string, key: string, method = "GET", body?: unknown) {
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new PaymentError(502, "The payment service is temporarily unavailable. Please try again or contact Registry.");
  return response.json();
}
async function ams(path: string, method = "GET", body?: unknown) { const c = config(); return jsonRequest(`${c.ams}${path}`, c.amsKey, method, body); }
function invoice(value: unknown): Invoice {
  const v = value as Invoice | null;
  if (!v || !/^wcsa-[A-Za-z0-9-]{16,100}$/.test(v.reference || "") || !["approved_for_payment", "paid"].includes(v.status) || v.initiative !== "WCSSA" || v.category !== "School" || v.year !== "2027" || v.amount !== 35000 || v.currency !== "ZAR" || typeof v.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) || typeof v.organisationName !== "string" || !Number.isFinite(Date.parse(v.expiresAt))) throw new PaymentError(403, "A valid Registry-approved 2027 school invoice is required. Other membership fees have not been configured.");
  return v;
}
export function verifySignature(body: string, signature: string | null) {
  const key = config().key;
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", key).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export async function checkout(token: unknown, origin: string | null) {
  const c = config();
  if (origin !== c.origin) throw new PaymentError(403, "Please open the payment link on the official membership portal.");
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{32,256}$/.test(token)) throw new PaymentError(400, "Enter the valid payment code supplied by Registry.");
  // AMS atomically claims the approved invoice and returns its persisted reference.
  // Client drafts, amounts and categories are never used to establish eligibility.
  const bill = invoice(await ams("/payment-invoices/claim", "POST", { token }));
  if (bill.status === "paid") throw new PaymentError(409, "This invoice has already been paid. Please request your receipt from Registry.");
  if (Date.parse(bill.expiresAt) <= Date.now()) throw new PaymentError(403, "This payment link has expired. Please request a new one from Registry.");
  const result = await jsonRequest("https://api.paystack.co/transaction/initialize", c.key, "POST", { email: bill.email, amount: 35000, currency: "ZAR", reference: bill.reference, callback_url: `${c.origin}/membership/payments/return` });
  const url = result?.data?.authorization_url;
  if (!result?.status || typeof url !== "string") throw new PaymentError(502, "Checkout could not be opened. Please contact Registry before retrying.");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "checkout.paystack.com" || parsed.username || parsed.password) throw new PaymentError(502, "Checkout could not be opened.");
  return { url: parsed.href };
}
export async function settle(reference: string) {
  if (!/^wcsa-[A-Za-z0-9-]{16,100}$/.test(reference)) throw new PaymentError(400, "Invalid payment reference.");
  const c = config();
  const bill = invoice(await ams(`/payment-invoices/by-reference/${encodeURIComponent(reference)}`));
  if (bill.reference !== reference) throw new PaymentError(403, "Payment reference does not match the approved invoice.");
  const result = await jsonRequest(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, c.key);
  const payment = result?.data;
  if (!result?.status || payment?.status !== "success") return { paid: false };
  if (payment.reference !== bill.reference || payment.amount !== bill.amount || payment.currency !== bill.currency || payment.domain !== c.mode || payment.customer?.email?.toLowerCase() !== bill.email.toLowerCase() || !Number.isSafeInteger(payment.id) || !Number.isFinite(Date.parse(payment.paid_at))) throw new PaymentError(403, "Payment details do not match the Registry-approved invoice. Please contact Registry.");
  // AMS must atomically settle once per reference and transaction ID, persist the
  // receipt, then publish membership state to its separate organisation interfaces.
  const saved = await ams(`/payment-invoices/${encodeURIComponent(reference)}/settle`, "POST", { reference, provider: "paystack", transactionId: String(payment.id), amount: payment.amount, currency: payment.currency, mode: payment.domain, paidAt: payment.paid_at });
  if (saved?.status !== "paid") throw new PaymentError(502, "Payment was received but Registry confirmation is pending. Do not pay again; contact Registry.");
  return { paid: true };
}
export function errorResponse(error: unknown) {
  return Response.json({ error: error instanceof PaymentError ? error.message : "Payment service unavailable. Please contact Registry before retrying." }, { status: error instanceof PaymentError ? error.status : 502, headers: { "Cache-Control": "no-store" } });
}
