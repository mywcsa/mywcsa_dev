"use client";
import {useCallback,useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import {WorkHubIcon} from "@/app/workhub/WorkHubIcon";
import styles from "./staff-console.module.css";
import GovernanceDesk from "./governance-desk";

type Case=EmsEvent&{assigned_to_email?:string|null;priority?:string;risk_level?:string;review_due?:string|null};
type Task={id:string;event_id:string;title:string;details:string;category:string;assigned_to_email:string;created_by_email:string;status:string;priority:string;due_date:string|null;created_at:string};
type Note={id:string;body:string;author_email:string;created_at:string};
type Check={id:string;item:string;status:string;updated_by_email:string|null};
type Activity={id:number;action:string;actor_email:string;created_at:string;details:Record<string,unknown>};
type Details={event:Case;tasks:Task[];notes:Note[];checks:Check[];activity:Activity[]};
const sectionCategory:Record<string,string>={
 "Event Applications":"application","Reviews & Endorsements":"review","Safety & Compliance":"safety",
 "Inspections & Corrective Actions":"safety","Contractors & Vendors":"vendor","Personnel & Rosters":"personnel",
 "Logistics & Facilities":"logistics","Access & Accreditation":"accreditation","Live Operations Centre":"operations",
 "Incidents & Emergencies":"incident","Letters & Memoranda":"certificate","Certificates & Verification":"certificate",
 "Finance & Payments":"finance","Correspondence & Cases":"correspondence",
};
const categories=[["general","General"],["application","Applications"],["review","Assessments"],["safety","Safety & Inspections"],["vendor","Contractors & Vendors"],["personnel","Personnel"],["logistics","Logistics"],["accreditation","Access & Accreditation"],["operations","Operations"],["incident","Incidents"],["certificate","Documents & Certification"],["finance","Finance"],["correspondence","Correspondence"]];
const readable=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const date=(d?:string|null)=>d?new Date(d.length===10?d+"T12:00:00":d).toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"}):"—";
const canReview=(role?:string)=>["super_admin","executive","registrar","manager","assessor","compliance"].includes(role||"");
const isEditable=(role?:string)=>role!=="auditor"&&role!=="viewer";
const isWorkView=(s:string)=>s==="My Work"||s==="Dashboard";
const isRegistryView=(s:string)=>["Event Applications","Event Registry","Reviews & Endorsements","Safety & Compliance","Inspections & Corrective Actions"].includes(s);
const logError=(e:unknown)=>e instanceof Error?e.message:"Operation failed. Please retry.";

const sectionIdentity:Record<string,{serial:string,icon:string,headline:string,description:string,theme:string}>={
 "My Work":{serial:"A",icon:"✓",headline:"Your work, prioritised",description:"Assigned duties, due dates and accountable case handling.",theme:"work"},
 "Event Applications":{serial:"B",icon:"▤",headline:"Application processing",description:"Receive, validate and review submitted event applications.",theme:"registry"},
 "Event Registry":{serial:"C",icon:"▦",headline:"Official event register",description:"Search case references and maintain event records and audit history.",theme:"registry"},
 "Reviews & Endorsements":{serial:"D",icon:"✧",headline:"Decisions with accountability",description:"Assessment records and delegated endorsement decisions are separate from payment.",theme:"governance"},
 "Safety & Compliance":{serial:"E",icon:"✚",headline:"Safety oversight",description:"Coordinate event safety checks, risk concerns and compliance actions.",theme:"safety"},
 "Inspections & Corrective Actions":{serial:"F",icon:"◈",headline:"Inspection control",description:"Record inspection findings, remedial tasks and follow-up actions.",theme:"safety"},
 "Contractors & Vendors":{serial:"G",icon:"◇",headline:"Supplier coordination",description:"Manage contractor and vendor tasks linked to event cases.",theme:"people"},
 "Personnel & Rosters":{serial:"H",icon:"◎",headline:"Personnel operations",description:"Assign event staffing tasks and monitor accountable personnel work.",theme:"people"},
 "Logistics & Facilities":{serial:"I",icon:"▣",headline:"Resource and venue logistics",description:"Coordinate equipment, facilities and delivery checklists.",theme:"operations"},
 "Access & Accreditation":{serial:"J",icon:"◉",headline:"Accreditation oversight",description:"Review event-related access requests, badges and assigned tasks.",theme:"operations"},
 "Live Operations Centre":{serial:"K",icon:"◉",headline:"Live event operations",description:"Follow active event cases and on-the-day operational tasks.",theme:"live"},
 "Incidents & Emergencies":{serial:"L",icon:"!",headline:"Incident coordination",description:"Record operational incidents and follow-up tasks; emergency calls remain external.",theme:"safety"},
 "Letters & Memoranda":{serial:"M",icon:"✉",headline:"Official letters and memoranda",description:"Prepare case-linked correspondence subject to independent review.",theme:"documents"},
 "Certificates & Verification":{serial:"N",icon:"◆",headline:"Verification and certification",description:"Manage records supporting formally delegated certificate workflows.",theme:"documents"},
};
export default function StaffConsole({actor,section,onChange}:{actor:EmsActor;section:string;onChange?:()=>void}){
 const [events,setEvents]=useState<Case[]>([]);
 const [tasks,setTasks]=useState<Task[]>([]);
 const [selected,setSelected]=useState("");
 const [details,setDetails]=useState<Details|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [search,setSearch]=useState("");
 const [taskTitle,setTaskTitle]=useState("");
 const [taskBody,setTaskBody]=useState("");
 const [taskAssignee,setTaskAssignee]=useState(actor.email);
 const [taskCategory,setTaskCategory]=useState("general");
 const [taskPriority,setTaskPriority]=useState("normal");
 const [taskDue,setTaskDue]=useState("");
 const [note,setNote]=useState("");
 const [checkName,setCheckName]=useState("");
 const [caseStatus,setCaseStatus]=useState("submitted");
 const [risk,setRisk]=useState("unassessed");
 const [priority,setPriority]=useState("normal");
 const [assigned,setAssigned]=useState("");
 const [reviewDue,setReviewDue]=useState("");
 const allowed=canReview(actor.role);
 const edit=isEditable(actor.role);
 const event=events.find(e=>e.id===selected);
 const chosen=details?.event?.id===selected?details:null;
 const category=sectionCategory[section]||"";
 const visibleTasks=useMemo(()=>tasks.filter(t=>!category||t.category===category),[tasks,category]);
 const identity=sectionIdentity[section];
 const matched=events.filter(e=>(e.reference+" "+e.name+" "+e.organiser_name+" "+e.venue_name+" "+e.status).toLowerCase().includes(search.toLowerCase()));
 const upcoming=events.filter(e=>e.end_date>=new Date().toISOString().slice(0,10));
 const openTasks=tasks.filter(t=>t.status!=="completed");
 const myTasks=openTasks.filter(t=>t.assigned_to_email.toLowerCase()===actor.email.toLowerCase());

 const load=useCallback(async()=>{
  setLoading(true);
  try{
   const response=await fetch("/api/wcda-events/staff",{cache:"no-store"});
   const data=await response.json() as {events?:Case[];tasks?:Task[];error?:string};
   if(!response.ok)throw new Error(data.error||"Unable to load WCDA employee records.");
   setEvents(data.events||[]);setTasks(data.tasks||[]);
   setSelected(s=>s&&(data.events||[]).some(e=>e.id===s)?s:(data.events?.[0]?.id||""));
  }catch(e){setMessage(logError(e));}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 const loadDetails=useCallback(async(id:string)=>{
  if(!id)return;
  try{
   const r=await fetch("/api/wcda-events/staff?eventId="+encodeURIComponent(id),{cache:"no-store"});
   const data=await r.json() as Details&{error?:string};
   if(!r.ok)throw new Error(data.error||"Could not load the event case.");
   setDetails(data);
   setCaseStatus(data.event.status);setRisk(data.event.risk_level||"unassessed");setPriority(data.event.priority||"normal");
   setAssigned(data.event.assigned_to_email||"");setReviewDue(data.event.review_due||"");
  }catch(e){setMessage(logError(e));setDetails(null);}
 },[]);
 useEffect(()=>{setDetails(null);void loadDetails(selected);},[selected,loadDetails]);
 async function act(action:string,payload:Record<string,unknown>,id=selected){
  if(!id||busy)return;
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/wcda-events/staff",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventId:id,action,payload})
   });
   const data=await response.json() as {error?:string};
   if(!response.ok)throw new Error(data.error||"Could not save the action.");
   await load();await loadDetails(id);onChange?.();
   setMessage("Saved successfully. The record and audit history have been updated.");
  }catch(e){setMessage(logError(e));}finally{setBusy(false);}
 }
 function makeTask(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!taskTitle.trim())return;
  void act("create_task",{title:taskTitle,details:taskBody,assigned_to_email:taskAssignee,category:taskCategory,priority:taskPriority,due_date:taskDue})
    .then(()=>{setTaskTitle("");setTaskBody("");});
 }
 function saveNote(e:FormEvent<HTMLFormElement>){e.preventDefault();void act("add_note",{body:note}).then(()=>setNote(""));}
 function saveCheck(e:FormEvent<HTMLFormElement>){e.preventDefault();void act("add_check",{item:checkName}).then(()=>setCheckName(""));}
 function downloadCSV(){
  const quote=(v:unknown)=>'"'+String(v??"").replaceAll('"','""')+'"';
  const lines=[["Reference","Event","Organiser","Venue","Start","End","Status","Risk","Priority"].map(quote).join(","),
   ...matched.map(e=>[e.reference,e.name,e.organiser_name,e.venue_name,e.start_date,e.end_date,e.status,e.risk_level,e.priority].map(quote).join(","))];
  const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="WCDA-EMS-event-registry.csv";a.click();URL.revokeObjectURL(url);
 }
 return <div className={styles.console} aria-label="WCDA employee case management">
  {identity&&<section className={styles.moduleHero} data-theme={identity.theme}>
    <div className={styles.moduleEmblem}>{identity.icon}</div><div>
      <small>MYWCDA / {identity.serial} / {section.toUpperCase()}</small>
      <h2>{identity.headline}</h2>
      <p>{identity.description}</p>
    </div>
    <aside><b>{visibleTasks.length}</b><span>{category?"Module tasks":"Linked tasks"}</span></aside>
  </section>}
  {message&&<div className={styles.message} role="status">{message}<button type="button" onClick={()=>setMessage("")} aria-label="Dismiss message">×</button></div>}
  <div className={styles.top}>
   <div><span className={styles.eyebrow}>CONNECTED EMPLOYEE WORKSPACE</span><h2>{section==="Dashboard"?"Work & Case Control":section}</h2><p>{actor.role==="intake"?"Personal intake access: your own event cases and work. Formal approval requires a delegated role.":"Track the event lifecycle, assign work, record assessments and retain an audit trail."}</p></div>
   <div className={styles.tools}><button onClick={()=>void load()} type="button" disabled={loading}>↻ Refresh records</button><button onClick={downloadCSV} type="button" disabled={!events.length}>↓ Export CSV</button></div>
  </div>
  <div className={styles.metrics}>
   <div><span>Accessible cases</span><strong>{loading?"—":events.length}</strong><small>Verified registry records</small></div>
   <div><span>Open work items</span><strong>{loading?"—":openTasks.length}</strong><small>Active assigned actions</small></div>
   <div><span>My tasks</span><strong>{loading?"—":myTasks.length}</strong><small>Assigned to {actor.name.split(" ")[0]}</small></div>
   <div><span>Upcoming events</span><strong>{loading?"—":upcoming.length}</strong><small>Sessions on or after today</small></div>
  </div>

  {section==="Reports & Intelligence"&&<section className={styles.panel}><h3>Registry activity summary</h3><div className={styles.statsLine}>{["submitted","under_review","corrections_requested","endorsed","closed"].map(s=><span key={s}>{readable(s)}: <b>{events.filter(e=>e.status===s).length}</b></span>)}</div><p>Numbers are calculated from the records your account is authorised to view. Download a CSV for spreadsheet analysis.</p></section>}

  {section==="Organisers & Stakeholders"&&<section className={styles.panel}><h3>Known event organisers</h3>{Array.from(new Set(events.map(e=>e.organiser_name))).map(n=><div className={styles.line} key={n}><strong>{n}</strong><span>{events.filter(e=>e.organiser_name===n).length} linked event(s)</span></div>)}{!events.length&&<p>No organiser records are linked to your accessible events.</p>}</section>}
  {section==="Venues & Locations"&&<section className={styles.panel}><h3>Registered event venues</h3>{Array.from(new Set(events.map(e=>e.venue_name))).map(n=><div className={styles.line} key={n}><strong>{n}</strong><span>{events.filter(e=>e.venue_name===n).length} event(s)</span></div>)}{!events.length&&<p>No venues have been registered for your accessible cases.</p>}</section>}
  {(section==="Events Calendar & GIS"||section==="Programmes & Scheduling")&&<section className={styles.panel}><h3>Upcoming event schedule</h3><p>This is the verified date register. Map coordinates and external GIS data have not yet been connected.</p>{upcoming.sort((a,b)=>a.start_date.localeCompare(b.start_date)).map(e=><button className={styles.lineButton} key={e.id} onClick={()=>setSelected(e.id)}><strong>{date(e.start_date)} — {e.name}</strong><span>{e.venue_name} · {e.reference}</span></button>)}{!upcoming.length&&<p>No upcoming events in your accessible registry.</p>}</section>}

  {(isWorkView(section)||isRegistryView(section)||!!category||!["Organisers & Stakeholders","Venues & Locations","Reports & Intelligence","Events Calendar & GIS","Programmes & Scheduling"].includes(section))&&<div className={styles.columns}>
   <section className={styles.panel}>
    <div className={styles.panelHeading}><h3>{isWorkView(section)?"Task Queue":"Event Case Register"}</h3><span>{isWorkView(section)?visibleTasks.length:matched.length} entries</span></div>
    {isWorkView(section)&&<div className={styles.taskList}>
      {visibleTasks.map(t=><button className={styles.taskItem} type="button" key={t.id} onClick={()=>setSelected(t.event_id)}><strong>{t.title}</strong><small>{t.category} · {t.assigned_to_email} · {t.due_date?date(t.due_date):"No deadline"}</small><span>{readable(t.status)}</span></button>)}
      {!visibleTasks.length&&<p className={styles.empty}>{loading?"Loading tasks…":"No work items yet. Open a case to create an assigned task."}</p>}
     </div>}
    {!isWorkView(section)&&<><input className={styles.search} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reference, event, organiser…" aria-label="Search event cases"/><div className={styles.caseList}>{matched.map(e=><button type="button" key={e.id} className={styles.caseItem+" "+(e.id===selected?styles.selected:"")} onClick={()=>setSelected(e.id)}><span><b>{e.reference}</b><small>{readable(e.status)}</small></span><strong>{e.name}</strong><small>{e.organiser_name} · {e.venue_name}</small><small>{e.capture_channel&&e.capture_channel!=="organiser_portal"?"Office captured · received "+date(e.date_received):"Online application"} · {date(e.start_date)} to {date(e.end_date)}</small></button>)}{!matched.length&&<p className={styles.empty}>{loading?"Loading cases…":"No case matches this search."}</p>}</div></>}
    {isWorkView(section)&&<div className={styles.shortList}><h4>Event cases</h4>{events.slice(0,8).map(e=><button type="button" key={e.id} onClick={()=>setSelected(e.id)}>{e.reference} · {e.name}</button>)}{!events.length&&<p>No accessible events yet. Create an application from the main dashboard.</p>}</div>}
   </section>

   <section className={styles.panel}>
    <div className={styles.panelHeading}><h3>Case Workspace</h3><span>{event?.reference||"No case selected"}</span></div>
    {event?<><div className={styles.caseHeading}><h3>{event.name}</h3><p>{event.organiser_name} · {event.venue_name} · {date(event.start_date)}</p><p>{event.capture_channel&&event.capture_channel!=="organiser_portal"?"In-office capture · received "+date(event.date_received)+" · captured by "+(event.captured_by_email||"staff"):"Organiser portal submission"}</p><div className={styles.chips}><span>{readable(event.status)}</span><span>{readable(event.priority||"normal")} priority</span><span>{readable(event.risk_level||"unassessed")} risk</span></div></div>
      <div className={styles.caseTabs}>
        <details open><summary>Tasks & assignments ({chosen?.tasks.length??0})</summary>
        <div className={styles.detailBody}>
          {(chosen?.tasks||[]).map(t=><div key={t.id} className={styles.row}><div><strong>{t.title}</strong><small>{t.category} · {t.assigned_to_email} · Due {date(t.due_date)}</small></div><select aria-label={"Update "+t.title} disabled={busy||!edit} value={t.status} onChange={e=>void act("task_status",{task_id:t.id,status:e.target.value})}>{["open","in_progress","blocked","completed"].map(s=><option key={s} value={s}>{readable(s)}</option>)}</select></div>)}
          {!(chosen?.tasks.length)&&<p>No tasks assigned to this case.</p>}
          {edit&&<form onSubmit={makeTask} className={styles.form}><h4>Create assigned work</h4><label>Title<input required minLength={3} maxLength={160} value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="e.g. Check safety documentation"/></label><label>Details<textarea maxLength={2000} value={taskBody} onChange={e=>setTaskBody(e.target.value)}/></label><label>Assigned employee email<input type="email" required value={taskAssignee} onChange={e=>setTaskAssignee(e.target.value)} disabled={!allowed}/></label><div className={styles.double}><label>Category<select value={taskCategory} onChange={e=>setTaskCategory(e.target.value)}>{categories.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Priority<select value={taskPriority} onChange={e=>setTaskPriority(e.target.value)}>{["low","normal","high","urgent"].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Due date<input type="date" value={taskDue} onChange={e=>setTaskDue(e.target.value)}/></label><button type="submit" disabled={busy}>Add task</button></form>}
        </div></details>
        <details><summary>Internal notes ({chosen?.notes.length??0})</summary><div className={styles.detailBody}>{(chosen?.notes||[]).map(n=><div className={styles.note} key={n.id}><p>{n.body}</p><small>{n.author_email} · {date(n.created_at)}</small></div>)}{!chosen?.notes.length&&<p>No internal notes yet.</p>}{edit&&<form className={styles.form} onSubmit={saveNote}><label>Record a case note<textarea required minLength={3} maxLength={2500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Private staff note…"/></label><button type="submit" disabled={busy}>Save case note</button></form>}</div></details>
        <details><summary>Assessment checklist ({chosen?.checks.length??0})</summary><div className={styles.detailBody}>{(chosen?.checks||[]).map(c=><div key={c.id} className={styles.row}><strong>{c.item}</strong><select aria-label={"Checklist "+c.item} value={c.status} disabled={!allowed||busy} onChange={e=>void act("check_status",{check_id:c.id,status:e.target.value})}>{["pending","checked","not_applicable"].map(s=><option key={s} value={s}>{readable(s)}</option>)}</select></div>)}{!chosen?.checks.length&&<p>No checklist items for this event.</p>}{allowed&&<form className={styles.form} onSubmit={saveCheck}><label>Add review item<input value={checkName} required minLength={3} maxLength={180} onChange={e=>setCheckName(e.target.value)} placeholder="e.g. Venue permission received"/></label><button type="submit" disabled={busy}>Add checklist item</button></form>}<p>Checked items are preliminary staff tracking, not an official approval or licence verification.</p></div></details>
        <details><summary>Case assessment & routing</summary><div className={styles.detailBody}>{allowed?<form className={styles.form} onSubmit={e=>{e.preventDefault();void act("set_case",{status:caseStatus,priority,risk_level:risk,assigned_to_email:assigned,review_due:reviewDue});}}><label>Processing status<select value={caseStatus} onChange={e=>setCaseStatus(e.target.value)}>{["submitted","under_review","corrections_requested"].map(s=><option key={s} value={s}>{readable(s)}</option>)}</select></label><div className={styles.double}><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}>{["low","normal","high","urgent"].map(s=><option key={s}>{s}</option>)}</select></label><label>Risk screening<select value={risk} onChange={e=>setRisk(e.target.value)}>{["unassessed","low","medium","high","critical"].map(s=><option key={s}>{s}</option>)}</select></label></div><label>Case owner email<input type="email" value={assigned} onChange={e=>setAssigned(e.target.value)} placeholder="employee@wcsports.co.za"/></label><label>Review deadline<input type="date" value={reviewDue} onChange={e=>setReviewDue(e.target.value)}/></label><button type="submit" disabled={busy}>Save assessment & assignment</button></form>:<p>Formal case routing and risk classification require a delegated reviewer role. You can still add tasks and notes to cases you created.</p>}<p>Final endorsement and certificate issuance remain disabled until authorised legal and financial controls are configured.</p></div></details>
        <details><summary>Activity & audit trail ({chosen?.activity.length??0})</summary><div className={styles.detailBody}>{(chosen?.activity||[]).map(a=><div className={styles.note} key={a.id}><strong>{readable(a.action)}</strong><small>{a.actor_email} · {date(a.created_at)}</small></div>)}{!chosen?.activity.length&&<p>No recorded actions.</p>}</div></details>
      </div>
    </>:<p className={styles.empty}>Select or create an event to manage its assigned work, review notes and status.</p>}
   </section>
  </div>}
  {event&&<GovernanceDesk key={event.id+"-"+section} actor={actor} eventId={event.id} event={event} reference={event.reference} section={section} onChange={onChange}/>}
  {category&&<p className={styles.disclaimer}>This section currently tracks real {categories.find(c=>c[0]===category)?.[1].toLowerCase()} work items and related event cases. Specialist {section.toLowerCase()} features, formal financial records and external authorisations are not represented as live until implemented and verified.</p>}
 </div>;
}
