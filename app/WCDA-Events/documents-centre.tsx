"use client";
import {useEffect,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import styles from "./documents-centre.module.css";
type Doc={id:string;event_id:string;document_type:string;file_name:string;mime_type:string;file_size:number;uploaded_by_email:string;created_at:string};
type Archive={id:string;event_id:string;document_id:string;state:"processing"|"archived"|"uncertain";archive_name:string|null;file_sha256:string|null;archived_at:string|null;};
const kinds=[["application","Application and registration"],["safety","Safety and security"],["medical","Medical and emergency planning"],["venue","Venue and landowner documents"],["insurance","Insurance and liability"],["programme","Event programme"],["compliance","Compliance and permits"],["other","Other supporting evidence"]];
export default function DocumentsCentre({actor,events,initialEventId,onUploaded}:{actor:EmsActor;events:EmsEvent[];initialEventId?:string;onUploaded?:()=>void}){
 const canArchive=actor.mode==="staff"&&["manager","super_admin","executive","compliance","certificates","registrar"].includes(actor.role||"");
 const[archives,setArchives]=useState<Archive[]>([]);
 const[archiveEnabled,setArchiveEnabled]=useState(false);
 const[archiving,setArchiving]=useState("");
 const[docs,setDocs]=useState<Doc[]>([]);
 const[eventId,setEventId]=useState(initialEventId||"");
 const[search,setSearch]=useState("");
 const[onlyKind,setOnlyKind]=useState("all");
 const[kind,setKind]=useState("application");
 const[file,setFile]=useState<File|null>(null);
 const[loading,setLoading]=useState(true);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const[message,setMessage]=useState("");
 async function refresh(){
  setLoading(true);setError("");
  try{
   const r=await fetch("/api/wcda-events/documents",{cache:"no-store"});
   const x=await r.json() as {documents?:Doc[];error?:string};
   if(!r.ok)throw new Error(x.error||"Documents unavailable.");
   setDocs(x.documents||[]);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load files.");}
  finally{setLoading(false);}
 }
 async function refreshArchives(){
  if(!canArchive)return;
  try{
   const r=await fetch("/api/wcda-events/archive",{cache:"no-store"});
   const x=await r.json() as {archives?:Archive[];archiveEnabled?:boolean};
   if(r.ok){setArchives(x.archives||[]);setArchiveEnabled(x.archiveEnabled===true);}
  }catch{setArchiveEnabled(false);}
 }
 useEffect(()=>{void refresh();void refreshArchives()},[]);
 async function archiveDocument(doc:Doc){
  if(archiving)return;
  setArchiving(doc.id);setError("");setMessage("");
  try{
   const r=await fetch("/api/wcda-events/archive",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventId:doc.event_id,documentId:doc.id})});
   const x=await r.json() as {archive?:Archive;error?:string};
   if(!r.ok||x.archive?.state!=="archived")throw new Error(x.error||"SharePoint did not confirm this archive.");
   setMessage("Evidence copy archived in the approved SharePoint library and linked to the official EMS case.");
   await refreshArchives();
  }catch(e){setError(e instanceof Error?e.message:"Archive could not be confirmed.");await refreshArchives();}
  finally{setArchiving("");}
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!file||!eventId)return;
  if(file.size>10485760||file.size===0){setError("Choose a non-empty file not exceeding 10 MB.");return;}
  if(!/\.(pdf|png|jpe?g)$/i.test(file.name)){setError("Only PDF, PNG and JPEG evidence files are supported.");return;}
  setBusy(true);setError("");setMessage("");
  try{
   const body=new FormData();body.append("file",file);body.append("eventId",eventId);body.append("documentType",kind);
   const r=await fetch("/api/wcda-events/documents",{method:"POST",body});
   const x=await r.json() as {document?:Doc;error?:string};
   if(!r.ok||!x.document)throw new Error(x.error||"Upload could not be completed.");
   setMessage("Evidence saved to the private event register. You can preview or download it below.");
   setFile(null);
   const input=document.querySelector<HTMLInputElement>("#wcdaDocumentFile");
   if(input)input.value="";
   await refresh();
   onUploaded?.();
  }catch(e){setError(e instanceof Error?e.message:"Document upload failed.");}
  finally{setBusy(false);}
 }
 const visible=docs.filter(d=>(!eventId||d.event_id===eventId)
   &&(onlyKind==="all"||d.document_type===onlyKind)
   &&(d.file_name+" "+(kinds.find(k=>k[0]===d.document_type)?.[1]||"")).toLowerCase().includes(search.toLowerCase()));
 const eventFor=(id:string)=>events.find(e=>e.id===id);
 return <section className={styles.root}>
  <header className={styles.heading}><div><span className={styles.overline}>MYWCDA EVENTS · DOCUMENT CONTROL</span><h2>{actor.mode==="staff"?"Official case documents":"Documents & compliance"}</h2><p>Attach supporting evidence to an authorised event case. Files are stored privately and are not publicly accessible.</p></div><button type="button" onClick={()=>void refresh()} disabled={busy||loading}>↻ Refresh</button></header>
  {canArchive&&!archiveEnabled&&<p className={styles.help}><strong>Secure evidence storage is active.</strong> The separate SharePoint archive has not yet been approved for application access. You can still upload, preview, download and classify case evidence here.</p>}
  {error&&<p role="alert" className={styles.error}>{error}</p>}
  {message&&<p role="status" className={styles.success}>{message}</p>}
  <form className={styles.panel} onSubmit={submit}>
   <div className={styles.cardHead}><h3>Upload supporting documentation</h3><span>PDF, PNG, JPEG · up to 10 MB</span></div>
   <div className={styles.formGrid}>
    <label>Linked EMS event *<select required value={eventId} onChange={e=>setEventId(e.target.value)}>
     <option value="">Select an authorised event</option>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.reference} · {ev.name}</option>)}
    </select></label>
    <label>Document classification *<select required value={kind} onChange={e=>setKind(e.target.value)}>{kinds.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label className={styles.fileLabel}>Supporting file *<input id="wcdaDocumentFile" type="file" required accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
   </div>
   <p className={styles.help}>Select the correct event and classification. PDF, PNG and JPEG files are checked by their actual file contents. Evidence is private and does not automatically issue an endorsement or certificate.</p>
   <button type="submit" className={styles.upload} disabled={!file||!eventId||busy}>{busy?"Uploading securely…":"Upload to event record ↑"}</button>
  </form>
  <section className={styles.panel}>
   <div className={styles.cardHead}><h3>Evidence library</h3><span>{visible.length} matching document(s)</span></div>
   <div className={styles.filters}>
    <label>Find a file <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search filename or document category…"/></label>
    <label>Category <select value={onlyKind} onChange={e=>setOnlyKind(e.target.value)}><option value="all">All document types</option>{kinds.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>
    {(search||onlyKind!=="all")&&<button type="button" onClick={()=>{setSearch("");setOnlyKind("all")}}>Clear filters</button>}
   </div>
   {loading?<p className={styles.help}>Loading authorised records…</p>:visible.length===0?<div className={styles.empty}>No documents found for this view. Select an event above or upload the first supporting file.</div>:
    <div className={styles.list}>{visible.map(d=><article key={d.id} className={styles.doc}>
     <span className={styles.icon}>{d.mime_type==="application/pdf"?"PDF":"IMG"}</span>
     <div className={styles.docInfo}><strong>{d.file_name}</strong><span>{eventFor(d.event_id)?.reference||"EMS record"} · {kinds.find(k=>k[0]===d.document_type)?.[1]||"Document"}</span><small>{new Intl.DateTimeFormat("en-ZA",{dateStyle:"medium"}).format(new Date(d.created_at))} · {(d.file_size/1024/1024).toFixed(2)} MB</small></div>
     <div className={styles.fileActions}>
      <a href={"/api/wcda-events/documents?documentId="+encodeURIComponent(d.id)+"&preview=1"} target="_blank" rel="noopener noreferrer" aria-label={"Preview "+d.file_name}>Preview ↗</a>
      <a href={"/api/wcda-events/documents?documentId="+encodeURIComponent(d.id)} aria-label={"Download "+d.file_name}>Download ↓</a>
     </div>
     {canArchive&&(()=>{const archived=archives.find(a=>a.document_id===d.id);
       return archived?<span className={styles.archiveStatus}>{archived.state==="archived"?"Archived in SharePoint":archived.state==="uncertain"?"Archive needs reconciliation":"Archiving in progress"}</span>:
        archiveEnabled?<button className={styles.archiveButton} type="button" disabled={Boolean(archiving)} onClick={()=>void archiveDocument(d)}>{archiving===d.id?"Archiving…":"Copy to SharePoint ↗"}</button>:
        <span className={styles.archiveStatus} title="Retained in the private, access-controlled EMS evidence store">Private EMS record ✓</span>;
     })()}
    </article>)}</div>}
  </section>
  <p className={styles.help}>Documents are retained as case evidence. Uploaded evidence does not replace official endorsement decisions, permit requirements or document verification.</p>
 </section>;
}
