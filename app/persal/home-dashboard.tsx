"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Official, WorkItem } from "@/lib/persal/server";
import { workspaceNames } from "./modules";
import { useActiveWorkspace } from "./portal-shell";

type Overview={active:number|null;pendingStarts:number|null;total:number|null;workItems:WorkItem[]};
export default function HomeDashboard({official,overview}:{official:Official;overview:Overview}) {
 const workspace=useActiveWorkspace();
 const [combined,setCombined]=useState(true);
 const [showShortcuts,setShowShortcuts]=useState(true);
 const [showActivity,setShowActivity]=useState(true);
 const [detail,setDetail]=useState<string|null>(null);
 useEffect(()=>{try{const p=JSON.parse(localStorage.getItem("persal-home-"+official.id)||"{}");setShowShortcuts(p.shortcuts!==false);setShowActivity(p.activity!==false);}catch{}},[official.id]);
 function setPreferences(shortcuts:boolean,activity:boolean){setShowShortcuts(shortcuts);setShowActivity(activity);localStorage.setItem("persal-home-"+official.id,JSON.stringify({shortcuts,activity}));}
 const ownTasks=overview.workItems.filter(t=>combined||t.workspace===workspace);
 const openTasks=ownTasks.filter(t=>!["approved","rejected","completed","cancelled"].includes(t.status));
 const metrics=[
  {name:"Active employees",value:overview.active,href:"/persal/personnel-administration"},
  {name:"All employee records",value:overview.total,href:"/persal/personnel-administration"},
  {name:"Pending starts",value:overview.pendingStarts,href:"/persal/personnel-administration"},
  {name:"My assigned tasks",value:openTasks.length,href:"/persal/utilities?tab=My%20Tasks"},
  {name:"Critical alerts",value:openTasks.filter(t=>t.priority==="critical").length,href:"/persal/utilities?tab=My%20Tasks"},
  {name:"Approvals",value:openTasks.filter(t=>t.type==="approval").length,href:"/persal/utilities?tab=My%20Tasks"}
 ];
 const visible=workspace==="executive"||workspace==="personnel"||workspace==="management"?metrics:metrics.slice(3);
 const selected=metrics.find(m=>m.name===detail);
 return <div className="persal-page">
  <section className="persal-hero"><div><span className="persal-eyebrow">WELCOME TO {workspaceNames[workspace].toUpperCase()}</span><h1>Welcome back, {official.name.split(" ")[0]}.</h1><p>Your restricted PERSAL workspace — approvals, staffing administration, alerts and tasks in one place.</p><Link href="/persal/utilities?tab=My%20Tasks">View assigned work ↗</Link></div><div className="persal-hero-art">▦</div></section>
  <div className="persal-section-heading"><h2>Command centre</h2><span>Data retrieved from authorised records</span></div>
  <section className="persal-kpis" aria-label="Dashboard statistics">{visible.map(item=><button className="persal-kpi" type="button" key={item.name} onClick={()=>setDetail(item.name)}><small>{item.name}</small><strong>{item.value===null?"—":item.value.toLocaleString("en-ZA")}</strong><span>Explore details ↗</span></button>)}</section>
  <section className="persal-critical"><strong>Authorisation safeguards active</strong><p>Payroll release, banking amendments and employment changes require independent approval. Mandatory alerts are never hidden by dashboard preferences.</p></section>
  <div className="persal-columns">
   <section className="persal-panel"><div className="persal-panelhead"><div><h2>My Tasks & Approvals</h2><p>One combined inbox plus your departmental work queue</p></div><Link href="/persal/utilities?tab=My%20Tasks">Open inbox ↗</Link></div>
    <div className="persal-toggle"><button type="button" aria-pressed={combined} className={combined?"on":""} onClick={()=>setCombined(true)}>Combined</button><button type="button" aria-pressed={!combined} className={!combined?"on":""} onClick={()=>setCombined(false)}>Current department</button></div>
    {openTasks.length?openTasks.slice(0,8).map(t=><div className="persal-task" key={t.id}><div><strong>{t.title}</strong><small>{t.reference} · {workspaceNames[t.workspace]} · {t.status}</small></div><span className={"persal-priority "+t.priority}>{t.priority}</span></div>):<div className="persal-empty">No outstanding tasks in this view.</div>}
   </section>
   <section className="persal-panel"><div className="persal-panelhead"><div><h2>My dashboard</h2><p>Personalised layout · permission-safe controls</p></div></div>
    <div className="persal-preferences"><label><input type="checkbox" checked={showShortcuts} onChange={e=>setPreferences(e.target.checked,showActivity)}/> Display shortcuts</label><label><input type="checkbox" checked={showActivity} onChange={e=>setPreferences(showShortcuts,e.target.checked)}/> Display activity information</label><button onClick={()=>setPreferences(true,true)}>Restore default layout</button></div>
    {showShortcuts&&<div className="persal-shortcuts"><Link href="/persal/personnel-administration">Personnel Administration ↗</Link><Link href="/persal/management-information">Management Information ↗</Link><Link href="/persal/back-office">Back-office Administration ↗</Link></div>}
    {showActivity&&<p className="persal-smallprint">Only actions recorded inside your authorised workspaces appear in the activity history. No sample transactions are shown.</p>}
   </section>
  </div>
  {selected&&<div className="persal-overlay" onClick={()=>setDetail(null)}><div className="persal-detail" role="dialog" aria-modal="true" aria-label={selected.name} onClick={e=>e.stopPropagation()}><button className="persal-close" onClick={()=>setDetail(null)}>Close ×</button><span className="persal-eyebrow">INTERACTIVE DRILL-DOWN</span><h2>{selected.name}</h2><strong>{selected.value===null?"Not available":selected.value.toLocaleString("en-ZA")}</strong><p>Open the relevant module for authorised records and further information.</p><Link href={selected.href}>Open full module ↗</Link></div></div>}
 </div>;
}
