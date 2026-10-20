"use client";
import {useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import type {EmsInvoice,EmsReceipt} from "@/lib/ems/payments";
import styles from "./finance-desk.module.css";

const rand=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
const label=(s:string)=>s.replaceAll("_"," ").replace(/\b[a-z]/g,c=>c.toUpperCase());
const shortDate=(iso:string|null)=>iso?new Date(iso).toLocaleDateString("en-ZA",{dateStyle:"medium"}):"—";

export default function FinanceDesk({actor,events}:{actor:EmsActor;events:EmsEvent[]}){
 const isStaff=actor.mode==="staff";
 const mayPrepare=isStaff&&["finance","manager","super_admin","executive"].includes(actor.role||"");
 const mayApprove=isStaff&&["manager","super_admin","executive"].includes(actor.role||"");
 const isPilotTester=actor.mode==="staff"&&actor.role==="super_admin"&&actor.email.toLowerCase()==="ebranch@wcsports.co.za";
 const[records,setRecords]=useState<EmsInvoice[]>([]);
 const[receipts,setReceipts]=useState<EmsReceipt[]>([]);
 const[busy,setBusy]=useState(false);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[message,setMessage]=useState("");
 const[eventId,setEventId]=useState("");
 const[pilotEventId,setPilotEventId]=useState("");
 const[diagnostics,setDiagnostics]=useState<{mode:"test"|"live"|null;configured:boolean;providerReachable:boolean;pilotEnabled:boolean;r1Ready:boolean;message:string}|null>(null);
 const[checking,setChecking]=useState(false);
 const[amount,setAmount]=useState("");
 const[description,setDescription]=useState("");
 const[reason,setReason]=useState("");
 const[activeInvoice,setActiveInvoice]=useState("");
 const unbilled=useMemo(()=>events.filter(e=>!records.some(i=>i.event_id===e.id&&!i.is_pilot_test)),[events,records]);
 async function checkPaystack(){
   setChecking(true);setError("");
   try{
    const r=await fetch("/api/wcda-events/payments/health",{cache:"no-store"});
    const d=await r.json() as {error?:string;mode:"test"|"live"|null;configured:boolean;providerReachable:boolean;pilotEnabled:boolean;r1Ready:boolean;message:string};
    if(!r.ok)throw Error(d.error||"Gateway check unavailable.");
    setDiagnostics(d);
   }catch(e){setError(e instanceof Error?e.message:"Gateway check unavailable.");}
   finally{setChecking(false);}
 }
 const byEvent=(id:string)=>events.find(e=>e.id===id);
 const pilotEligible=events.filter(e=>!records.some(i=>i.event_id===e.id&&i.is_pilot_test)&&e.captured_by_email?.toLowerCase()===actor.email.toLowerCase()
   &&e.capture_channel!=="organiser_portal");

 async function refresh(){
  setLoading(true);setError("");
  try{
   const r=await fetch("/api/wcda-events/payments",{cache:"no-store"});
   const x=await r.json() as {invoices?:EmsInvoice[];receipts?:EmsReceipt[];error?:string};
   if(!r.ok)throw new Error(x.error||"Could not load billing records.");
   setRecords(x.invoices||[]);setReceipts(x.receipts||[]);
  }catch(e){setError(e instanceof Error?e.message:"Billing records unavailable.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh()},[]);
 async function execute(payload:Record<string,unknown>){
  setBusy(true);setError("");setMessage("");
  try{
   const r=await fetch("/api/wcda-events/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const x=await r.json() as {invoice?:EmsInvoice;url?:string;paid?:boolean;error?:string};
   if(!r.ok)throw new Error(x.error||"Unable to complete the action.");
   if(payload.action==="checkout"){
    if(x.paid){setMessage("This invoice has already been paid.");await refresh();return;}
    if(typeof x.url!=="string"||!x.url.startsWith("https://checkout.paystack.com/"))throw new Error("The provider did not return a valid checkout address.");
    window.location.assign(x.url);
    return;
   }
   if(payload.action==="prepare"){setAmount("");setDescription("");setEventId("");}
   if(payload.action==="prepare_r1_pilot")setPilotEventId("");
   setReason("");setActiveInvoice("");
   await refresh();
   setMessage(payload.action==="prepare_r1_pilot"||(payload.action==="prepare"&&x.invoice?.is_pilot_test)
     ?"R1 internal pilot invoice created and ready for checkout. No additional manager approval is required."
     :payload.action==="prepare"
       ?"Official event invoice prepared. The normal finance controls apply."
       :payload.action==="approve"?"Invoice approved for payment. The linked payer may proceed.":"Invoice cancelled before checkout.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to complete the action.");}
  finally{setBusy(false);}
 }
 function prepare(e:FormEvent){
  e.preventDefault();
  if(!/^\d+(\.\d{1,2})?$/.test(amount)){setError("Enter a valid rand amount, with no more than two decimal places.");return;}
  const cents=Math.round(Number(amount)*100);
  if(!Number.isSafeInteger(cents)||cents<100||cents>100000000){setError("Enter an amount between R1.00 and R1,000,000.00.");return;}
  void execute({action:"prepare",eventId,amountCents:cents,description});
 }
 async function receiptPdf(invoice:EmsInvoice,receipt:EmsReceipt){
  try{
   const {jsPDF}=await import("jspdf");
   const pdf=new jsPDF();
   pdf.setFillColor(0,20,132);pdf.rect(0,0,210,36,"F");
   pdf.setFont("helvetica","bold");pdf.setFontSize(17);pdf.setTextColor(255,255,255);
   pdf.text("MyWCDA Events",16,22);
   pdf.setTextColor(30,48,83);pdf.setFontSize(17);pdf.text("PAYMENT CONFIRMATION",16,56);
   pdf.setFont("helvetica","normal");pdf.setFontSize(10);
   const lines=[
    "Payment confirmation: "+receipt.receipt_reference,
    "Event: "+(byEvent(invoice.event_id)?.name||invoice.event_id),
    "EMS reference: "+(byEvent(invoice.event_id)?.reference||"See event registry"),
    "Invoice reference: "+invoice.reference,
    "Amount confirmed: "+rand(invoice.amount_cents),
    "Currency: ZAR",
    "Provider: Paystack",
    "Transaction ID: "+receipt.provider_transaction_id,
    "Date: "+shortDate(receipt.paid_at),
    "Gateway environment: "+receipt.payment_mode.toUpperCase(),
    "",
    "This acknowledges a gateway-verified payment only.",
    "It is NOT an event endorsement, operating licence, permit or tax invoice.",
    "For billing enquiries: finances@wcsports.co.za"
   ];
   let y=73;
   for(const line of lines){for(const wrapped of pdf.splitTextToSize(line,176) as string[]){pdf.text(wrapped,16,y);y+=8;}}
   pdf.save("MyWCDA-Payment-"+receipt.receipt_reference+".pdf");
  }catch{setError("Could not create the payment confirmation document.");}
 }
 return <section className={styles.root}>
  <div className={styles.heading}><div><span className={styles.overline}>MYWCDA EVENTS · SECURE FINANCIAL SERVICES</span><h2>{isStaff?"Event billing & payment control":"Your invoices & payments"}</h2><p>{isStaff?"Run the R1 connectivity pilot without manual approval, and manage approved official event charges and verified Paystack settlements.":"Review approved event charges and pay safely through Paystack. Charges cannot be changed in your browser."}</p></div><button type="button" onClick={()=>void refresh()} disabled={loading||busy}>↻ Refresh</button></div>
  {error&&<p className={styles.alert} role="alert">{error}</p>}
  {message&&<p className={styles.success} role="status">{message}</p>}
  {isPilotTester&&<section className={styles.pilot} aria-label="R1 authorised internal payment pilot">
    <div className={styles.pilotHeading}>
      <span>INTERNAL CHECKOUT TEST · NOT AN OFFICIAL WCDA FEE</span>
      <strong>R1.00</strong>
    </div>
    <h3>Test Paystack checkout with your office-captured application</h3>
    <p>Capture an office application under this account, then create exactly one R1 test invoice for it.
      The <strong>R1 internal test becomes payment-ready automatically</strong> after its identity, amount and event eligibility are checked.
      Use your own permitted payment method. This test does not approve an event, issue a permit or set a public fee.</p>
    <div className={styles.checks}>
      <button type="button" onClick={()=>void checkPaystack()} disabled={checking}>
        {checking?"Checking securely…":"Check live Paystack connection ↗"}
      </button>
      {diagnostics&&<div role="status"><strong>{diagnostics.r1Ready?"Gateway connection verified":"Gateway needs attention"}</strong>
       <span>Mode: {diagnostics.mode?.toUpperCase()||"Not configured"} · Provider: {diagnostics.providerReachable?"Connected":"Unconfirmed"} · R1 pilot: {diagnostics.pilotEnabled?"Enabled":"Not enabled"}</span>
       <small>{diagnostics.message}</small></div>}
    </div>
    <div className={styles.pilotActions}>
      <label>Choose your captured event
        <select aria-label="Choose your office test event" value={pilotEventId} onChange={e=>setPilotEventId(e.target.value)}>
          <option value="">Select an unbilled office application</option>
          {pilotEligible.map(e=><option value={e.id} key={e.id}>{e.reference} · {e.name}</option>)}
        </select>
      </label>
      <button type="button" disabled={busy||!pilotEventId}
        onClick={()=>void execute({action:"prepare_r1_pilot",eventId:pilotEventId})}>
        {busy?"Creating…":"Create R1 pilot invoice"}
      </button>
    </div>
    {!pilotEligible.length&&<small>First use **Capture in Office** to register your test application. Return here after it is saved.</small>}
  </section>}
  {mayPrepare&&<form className={styles.card+" "+styles.prepare} onSubmit={prepare}>
   <div className={styles.cardTitle}><h3>Prepare an event invoice</h3><span>Finance authorisation</span></div>
   <p className={styles.muted}>Only approved, documented fees should be entered. No automatic charge is applied to event applications.</p>
   <div className={styles.formGrid}>
    <label>Registered event<select required value={eventId} onChange={e=>setEventId(e.target.value)}><option value="">Select an unbilled event</option>{unbilled.map(e=><option key={e.id} value={e.id}>{e.reference} · {e.name}</option>)}</select></label>
    <label>Amount in ZAR<input required inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" placeholder="e.g. 350.00" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
    <label className={styles.wide}>Charge description / approved fee basis<input required minLength={8} maxLength={500} placeholder="Description and basis of the applicable event fee" value={description} onChange={e=>setDescription(e.target.value)}/></label>
   </div>
   <div className={styles.formFoot}><small>A different manager or executive must approve the prepared invoice. No payment is taken at this step.</small><button type="submit" disabled={busy||!eventId||description.trim().length<8}>{busy?"Saving…":"Prepare invoice"}</button></div>
  </form>}
  <div className={styles.card}>
   <div className={styles.cardTitle}><h3>{isStaff?"Official event invoices":"Invoices linked to your events"}</h3><span>{records.length} record(s)</span></div>
   {loading?<p className={styles.muted}>Loading secured event finance records…</p>:records.length===0?<div className={styles.empty}><strong>No event invoices yet.</strong><p>{isStaff?"Prepare an invoice only when a legitimate fee has been authorised.":"Once WCDA Finance issues and independently approves a charge, the invoice will appear here."}</p></div>:
   <div className={styles.list}>{records.map(i=>{
    const receipt=receipts.find(x=>x.invoice_id===i.id);
    const canReview=mayApprove&&!i.is_pilot_test&&i.status==="pending_approval"&&i.prepared_by_email!==actor.email;
    return <article key={i.id} className={styles.invoice}>
     <div className={styles.invoiceTop}><div><small>{byEvent(i.event_id)?.reference||"WCDA EVENT"}</small><h4>{byEvent(i.event_id)?.name||"Event invoice"}</h4><p>{i.description}</p></div><strong className={styles.amount}>{rand(i.amount_cents)}</strong></div>
     <div className={styles.details}>{i.is_pilot_test&&<span className={styles.pilotLabel}>R1 INTERNAL TEST</span>}<span>Invoice {i.reference}</span><span>Issued {shortDate(i.created_at)}</span><span className={styles.status} data-status={i.status}>{label(i.status)}</span></div>
     {i.status==="pending_approval"&&<p className={styles.hint}>{i.is_pilot_test?"The R1 internal test is being prepared; refresh to check eligibility.":"Official event charge: finance review pending before checkout."}</p>}
     {i.status==="approved_for_payment"&&(i.is_pilot_test?<p className={styles.hint}><strong>R1 internal test ready for checkout.</strong> Automatic eligibility verified; no manager approval needed.</p>:i.approved_by_email?<p className={styles.hint}>Approved by {isStaff?i.approved_by_email:"WCDA Finance"} on {shortDate(i.approved_at)}.</p>:null)}
     {i.status==="paid"&&receipt&&<div className={styles.receipt}><strong>✓ Paystack payment verified</strong><span>Confirmation: {receipt.receipt_reference}</span><button type="button" onClick={()=>void receiptPdf(i,receipt)}>Download confirmation PDF ↓</button></div>}
     {((!isStaff&&!i.is_pilot_test)||(isPilotTester&&i.is_pilot_test&&i.amount_cents===100&&i.customer_email.toLowerCase()===actor.email.toLowerCase()))&&
      (i.status==="approved_for_payment"||i.status==="checkout_pending")&&
       <button className={styles.pay} type="button" disabled={busy}
        onClick={()=>void execute({action:"checkout",invoiceId:i.id})}>
        {busy?"Opening secure checkout…":i.status==="checkout_pending"?"Resume Paystack checkout ↗":"Pay "+rand(i.amount_cents)+" securely ↗"}
       </button>}
     {(i.is_pilot_test&&isPilotTester||!isStaff)&&i.status==="checkout_pending"&&
      <p className={styles.hint}>If the previous checkout was interrupted, use Resume checkout. The server prevents duplicate requests while an initialization is in progress (up to two minutes).</p>}
     {canReview&&<div className={styles.review}>
      {activeInvoice===i.id?<><label>Approval or cancellation reason<textarea required rows={2} minLength={8} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Record the documented basis for your decision"/></label><div className={styles.buttons}><button type="button" disabled={busy||reason.trim().length<8} onClick={()=>void execute({action:"approve",invoiceId:i.id,reason})}>Approve for payment</button><button type="button" className={styles.danger} disabled={busy||reason.trim().length<8} onClick={()=>void execute({action:"cancel",invoiceId:i.id,reason})}>Cancel invoice</button><button type="button" className={styles.ghost} onClick={()=>{setActiveInvoice("");setReason("")}}>Close</button></div></>:
       <button type="button" onClick={()=>{setActiveInvoice(i.id);setReason("")}}>Review invoice →</button>}
     </div>}
     {i.status==="paid"&&<p className={styles.hint}>Payment verification is separate from event assessment and endorsement. A settled invoice does not grant approval.</p>}
    </article>
   })}</div>}
  </div>
  <p className={styles.footNote}>Payments are processed on Paystack’s secure checkout. Financial records and acknowledgements are retained in the EMS database. For discrepancies contact <a href="mailto:finances@wcsports.co.za">finances@wcsports.co.za</a>.</p>
 </section>;
}
