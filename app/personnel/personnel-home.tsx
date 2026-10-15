"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {persalModules,workspaceNames} from "@/app/persal/modules";
import type {Official,WorkItem,Workspace} from "@/lib/persal/server";
import {usePersonnelWorkspace} from "./preview-shell";
type Overview={active:number|null;pendingStarts:number|null;total:number|null;workItems:WorkItem[]};
const recommendations:Record<Workspace,string[]>={
 executive:["management-information","human-resource-planning","utilities"],
 management:["human-resource-planning","supporting-sub-systems","management-information"],
 personnel:["personnel-administration","human-resource-planning","utilities"],
 finance:["salary-administration","management-information","utilities"],
 ict_bit:["back-office","utilities","management-information"],
 innovation:["back-office","utilities","supporting-sub-systems"],
 communications:["utilities","back-office","supporting-sub-systems"]
};
const cards=[
 {title:"Employee master",label:"Approved workforce records",key:"total" as const,icon:"♙",href:"/personnel/personnel-administration?tab=Employee%20Registry"},
 {title:"Active employees",label:"Current employee establishment",key:"active" as const,icon:"▦",href:"/personnel/personnel-administration"},
 {title:"Pending starts",label:"Employment commencing soon",key:"pendingStarts" as const,icon:"◷",href:"/personnel/personnel-administration?tab=Appointments"},
 {title:"My tasks",label:"Assigned actions and reviews",key:"work" as const,icon:"▤",href:"/personnel/utilities?tab=My%20Tasks"}
];
export default function PersonnelHome({official,overview}:{official:Official|null;overview:Overview|null}){
 const workspace=usePersonnelWorkspace();
 const [filter,setFilter]=useState("");
 const [queue,setQueue]=useState<"combined"|"current">("combined");
 const [showAutomation,setShowAutomation]=useState(true);
 const [panel,setPanel]=useState<(typeof cards)[number]|null>(null);
 const [details,setDetails]=useState(false);
 useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem("wcsa-personnel-home")||"{}");setShowAutomation(stored.automation!==false);}catch{}},[]);
 const recommended=recommendations[workspace].map(slug=>persalModules.find(m=>m.slug===slug)!).filter(Boolean);
 const filtered=persalModules.filter(m=>(m.name+" "+m.tabs.join(" ")).toLowerCase().includes(filter.trim().toLowerCase()));
 const assigned=overview?.workItems.filter(t=>queue==="combined"||t.workspace===workspace)||[];
 const opened=assigned.filter(t=>!["completed","approved","rejected","cancelled"].includes(t.status));
 return <div className="persal-page wcsp-home">
  <section className="persal-hero wcsp-hero">
   <div className="wcsp-hero-content">
    <span className="wcsp-herotag"><span aria-hidden>✦</span> YOUR PERSONNEL COMMAND CENTRE</span>
    <h1>People. Purpose.<br/><em>Progress.</em></h1>
    <p>A more intelligent way to manage workforce planning, personnel services and payroll operations across WCSA.</p>
    <div className="wcsp-herobuttons"><Link href="/personnel/personnel-administration">Explore Personnel <span aria-hidden>↗</span></Link><Link href="/personnel/back-office">Automation Centre <span aria-hidden>↗</span></Link></div>
   </div>
   <div className="wcsp-heroseal" aria-hidden><span>WCSA</span><small>GOVAPPS</small></div>
   <a className="wcsp-credit" href="https://unsplash.com/license" target="_blank" rel="noreferrer">Photo: Unsplash · licence ↗</a>
  </section>
  <div className="wcsp-welcome"><div><span className="persal-eyebrow">YOUR CURRENT VIEW</span><h2>{workspaceNames[workspace]}</h2><p>Choose another department in the header to explore the relevant tools and workflows.</p></div><span className="wcsp-welcome-dot"><span></span> {official?"Verified official":"Visual preview only"}</span></div>
  <div className="persal-section-heading"><h2>Workspace overview</h2><span>{official?"Authorised records only":"No confidential data shown"}</span></div>
  <section className="persal-kpis wcsp-kpis">
   {cards.map(card=><button type="button" key={card.title} className="persal-kpi wcsp-stat" onClick={()=>setPanel(card)}><span className="wcsp-stat-icon">{card.icon}</span><small>{card.title}</small><strong>{!official?"—":card.key==="work"?opened.length:overview?.[card.key]??"—"}</strong><span>{card.label} <b>↗</b></span></button>)}
  </section>
  <div className="persal-section-heading"><h2>Recommended for {workspaceNames[workspace]}</h2><span>Department-specific shortcuts</span></div>
  <section className="wcsp-features">{recommended.map((m,index)=><Link href={"/personnel/"+m.slug} key={m.slug} className="wcsp-feature"><span className="wcsp-feature-icon">{m.icon}</span><span><strong>{m.name}</strong><small>{m.description}</small></span><b>{index===0?"01":index===1?"02":"03"}</b><span className="wcsp-feature-arrow">↗</span></Link>)}</section>
  <div className="wcsp-grid">
   <section className="persal-panel wcsp-panel">
    <div className="persal-panelhead"><div><span className="persal-eyebrow">TASK MANAGEMENT</span><h2>My tasks & approvals</h2><p>Combined and departmental work queues</p></div><Link href="/personnel/utilities?tab=My%20Tasks">Open inbox ↗</Link></div>
    <div className="persal-toggle"><button className={queue==="combined"?"on":""} onClick={()=>setQueue("combined")}>Combined</button><button className={queue==="current"?"on":""} onClick={()=>setQueue("current")}>Current department</button></div>
    {official&&opened.length?opened.slice(0,5).map(t=><div key={t.id} className="persal-task"><div><strong>{t.title}</strong><small>{t.reference} · {t.status.replaceAll("_"," ")}</small></div><span className={"persal-priority "+t.priority}>{t.priority}</span></div>):
    <div className="wcsp-empty"><span>▤</span><strong>{official?"Your queue is clear":"Review workflow preview"}</strong><p>{official?"No outstanding tasks in this view.":"When accounts are verified, assigned actions will appear here. No fabricated approvals or personnel records are displayed."}</p></div>}
   </section>
   <section className="persal-panel wcsp-panel">
    <div className="persal-panelhead"><div><span className="persal-eyebrow">NAVIGATE THE SYSTEM</span><h2>Find a function</h2><p>Search across administration modules</p></div></div>
    <input className="wcsp-filter" type="search" placeholder="Search tools and sections..." value={filter} onChange={e=>setFilter(e.target.value)}/>
    <div className="wcsp-module-list">{filtered.slice(0,7).map(m=><Link key={m.slug} href={"/personnel/"+m.slug}><span>{m.icon}</span><strong>{m.name}</strong><small>{m.tabs.length} sections</small><b>↗</b></Link>)}{filtered.length===0&&<p>No matching administration modules.</p>}</div>
   </section>
  </div>
  <section className="wcsp-automation">
    <div><span className="persal-eyebrow">INTEGRATION-FIRST DESIGN</span><h2>One approved change.<br/>Every relevant system in sync.</h2><p>PERSAL is designed as the employee master and payroll authority. Approved events will connect WorkHub, Careers, Microsoft 365, SharePoint and other authorised GovApps workflows.</p>
      <Link href="/personnel/back-office?tab=Automation%20Outbox">Explore automation controls ↗</Link>
    </div>
    <div className="wcsp-automation-right"><div className="wcsp-automation-top">EMPLOYEE EVENT <span>→</span></div><div>01 <span>Capture</span></div><div>02 <span>Verify</span></div><div>03 <span>Approve</span></div><div>04 <span>Publish approved event</span></div><div>05 <span>Synchronise authorised apps</span></div><button onClick={()=>{setShowAutomation(!showAutomation);try{localStorage.setItem("wcsa-personnel-home",JSON.stringify({automation:!showAutomation}));}catch{}}}>{showAutomation?"Hide":"Show"} workflow details</button>{showAutomation&&<small>Design workflow only. Payments, employment decisions and notifications are not automatically executed in this preview.</small>}</div>
  </section>
  {panel&&<div className="persal-overlay" onClick={()=>setPanel(null)}><div className="persal-detail" role="dialog" aria-modal="true" aria-label={panel.title} onClick={e=>e.stopPropagation()}><button className="persal-close" onClick={()=>setPanel(null)}>Close ×</button><span className="persal-eyebrow">WORKSPACE DRILL-DOWN</span><h2>{panel.title}</h2><p>{panel.label}. {official?"Data visibility follows your assigned permissions.":"For now this is a visual-only preview, so no employee statistics are published."}</p><button className="wcsp-details" onClick={()=>setDetails(!details)}>{details?"Hide":"Show"} access information</button>{details&&<p>Viewing or changing employee and salary information requires an individually verified Microsoft Entra identity and appropriate permissions.</p>}<div><Link href={panel.href}>Open relevant module ↗</Link></div></div></div>}
 </div>;
}
