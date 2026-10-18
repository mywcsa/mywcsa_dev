"use client";
import {useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import styles from "./microsoft-centre.module.css";
type CaseMessage={
 id:string;event_id:string;kind:string;recipient_email:string;
 subject:string;body:string;status:"draft"|"approved"|"dispatching"|"accepted"|"uncertain";
 prepared_by_email:string;approved_by_email:string|null;created_at:string;accepted_at:string|null;
};
const types=[
 {value:"status_update",label:"Status update"},
 {value:"documents_requested",label:"Supporting documents requested"},
 {value:"payment_notice",label:"Finance correspondence"},
 {value:"general",label:"General event correspondence"},
];
const title=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const day=(v:string|null)=>v?new Date(v).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}):"—";
export default function CorrespondenceCentre({actor,events}:{actor:EmsActor;events:EmsEvent[]}){
 const isStaff=actor.mode==="staff";
 const canCompose=isStaff&&["registrar","manager","executive","assessor","operations","compliance","finance","certificates"].includes(actor.role||"");
 const canApprove=isStaff&&["manager","executive"].includes(actor.role||"");
 const[records,setRecords]=useState<CaseMessage[]>([]);
 const[enabled,setEnabled]=useState(false);
 const[loading,setLoading]=useState(true);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const[notice,setNotice]=useState("");
 const[eventId,setEventId]=useState("");
 const[kind,setKind]=useState("general");
 const[subject,setSubject]=useState("");
 const[body,setBody]=useState("");
 const[expanded,setExpanded]=useState<string|null>(null);
 const[filter,setFilter]=useState("");
 const eventFor=(id:string)=>events.find(e=>e.id===id);
 const visible=useMemo(()=>records.filter(r=>!filter||r.event_id===filter),[records,filter]);
 async function refresh(){
  setLoading(true);setError("");
  try{
   const r=await fetch("/api/wcda-events/correspondence",{cache:"no-store"});
   const response=await r.json() as {messages?:CaseMessage[];mailEnabled?:boolean;error?:string};
   if(!r.ok)throw new Error(response.error||"Could not load correspondence.");
   setRecords(response.messages||[]);setEnabled(response.mailEnabled===true);
  }catch(e){setError(e instanceof Error?e.message:"Correspondence service unavailable.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh()},[]);
 async function update(payload:Record<string,unknown>){
  if(busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/wcda-events/correspondence",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
   });
   const result=await r.json() as {message?:CaseMessage;acceptedByMicrosoft?:boolean;error?:string};
   if(!r.ok||!result.message)throw new Error(result.error||"Unable to update case correspondence.");
   if(payload.action==="prepare"){setEventId("");setKind("general");setSubject("");setBody("");}
   setNotice(payload.action==="prepare"?"Draft saved for independent management review.":
    payload.action==="approve"?"Message approved. An authorised manager can now dispatch it through Microsoft Graph.":
    "Microsoft Graph accepted the message for processing. Delivery to the recipient is not yet confirmed.");
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Correspondence action failed.");}
  finally{setBusy(false);}
 }
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!eventId||subject.trim().length<8||body.trim().length<15)return;
  void update({action:"prepare",eventId,kind,subject,body});
 }
 return <section className={styles.root}>
  <header className={styles.header}>
   <div><span className={styles.overline}>MYWCDA EVENTS · MICROSOFT 365 CORRESPONDENCE</span>
    <h2>{isStaff?"Official correspondence & cases":"Messages & notifications"}</h2>
    <p>{isStaff?"Write case-specific communications, obtain independent approval and use Microsoft Graph for authorised dispatch.":"Messages accepted for sending by WCDA appear here once the Microsoft service is enabled."}</p>
   </div>
   <button type="button" className={styles.refresh} onClick={()=>void refresh()} disabled={busy||loading}>↻ Refresh</button>
  </header>
  {isStaff&&!enabled&&<div className={styles.warning}><strong>Microsoft email integration awaiting activation.</strong> Drafts and independent approvals can be prepared, but no emails can be dispatched until a verified mailbox, Graph application permissions and the administrator enable the service.</div>}
  {error&&<p className={styles.error} role="alert">{error}</p>}
  {notice&&<p className={styles.success} role="status">{notice}</p>}
  {canCompose&&<form className={styles.card} onSubmit={submit}>
   <div className={styles.cardTitle}><h3>Prepare outgoing correspondence</h3><span>Draft · Not yet sent</span></div>
   <p className={styles.small}>The recipient comes from the registered event applicant, not from an address typed into this form. Another authorised manager must approve before dispatch.</p>
   <div className={styles.form}>
    <label>Event case *<select required value={eventId} onChange={e=>setEventId(e.target.value)}>
     <option value="">Select an event case</option>{events.map(e=><option key={e.id} value={e.id}>{e.reference} · {e.name}</option>)}
    </select></label>
    <label>Message category *<select value={kind} onChange={e=>setKind(e.target.value)}>{types.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
    <label className={styles.wide}>Subject *<input minLength={8} maxLength={160} required value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Event reference and purpose of correspondence"/></label>
    <label className={styles.wide}>Official message text *<textarea minLength={15} maxLength={5000} required rows={7} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write the specific notification or document request. Do not claim that an event has received approval unless confirmed by an authorised decision."/></label>
   </div>
   <footer className={styles.formFooter}><span>Messages are saved to the EMS case record and audited.</span><button type="submit" disabled={busy||!eventId||subject.trim().length<8||body.trim().length<15}>{busy?"Saving…":"Save draft for review"}</button></footer>
  </form>}
  <section className={styles.card}>
   <div className={styles.cardTitle}>
    <h3>{isStaff?"Case correspondence register":"Messages on your events"}</h3>
    <span>{visible.length} record(s)</span>
   </div>
   <label className={styles.filter}>Event filter<select value={filter} onChange={e=>setFilter(e.target.value)}>
    <option value="">All authorised events</option>{events.map(e=><option key={e.id} value={e.id}>{e.reference} · {e.name}</option>)}
   </select></label>
   {loading?<p className={styles.small}>Loading secure case correspondence…</p>:visible.length===0?
    <div className={styles.empty}>{isStaff?"No correspondence prepared for these cases.":"No official messages have been sent for your events."}</div>:
    <div className={styles.entries}>{visible.map(m=>{
     const canApproveThis=canApprove&&m.status==="draft"&&m.prepared_by_email!==actor.email;
     const canDispatch=canApprove&&enabled&&m.status==="approved"&&m.approved_by_email===actor.email;
     return <article key={m.id} className={styles.entry}>
      <div className={styles.entryHeader}>
       <div><span className={styles.overline}>{eventFor(m.event_id)?.reference||"EVENT"} · {types.find(t=>t.value===m.kind)?.label||title(m.kind)}</span>
        <h4>{m.subject}</h4><p>{day(m.created_at)}{isStaff?" · "+m.recipient_email:""}</p>
       </div>
       <span className={styles.status} data-status={m.status}>{m.status==="accepted"?"Accepted by Microsoft":title(m.status)}</span>
      </div>
      {(expanded===m.id||!isStaff)&&<div className={styles.message}>{m.body}</div>}
      <div className={styles.entryActions}>
       {isStaff&&<button type="button" className={styles.secondary} onClick={()=>setExpanded(expanded===m.id?null:m.id)}>{expanded===m.id?"Hide details":"Read message"}</button>}
       {canApproveThis&&<button type="button" disabled={busy} onClick={()=>void update({action:"approve",eventId:m.event_id,messageId:m.id})}>Approve message</button>}
       {canDispatch&&<button type="button" disabled={busy} onClick={()=>void update({action:"dispatch",eventId:m.event_id,messageId:m.id})}>Send through Microsoft Graph</button>}
      </div>
      {isStaff&&m.status==="uncertain"&&<p className={styles.caution}>Delivery outcome unknown. Do not resend; an administrator must inspect the sender’s Microsoft 365 Sent Items first.</p>}
      {m.status==="accepted"&&<p className={styles.small}>Microsoft accepted this message for processing. Recipient delivery is not independently confirmed.</p>}
     </article>;
    })}</div>}
  </section>
 </section>;
}
