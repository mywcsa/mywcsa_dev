"use client";
import {useState,type FormEvent} from "react";
import styles from "./office-capture.module.css";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";

type CaptureForm={
 captureChannel:string;dateReceived:string;organiserName:string;contactName:string;
 contactEmail:string;contactPhone:string;originalReference:string;officeNotes:string;
 name:string;category:string;description:string;venueName:string;venueAddress:string;
 startDate:string;endDate:string;estimatedAttendance:string;
};
const todaySA=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Johannesburg",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const initial=():CaptureForm=>({
 captureChannel:"office_walk_in",dateReceived:todaySA(),organiserName:"",contactName:"",
 contactEmail:"",contactPhone:"",originalReference:"",officeNotes:"",
 name:"",category:"Festival",description:"",venueName:"",venueAddress:"",
 startDate:"",endDate:"",estimatedAttendance:""
});
const categories=["Festival","Sport","Concert","Market","Conference","Cultural","Community","Religious","Exhibition","Other"];
const channels=[{value:"office_walk_in",label:"Walk-in at WCDA office"},{value:"office_paper",label:"Paper application received"},{value:"office_email",label:"Application emailed to office"},{value:"staff_assisted",label:"Employee-assisted registration"}];
const brief=(e:unknown)=>e instanceof Error?e.message:"Unable to submit the application.";
export default function OfficeCapture({actor,events,onCaptured,onFinance}:{actor:EmsActor;events:EmsEvent[];onCaptured:(reference:string)=>void;onFinance:()=>void}){
 const [form,setForm]=useState<CaptureForm>(initial);
 const [stage,setStage]=useState(1);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [created,setCreated]=useState<{reference:string;id:string;status:string}|null>(null);
 const update=(key:keyof CaptureForm,value:string)=>setForm(s=>({...s,[key]:value}));
 const duplicate=events.filter(e=>e.name.trim().toLowerCase()===form.name.trim().toLowerCase()&&e.start_date===form.startDate&&e.venue_name.trim().toLowerCase()===form.venueName.trim().toLowerCase());
 const validStage1=form.organiserName.trim().length>=2&&form.contactName.trim().length>=2
   &&!!(form.contactEmail.trim()||form.contactPhone.trim())&&!!form.dateReceived
   &&form.dateReceived<=todaySA()
   &&(!form.contactEmail||/^[^ @]+@[^ @]+\.[^ @]+$/.test(form.contactEmail))
   &&(!form.contactPhone||/^[0-9+() .-]{7,30}$/.test(form.contactPhone));
 const validStage2=form.name.trim().length>=3&&form.venueName.trim().length>=2
   &&!!form.startDate&&!!form.endDate&&form.endDate>=form.startDate;
 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(saving)return;
   if(!validStage1){setStage(1);setError("Check the received date and organiser contact details.");return;}
   if(!validStage2){setStage(2);setError("Complete the event, venue and valid event date fields.");return;}
   if(duplicate.length){setStage(3);setError("Review the possible duplicate before registering a second event.");return;}
   setSaving(true);setError("");
   try{
    const response=await fetch("/api/wcda-events/office-capture",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)
    });
    const data=await response.json() as {event?:{reference:string;id:string;status:string};error?:string};
    if(!response.ok||!data.event)throw new Error(data.error||"Could not capture the office application.");
    setCreated(data.event);onCaptured(data.event.reference);
   }catch(err){setError(brief(err));}finally{setSaving(false);}
 }
 if(created)return <section className={styles.success} aria-live="polite">
    <span className={styles.overline}>OFFICE CAPTURE COMPLETED</span>
    <div className={styles.tick}>✓</div>
    <h2>Application captured successfully</h2>
    <p>This event has been entered into the EMS registry for formal assessment.</p>
    <div className={styles.receipt}><small>OFFICIAL EMS REFERENCE</small><strong>{created.reference}</strong><span>Status: Submitted — awaiting assessment</span><span>Capturing employee: {actor.name} ({actor.email})</span><span>Received: {form.dateReceived} · {channels.find(c=>c.value===form.captureChannel)?.label}</span></div>
    <p className={styles.warning}>This is an administrative capture confirmation, not an endorsement, licence, certificate or approval.</p>
    {actor.email.toLowerCase()==="ebranch@wcsports.co.za"&&<div className={styles.nextAction}>
       <strong>Next: your R1 payment connectivity test</strong>
       <p>Go to Finance & Payments to create the R1 internal pilot invoice. It becomes payment-ready automatically—no second person's approval is needed. Use the Paystack checkout button once the invoice appears.</p>
       <button type="button" onClick={onFinance}>Open Finance & R1 test →</button>
    </div>}
    <div className={styles.actions}><button type="button" onClick={()=>{setCreated(null);setForm(initial());setStage(1);setError("");}}>Capture another event</button><button className={styles.outline} type="button" onClick={()=>{void navigator.clipboard.writeText(created.reference);}}>Copy reference</button></div>
  </section>;
 return <section className={styles.panel} aria-label="Internal employee event capture">
  <header className={styles.heading}><div><span className={styles.overline}>WCDA EVENT REGISTRY · EMPLOYEE INTAKE</span><h2>Capture an in-office application</h2><p>For paperwork, walk-ins and applications received directly at the office. The organiser does not need to sign into GovApps for staff to capture the record.</p></div><span className={styles.private}>Employee only</span></header>
  <div className={styles.steps} role="group" aria-label="Capture progress">{["Receipt & organiser","Event information","Review & capture"].map((label,i)=><button type="button" key={label} className={stage===i+1?styles.current:""} onClick={()=>{if(i===0||i===1&&validStage1||i===2&&validStage1&&validStage2)setStage(i+1);}}><b>{i+1}</b>{label}</button>)}</div>
  <form onSubmit={submit}>
    {stage===1&&<div className={styles.grid}>
       <label>How was the application received? <select required value={form.captureChannel} onChange={e=>update("captureChannel",e.target.value)}>{channels.map(o=><option value={o.value} key={o.value}>{o.label}</option>)}</select></label>
       <label>Date application received <input required type="date" max={todaySA()} value={form.dateReceived} onChange={e=>update("dateReceived",e.target.value)}/></label>
       <label>Organiser / organisation name <input required maxLength={200} value={form.organiserName} onChange={e=>update("organiserName",e.target.value)} placeholder="Name stated on the application"/></label>
       <label>Applicant / contact person <input required maxLength={150} value={form.contactName} onChange={e=>update("contactName",e.target.value)} placeholder="Person submitting the application"/></label>
       <label>Applicant's email (if available) <input type="email" maxLength={254} value={form.contactEmail} onChange={e=>update("contactEmail",e.target.value)} placeholder="organiser@example.co.za"/></label>
       <label>Applicant's phone (if available) <input type="tel" maxLength={30} value={form.contactPhone} onChange={e=>update("contactPhone",e.target.value)} placeholder="e.g. 021 000 0000"/></label>
       <p className={styles.help}>An email address or a telephone number is required; the applicant does not need both. Your staff identity is recorded automatically.</p>
    </div>}
    {stage===2&&<div className={styles.grid}>
       <label>Event name <input required maxLength={200} value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Official name of event"/></label>
       <label>Event category <select value={form.category} onChange={e=>update("category",e.target.value)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
       <label>Venue / location name <input required maxLength={200} value={form.venueName} onChange={e=>update("venueName",e.target.value)} placeholder="Where it will take place"/></label>
       <label>Venue address <input maxLength={300} value={form.venueAddress} onChange={e=>update("venueAddress",e.target.value)} placeholder="Street, area, town"/></label>
       <label>First event date <input type="date" required value={form.startDate} onChange={e=>update("startDate",e.target.value)}/></label>
       <label>Last event date <input type="date" min={form.startDate||undefined} required value={form.endDate} onChange={e=>update("endDate",e.target.value)}/></label>
       <label>Expected number of attendees <input type="number" min={0} max={100000000} value={form.estimatedAttendance} onChange={e=>update("estimatedAttendance",e.target.value)} placeholder="If known"/></label>
       <label className={styles.wide}>Event summary / description <textarea maxLength={3000} rows={3} value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Record the purpose and activities described in the application"/></label>
    </div>}
    {stage===3&&<div className={styles.review}>
      <div className={styles.summary}>
       <h3>Check the application against the original</h3>
       <dl><dt>Source</dt><dd>{channels.find(c=>c.value===form.captureChannel)?.label}</dd><dt>Date received</dt><dd>{form.dateReceived}</dd><dt>Organiser</dt><dd>{form.organiserName}</dd><dt>Contact</dt><dd>{form.contactName}</dd><dt>Event</dt><dd>{form.name}</dd><dt>Dates</dt><dd>{form.startDate} → {form.endDate}</dd><dt>Venue</dt><dd>{form.venueName}</dd></dl>
      </div>
      {duplicate.length>0&&<div className={styles.caution}><strong>Possible duplicate application!</strong> A record with the same event name, venue and start date already exists: {duplicate.map(e=>e.reference).join(", ")}. Check before registering again.</div>}
      <div className={styles.grid}>
       <label>Original paper / email reference (optional)<input maxLength={120} value={form.originalReference} onChange={e=>update("originalReference",e.target.value)} placeholder="Reference written on original application"/></label>
       <label className={styles.wide}>Office capture notes (optional)<textarea rows={4} maxLength={1500} value={form.officeNotes} onChange={e=>update("officeNotes",e.target.value)} placeholder="e.g. Application handed in at front desk; paper originals stored in registry file"/></label>
      </div>
      <p className={styles.help}>Paper originals and scan uploads are not automatically attached by this form. Follow your current records procedure to retain supporting documents.</p>
      <p className={styles.warning}>Submitting will create an official EMS reference and a pending assessment case. It will not approve, endorse, certify or invoice the event.</p>
    </div>}
    {error&&<p className={styles.error} role="alert">{error}</p>}
    <footer className={styles.actions}>
      {stage>1&&<button type="button" className={styles.outline} onClick={()=>setStage(s=>s-1)}>← Previous</button>}
      {stage<3?<button type="button" disabled={stage===1?!validStage1:!validStage2} onClick={()=>setStage(s=>s+1)}>Continue →</button>:
       <button type="submit" disabled={saving||!validStage1||!validStage2||duplicate.length>0}>{saving?"Saving official event…":"Capture and register event"}</button>}
    </footer>
    {stage===3&&duplicate.length>0&&<p className={styles.help}>Capture is paused because a potentially identical event is already registered. Review the existing record first.</p>}
  </form>
 </section>;
}
