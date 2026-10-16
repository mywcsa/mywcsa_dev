"use client";

import {useCallback,useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor} from "@/lib/ems/types";
import styles from "./governance-desk.module.css";

type Work={id:string;module:string;title:string;description:string;status:string;created_by_email:string;created_at:string};
type Draft={id:string;kind:string;title:string;body:string;status:"draft";created_by_email:string;created_at:string};
type Review={id:string;status:string;recommendation:string;requested_by_email:string;decision_reason:string|null;decided_by_email:string|null;requested_at:string};
type Dataset={work:Work[];drafts:Draft[];reviews:Review[];activeSigner:boolean;error?:string};
const moduleBySection:Record<string,string>={
 "Safety & Compliance":"safety",
 "Inspections & Corrective Actions":"inspections",
 "Contractors & Vendors":"vendors",
 "Personnel & Rosters":"personnel",
 "Logistics & Facilities":"logistics",
 "Access & Accreditation":"accreditation",
 "Live Operations Centre":"operations",
 "Incidents & Emergencies":"incidents",
 "Correspondence & Cases":"correspondence",
 "Finance & Payments":"finance",
 "Programmes & Scheduling":"scheduling",
};
const documentTabs=new Set(["Letters & Memoranda","Certificates & Verification","Documents & Records"]);
const decisionTabs=new Set(["Reviews & Endorsements"]);
const canRequestRole=new Set(["assessor","compliance","registrar","manager","executive"]);
const canDraftRole=new Set(["certificates","registrar","manager","executive"]);
const allowedModules:Record<string,string[]>={
 finance:["finance","manager","executive"],
 safety:["compliance","operations","manager","executive","assessor"],
 inspections:["compliance","operations","manager","executive","assessor"],
 incidents:["compliance","operations","manager","executive","assessor"],
 vendors:["operations","manager","executive","registrar"],
 personnel:["operations","manager","executive","registrar"],
 logistics:["operations","manager","executive","registrar"],
 accreditation:["operations","manager","executive","registrar"],
 operations:["operations","manager","executive","registrar"],
 scheduling:["operations","manager","executive","registrar"],
 correspondence:["operations","manager","executive","registrar","assessor","compliance","finance","certificates"],
};
const formats:[string,string][]=[
 ["endorsement_letter","Endorsement letter"],
 ["approval_letter","Approval correspondence"],
 ["certificate","Certificate draft"],
 ["memorandum","Memorandum"],
 ["other","Other document"],
];
const nice=(value:string)=>value.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const formatDate=(value:string)=>new Date(value).toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"});
const initial:Dataset={work:[],drafts:[],reviews:[],activeSigner:false};
function errorText(error:unknown){return error instanceof Error?error.message:"The request could not be completed.";}

