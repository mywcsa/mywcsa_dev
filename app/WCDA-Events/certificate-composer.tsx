"use client";
import {useEffect,useMemo,useState,type CSSProperties} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import styles from "./certificate-composer.module.css";

type Row={key:number;date:string;venue:string;start:string;end:string};
const verificationFooter="AN DIGITAL CERTIFICATE ISSUED BY THE MYWCDA EVENTS – VERIFICATION: mail-wcda@wcsports.co.za";
const conditions="This endorsement remains subject to applicable legislation, municipal and venue requirements, health and safety obligations, permits, licences and approvals of the relevant competent authorities.";
const pad=(n:number)=>String(n).padStart(2,"0");
function isoDate(date:Date){return date.getUTCFullYear()+"-"+pad(date.getUTCMonth()+1)+"-"+pad(date.getUTCDate())}
function dateParts(value:string){
 const found=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
 if(!found)return null;
 const d=new Date(Date.UTC(Number(found[1]),Number(found[2])-1,Number(found[3])));
 return isoDate(d)===value?d:null;
}
function shownDate(value:string,upper=false){
 const d=dateParts(value);
 if(!d)return value||"DATE NOT PROVIDED";
 const formatted=new Intl.DateTimeFormat("en-GB",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d);
 return upper?formatted.replace(/^[^,]+, /,"").toUpperCase():formatted;
}
function issueDate(value:string){
 const d=dateParts(value);
 if(!d)return "NOT ISSUED";
 return new Intl.DateTimeFormat("en-GB",{timeZone:"UTC",day:"numeric",month:"long",year:"numeric"}).format(d).toUpperCase();
}
function initials(name:string){
 const words=name.toUpperCase().match(/[A-Z]+/g)?.filter(s=>!["THE","AND","OF","FOR","PTY","LTD","NPC"].includes(s))||[];
 return words.slice(0,3).map(w=>w[0]).join("")||"ORG";
}
function initialRows(event:EmsEvent):Row[]{
 const from=dateParts(event.start_date),to=dateParts(event.end_date);
 if(!from||!to||to.getTime()<from.getTime())return [{key:0,date:event.start_date||"",venue:event.venue_name,start:"",end:""}];
 const n=Math.min(5,Math.floor((to.getTime()-from.getTime())/86400000)+1);
 return Array.from({length:n},(_,i)=>({key:i,date:isoDate(new Date(from.getTime()+i*86400000)),venue:event.venue_name,start:"",end:""}));
}
function formatClock(value:string){
 if(!value)return "TIME TO CONFIRM";
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return "TIME TO CONFIRM";
 return value;
}
function escapeForDraft(s:string){return s.replace(/[\u0000-\u001f]/g," ").trim()}
export default function CertificateComposer({actor,event,onSaved}:{actor:EmsActor;event:EmsEvent;onSaved?:()=>void}){
 const [rows,setRows]=useState<Row[]>(()=>initialRows(event));
 const [ack,setAck]=useState("");
 const [suffix,setSuffix]=useState("");
 const [issue,setIssue]=useState("");
 const [stampX,setStampX]=useState(0);
 const [stampY,setStampY]=useState(0);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const abbr=useMemo(()=>initials(event.organiser_name),[event.organiser_name]);
 const endorsement=ack.trim()||`The Western Cape Development Authority hereby confirms its formal endorsement and approval of ${event.name}, organised by ${event.organiser_name}, and acknowledges the organiser's event planning, vendor coordination, operational arrangements and compliance framework submitted for the event.`;
 const suffixDisplay=/^\d{6}$/.test(suffix)?suffix:"######";
 const abbreviation=abbr+suffixDisplay;
 const esc="ESC"+suffixDisplay;
 const stampStyle={transform:`translate(${stampX}px,${stampY}px)`} as CSSProperties;
 useEffect(()=>{setRows(initialRows(event));setAck("");setSuffix("");setIssue("");setStampX(0);setStampY(0);setNotice("");setError("");},[event.id,event.start_date,event.end_date,event.venue_name]);
 function changeRow(key:number,field:Exclude<keyof Row,"key">,value:string){
  setRows(old=>old.map(r=>r.key===key?{...r,[field]:value}:r));
 }
 function validate(){
  if(!rows.length||rows.some(r=>!dateParts(r.date)||!r.venue.trim()||!r.start||!r.end)){
   setError("Complete every certificate date, venue and start/end time before saving the draft.");return false;
  }
  if(rows.some(r=>r.end===r.start)){
   setError("Check the start and end times. Use 24-hour HH:MM values.");return false;
  }
  if(suffix&&!/^\d{6}$/.test(suffix)){
   setError("The linked reference suffix must contain six digits. Leave it blank if no reference is assigned.");return false;
  }
  return true;
 }
 async function saveDraft(){
  setNotice("");setError("");
  if(!validate())return;
  setBusy(true);
  const body=[
   "DRAFT - NOT ISSUED",
   "Certificate OF ENDORSEMENT & APPROVAL",
   "EVENT: "+event.name,
   "ORGANISER: "+event.organiser_name,
   "DATE & LOCATION | TIME / DURATION",
   ...rows.map(r=>shownDate(r.date)+" - "+r.venue+" | "+r.start+" - "+r.end),
   "OFFICIAL ENDORSEMENT",
   endorsement,
   conditions,
   "CERTIFICATE REFERENCE: "+abbr+"###### (unallocated, not an official reference)",
   "FINANCE REFERENCE: ESC###### (unallocated, not an official reference)",
   "ISSUE DATE: NOT ISSUED",
   "MRS S MORGAN - REGISTRAR: EVENTS & SAFETY",
   "DATE: NOT ISSUED",
   "STAMP POSITION: "+stampX+","+stampY,
   verificationFooter
  ].join("\n");
  try{
   const res=await fetch("/api/wcda-events/governance",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({eventId:event.id,action:"create_draft",payload:{
      kind:"certificate",title:"DRAFT CERTIFICATE OF ENDORSEMENT & APPROVAL - "+event.name,body
    }})
   });
   const data=await res.json() as {error?:string};
   if(!res.ok)throw Error(data.error||"Unable to save the controlled certificate draft.");
   setNotice("Certificate draft saved to the event record. No official number, approval or issue date has been allocated.");
   onSaved?.();
  }catch(e){setError(e instanceof Error?e.message:"Unable to save the draft.");}
  finally{setBusy(false);}
 }
 return <section className={styles.composer} aria-label="Boland-style certificate template designer">
  <div className={styles.toolbar}>
   <div><span>MASTER FORMAT / WCDA EVENTS</span><h3>Certificate template designer</h3><p>Based on the uploaded Boland Festival certificate. The paper below is an <strong>unissued draft</strong>.</p></div>
   <div className={styles.actions}><button onClick={()=>void saveDraft()} disabled={busy} type="button">{busy?"Saving…":"Save controlled draft"}</button><button className={styles.print} onClick={()=>{if(validate())window.print()}} type="button">Print draft / Save PDF ↗</button></div>
  </div>
  {notice&&<p className={styles.success} role="status">{notice}</p>}
  {error&&<p className={styles.error} role="alert">{error}</p>}
  <div className={styles.editor}>
   <div className={styles.settings}>
    <h4>1. Date, location & times</h4>
    <p>All dates and times appear in the certificate table. Times use 24-hour HH:MM format. No times are invented from the EMS registry.</p>
    {rows.map((r,i)=><fieldset key={r.key}><legend>Event day {i+1}</legend><label>Date<input type="date" value={r.date} onChange={e=>changeRow(r.key,"date",e.target.value)}/></label><label>Venue / location<input value={r.venue} onChange={e=>changeRow(r.key,"venue",e.target.value)} maxLength={170}/></label><div className={styles.timeFields}><label>From<input type="time" value={r.start} onChange={e=>changeRow(r.key,"start",e.target.value)}/></label><label>Until<input type="time" value={r.end} onChange={e=>changeRow(r.key,"end",e.target.value)}/></label></div></fieldset>)}
    <h4>2. Acknowledgement</h4><label>Official endorsement wording<textarea rows={6} value={ack} onChange={e=>setAck(e.target.value)} maxLength={950} placeholder={endorsement}/></label>
    <h4>3. Certificate control</h4>
    <label>Six-digit reference (authorised allocation only)<input maxLength={6} inputMode="numeric" pattern="[0-9]{6}" value={suffix} onChange={e=>setSuffix(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Leave blank until allocated"/></label>
    <p>Certificate: <strong>{abbreviation}</strong> · Finance: <strong>{esc}</strong>. Both always use the same six digits. A draft reference is not a reserved or verified official number.</p>
    <label>Proposed issue date<input type="date" value={issue} onChange={e=>setIssue(e.target.value)}/></label>
    <p>This date appears in UPPERCASE twice. It remains <strong>NOT ISSUED</strong> on drafts saved to the system.</p>
    <h4>4. Stamp placement</h4><label>Horizontal position<input type="range" min={-90} max={30} value={stampX} onChange={e=>setStampX(Number(e.target.value))}/></label><label>Vertical position<input type="range" min={-70} max={20} value={stampY} onChange={e=>setStampY(Number(e.target.value))}/></label>
    <button type="button" className={styles.reset} onClick={()=>{setStampX(0);setStampY(0)}}>Reset stamp position</button>
   </div>
   <div className={styles.paperWrap}>
    <article className={styles.sheet} aria-label="Unissued certificate preview">
      <div className={styles.borderOuter}><div className={styles.borderMid}><div className={styles.borderInner}>
       <div className={styles.identity}><span className={styles.dome} aria-hidden="true">◈</span><div><strong>WESTERN CAPE</strong><b>DEVELOPMENT AUTHORITY</b><small>EVENT & SAFETY DEPARTMENT</small></div><span className={styles.triLogo} aria-hidden="true"><i/><i/><i/></span></div>
       <div className={styles.certificateTitle}><h1>Certificate</h1><h2>OF ENDORSEMENT & APPROVAL</h2></div>
       <div className={styles.eventIdentity}><p>THIS CERTIFICATE IS HEREBY ISSUED TO</p><h3>{event.name.toUpperCase()}</h3><p>ORGANISER: <strong>{event.organiser_name.toUpperCase()}</strong></p></div>
       <table className={styles.schedule}><thead><tr><th>DATE & LOCATION:</th><th>TIME / DURATION:</th></tr></thead><tbody>{rows.map(r=><tr key={r.key}><td><strong>{shownDate(r.date)}</strong> – {r.venue}</td><td>{formatClock(r.start)} – {formatClock(r.end)}</td></tr>)}</tbody></table>
       <div className={styles.endorsement}><h3>OFFICIAL ENDORSEMENT</h3><p>{endorsement}</p><em>{conditions}</em></div>
       <div className={styles.references}><div><strong>CERTIFICATE REFERENCE</strong><span>{abbreviation}</span></div><div><strong>FINANCE REFERENCE</strong><span>{esc}</span></div><div><strong>ISSUE DATE</strong><span>{issueDate(issue)}</span></div></div>
       <div className={styles.signature}><span>S Morgan</span><strong>MRS S MORGAN</strong><b>REGISTRAR: EVENTS & SAFETY</b><p>DATE: <strong>{issueDate(issue)}</strong></p></div>
       <div className={styles.stamp} style={stampStyle}><strong>WESTERN CAPE DEVELOPMENT AUTHORITY</strong><small>An initiative owned by Western Cape Sports Association</small><p>7 BREE STREET, CAPE TOWN, 8001<br/>EMAIL: mail-wcda@wcsports.co.za<br/>T: (083) 273-1459 F: (021) 896 9021<br/><b>Chair:</b> T. Williams ; <b>Admin:</b> M. Leibrandt</p><small>WES-KAAPSE ONTWIKKELINGSOWERHEID</small></div>
       <div className={styles.draftWatermark}>DRAFT — NOT ISSUED</div>
      </div></div></div>
      <footer>{verificationFooter}</footer>
    </article>
    <p className={styles.disclaimer}>Preview replicates the structural format and wording rules. The original DOCX remains the exact source for artwork and typography. This preview does not create a permit, endorsement, certificate number or official issuance.</p>
   </div>
  </div>
 </section>;
}
