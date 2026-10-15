"use client";
import {useEffect,useMemo,useState,type FormEvent} from "react";
import Link from "next/link";
import type {Official} from "@/lib/persal/server";
import type {CaseRow} from "@/lib/persal/records";
import {fieldDefinitions,readOnlySections} from "@/lib/persal/fields";
import {persalModules} from "@/app/persal/modules";
import {canUseModule} from "@/lib/persal/permissions";
type Props={module:string;tab:string;official:Official|null};
type RegisterRow=Record<string,string|number|boolean|null>;
const core=["Employee Registry","Audit Register","Automation Outbox","Access Register"] as const;
const views:Record<string,string>={"Employee Registry":"employees","Audit Register":"audit","Automation Outbox":"outbox","Access Register":"access"};
const displayTitles:Record<string,string>={"Employee Registry":"Employee master records","Audit Register":"Security and transaction log","Automation Outbox":"Event delivery register","Access Register":"Approved PERSAL officials"};
const titleField=(row:CaseRow)=>row.title||row.reference;
export default function RecordWorkbench({module,tab,official}:Props){
 const [cases,setCases]=useState<CaseRow[]>([]);
 const [special,setSpecial]=useState<RegisterRow[]>([]);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const [error,setError]=useState(""),[notice,setNotice]=useState("");
 const [q,setQ]=useState(""),[formOpen,setFormOpen]=useState(false);
 const [selected,setSelected]=useState<CaseRow|null>(null);
 const [title,setTitle]=useState(""),[fields,setFields]=useState<Record<string,string>>({});
 const [note,setNote]=useState("");
 const [filter,setFilter]=useState("all");
 const eligible=Boolean(official&&canUseModule(official,module));
 const specialView=views[tab],hasIntake=!readOnlySections.includes(tab);
 const fieldsSpec=useMemo(()=>fieldDefinitions(tab),[tab]);
 async function requestJSON(url:string,init?:RequestInit){
  const res=await fetch(url,{...init,cache:"no-store",headers:{"Content-Type":"application/json",...(init?.headers||{})}});
  const parsed:unknown=await res.json().catch(()=>({error:"The service did not respond"}));
  if(!res.ok)throw new Error(typeof parsed==="object"&&parsed&&"error" in parsed?String((parsed as {error:unknown}).error):"Request failed");
  return parsed as Record<string,unknown>;
 }
 async function load(){
  if(!eligible)return;
  setLoading(true);setError("");
  try{
   if(specialView){
    const result=await requestJSON("/api/persal/operations?view="+specialView);
    setSpecial(Array.isArray(result.records)?result.records as RegisterRow[]:[]);
   }else if(tab==="My Tasks"||tab==="Transaction Search"){
    const modules=persalModules.filter(m=>official&&canUseModule(official,m.slug));
    const outputs=await Promise.all(modules.map(m=>requestJSON("/api/persal/cases?module="+encodeURIComponent(m.slug)).catch(()=>({cases:[]}))));
    setCases(outputs.flatMap(o=>Array.isArray(o.cases)?o.cases as CaseRow[]:[]).sort((a,b)=>b.created_at.localeCompare(a.created_at)));
   }else{
    const result=await requestJSON("/api/persal/cases?module="+encodeURIComponent(module)+"&tab="+encodeURIComponent(tab));
    setCases(Array.isArray(result.cases)?result.cases as CaseRow[]:[]);
   }
  }catch(e){setError(e instanceof Error?e.message:"Unable to retrieve records");}
  finally{setLoading(false);}
 }
 useEffect(()=>{setSelected(null);setFormOpen(false);setFields({});setTitle("");setFilter("all");void load();},[module,tab,official?.id]);
 function openNew(){setSelected(null);setTitle("");setFields({});setNote("");setFormOpen(true);setError("");}
 function openExisting(row:CaseRow){setSelected(row);setTitle(row.title);setFields(row.fields||{});setNote("");setFormOpen(true);setError("");}
 async function save(e:FormEvent){
  e.preventDefault();if(!eligible)return;setBusy(true);setError("");setNotice("");
  try{
   const editing=Boolean(selected);
   const result=await requestJSON(editing?"/api/persal/cases/"+selected!.id:"/api/persal/cases",{
    method:editing?"PATCH":"POST",body:JSON.stringify(editing?{action:"save",title,fields}:{module,tab,title,fields})
   });
   setNotice(editing?"Changes saved. Submit when ready.":"Record created as a draft. Submit for independent verification when ready.");
   setFormOpen(false);setSelected(null);await load();
  }catch(e){setError(e instanceof Error?e.message:"Unable to save case");}
  finally{setBusy(false);}
 }
 async function transition(row:CaseRow,action:string){
  if(!eligible)return;setBusy(true);setError("");setNotice("");
  try{
   await requestJSON("/api/persal/cases/"+row.id,{method:"PATCH",body:JSON.stringify({action,note})});
   setNotice("Record "+action+" action completed.");
   setFormOpen(false);setSelected(null);setNote("");await load();
  }catch(e){setError(e instanceof Error?e.message:"Approval operation failed");}
  finally{setBusy(false);}
 }
 const shown=cases.filter(c=>(filter==="all"||c.status===filter||filter==="mine"&&c.created_by===official?.id)&&
   (tab!=="My Tasks"||filter==="all"||c.status===filter) &&
   (q.trim()===""||[c.reference,c.title,c.tab,c.workspace].some(x=>x.toLowerCase().includes(q.trim().toLowerCase()))));
 const filteredSpecial=special.filter(row=>!q||Object.values(row).some(v=>String(v??"").toLowerCase().includes(q.toLowerCase())));
 if(!official)return <div className="wcsp-live-gate"><div className="wcsp-gate-icon">⌑</div><h3>Staff sign-in required</h3><p>This module is operational but contains restricted personnel and payroll information. Sign in with your WCSA Microsoft organisational account to open your authorised records, submit transactions and process approvals.</p><Link href="/login/staff?returnTo=%2Fpersonnel">Continue with Microsoft ↗</Link><small>Access is limited to the 19 approved officials after individual identity verification.</small></div>;
 if(!eligible)return <div className="wcsp-live-gate"><div className="wcsp-gate-icon">◇</div><h3>Department authorisation required</h3><p>Your verified PERSAL account does not have access to this module. Request a formal delegation from the Head of PERSAL and relevant department authority.</p><Link href="/personnel">Return to Command Centre ↗</Link></div>;
 return <div className="wcsp-workbench">
   <div className="wcsp-workbench-head"><div><span className="persal-eyebrow">ACTIVE WORKSPACE</span><h3>{displayTitles[tab]||tab}</h3><p>{specialView?"Read-only view of current controlled registers":"Capture a record, submit it for review and track its status in the official transaction register."}</p></div>
    <div className="wcsp-workbench-actions"><button type="button" onClick={()=>void load()} disabled={loading||busy}>↻ Refresh</button>{hasIntake&&<button className="primary" onClick={openNew} disabled={busy}>+ New record</button>}{tab==="Employee Registry"&&<Link href="/personnel/personnel-administration?tab=Appointments">+ Create appointment ↗</Link>}</div>
   </div>
   {(error||notice)&&<div className={"wcsp-message "+(error?"wcsp-error":"wcsp-success")} role="status">{error||notice}</div>}
   <div className="wcsp-record-toolbar"><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search references, names or cases..." aria-label="Search records"/>{!specialView&&<select aria-label="Filter transaction status" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="draft">Drafts</option><option value="submitted">Awaiting approval</option><option value="returned">Returned</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="mine">My records</option></select>}<span>{specialView?filteredSpecial.length:shown.length} records</span></div>
   {loading?<div className="wcsp-register-empty">Loading current records…</div>:specialView?
    filteredSpecial.length?<div className="wcsp-case-list">{filteredSpecial.map((row,i)=><div className="wcsp-case-card" key={String(row.id||i)}><div className="wcsp-case-main"><strong>{String(row.full_name||row.event_type||row.first_name||row.entity_type||"Record")}{row.last_name?" "+row.last_name:""}</strong><small>{Object.entries(row).filter(([key])=>!["id","full_name","first_name","last_name"].includes(key)).slice(0,5).map(([k,v])=>k.replaceAll("_"," ")+": "+(typeof v==="boolean"?(v?"Yes":"No"):v??"—")).join(" · ")}</small></div></div>)}</div>:
    <div className="wcsp-register-empty"><strong>No matching entries</strong><p>There are no records in this register for the permitted scope.</p></div>:
    shown.length?<div className="wcsp-case-list">{shown.map(row=><article className="wcsp-case-card" key={row.id}><div className="wcsp-case-main"><span className="wcsp-case-ref">{row.reference} · {row.tab}</span><strong>{titleField(row)}</strong><small>{new Date(row.created_at).toLocaleDateString("en-ZA")} · {row.workspace.replaceAll("_"," ")} · {row.module.replaceAll("-"," ")}</small></div><div className="wcsp-case-actions"><span className={"wcsp-status wcsp-"+row.status}>{row.status}</span><button type="button" onClick={()=>openExisting(row)}>Details ↗</button></div></article>)}</div>:
    <div className="wcsp-register-empty"><span className="wcsp-empty-icon">▤</span><strong>No transactions found</strong><p>{hasIntake?"Create a new record to begin a traceable case and approval process.":"Your authorised records and assigned workflows will appear here."}</p>{hasIntake&&<button type="button" onClick={openNew}>+ Create first record</button>}</div>}
   {formOpen&&<div className="wcsp-modal-overlay" onClick={()=>setFormOpen(false)}><div className="wcsp-modal" role="dialog" aria-modal="true" aria-label="PERSAL record" onClick={e=>e.stopPropagation()}><div className="wcsp-modal-top"><div><span className="persal-eyebrow">{selected?.reference||"NEW PERSONNEL RECORD"}</span><h3>{selected?"Manage case":"Create "+tab+" record"}</h3></div><button type="button" onClick={()=>setFormOpen(false)} aria-label="Close">✕</button></div>
    <form onSubmit={save} className="wcsp-case-form"><label>Case title <span>*</span><input value={title} onChange={e=>setTitle(e.target.value)} minLength={3} maxLength={160} required disabled={Boolean(selected&&!["draft","returned"].includes(selected.status))}/></label>
      <div className="wcsp-form-grid">{fieldsSpec.map(field=><label key={field.key}>{field.label} {field.required?"*":""}{field.type==="textarea"?<textarea rows={3} value={fields[field.key]||""} onChange={e=>setFields(f=>({...f,[field.key]:e.target.value}))} required={field.required} disabled={Boolean(selected&&!["draft","returned"].includes(selected.status))}/>:field.type==="select"?<select value={fields[field.key]||""} onChange={e=>setFields(f=>({...f,[field.key]:e.target.value}))} disabled={Boolean(selected&&!["draft","returned"].includes(selected.status))}><option value="">Select…</option>{field.options?.map(o=><option key={o}>{o}</option>)}</select>:<input type={field.type||"text"} value={fields[field.key]||""} onChange={e=>setFields(f=>({...f,[field.key]:e.target.value}))} required={field.required} placeholder={field.placeholder} disabled={Boolean(selected&&!["draft","returned"].includes(selected.status))}/>}</label>)}</div>
      {(!selected||["draft","returned"].includes(selected.status))&&<button className="wcsp-save" type="submit" disabled={busy}>{busy?"Saving…":selected?"Save changes":"Create draft"}</button>}
    </form>
    {selected&&<div className="wcsp-decision"><div className="wcsp-decision-head"><span className={"wcsp-status wcsp-"+selected.status}>{selected.status}</span><small>Created {new Date(selected.created_at).toLocaleDateString("en-ZA")}</small></div>
     {selected.decision_note&&<p>Decision: {selected.decision_note}</p>}
     {selected.created_by===official.id&&["draft","returned"].includes(selected.status)&&<button type="button" className="wcsp-submit" disabled={busy} onClick={()=>void transition(selected,"submit")}>Submit for independent approval →</button>}
     {selected.created_by!==official.id&&selected.status==="submitted"&&<>
       <label>Reviewer reason or comments<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Reason required for return or rejection"/></label>
       <div className="wcsp-review-actions"><button type="button" disabled={busy} onClick={()=>void transition(selected,"approve")}>Approve</button><button type="button" disabled={busy||note.trim().length<3} onClick={()=>void transition(selected,"return")}>Return for correction</button><button type="button" disabled={busy||note.trim().length<3} onClick={()=>void transition(selected,"reject")}>Reject</button></div>
     </>}
     {selected.created_by===official.id&&selected.status==="submitted"&&<p>Submitted for independent review. The author cannot approve this record.</p>}
     {selected.status==="approved"&&<p>Approved case recorded and event entered in the secure outbox. Payroll payment or external integration delivery, if applicable, requires a separate operational service.</p>}
    </div>}
   </div></div>}
 </div>;
}