export default function GovernanceDesk({actor,eventId,reference,section,onChange}:{
 actor:EmsActor;eventId:string;reference:string;section:string;onChange?:()=>void
}){
 const module=moduleBySection[section];
 const documents=documentTabs.has(section);
 const decisions=decisionTabs.has(section);
 const [data,setData]=useState<Dataset>(initial);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [draftTitle,setDraftTitle]=useState("");
 const [draftBody,setDraftBody]=useState("");
 const [kind,setKind]=useState("endorsement_letter");
 const [recommendation,setRecommendation]=useState("");
 const [decisionReasons,setDecisionReasons]=useState<Record<string,string>>({});
 const [openDraft,setOpenDraft]=useState<string|null>(null);
 const rows=useMemo(()=>data.work.filter(w=>w.module===module),[data.work,module]);
 const canCreate=!!module&&(allowedModules[module]||[]).includes(actor.role||"");
 const canDraft=canDraftRole.has(actor.role||"");
 const canRequest=canRequestRole.has(actor.role||"");

 const reload=useCallback(async()=>{
  if(!eventId)return;
  setLoading(true);
  try{
   const response=await fetch("/api/wcda-events/governance?eventId="+encodeURIComponent(eventId),{cache:"no-store"});
   const json=await response.json() as Dataset;
   if(!response.ok)throw new Error(json.error||"Unable to load governance records.");
   setData(json);
  }catch(error){setData(initial);setNotice(errorText(error));}
  finally{setLoading(false);}
 },[eventId]);
 useEffect(()=>{void reload();},[reload]);
 async function save(action:string,payload:Record<string,unknown>){
  if(busy)return false;
  setBusy(true);setNotice("");
  try{
   const response=await fetch("/api/wcda-events/governance",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({eventId,action,payload})
   });
   const json=await response.json() as {error?:string};
   if(!response.ok)throw new Error(json.error||"Could not save governance record.");
   await reload();onChange?.();
   setNotice("Saved securely. The event audit trail has been updated.");
   return true;
  }catch(error){setNotice(errorText(error));return false;}
  finally{setBusy(false);}
 }
 async function createWork(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(await save("create_work",{module,title,description})){setTitle("");setDescription("");}
 }
 async function createDraft(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(await save("create_draft",{kind,title:draftTitle,body:draftBody})){setDraftTitle("");setDraftBody("");}
 }
 async function recommend(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(await save("request_endorsement",{recommendation})){setRecommendation("");}
 }
 async function decide(id:string,decision:"approved"|"rejected"){
  if(await save("decide_endorsement",{reviewId:id,decision,reason:decisionReasons[id]||""}))
   setDecisionReasons(state=>({...state,[id]:""}));
 }
 function copyDraft(d:Draft){
  void navigator.clipboard.writeText("DRAFT — NOT ISSUED\n"+reference+"\n"+d.title+"\n\n"+d.body+"\n\nNOT A PERMIT, SIGNED ENDORSEMENT OR ISSUED CERTIFICATE.");
  setNotice("Draft text copied with its non-issued notice.");
 }
 if(!module&&!documents&&!decisions)return null;
 return <section className={styles.desk} aria-label={section+" governance register"}>
   <div className={styles.heading}>
    <div><span className={styles.overline}>WCDA SECURE RECORDS · {reference}</span><h3>{decisions?"Review & independent sign-off":documents?"Controlled document drafting":section+" register"}</h3></div>
    <button className={styles.smallButton} type="button" disabled={loading||busy} onClick={()=>void reload()}>↻ Refresh</button>
   </div>
   {notice&&<div className={styles.notice} role="status">{notice}</div>}
   {loading?<p className={styles.empty}>Loading the secured case register…</p>:<>
    {!!module&&<>
     <p className={styles.help}>{module==="finance"?"Record internal finance follow-up, reconciliations and billing tasks. No invoice or payment is generated here.":module==="correspondence"?"Track correspondence and responses. This register does not send email or sync an inbox.":"Record event-specific operations, assignments and evidence. Entries retain a named employee and timestamp."}</p>
     <div className={styles.records}>
      {rows.map(item=><article key={item.id} className={styles.record}>
       <div><strong>{item.title}</strong><small>{item.created_by_email} · {formatDate(item.created_at)}</small><p>{item.description}</p></div>
       <div><span className={styles.status}>{nice(item.status)}</span>
       {(actor.email===item.created_by_email||["executive","manager"].includes(actor.role||""))?
       <select aria-label={"Status for "+item.title} disabled={busy} value={item.status}
        onChange={e=>void save("set_work_status",{recordId:item.id,status:e.target.value})}>
        {["open","in_progress","blocked","completed"].map(s=><option key={s} value={s}>{nice(s)}</option>)}
       </select>:null}</div>
      </article>)}
      {!rows.length&&<p className={styles.empty}>No records in this module for the selected event.</p>}
     </div>
     {canCreate&&<form className={styles.form} onSubmit={createWork}>
      <h4>New {section.toLowerCase()} record</h4>
      <label>Subject or action<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Describe the work item"/></label>
      <label>Details and action taken<textarea value={description} maxLength={4000} rows={3} onChange={e=>setDescription(e.target.value)}/></label>
      <button disabled={busy} type="submit">{busy?"Saving…":"Save to event register"}</button>
     </form>}
    </>}
    {documents&&<>
     <p className={styles.warning}>All documents in this section are internal drafts. No letter, permit or certificate is signed, sent or issued automatically. An authorised official must complete the relevant approval and document-control procedures.</p>
     <div className={styles.records}>{data.drafts.map(d=><article key={d.id} className={styles.record}>
      <div><strong>{d.title}</strong><small>{nice(d.kind)} · {d.created_by_email} · {formatDate(d.created_at)}</small><span className={styles.status}>DRAFT · NOT ISSUED</span></div>
      <button className={styles.smallButton} type="button" onClick={()=>setOpenDraft(openDraft===d.id?null:d.id)}>{openDraft===d.id?"Hide":"Preview"}</button>
      {openDraft===d.id&&<div className={styles.draftPreview}><b>DRAFT — NOT ISSUED</b><p><strong>{d.title}</strong></p><pre>{d.body}</pre><p>This document has not been signed or issued and is not evidence of legal approval.</p><button type="button" className={styles.smallButton} onClick={()=>copyDraft(d)}>Copy draft text</button></div>}
     </article>)}{!data.drafts.length&&<p className={styles.empty}>No document drafts have been prepared for this event.</p>}</div>
     {canDraft&&<form className={styles.form} onSubmit={createDraft}>
       <h4>Prepare internal draft</h4>
       <label>Document type<select value={kind} onChange={e=>setKind(e.target.value)}>{formats.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
       <label>Document title<input required minLength={3} maxLength={180} value={draftTitle} onChange={e=>setDraftTitle(e.target.value)}/></label>
       <label>Draft body<textarea required minLength={10} maxLength={10000} rows={6} value={draftBody} onChange={e=>setDraftBody(e.target.value)} placeholder="Enter verified facts and approved wording. Do not include a signature."/></label>
       <button disabled={busy} type="submit">{busy?"Saving…":"Save draft — do not issue"}</button>
      </form>}
    </>}
    {decisions&&<>
     <p className={styles.help}>Assessment staff may recommend endorsement. The decision must be taken independently by a separately appointed signatory. A complete checklist and risk assessment are mandatory before endorsement; endorsement is not a statutory event permit.</p>
     <div className={styles.records}>{data.reviews.map(r=><article key={r.id} className={styles.record}>
      <div><strong>{nice(r.status)} recommendation</strong><small>Requested by {r.requested_by_email} · {formatDate(r.requested_at)}</small><p>{r.recommendation}</p>{r.decision_reason&&<p><b>Decision rationale:</b> {r.decision_reason} ({r.decided_by_email})</p>}</div>
      <span className={styles.status}>{nice(r.status)}</span>
      {r.status==="pending"&&data.activeSigner&&r.requested_by_email!==actor.email&&<div className={styles.decisionBox}>
       <label>Signatory's evidence-based reason<textarea required minLength={15} maxLength={3000} rows={3} value={decisionReasons[r.id]||""} onChange={e=>setDecisionReasons(v=>({...v,[r.id]:e.target.value}))}/></label>
       <div className={styles.actions}><button disabled={busy||(decisionReasons[r.id]||"").trim().length<15} onClick={()=>void decide(r.id,"approved")} type="button">Approve endorsement</button><button disabled={busy||(decisionReasons[r.id]||"").trim().length<15} onClick={()=>void decide(r.id,"rejected")} type="button" className={styles.danger}>Reject recommendation</button></div>
      </div>}
      {r.status==="pending"&&!data.activeSigner&&<p className={styles.warning}>Awaiting a separately appointed, verified signatory. This account cannot issue an endorsement.</p>}
     </article>)}{!data.reviews.length&&<p className={styles.empty}>No endorsement recommendation recorded.</p>}</div>
     {canRequest&&<form onSubmit={recommend} className={styles.form}>
      <h4>Submit recommendation for signatory review</h4>
      <label>Assessment findings and reasons<textarea value={recommendation} onChange={e=>setRecommendation(e.target.value)} rows={5} minLength={15} maxLength={3000} required placeholder="Summarise safety, venue, risk and documentary evidence…"/></label>
      <button type="submit" disabled={busy||data.reviews.some(r=>r.status==="pending")}>{busy?"Saving…":"Submit recommendation"}</button>
     </form>}
    </>}
   </>}
 </section>;
}