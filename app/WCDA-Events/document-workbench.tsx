"use client";
import {useEffect,useMemo,useState} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import DocumentsCentre from "./documents-centre";
import GovernanceDesk from "./governance-desk";
import styles from "./document-workbench.module.css";

type DocumentSection="Letters & Memoranda"|"Certificates & Verification"|"Documents & Records";
type View="drafts"|"evidence";
const draftingRoles=["certificates","registrar","manager","super_admin","executive"];
const documentGuides=[
 {key:"application",name:"Application",description:"Original application and organiser details"},
 {key:"safety",name:"Safety plan",description:"Security or safety management evidence"},
 {key:"venue",name:"Venue",description:"Venue or landowner permission"},
 {key:"insurance",name:"Insurance",description:"Liability or relevant insurance evidence"},
 {key:"programme",name:"Programme",description:"Event activities and programme"},
];

export default function DocumentWorkbench({actor,events,section,onCapture}:{
 actor:EmsActor;events:EmsEvent[];section:DocumentSection;onCapture:()=>void
}){
 const [view,setView]=useState<View>(section==="Documents & Records"?"evidence":"drafts");
 const [eventId,setEventId]=useState("");
 const [available,setAvailable]=useState<string[]>([]);
 const [loadingCounts,setLoadingCounts]=useState(false);
 const [revision,setRevision]=useState(0);
 const event=useMemo(()=>events.find(x=>x.id===eventId),[events,eventId]);
 const canDraft=draftingRoles.includes(actor.role||"");
 useEffect(()=>{
  setEventId(previous=>events.some(e=>e.id===previous)?previous:events[0]?.id||"");
 },[events]);
 useEffect(()=>{setView(section==="Documents & Records"?"evidence":"drafts")},[section]);
 useEffect(()=>{
  if(!eventId){setAvailable([]);return}
  let cancelled=false;
  setLoadingCounts(true);
  fetch("/api/wcda-events/documents",{cache:"no-store"}).then(async response=>{
   const json=await response.json() as {documents?:{event_id:string;document_type:string}[]};
   if(!response.ok)throw Error("Unable to refresh the document checklist.");
   if(!cancelled)setAvailable((json.documents||[]).filter(d=>d.event_id===eventId).map(d=>d.document_type));
  }).catch(()=>{if(!cancelled)setAvailable([])}).finally(()=>{if(!cancelled)setLoadingCounts(false)});
  return()=>{cancelled=true};
 },[eventId,view,revision]);
 return <section className={styles.shell} aria-label="WCDA document centre">
  <header className={styles.hero}>
    <div><span className={styles.kicker}>MYWCDA EVENTS / CONTROLLED RECORDS</span>
      <h2>Document Centre</h2>
      <p>Prepare internal letters and certificates, manage case evidence, and check document readiness in one workspace.</p></div>
    <div className={styles.heroMark} aria-hidden="true">WCDA<span>DOCS</span></div>
  </header>
  <div className={styles.steps}>
    <div><b>01</b><span><strong>Choose the event</strong><small>Work on the correct EMS reference</small></span></div>
    <div><b>02</b><span><strong>Prepare or upload</strong><small>Create a draft or attach evidence</small></span></div>
    <div><b>03</b><span><strong>Review & retain</strong><small>Check the record before any issuance</small></span></div>
  </div>
  {!events.length?<div className={styles.empty}>
    <h3>Your document workspace is ready.</h3>
    <p>Create an event application first. Documents and drafts are always linked to a case so they cannot be mixed between organisers.</p>
    <button type="button" onClick={onCapture}>Capture an application →</button>
   </div>:<>
    <div className={styles.selector}>
      <label htmlFor="wcda-doc-case">Active event case</label>
      <select id="wcda-doc-case" value={eventId} onChange={e=>setEventId(e.target.value)}>
       {events.map(ev=><option key={ev.id} value={ev.id}>{ev.reference} · {ev.name}</option>)}
      </select>
      {event&&<span className={styles.context}><b>{event.reference}</b><span>{event.organiser_name} · {event.venue_name}</span></span>}
    </div>
    <div className={styles.tabBar} role="group" aria-label="Document workspace view">
      <button type="button" aria-pressed={view==="drafts"} className={view==="drafts"?styles.active:""} onClick={()=>setView("drafts")}>Document Draft Studio</button>
      <button type="button" aria-pressed={view==="evidence"} className={view==="evidence"?styles.active:""} onClick={()=>setView("evidence")}>Evidence & File Library</button>
    </div>
    {view==="evidence"&&<div className={styles.libraryArea}>
      <section className={styles.checklist} aria-label="Suggested supporting evidence">
        <div className={styles.checkHeader}><div><span>CASE READINESS</span><h3>Supporting evidence</h3></div><span>{loadingCounts?"Checking…":documentGuides.filter(g=>available.includes(g.key)).length+" / "+documentGuides.length+" received"}</span></div>
        <p>A helpful checklist, not a substitute for the event-specific legal requirements or formal assessment.</p>
        <div className={styles.checkGrid}>{documentGuides.map(g=><div key={g.key} className={styles.checkItem}>
          <span className={available.includes(g.key)?styles.checked:styles.todo}>{available.includes(g.key)?"✓":"·"}</span>
          <div><strong>{g.name}</strong><small>{g.description}</small></div>
          <em>{available.includes(g.key)?"On file":"Not yet on file"}</em>
        </div>)}</div>
      </section>
      <DocumentsCentre key={eventId} actor={actor} events={events} initialEventId={eventId} onUploaded={()=>setRevision(v=>v+1)}/>
    </div>}
    {view==="drafts"&&(canDraft&&event?<div className={styles.draftArea}>
      <div className={styles.draftExplainer}><strong>Document Draft Studio</strong><p>Create a WCDA-branded, case-specific draft, save it in the EMS register and export a watermarked PDF. Drafts do <b>not</b> issue approvals, signatures, certificates or permits.</p></div>
      <GovernanceDesk key={event.id+"-"+section} actor={actor} eventId={event.id} reference={event.reference} event={event} section={section==="Documents & Records"?"Letters & Memoranda":section}/>
    </div>:<div className={styles.empty}><h3>Drafts require a document-authorised staff role</h3><p>You can still upload and view evidence. Draft creation is reserved for appointed certificate, registry and management officials.</p><button onClick={()=>setView("evidence")} type="button">Open Evidence Library →</button></div>)}
  </>}
 </section>;
}
