"use client";
import { useEffect, useState, type FormEvent } from "react";
import s from "../../../membership/portal.module.css";
import { useHydrated } from "../../../membership/use-hydrated";
type Invoice = {
  reference: string;
  organisationName: string;
  emis: string;
  email: string;
  reviewReference: string;
  year: string;
  status: string;
  mode: string;
  receiptNumber: string | null;
};
export default function InvoiceWorkspace() {
  const hydrated = useHydrated();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [canIssue, setCanIssue] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Checking database connection…");
  async function load() {
    try {
      const response = await fetch("/api/ams/membership-invoices", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setError("");
      setInvoices(result.invoices);
      setCanIssue(true);
      setStatus("Connected to the AMS database");
    } catch (e) {
      setCanIssue(false);
      setInvoices([]);
      setStatus("Setup or Registry permission required");
      setError(
        e instanceof Error ? e.message : "The database could not be reached.",
      );
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ams/membership-invoices", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result;
      })
      .then((result) => {
        setInvoices(result.invoices);
        setCanIssue(true);
        setStatus("Connected to the AMS database");
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setCanIssue(false);
          setInvoices([]);
          setStatus("Setup or Registry permission required");
          setError(
            e instanceof Error
              ? e.message
              : "The database could not be reached.",
          );
        }
      });
    return () => controller.abort();
  }, []);
  async function issue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setCode("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/ams/membership-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationName: data.get("organisationName"),
          emis: data.get("emis"),
          email: data.get("email"),
          reviewReference: data.get("reviewReference"),
          reviewNotes: data.get("reviewNotes"),
          reviewConfirmed: data.get("reviewConfirmed") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCode(result.paymentCode);
      form.reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invoice could not be issued.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`${s.portal} ${s.main} ${s.embedded}`}>
      <div className={s.pageTitle}>
        <div>
          <p className={s.eyebrow}>MYWCSA AMS · REGISTRY</p>
          <h1>Membership invoices</h1>
          <p>Registry-approved 2027 school memberships · R350 each.</p>
        </div>
        <button className={s.secondary} onClick={load}>
          Refresh records
        </button>
      </div>
      <p role="status">{status}</p>
      {error && <p role="alert">{error}</p>}
      <section className={s.panel}>
        <h2>Issue an approved invoice</h2>
        <p>
          Record a completed Registry review using its existing application or
          file reference. This does not submit or approve a local membership
          preview. Only authorised Registry staff can issue invoices.
        </p>
        <form onSubmit={issue}>
          <div className={s.formGrid}>
            <label className={s.field}>
              <span>School’s official name</span>
              <input
                name="organisationName"
                required
                minLength={2}
                maxLength={250}
              />
            </label>
            <label className={s.field}>
              <span>EMIS / paypoint number</span>
              <input
                name="emis"
                inputMode="numeric"
                required
                pattern="[0-9]{10}"
                maxLength={10}
              />
            </label>
            <label className={s.field}>
              <span>Authorised payer email</span>
              <input name="email" type="email" required maxLength={254} />
            </label>
            <label className={s.field}>
              <span>Registry application / review reference</span>
              <input
                name="reviewReference"
                required
                minLength={3}
                maxLength={150}
              />
            </label>
          </div>
          <label className={s.field}>
            <span>Review notes and document references</span>
            <textarea
              name="reviewNotes"
              required
              minLength={10}
              maxLength={4000}
            />
          </label>
          <label className={s.check}>
            <input name="reviewConfirmed" type="checkbox" required />I have
            completed Registry review of the organisation’s details,
            representative’s authority and required documents.
          </label>
          <button
            className={s.primary}
            disabled={busy || !hydrated || !canIssue}
          >
            {busy ? "Issuing invoice…" : "Issue R350 invoice"}
          </button>
        </form>
      </section>
      {code && (
        <section className={s.panel}>
          <h2>Private payment code</h2>
          <p>
            Give this code securely to the authorised payer, together with the
            invoice reference. It is displayed only for this issuance and is not
            stored in plain text.
          </p>
          <output
            style={{
              display: "block",
              overflowWrap: "anywhere",
              padding: 14,
              background: "#edf2fb",
            }}
          >
            {code}
          </output>
          <p>
            Payment page: https://govapps.wcsports.co.za/membership/payments
          </p>
          <button className={s.secondary} onClick={() => setCode("")}>
            Hide code
          </button>
        </section>
      )}
      <section className={s.panel}>
        <h2>Approved invoices & verified payments</h2>
        {!invoices.length ? (
          <p>No invoices to display.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                fontSize: 13,
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {[
                    "School / EMIS",
                    "Invoice / review",
                    "Payer",
                    "Status / mode",
                    "Receipt",
                  ].map((label) => (
                    <th
                      key={label}
                      style={{ padding: 10, borderBottom: "1px solid #d2d7df" }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.reference}>
                    <td style={{ padding: 10 }}>
                      {i.organisationName}
                      <br />
                      {i.emis}
                    </td>
                    <td style={{ padding: 10, overflowWrap: "anywhere" }}>
                      {i.reference}
                      <br />
                      {i.reviewReference}
                    </td>
                    <td style={{ padding: 10 }}>{i.email}</td>
                    <td style={{ padding: 10 }}>
                      {i.status.replaceAll("_", " ")}
                      <br />
                      {i.mode}
                    </td>
                    <td style={{ padding: 10 }}>
                      {i.receiptNumber || "Not issued"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
