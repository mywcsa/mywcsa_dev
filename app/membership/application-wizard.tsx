"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { usePreview } from "./portal-shell";
import { initiatives, emptyOrganisation, feeLabel, isIndividual } from "./portal-data";
import { AnnualFields, DocumentFields, OrganisationFields, Panel, Field } from "./portal-content";
import s from "./portal.module.css";
import { useHydrated } from "./use-hydrated";

const stages = ["Choose Membership", "Organisation Details", "Annual Information", "Documents", "Review & Submit"];

type LookupResult = { wcsaId: string; initiative: string; category: string; organisation: Record<string, unknown> };
type SubmitResult = { reference: string; status: string; submittedAt: string };

export default function ApplicationWizard() {
  const { draft, setDraft, notice } = usePreview();
  const [error, setError] = useState("");
  const [accurate, setAccurate] = useState(false);
  const [documentAcknowledged, setDocumentAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const hydrated = useHydrated();
  const step = Math.min(Math.max(draft.step, 1), 5);
  const selectedInitiative = initiatives.find(item => item.id === draft.initiative)!;

  function move(next: number) {
    setError("");
    setDraft(d => ({ ...d, step: next }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function findRenewal() {
    if (!/^05[0-9]{8}$/.test(draft.wcsaId)) { setError("Enter a valid 10-digit WCSA ID starting with 05."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/membership/applications?wcsaId=${encodeURIComponent(draft.wcsaId)}`, { cache: "no-store" });
      const data = await response.json() as LookupResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Membership lookup failed.");
      setDraft(d => ({ ...d, initiative: data.initiative, category: data.category, organisation: { ...d.organisation, ...(data.organisation || {}) }, sample: false, step: 3 }));
      notice("Membership found", "Your organisation details were confirmed from the Registry. Continue with the annual information for this renewal.");
    } catch (e) { setError(e instanceof Error ? e.message : "Membership lookup failed."); }
    finally { setBusy(false); }
  }

  async function submitApplication() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/membership/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json() as SubmitResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Registry could not accept the application.");
      setReference(data.reference);
      setDraft(d => ({ ...d, reviewedPreview: true }));
      notice("Application submitted", `Registry received your membership application. Reference: ${data.reference}. Status: Submitted.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Registry could not accept the application."); }
    finally { setBusy(false); }
  }

  async function continueStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (step === 1) {
      if (draft.application === "Renewal") { await findRenewal(); return; }
      move(2); return;
    }
    if (step === 2) {
      if (!draft.organisation.addressConfirmed) { setError("Confirm the physical address before continuing."); return; }
      if (isIndividual(draft.category) && draft.organisation.dob) {
        const dob = new Date(draft.organisation.dob); const now = new Date();
        const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
        if (dob > now) { setError("Date of birth cannot be in the future."); return; }
        if (age < 18 && (!draft.organisation.guardian || !draft.organisation.guardianEmail)) { setError("Add the parent / guardian's name and email for this applicant."); return; }
      }
      move(3); return;
    }
    if (step === 3) { if (!draft.codes.length) { setError("Select at least one code or programme."); return; } move(4); return; }
    if (step === 4) { if (!documentAcknowledged) { setError("Confirm that the required supporting documents are included."); return; } move(5); return; }
    if (step === 5) { if (!accurate) { setError("Confirm the declaration before submitting."); return; } await submitApplication(); }
  }

  return <>
    <div className={s.pageTitle}><div><p className={s.eyebrow}>MEMBERSHIP APPLICATION · {draft.year}</p><h1>{draft.application === "Renewal" ? "Renew your membership" : "Membership application"}</h1><p>Submit your membership information to the Registry for review.</p></div>{reference && <span className={s.pill}>Reference {reference}</span>}</div>
    <ol className={s.wizardSteps} aria-label="Application progress">{stages.map((name, i) => <li key={name} className={step === i + 1 ? s.currentStep : step > i + 1 ? s.pastStep : ""} aria-current={step === i + 1 ? "step" : undefined}><span>{i + 1}</span><strong>{name}</strong></li>)}</ol>
    <Panel title={`Step ${step} · ${stages[step - 1]}`}>
      <form onSubmit={continueStep}>
        {step === 1 && <>
          <p className={s.muted}>Choose the organisation or programme under which you are applying. Your signed-in account remains the organisation super administrator, with a maximum of two super administrators per organisation.</p>
          <div className={s.initiativeGrid}>{initiatives.map(item => <label key={item.id} className={`${s.initiativeCard} ${draft.initiative === item.id ? s.selectedChoice : ""}`}><input type="radio" name="initiative" value={item.id} checked={draft.initiative === item.id} onChange={() => setDraft(d => ({ ...d, initiative: item.id, category: item.categories[0], codes: [], estimates: {}, sample: false, organisation: { ...emptyOrganisation } }))} /><strong>{item.id === "IKM" ? "iKM" : item.id}</strong><span>{item.name}</span></label>)}</div>
          <div className={s.formGrid}>
            <Field label="Membership type"><select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>{selectedInitiative.categories.map(type => <option key={type}>{type}</option>)}</select></Field>
            <Field label="Membership year"><select value={draft.year} onChange={e => setDraft(d => ({ ...d, year: e.target.value }))}><option>2027</option><option>2028</option></select></Field>
            <Field label="Application type"><select value={draft.application} onChange={e => setDraft(d => ({ ...d, application: e.target.value as "New Application" | "Renewal" }))}><option>New Application</option><option>Renewal</option></select></Field>
          </div>
          <div className={s.feeSummary}><strong>{draft.category}</strong><span>{feeLabel(draft.category)}</span></div>
          {draft.application === "Renewal" && <div className={s.verificationBox}><Field label="Existing WCSA ID"><input required value={draft.wcsaId} inputMode="numeric" pattern="05[0-9]{8}" maxLength={10} onChange={e => setDraft(d => ({ ...d, wcsaId: e.target.value.replace(/\D/g, "") }))} placeholder="10 digits starting with 05" /></Field><p>The Registry will find the active organisation assigned to this WCSA ID. Confirmed renewals continue directly to annual information.</p></div>}
        </>}
        {step === 2 && <><p className={s.muted}>Complete the official organisation or individual details and confirm your authority to apply.</p><OrganisationFields /></>}
        {step === 3 && <AnnualFields />}
        {step === 4 && <><DocumentFields /><label className={s.check}><input type="checkbox" required checked={documentAcknowledged} onChange={e => setDocumentAcknowledged(e.target.checked)} />I confirm that I have included the supporting documents required for this membership type and understand Registry may request additional evidence.</label></>}
        {step === 5 && <>
          <div className={s.reviewBanner}><strong>Ready for Registry submission</strong><span>Submitting creates an official application reference and starts Registry review.</span></div>
          <dl className={s.details}><div><dt>Initiative & membership</dt><dd>{draft.initiative} · {draft.category} · {draft.year}</dd></div><div><dt>Application type</dt><dd>{draft.application}</dd></div><div><dt>Organisation / individual</dt><dd>{draft.organisation.name || "Not added"}</dd></div><div><dt>WCSA ID</dt><dd>{draft.wcsaId || "Allocated manually by Registry after approval where applicable"}</dd></div><div><dt>Address</dt><dd>{[draft.organisation.address, draft.organisation.town, draft.organisation.postalCode].filter(Boolean).join(", ") || "Not added"}</dd></div><div><dt>Codes / programmes</dt><dd>{draft.codes.join(", ") || "Not selected"}</dd></div><div><dt>Documents</dt><dd>{draft.documents.map(f => f.name).join(", ") || "No documents added"}</dd></div><div><dt>Annual fee</dt><dd>{feeLabel(draft.category)} · payable only after Registry approval</dd></div></dl>
          <label className={s.check}><input type="checkbox" checked={accurate} onChange={e => setAccurate(e.target.checked)} required />I declare that the information supplied is complete and accurate and I am authorised to submit this application.</label>
          <p className={s.muted}>Workflow: Submitted → Under Review → Information Required or Approved for Payment → Payment Verified → Active.</p>
        </>}
        {error && <p role="alert" className={s.error}>{error}</p>}
        <div className={s.wizardActions}>{step > 1 && <button type="button" className={s.secondary} disabled={busy} onClick={() => move(step - 1)}>← Back</button>}<Link href="/membership/dashboard">Return to dashboard</Link><button type="submit" className={s.primary} disabled={!hydrated || busy || Boolean(reference)}>{busy ? "Please wait…" : reference ? "Submitted" : step === 5 ? "Submit application to Registry" : step === 1 && draft.application === "Renewal" ? "Find organisation" : "Continue →"}</button></div>
      </form>
    </Panel>
  </>;
}
