"use client";
import Link from "next/link";
import { PdfDownload } from "./pdf-download";
import { useRef, useState, type FormEvent } from "react";
import { usePreview } from "./portal-shell";
import { initiatives, applicationStages, demoOrganisation, emptyOrganisation, feeLabel, isIndividual } from "./portal-data";
import { AnnualFields, DocumentFields, OrganisationFields, Panel, Field } from "./portal-content";
import s from "./portal.module.css";
import { useHydrated } from "./use-hydrated";

export default function ApplicationWizard() {
  const { draft, setDraft, notice } = usePreview();
  const [error, setError] = useState("");
  const [accurate, setAccurate] = useState(false);
  const [documentAcknowledged, setDocumentAcknowledged] = useState(false);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const pass = useRef<HTMLInputElement>(null);
  const confirmPass = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const hydrated = useHydrated();
  const step = draft.step;
  const selectedInitiative = initiatives.find(item => item.id === draft.initiative)!;
  function move(next: number) { setError(""); setDraft(d => ({ ...d, step: next })); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function continueStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (step === 1) {
      if (pass.current?.value !== confirmPass.current?.value) { setError("The passwords do not match."); return; }
      if (!draft.account.verifiedPreview) { setError("Use Preview email verification to see the next stage. No verification email is sent."); return; }
      if (pass.current) pass.current.value = ""; if (confirmPass.current) confirmPass.current.value = ""; setShowPassword(false); move(2); return;
    }
    if (step === 2) {
      if (draft.application === "Renewal") {
        if (draft.wcsaId !== "0547071626") { setError("Live database lookup is not connected. To test the renewal wizard, use the sample WCSA ID 0547071626."); return; }
        confirmDialog.current?.showModal(); return;
      }
      move(3); return;
    }
    if (step === 3 && !draft.organisation.addressConfirmed) { setError("Confirm the physical address before continuing."); return; }
    if (step === 3 && isIndividual(draft.category) && draft.organisation.dob) {
      const dob = new Date(draft.organisation.dob); const now = new Date(); const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (dob > now) { setError("Date of birth cannot be in the future."); return; }
      if (age < 18 && (!draft.organisation.guardian || !draft.organisation.guardianEmail)) { setError("Add the parent / guardian's name and email for this applicant."); return; }
    }
    if (step === 4 && !draft.codes.length) { setError("Select at least one code or programme."); return; }
    if (step === 5 && !documentAcknowledged) { setError("Acknowledge the proposed document checklist before reviewing."); return; }
    if (step === 6) {
      if (!accurate) { setError("Confirm your review declaration first."); return; }
      setDraft(d => ({ ...d, reviewedPreview: true })); notice("Application review preview complete", "Nothing has been submitted to Registry. You can download the draft or return to the dashboard. Live submission, verification and payment remain disconnected."); return;
    }
    move(step + 1);
  }
  function confirmOrganisation(update: boolean) {
    setDraft(d => ({ ...d, initiative: "WCSSA", category: "School", organisation: { ...demoOrganisation }, sample: true, step: update ? 3 : 4 })); confirmDialog.current?.close(); setError(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return <>
    <div className={s.pageTitle}><div><p className={s.eyebrow}>MEMBERSHIP APPLICATION · {draft.year}</p><h1>{draft.application === "Renewal" ? "Renew your membership" : "Start your membership"}</h1><p>Account, annual information and supporting documents.</p></div><PdfDownload /></div>
    <ol className={s.wizardSteps} aria-label="Application progress">{applicationStages.map((name, i) => <li key={name} className={step === i + 1 ? s.currentStep : step > i + 1 ? s.pastStep : ""} aria-current={step === i + 1 ? "step" : undefined}><span>{i + 1}</span><strong>{name}</strong></li>)}</ol>
    <Panel title={`Step ${step} · ${applicationStages[step - 1]}`}>
      <form onSubmit={continueStep}>
        {step === 1 && <>
          <p className={s.muted}>Prepare your account details. This preview does not register an account or send a verification email.</p>
          <div className={s.formGrid}>{([['firstName','First name','text'],['surname','Surname','text'],['email','Email address','email'],['mobile','Mobile number','tel']] as const).map(([key,label,type]) => <Field key={key} label={label}><input required type={type} value={draft.account[key]} onChange={e => setDraft(d => ({ ...d, account: { ...d.account, [key]: e.target.value, ...(key === "email" ? { verifiedPreview: false } : {}) } }))} /></Field>)}
            <Field label="Password"><input ref={pass} type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" /></Field>
            <Field label="Confirm password"><input ref={confirmPass} type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" /></Field>
          </div>
          <label className={s.check}><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />Show passwords</label>
          <label className={s.check}><input required type="checkbox" checked={draft.account.privacy} onChange={e => setDraft(d => ({ ...d, account: { ...d.account, privacy: e.target.checked } }))} />I understand this preview keeps draft details only in the open browser session.</label>
          <label className={s.check}><input required type="checkbox" checked={draft.account.terms} onChange={e => setDraft(d => ({ ...d, account: { ...d.account, terms: e.target.checked } }))} />I acknowledge this is a preview; live portal terms will be provided before registration opens.</label>
          <div className={s.verificationBox}><div><strong>{draft.account.verifiedPreview ? "Verification step previewed" : "Email verification"}</strong><p>{draft.account.verifiedPreview ? "Simulated only — email access has not been verified." : "The live system will send a link or code before the application can proceed."}</p></div><button type="button" className={s.secondary} onClick={() => { if (!draft.account.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.account.email)) { setError("Enter a valid email address first."); return; } setDraft(d => ({ ...d, account: { ...d.account, verifiedPreview: true } })); setError(""); }}>Preview email verification</button></div>
        </>}
        {step === 2 && <>
          <p className={s.muted}>Choose the initiative and membership you want to apply for.</p>
          <div className={s.initiativeGrid}>{initiatives.map(item => <label key={item.id} className={`${s.initiativeCard} ${draft.initiative === item.id ? s.selectedChoice : ""}`}><input type="radio" name="initiative" value={item.id} checked={draft.initiative === item.id} onChange={() => setDraft(d => ({ ...d, initiative: item.id, category: item.categories[0], codes: [], estimates: {}, sample: false, organisation: { ...emptyOrganisation } }))} /><strong>{item.id === "IKM" ? "iKM" : item.id}</strong><span>{item.name}</span></label>)}</div>
          <div className={s.formGrid}>
            <Field label="Membership type"><select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>{selectedInitiative.categories.map(type => <option key={type}>{type}</option>)}</select></Field>
            <Field label="Membership year"><select value={draft.year} onChange={e => setDraft(d => ({ ...d, year: e.target.value }))}><option>2027</option><option>2028</option></select></Field>
            <Field label="Application type"><select value={draft.application} onChange={e => setDraft(d => ({ ...d, application: e.target.value as "New Application" | "Renewal" }))}><option>New Application</option><option>Renewal</option></select></Field>
          </div>
          <div className={s.feeSummary}><strong>{draft.category}</strong><span>{feeLabel(draft.category)}</span></div>
          {draft.application === "Renewal" && <div className={s.verificationBox}><div><Field label="Existing WCSA ID"><input required value={draft.wcsaId} inputMode="numeric" pattern="05[0-9]{8}" maxLength={10} onChange={e => setDraft(d => ({ ...d, wcsaId: e.target.value.replace(/\D/g, "") }))} placeholder="10 digits starting with 05" /></Field><p>Use sample ID <strong>0547071626</strong> to test the confirmation wizard. This searches a single sample record, not a live database.</p></div></div>}
        </>}
        {step === 3 && <><p className={s.muted}>{draft.sample ? "Sample record loaded. Updates stay in this preview." : "Complete the official details and confirm your authority to apply."}</p><OrganisationFields /></>}
        {step === 4 && <AnnualFields />}
        {step === 5 && <><DocumentFields /><label className={s.check}><input type="checkbox" required checked={documentAcknowledged} onChange={e => setDocumentAcknowledged(e.target.checked)} />I have reviewed the proposed checklist. Selected files have not been uploaded, and Registry may request further documents.</label></>}
        {step === 6 && <>
          <div className={s.reviewBanner}><strong>{draft.sample ? "Sample application" : "Application draft"}</strong><span>Not submitted · Not verified · Not approved</span></div>
          <dl className={s.details}><div><dt>Applicant</dt><dd>{draft.account.firstName} {draft.account.surname} · {draft.account.email || "Account step not completed"}</dd></div><div><dt>Initiative & membership</dt><dd>{draft.initiative} · {draft.category} · {draft.year}</dd></div><div><dt>Organisation / individual</dt><dd>{draft.organisation.name || "Not added"}</dd></div><div><dt>WCSA ID</dt><dd>{draft.wcsaId || "Not issued — allocated by Registry"}</dd></div><div><dt>Address</dt><dd>{[draft.organisation.address, draft.organisation.town, draft.organisation.postalCode].filter(Boolean).join(", ") || "Not added"}</dd></div><div><dt>Codes / programmes</dt><dd>{draft.codes.join(", ") || "Not selected"}</dd></div><div><dt>Participation targets</dt><dd>{draft.participationTarget || "Not added"}</dd></div><div><dt>Performance targets</dt><dd>{draft.performanceTarget || "Not added"}</dd></div><div><dt>Development priorities</dt><dd>{draft.priorities || "Not added"}</dd></div><div><dt>Documents</dt><dd>{draft.documents.map(f => f.name).join(", ") || "None selected locally"}</dd></div><div><dt>Annual fee</dt><dd>{feeLabel(draft.category)}</dd></div></dl>
          <label className={s.check}><input type="checkbox" checked={accurate} onChange={e => setAccurate(e.target.checked)} required />I have checked this draft and understand that completing the preview does not submit a membership application.</label>
          <p className={s.muted}>The live workflow will be Submitted → Under Review → Information Required or Approved for Payment → Payment Verified → Active. Payment becomes available after approval.</p>
        </>}
        {error && <p role="alert" className={s.error}>{error}</p>}
        <div className={s.wizardActions}>{step > 1 && <button type="button" className={s.secondary} onClick={() => move(step === 4 && draft.sample ? 2 : step - 1)}>← Back</button>}<Link href="/membership/dashboard">Return to dashboard</Link><button type="submit" className={s.primary} disabled={!hydrated}>{step === 6 ? "Finish review preview" : step === 2 && draft.application === "Renewal" ? "Find sample organisation" : "Continue →"}</button></div>
      </form>
    </Panel>
    <dialog ref={confirmDialog} className={s.dialog} aria-labelledby="confirm-organisation-title"><p className={s.eyebrow}>SAMPLE LOOKUP RESULT</p><h2 id="confirm-organisation-title">Confirm Your Organisation Details</h2><p>We found the sample organisation for this WCSA ID. Please check the information below before continuing.</p><dl className={s.details}><div><dt>Organisation</dt><dd>{demoOrganisation.name}</dd></div><div><dt>WCSA ID</dt><dd>0547071626</dd></div><div><dt>Membership type</dt><dd>School · WCSSA</dd></div><div><dt>EMIS number</dt><dd>{demoOrganisation.emis}</dd></div><div><dt>Physical address</dt><dd>{demoOrganisation.address}, {demoOrganisation.town}, {demoOrganisation.postalCode}</dd></div><div><dt>Contact</dt><dd>{demoOrganisation.email} · {demoOrganisation.phone}</dd></div></dl><p className={s.muted}>This is demonstration data. No organisation record has been accessed or verified.</p><div className={s.dialogActions}><button className={s.primary} onClick={() => confirmOrganisation(false)}>Confirm & Continue to Step 4</button><button className={s.secondary} onClick={() => confirmOrganisation(true)}>Update Details</button><button className={s.textButton} onClick={() => confirmDialog.current?.close()}>Search Again</button></div></dialog>
  </>;
}
