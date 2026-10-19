"use client";
import {useEffect,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import styles from "./documents-centre.module.css";
type Doc={id:string;event_id:string;document_type:string;file_name:string;mime_type:string;file_size:number;uploaded_by_email:string;created_at:string};
type Archive={id:string;event_id:string;document_id:string;state:"processing"|"archived"|"uncertain";archive_name:string|null;file_sha256:string|null;archived_at:string|null;};
const kinds=[["application","Application and registration"],["safety","Safety and security"],["medical","Medical and emergency planning"],["venue","Venue and landowner documents"],["insurance","Insurance and liability"],["programme","Event programme"],["compliance","Compliance and permits"],["other","Other supporting evidence"]];
export default function DocumentsCentre({actor,events}:{actor:EmsActor;events:EmsEvent[]}){
 const canArchive=actor.mode==="staff"&&["manager","super_admin","executive","compliance","certificates","registrar"].includes(actor.role||"");
 const[archives,setArchives]=useState<Archive[]>([]);
 const[archiveEnabled,setArchiveEnabled]=useState(false);
 const[archiving,setArchiving]=useState("");
 const[docs,setDocs]=useState<Doc[]>([]);
 const[eventId,setEventId]=useState("");
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
  if(file.size>10485760){setError("The file cannot exceed 10 MB.");return;}
  setBusy(true);setError("");setMessage("");
  try{
   const body=new FormData();body.append("file",file);body.append("eventId",eventId);body.append("documentType",kind);
   const r=await fetch("/api/wcda-events/documents",{method:"POST",body});
   const x=await r.json() as {document?:Doc;error?:string};
   if(!r.ok||!x.document)throw new Error(x.error||"Upload could not be completed.");
   setMessage("Supporting evidence uploaded securely and linked to the event record.");
   setFile(null);
   const input=document.querySelector<HTMLInputElement>("#wcdaDocumentFile");
   if(input)input.value="";
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Document upload failed.");}
  finally{setBusy(false);}
 }
 const visible=eventId?docs.filter(d=>d.event_id===eventId):docs;
 const eventFor=(id:string)=>events.find(e=>e.id===id);
 return <section className={styles.root}>
  <header className={styles.heading}><div><span className={styles.overline}>MYWCDA EVENTS · DOCUMENT CONTROL</span><h2>{actor.mode==="staff"?"Official case documents":"Documents & compliance"}</h2><p>Attach supporting evidence to an authorised event case. Files are stored privately and are not publicly accessible.</p></div><button type="button" onClick={()=>void refresh()} disabled={busy||loading}>↻ Refresh</button></header>
  {canArchive&&!archiveEnabled&&<p className={styles.help}><strong>SharePoint official archive awaiting activation:</strong> uploads remain safely stored in the private EMS evidence register until the approved WCDA Microsoft site and Graph permission are configured.</p>}
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
   <p className={styles.help}>Only upload documents you are authorised to share. Supporting documents are reviewed separately and do not automatically approve or certify an event.</p>
   <button type="submit" className={styles.upload} disabled={!file||!eventId||busy}>{busy?"Uploading securely…":"Upload to event record ↑"}</button>
  </form>
  <section className={styles.panel}>
   <div className={styles.cardHead}><h3>Case document register</h3><span>{visible.length} document(s)</span></div>
   {loading?<p className={styles.help}>Loading authorised records…</p>:visible.length===0?<div className={styles.empty}>No documents found for this view. Select an event above or upload the first supporting file.</div>:
    <div className={styles.list}>{visible.map(d=><article key={d.id} className={styles.doc}>
     <span className={styles.icon}>{d.mime_type==="application/pdf"?"PDF":"IMG"}</span>
     <div className={styles.docInfo}><strong>{d.file_name}</strong><span>{eventFor(d.event_id)?.reference||"EMS record"} · {kinds.find(k=>k[0]===d.document_type)?.[1]||"Document"}</span><small>{new Intl.DateTimeFormat("en-ZA",{dateStyle:"medium"}).format(new Date(d.created_at))} · {(d.file_size/1024/1024).toFixed(2)} MB</small></div>
     <a href={"/api/wcda-events/documents?documentId="+encodeURIComponent(d.id)}>Download ↓</a>
     {canArchive&&(()=>{const archived=archives.find(a=>a.document_id===d.id);return archived?<span className={styles.archiveStatus}>{archived.state==="archived"?"Archived in SharePoint":archived.state==="uncertain"?"Archive needs reconciliation":"Archiving in progress"}</span>:<button className={styles.archiveButton} type="button" disabled={!archiveEnabled||Boolean(archiving)} onClick={()=>void archiveDocument(d)}>{archiving===d.id?"Archiving…":"Archive evidence ↗"}</button>})()}
    </article>)}</div>}
  </section>
  <p className={styles.help}>Documents are retained as case evidence. Uploaded evidence does not replace official endorsement decisions, permit requirements or document verification.</p>
 </section>;
}
