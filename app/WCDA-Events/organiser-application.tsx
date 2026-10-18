"use client";

import {useState,type FormEvent} from "react";
import type {EmsActor} from "@/lib/ems/types";
import styles from "./organiser-application.module.css";

type FormData={
 organiserName:string;contactName:string;contactPhone:string;
 name:string;category:string;description:string;venueName:string;venueAddress:string;
 startDate:string;endDate:string;estimatedAttendance:string;
 audience:string;ticketing:string;foodVendors:boolean;alcoholPlanned:boolean;roadClosures:boolean;
 safetyPlan:string;medicalPlan:string;accessibilityPlan:string;trafficPlan:string;additionalNotes:string;
 confirmed:boolean;acknowledged:boolean;
};
const categories=["Festival","Sport","Concert","Market","Conference","Cultural","Community","Religious","Exhibition","Other"];
const steps=["Organiser","Event & venue","Safety & operations","Review & submit"];
const makeInitial=(actor:EmsActor):FormData=>({
 organiserName:"",contactName:actor.name||"",contactPhone:"",
 name:"",category:"Festival",description:"",venueName:"",venueAddress:"",
 startDate:"",endDate:"",estimatedAttendance:"",
 audience:"",ticketing:"free",foodVendors:false,alcoholPlanned:false,roadClosures:false,
 safetyPlan:"",medicalPlan:"",accessibilityPlan:"",trafficPlan:"",additionalNotes:"",
 confirmed:false,acknowledged:false,
});
export default function OrganiserApplication({actor,onCreated,onCancel}:{actor:EmsActor;onCreated:(reference:string)=>void;onCancel:()=>void}){
 const[form,setForm]=useState<FormData>(()=>makeInitial(actor));
 const[step,setStep]=useState(0);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 function set<K extends keyof FormData>(field:K,value:FormData[K]){
  setForm(prev=>({...prev,[field]:value}));
 }
 const checks=[
  form.organiserName.trim().length>=2 && form.contactName.trim().length>=2 &&
   /^[0-9+() .-]{7,30}$/.test(form.contactPhone),
  form.name.trim().length>=3 && form.description.trim().length>=20 &&
   form.venueName.trim().length>=2 && form.venueAddress.trim().length>=5 &&
   !!form.startDate && !!form.endDate && form.endDate>=form.startDate &&
   (form.estimatedAttendance===""||(Number.isSafeInteger(Number(form.estimatedAttendance))&&Number(form.estimatedAttendance)>=0&&Number(form.estimatedAttendance)<=100000000)),
  form.safetyPlan.trim().length>=20 && form.medicalPlan.trim().length>=10,
  form.confirmed && form.acknowledged,
 ];
 const canContinue=checks[step] ?? false;
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(step<3){if(canContinue)setStep(s=>s+1);return;}
  if(busy||!checks.every(Boolean))return;
  setBusy(true);setError("");
  try{
   const {acknowledged,...fields}=form;
   const r=await fetch("/api/wcda-events/events",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fields),
   });
   const data=await r.json() as {event?:{reference:string};error?:string};
   if(!r.ok||!data.event?.reference)throw new Error(data.error||"The event application could not be submitted.");
   onCreated(data.event.reference);
  }catch(e){setError(e instanceof Error?e.message:"Unable to submit the event application.");}
  finally{setBusy(false);}
 }
 function move(index:number){
  if(index<step || checks.slice(0,index).every(Boolean)){setError("");setStep(index);}
 }
 return <section className={styles.shell} aria-label="New organiser event application">
  <header className={styles.header}>
   <div><span className={styles.overline}>OFFICIAL EVENT REGISTRATION</span>
    <h2>New event application</h2>
    <p>Complete the four stages to register an event for WCDA assessment. An EMS reference will be generated after submission.</p>
   </div>
   <button type="button" className={styles.cancel} onClick={onCancel}>Close ×</button>
  </header>
  <div className={styles.progress} role="navigation" aria-label="Application stages">
   {steps.map((name,i)=><button key={name} type="button" aria-current={step===i?"step":undefined}
    onClick={()=>move(i)} className={[styles.step,step===i?styles.active:"",i<step?styles.complete:""].join(" ")}>
    <b>{i<step?"✓":String(i+1).padStart(2,"0")}</b><span>{name}</span>
   </button>)}
  </div>
  <form onSubmit={submit}>
   {step===0&&<div className={styles.section}>
    <span className={styles.sectionCount}>01 / ORGANISER DETAILS</span>
    <h3>Who is organising the event?</h3>
    <p>Your signed-in email will be used for your official application and any related invoices.</p>
    <div className={styles.grid}>
     <label>Organiser or organisation name *<input required maxLength={200} minLength={2} value={form.organiserName} onChange={e=>set("organiserName",e.target.value)} placeholder="Legal or public name"/></label>
     <label>Primary contact person *<input required maxLength={150} minLength={2} value={form.contactName} onChange={e=>set("contactName",e.target.value)} placeholder="Responsible person"/></label>
     <label>Contact email (verified account)<input readOnly value={actor.email} aria-label="Signed-in contact email"/></label>
     <label>Contact telephone number *<input required type="tel" maxLength={30} value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} placeholder="+27 ..."/></label>
    </div>
    <div className={styles.info}>Account identity and event ownership are taken from your signed-in GovApps session; another person cannot change your account email on this form.</div>
   </div>}
   {step===1&&<div className={styles.section}>
    <span className={styles.sectionCount}>02 / EVENT REGISTRATION</span>
    <h3>Tell us about your event.</h3>
    <p>Provide enough detail for intake and preliminary assessment.</p>
    <div className={styles.grid}>
     <label>Official event title *<input required minLength={3} maxLength={200} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Name of event"/></label>
     <label>Type of event *<select value={form.category} onChange={e=>set("category",e.target.value)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
     <label className={styles.wide}>Purpose and planned activities *<textarea required minLength={20} maxLength={3000} rows={4} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the programme, activities, audiences and purpose of the event"/></label>
     <label>Venue or location name *<input required minLength={2} maxLength={200} value={form.venueName} onChange={e=>set("venueName",e.target.value)}/></label>
     <label>Physical venue address *<input required minLength={5} maxLength={300} value={form.venueAddress} onChange={e=>set("venueAddress",e.target.value)} placeholder="Street, area and town"/></label>
     <label>Start date *<input type="date" required value={form.startDate} onChange={e=>set("startDate",e.target.value)}/></label>
     <label>End date *<input type="date" required min={form.startDate||undefined} value={form.endDate} onChange={e=>set("endDate",e.target.value)}/></label>
     <label>Estimated attendance<input type="number" min={0} max={100000000} value={form.estimatedAttendance} onChange={e=>set("estimatedAttendance",e.target.value)} placeholder="Expected total"/></label>
     <label>Intended audience / participants<input maxLength={300} value={form.audience} onChange={e=>set("audience",e.target.value)} placeholder="e.g. Families and community members"/></label>
     <label>Access or ticketing model<select value={form.ticketing} onChange={e=>set("ticketing",e.target.value)}><option value="free">Free/open admission</option><option value="ticketed">Paid or ticketed event</option><option value="invitation">Invitation only</option></select></label>
    </div>
   </div>}
   {step===2&&<div className={styles.section}>
    <span className={styles.sectionCount}>03 / SAFETY & OPERATIONS</span>
    <h3>How will you manage your event?</h3>
    <p>Describe your planned arrangements. These declarations are for assessment and do not replace any permit or professional safety plan.</p>
    <div className={styles.checkGrid}>
     <label><input type="checkbox" checked={form.foodVendors} onChange={e=>set("foodVendors",e.target.checked)}/><span>Food or market vendors are planned</span></label>
     <label><input type="checkbox" checked={form.alcoholPlanned} onChange={e=>set("alcoholPlanned",e.target.checked)}/><span>Alcohol sales or service are planned</span></label>
     <label><input type="checkbox" checked={form.roadClosures} onChange={e=>set("roadClosures",e.target.checked)}/><span>Road closures or traffic changes may be needed</span></label>
    </div>
    <div className={styles.grid}>
     <label className={styles.wide}>Safety, security and crowd control arrangements *<textarea required minLength={20} maxLength={2000} rows={4} value={form.safetyPlan} onChange={e=>set("safetyPlan",e.target.value)} placeholder="Security, crowd movement, public safety and emergency response"/></label>
     <label className={styles.wide}>Medical and first-aid arrangements *<textarea required minLength={10} maxLength={1200} rows={3} value={form.medicalPlan} onChange={e=>set("medicalPlan",e.target.value)} placeholder="Describe first-aid arrangements or state that planning is pending"/></label>
     <label>Accessibility arrangements<textarea maxLength={1000} rows={3} value={form.accessibilityPlan} onChange={e=>set("accessibilityPlan",e.target.value)} placeholder="Accessibility and inclusive entry planning"/></label>
     <label>Transport, traffic and parking<textarea maxLength={1200} rows={3} value={form.trafficPlan} onChange={e=>set("trafficPlan",e.target.value)} placeholder="Access, parking or traffic planning"/></label>
     <label className={styles.wide}>Other operational information<textarea maxLength={1000} rows={2} value={form.additionalNotes} onChange={e=>set("additionalNotes",e.target.value)} placeholder="Additional details for assessors"/></label>
    </div>
   </div>}
   {step===3&&<div className={styles.section}>
    <span className={styles.sectionCount}>04 / FINAL DECLARATION</span>
    <h3>Review before submission.</h3>
    <p>Please check these details carefully. Your final application will be assigned an official EMS reference.</p>
    <div className={styles.summary}>
     <dl><dt>Organiser</dt><dd>{form.organiserName}</dd><dt>Contact</dt><dd>{form.contactName} · {actor.email}</dd>
     <dt>Event</dt><dd>{form.name} · {form.category}</dd><dt>Venue</dt><dd>{form.venueName}, {form.venueAddress}</dd>
     <dt>Dates</dt><dd>{form.startDate} to {form.endDate}</dd><dt>Attendance</dt><dd>{form.estimatedAttendance||"Not specified"}</dd>
     <dt>Event format</dt><dd>{form.ticketing==="free"?"Free":form.ticketing==="ticketed"?"Paid/ticketed":"Invitation only"}</dd>
     <dt>Special activities</dt><dd>{[form.foodVendors?"Food vendors":"",form.alcoholPlanned?"Alcohol":"",form.roadClosures?"Possible road closures":""].filter(Boolean).join(", ")||"None declared"}</dd></dl>
    </div>
    <div className={styles.declarations}>
     <label><input type="checkbox" checked={form.confirmed} onChange={e=>set("confirmed",e.target.checked)}/><span>I confirm that the information supplied is accurate to the best of my knowledge and I am authorised to submit this application.</span></label>
     <label><input type="checkbox" checked={form.acknowledged} onChange={e=>set("acknowledged",e.target.checked)}/><span>I understand that registering an event does not grant an endorsement, certificate, venue permission, statutory licence or permit. Any applicable charges require a separately approved invoice.</span></label>
    </div>
   </div>}
   {error&&<p role="alert" className={styles.error}>{error}</p>}
   <footer className={styles.footer}>
    <div>{step>0&&<button type="button" className={styles.back} onClick={()=>setStep(s=>s-1)}>← Previous</button>}</div>
    <span>Step {step+1} of 4</span>
    <button type="submit" className={styles.next} disabled={busy||!canContinue}>{busy?"Submitting securely…":step<3?"Continue →":"Submit for assessment →"}</button>
   </footer>
   {step===3&&<p className={styles.disclaimer}>This is an application intake confirmation only. Endorsements, legal permissions and payment confirmation are separate controlled processes.</p>}
  </form>
 </section>;
}
