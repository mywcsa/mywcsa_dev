"use client";
import {useEffect,useMemo,useState} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import styles from "./insight-views.module.css";

type Area="Events Calendar & GIS"|"Venues & Locations"|"Organisers & Stakeholders"|"Programmes & Scheduling"|"Reports & Intelligence"|"Administration & Audit";
type Task={id:string;event_id:string;title:string;assigned_to_email:string;status:string;due_date:string|null};
type Audit={id:number;action:string;actor_email:string;created_at:string;details:Record<string,unknown>};
type Detail={activity:Audit[];error?:string};
const date=(d:string)=>new Date(d+"T12:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"});
const pretty=(d:string)=>d.replaceAll("_"," ").replace(/\b\w/g,x=>x.toUpperCase());
const locator=(v:string)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(v);
const statusOrder=["submitted","under_review","corrections_requested","endorsed","closed","declined","withdrawn"];
export default function InsightViews({section,actor,events,onCapture,onFinance}:{section:Area;actor:EmsActor;events:EmsEvent[];onCapture:()=>void;onFinance:()=>void}){
 const [monthOffset,setMonthOffset]=useState(0);
 const [selected,setSelected]=useState("");
 const [tasks,setTasks]=useState<Task[]>([]);
 const [logs,setLogs]=useState<Audit[]>([]);
 const [auditError,setAuditError]=useState("");
 const [loading,setLoading]=useState(false);
 const [filter,setFilter]=useState("");
 const today=new Date();
 const first=new Date(today.getFullYear(),today.getMonth()+monthOffset,1);
 const monthKey=first.getFullYear()+"-"+String(first.getMonth()+1).padStart(2,"0");
 const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
 const startMonday=(first.getDay()+6)%7;
 const upcoming=useMemo(()=>[...events].filter(e=>e.end_date>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.start_date.localeCompare(b.start_date)),[events]);
 const venues=useMemo(()=>{
  const m=new Map<string,EmsEvent[]>();
  for(const e of events){const k=e.venue_name.trim()||"Unnamed venue";m.set(k,[...(m.get(k)||[]),e]);}
  return [...m].sort((a,b)=>a[0].localeCompare(b[0]));
 },[events]);
 const organisers=useMemo(()=>{
  const m=new Map<string,EmsEvent[]>();
  for(const e of events){const k=e.organiser_name.trim()||"Unassigned organiser";m.set(k,[...(m.get(k)||[]),e]);}
  return [...m].sort((a,b)=>a[0].localeCompare(b[0]));
 },[events]);
 const selectedEvent=events.find(e=>e.id===selected);
 useEffect(()=>{
  if(!["Programmes & Scheduling","Administration & Audit"].includes(section))return;
  let ignore=false;
  fetch("/api/wcda-events/staff",{cache:"no-store"}).then(async r=>{
   const data=await r.json() as {tasks?:Task[];error?:string};
   if(!r.ok)throw Error(data.error||"The staff work register is unavailable.");
   if(!ignore)setTasks(data.tasks||[]);
  }).catch(e=>{if(!ignore)setAuditError(e instanceof Error?e.message:"Work register unavailable.")});
  return()=>{ignore=true};
 },[section]);
 useEffect(()=>{
  if(section!=="Administration & Audit"||!selected)return;
  let cancelled=false;setLoading(true);setAuditError("");setLogs([]);
  fetch("/api/wcda-events/staff?eventId="+encodeURIComponent(selected),{cache:"no-store"}).then(async r=>{
   const d=await r.json() as Detail;if(!r.ok)throw Error(d.error||"Audit history unavailable.");
   if(!cancelled)setLogs(d.activity||[]);
  }).catch(e=>{if(!cancelled)setAuditError(e instanceof Error?e.message:"Unable to load audit history.")}).finally(()=>{if(!cancelled)setLoading(false)});
  return()=>{cancelled=true};
 },[section,selected]);
 function csvExport(){
  const cols=["Reference","Event","Organiser","Venue","Start","End","Status"];
  const escape=(s:unknown)=>'"'+String(s??"").replaceAll('"','""')+'"';
  const rows=[cols,...events.map(e=>[e.reference,e.name,e.organiser_name,e.venue_name,e.start_date,e.end_date,e.status])];
  const blob=new Blob([rows.map(row=>row.map(escape).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="MyWCDA-Events-Registry.csv";link.click();URL.revokeObjectURL(url);
 }
 const empty=<div className={styles.empty}><strong>No event data in your authorised registry yet</strong><p>Capture your first application in the office. These workspaces will populate from real records without sample or invented entries.</p><button type="button" onClick={onCapture}>Open Capture in Office →</button></div>;
 const header=(kicker:string,headline:string,description:string)=> <header className={styles.header}><div><small>{kicker}</small><h2>{headline}</h2><p>{description}</p></div><span className={styles.count}>{events.length} events</span></header>;
 if(section==="Events Calendar & GIS"){
  const cells:Array<number|null>=[...Array(startMonday).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  return <section className={styles.calArea}>{header("01 / INTELLIGENT CALENDAR","Events calendar & map discovery","Explore approved registry dates and locate event venues. Map search results are external and must be verified against venue records.")}
    <div className={styles.calLayout}><div className={styles.calendar}>
      <div className={styles.calTop}><button type="button" onClick={()=>setMonthOffset(x=>x-1)} aria-label="Previous month">‹</button><strong>{first.toLocaleDateString("en-ZA",{month:"long",year:"numeric"})}</strong><button type="button" onClick={()=>setMonthOffset(x=>x+1)} aria-label="Next month">›</button></div>
      <div className={styles.calGrid}>{["M","T","W","T","F","S","S"].map((d,i)=><span className={styles.week} key={i}>{d}</span>)}{cells.map((n,i)=>{
        const iso=n?monthKey+"-"+String(n).padStart(2,"0"):"";
        const matches=n?events.filter(e=>e.start_date<=iso&&e.end_date>=iso):[];
        return <div className={styles.calCell+" "+(matches.length?styles.hasEvent:"")} key={i}>{n&&<><span>{n}</span>{matches.slice(0,2).map(e=><small key={e.id} title={e.name}>{e.name}</small>)}{matches.length>2&&<em>+{matches.length-2} more</em>}</>}</div>
       })}</div></div>
      <aside className={styles.calSide}><span className={styles.pill}>VENUE DISCOVERY</span><h3>Events on the map</h3>{events.length?events.slice(0,8).map(e=><div className={styles.mapRow} key={e.id}><div><strong>{e.name}</strong><small>{e.venue_name}</small></div><a href={locator([e.venue_name,e.venue_address].filter(Boolean).join(", "))} target="_blank" rel="noopener noreferrer">Map ↗</a></div>):empty}</aside>
    </div>
  </section>;
 }
 if(section==="Venues & Locations")return <section className={styles.venueArea}>{header("02 / GEOGRAPHIC REGISTER","Venues & locations","One card per recorded venue, with actual case connections and external map lookup. Addresses are not treated as verified coordinates.")}
  {venues.length?<div className={styles.venueGrid}>{venues.map(([name,items],i)=><article className={styles.venueCard} key={name}><div className={styles.venueNumber}>{String(i+1).padStart(2,"0")}</div><div className={styles.venueIcon}>⌖</div><h3>{name}</h3><p>{items.length} registered event{items.length!==1?"s":""}</p><span>{items[0].venue_address||"Address not yet supplied"}</span><a href={locator([name,items[0].venue_address].filter(Boolean).join(", "))} target="_blank" rel="noopener noreferrer">Open map search ↗</a></article>)}</div>:empty}
  </section>;
 if(section==="Organisers & Stakeholders")return <section className={styles.orgArea}>{header("03 / RELATIONSHIP INTELLIGENCE","Organiser directory","Explore stakeholder relationships compiled from authorised event applications, not a fabricated contact book.")}
   <div className={styles.searchBox}><input aria-label="Filter organisers" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search organiser or organisation…"/><span>{organisers.length} organisations</span></div>
   {organisers.length?<div className={styles.orgList}>{organisers.filter(([n])=>n.toLowerCase().includes(filter.toLowerCase())).map(([name,items])=><article className={styles.orgRow} key={name}><span className={styles.initial}>{name.slice(0,1).toUpperCase()}</span><div><strong>{name}</strong><small>{items.map(e=>e.reference).join(" · ")}</small></div><span className={styles.orgCount}>{items.length} event{items.length===1?"":"s"}</span></article>)}</div>:empty}
  </section>;
 if(section==="Programmes & Scheduling")return <section className={styles.programmeArea}>{header("04 / PROGRAMME OPERATIONS","Programme timeline","Live event dates and assigned tasks in chronological order. No invented programmes or published schedules.")}
   <div className={styles.programmeLayout}><div><h3>Upcoming activity</h3>{upcoming.length?upcoming.map((e,i)=><article className={styles.timelineEntry} key={e.id}><span className={styles.timelineDot}>{i+1}</span><div><small>{date(e.start_date)}{e.end_date!==e.start_date?" — "+date(e.end_date):""}</small><h4>{e.name}</h4><p>{e.venue_name} · {e.reference}</p></div></article>):empty}</div><aside className={styles.taskPanel}><strong>Task assignments</strong><span>{tasks.length} task records</span>{tasks.length?tasks.slice(0,8).map(t=><p key={t.id}><b>{t.title}</b><small>{pretty(t.status)}{t.due_date?" · due "+date(t.due_date):""}</small></p>):<p>No programme tasks have been assigned yet.</p>}</aside></div>
  </section>;
 if(section==="Reports & Intelligence"){
  const counts=statusOrder.map(name=>({name,count:events.filter(e=>e.status===name).length}));
  const biggest=Math.max(1,...counts.map(x=>x.count));
  return <section className={styles.reportArea}>{header("05 / LIVE BUSINESS INTELLIGENCE","Event intelligence","Statistics are calculated from authorised database events; export your accessible register for further analysis.")}
   <div className={styles.kpi}><article><span>Events</span><strong>{events.length}</strong></article><article><span>Upcoming</span><strong>{upcoming.length}</strong></article><article><span>Venues</span><strong>{venues.length}</strong></article><article><span>Organisers</span><strong>{organisers.length}</strong></article></div>
   <div className={styles.reportBody}><div className={styles.chart}><h3>Pipeline by case status</h3>{counts.map(x=><div className={styles.barRow} key={x.name}><span>{pretty(x.name)}</span><div><i style={{width:Math.max(0,x.count/biggest*100)+"%"}}/></div><b>{x.count}</b></div>)}</div><div className={styles.export}><h3>Export authorised data</h3><p>Download your accessible case references, event names, dates, venues, organisers and statuses as CSV.</p><button type="button" onClick={csvExport}>Export event register ↓</button><small>No secret identifiers, payment details or staff credentials are included.</small></div></div>
  </section>;
 }
 return <section className={styles.auditArea}>{header("06 / GOVERNANCE & SYSTEM CONTROL","Administration & audit","Read-only event activity tracking. Financial approval, personnel access and legal signing remain subject to their separate authorisations.")}
 <div className={styles.auditLayout}><aside><h3>Audited event</h3>{events.length?events.map(e=><button type="button" key={e.id} className={selected===e.id?styles.active:""} onClick={()=>setSelected(e.id)}>{e.reference} <span>{e.name}</span></button>):empty}</aside>
 <div className={styles.auditDetails}><h3>{selectedEvent?selectedEvent.name:"Select an event for its audit trail"}</h3>{auditError&&<p role="alert">{auditError}</p>}{loading?<p>Reading authorised audit records…</p>:selected?logs.length?logs.map(a=><article key={a.id}><b>{pretty(a.action)}</b><p>{a.actor_email}</p><small>{new Date(a.created_at).toLocaleString("en-ZA")}</small></article>):<p>No activity entries returned for this event.</p>:<p>Choose a registered case to inspect its available audit actions.</p>}
 <div className={styles.auditGuard}><strong>Role scope: {pretty(actor.role||"unassigned")}</strong><p>Super Admin does not override independent invoice approvals, private documents or delegated endorsement signatories.</p><button type="button" onClick={onFinance}>Open Finance controls →</button></div></div></div>
 </section>;
}
