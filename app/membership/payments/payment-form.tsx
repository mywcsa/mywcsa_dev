"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import s from "../portal.module.css";
import { useHydrated } from "../use-hydrated";
export default function PaymentForm() {
  const hydrated = useHydrated();
  const [token, setToken] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function pay(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/membership/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token.trim() }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); window.location.assign(result.url); } catch (e) { setError(e instanceof Error ? e.message : "Checkout could not be opened."); setBusy(false); } }
  return <div className={`${s.portal} ${s.paymentPage}`}><main className={s.main} style={{ maxWidth: 680, margin: "40px auto" }}><p className={s.eyebrow}>MYWCSA MEMBERSHIP · SECURE PAYMENT</p><h1>Pay your approved membership invoice</h1><section className={s.panel}><h2>2027 school membership · R350</h2><p>Enter the private payment code issued by Registry after approval. MyWCSA AMS confirms your invoice before opening Paystack.</p><form onSubmit={pay}><label className={s.field}><span>Registry payment code</span><input autoComplete="off" value={token} onChange={e => setToken(e.target.value)} required minLength={32} maxLength={256} pattern="[A-Za-z0-9_-]{32,256}" /></label><p>No card details are entered or stored in MyWCSA. Complete payment on Paystack’s checkout page.</p>{error && <p role="alert">{error}</p>}<button className={s.primary} disabled={busy || !hydrated}>{busy ? "Checking approved invoice…" : "Continue to Paystack"}</button></form></section><p>Only approved invoices can be paid. Other membership fees will be enabled after they are agreed.</p><Link href="/membership/membership">Back to Membership & Payments</Link></main></div>;
}
