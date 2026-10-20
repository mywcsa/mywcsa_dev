"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WorkHubIcon, type WorkHubIconName } from "@/app/workhub/WorkHubIcon";
import type { EmsActor, EmsEvent } from "@/lib/ems/types";
import styles from "./workspace.module.css";
import StaffConsole from "./staff-console";
import OfficeCapture from "./office-capture";
import FinanceDesk from "./finance-desk";
import OrganiserApplication from "./organiser-application";
import DocumentsCentre from "./documents-centre";
import CorrespondenceCentre from "./correspondence-centre";
import InsightViews, {type Area as InsightArea} from "./insight-views";
import OrganiserOperations from "./organiser-operations";

type NavGroup = { name: string; items: string[] };
const internal: NavGroup[] = [
  {name:"Command Centre",items:["Dashboard","My Work","Events Calendar & GIS"]},
  {name:"Events Administration",items:["Capture in Office","Event Applications","Event Registry","Organisers & Stakeholders","Venues & Locations","Programmes & Scheduling"]},
  {name:"Governance & Safety",items:["Reviews & Endorsements","Safety & Compliance","Inspections & Corrective Actions"]},
  {name:"People & Operations",items:["Contractors & Vendors","Personnel & Rosters","Logistics & Facilities","Access & Accreditation","Live Operations Centre","Incidents & Emergencies"]},
  {name:"Official Documents",items:["Letters & Memoranda","Certificates & Verification","Documents & Records"]},
  {name:"Finance & Support",items:["Finance & Payments","Correspondence & Cases"]},
  {name:"Intelligence & Control",items:["Reports & Intelligence","Administration & Audit"]},
];
const external: NavGroup[] = [{name:"Organiser Workspace",items:["Dashboard","Event Applications","My Events","Documents & Compliance","Event Operations","Payments & Invoices","Letters & Certificates","Messages & Support"]}];
const dateZA=(date:string)=>date?new Date(date+"T12:00:00").toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"}):"—";
const readable=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const iconFor=(s:string):WorkHubIconName=>
 s==="Dashboard"?"house":/Calendar|Scheduling/.test(s)?"calendar":/Certificate|Compliance|Inspection/.test(s)?"check":/Finance|Payment|Invoice/.test(s)?"briefcase":/Work|People|Personnel|Organiser|Contractor|Vendor/.test(s)?"users":/Correspondence|Messages|Support/.test(s)?"mail":/Document|Letter|Record/.test(s)?"file":/Application|Event/.test(s)?"clipboard":/Report|Live|Incident/.test(s)?"activity":"id";

const insightSections:InsightArea[]=["Events Calendar & GIS","Venues & Locations","Organisers & Stakeholders","Programmes & Scheduling","Reports & Intelligence","Administration & Audit"];
const isInsight=(value:string):value is InsightArea=>insightSections.includes(value as InsightArea);

export default function EmsWorkspace({actor}:{actor:EmsActor}) {
  const groups=actor.mode==="staff"?internal:external;
  const [tab,setTab]=useState("Dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [pinned,setPinned]=useState(true);
  const [query,setQuery]=useState("");
  const [events,setEvents]=useState<EmsEvent[]>([]);
  const [loading,setLoading]=useState(false);
  const [notice,setNotice]=useState("");
  const [showForm,setShowForm]=useState(false);
  const isStaffViewer=actor.mode==="staff" && actor.role==="viewer";
  const canCreate=actor.mode==="organiser"||["super_admin","registrar","manager","assessor","intake","compliance","operations","finance","certificates"].includes(actor.role||"");
  const registryTabs=["Dashboard","Event Applications","Event Registry","My Events"];
  const navigable=groups.flatMap(g=>g.items);
  const matches=query.trim()?navigable.filter(x=>x.toLowerCase().includes(query.toLowerCase())).slice(0,5):[];
  const found=useMemo(()=>events.filter(e=>(e.name+" "+e.reference+" "+e.organiser_name+" "+e.venue_name).toLowerCase().includes(query.toLowerCase())),[events,query]);

  async function refresh() {
    if(isStaffViewer){
      setLoading(false);
      setEvents([]);
      setNotice("You can view the EMS workspace. Access to official event records requires an assigned WCDA EMS role.");
      return;
    }
    setLoading(true);
    try{
      const response=await fetch("/api/wcda-events/events",{cache:"no-store"});
      const data=await response.json() as {events?:EmsEvent[];error?:string};
      if(!response.ok)throw new Error(data.error||"The EMS event service is unavailable.");
      setEvents(data.events||[]);
      setNotice("");
    }catch(e){setEvents([]);setNotice(e instanceof Error?e.message:"The event registry is unavailable.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void refresh();},[]);
  const upcoming=events.filter(e=>e.start_date>=new Date().toISOString().slice(0,10));
  const metrics=[
    {label:"Registered events",value:isStaffViewer?"—":loading?"—":String(events.length),icon:"calendar" as WorkHubIconName,subtitle:"Events in authorised records"},
    {label:"Awaiting review",value:isStaffViewer?"—":loading?"—":String(events.filter(e=>["submitted","under_review","corrections_requested"].includes(e.status)).length),icon:"clipboard" as WorkHubIconName,subtitle:"Pending assessments"},
    {label:"Endorsed events",value:isStaffViewer?"—":loading?"—":String(events.filter(e=>e.status==="endorsed").length),icon:"check" as WorkHubIconName,subtitle:"Approved decisions"},
    {label:"Upcoming events",value:isStaffViewer?"—":loading?"—":String(upcoming.length),icon:"video" as WorkHubIconName,subtitle:"In the event calendar"},
  ];

  return <div className={styles.shell}>
    <header className={styles.topbar}>
      <div className={styles.topBrand}><img src="/mywcsa-logo.png" alt="MyWCSA GovApps"/><span><strong>MyWCDA Events</strong><small>Events | Safety | Progress</small></span></div>
      <div className={styles.headerSearch}><WorkHubIcon name="search" size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search EMS pages and events" placeholder="Search MyWCDA Events..."/>
        {matches.length>0&&<div className={styles.searchResults}>{matches.map(x=><button type="button" key={x} onClick={()=>{setTab(x);setQuery("");setShowForm(false);}}><WorkHubIcon name={iconFor(x)} size={17}/>{x}</button>)}</div>}
      </div>
      <div className={styles.topActions}><Link href={actor.mode==="staff"?"/my-apps":"/"} className={styles.backLink}>My Apps <WorkHubIcon name="external" size={13}/></Link><span className={styles.avatar}>{actor.name.slice(0,1).toUpperCase()}</span><span className={styles.accountName}>{actor.name}<small>{actor.mode==="staff"?"Employee":"Organiser"}</small></span></div>
    </header>
    <div className={`${styles.appBody} ${collapsed?styles.layoutCollapsed:""}`}>
      <aside className={styles.sidebar} style={{position:pinned?"sticky":"relative",top:pinned?10:undefined}}>
        <div className={styles.navControls}><button className={styles.collapse} type="button" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?"Expand navigation":"Collapse navigation"}><WorkHubIcon name="chevron" size={18}/></button>{!collapsed&&<button className={styles.pin} type="button" aria-pressed={pinned} onClick={()=>setPinned(v=>!v)}>{pinned?"Pinned":"Pin"}</button>}</div>
        <nav aria-label="EMS sections">
          {groups.map(group=><section key={group.name} className={styles.navGroup}>{!collapsed&&<span className={styles.navHeading}>{group.name}</span>}
          {group.items.map(item=><button className={`${styles.navItem} ${tab===item?styles.navActive:""}`} key={item} title={item} aria-current={tab===item?"page":undefined} type="button" onClick={()=>{setTab(item);setShowForm(false);}}>
          <span className={styles.navSymbol}><WorkHubIcon name={iconFor(item)} size={18}/></span>{!collapsed&&<><span>{item}</span><span className={styles.navChevron}><WorkHubIcon name="chevron" size={14}/></span></>}</button>)}</section>)}
        </nav>
        {!collapsed&&<div className={styles.sidebarBottom}><strong>WCDA</strong><small>Western Cape Development Authority</small><p>Events & Safety Department</p></div>}
      </aside>
      <main className={styles.main}>
        {tab!=="Dashboard"&&<div className={styles.titleRow}><div><span className={styles.eyebrow}>MYWCDA EVENTS · OFFICIAL GOVAPPS WORKSPACE</span><h1>{tab}</h1><p>Event reference: EMS YY/NNNNN</p></div>{canCreate&&registryTabs.includes(tab)&&<button type="button" className={styles.primaryButton} onClick={()=>{if(actor.mode==="staff"){setTab("Capture in Office");setShowForm(false);}else setShowForm(v=>!v);}}>{actor.mode==="staff"?"Capture office application":showForm?"Close form":"New event +"}</button>}</div>}
        {notice&&<div className={styles.notice} role="status">{notice}</div>}
        {tab==="Dashboard"&&<>
          <section className={styles.hero}><div className={styles.heroOverlay}><span className={styles.heroKicker}>WELCOME BACK</span><h1>{actor.name} <span aria-hidden="true">👋</span></h1><p>Your digital workspace for events, community safety and progress.</p>{canCreate&&<button type="button" className={styles.heroButton} onClick={()=>{if(actor.mode==="staff"){setTab("Capture in Office");setShowForm(false);}else setShowForm(true);}}>{actor.mode==="staff"?"Capture an office application":"New event application"} <WorkHubIcon name="arrow" size={16}/></button>}</div><div className={styles.heroQuote}>Events.<br/>Safety.<br/>Progress.</div></section>
          <section className={styles.stats} aria-label="EMS event summary">{metrics.map((m,i)=><div key={m.label} className={styles.stat}><span className={styles.metricIcon} data-tone={i}><WorkHubIcon name={m.icon} size={22}/></span><div className={styles.statDetail}><strong>{m.label}</strong><b>{m.value}</b><small>{m.subtitle}</small></div><span className={styles.metricGo}><WorkHubIcon name="chevron" size={16}/></span></div>)}</section>
          <div className={styles.dashboardPanels}>
            <section className={styles.glassPanel}><div className={styles.panelHeader}><h2><WorkHubIcon name="activity" size={17}/> Recent Activity</h2><span className={styles.panelHint}>Private event updates</span></div><div className={styles.panelBody}>{isStaffViewer?"Your EMS role is pending authorisation. Event records are restricted until your department assigns a role.":events.length?"Event records are available in the registry. Review your assigned cases and upcoming sessions.":"Activity will appear once authorised event records have been created."}</div></section>
            <section className={styles.glassPanel}><div className={styles.panelHeader}><h2><WorkHubIcon name="calendar" size={17}/> Event Calendar</h2><span className={styles.panelHint}>Upcoming</span></div><div className={styles.panelBody}>{upcoming.length?upcoming.slice(0,3).map(e=><p key={e.id}><strong>{e.name}</strong><br/>{dateZA(e.start_date)} · {e.venue_name}</p>):"No event sessions loaded. Upcoming events will appear here when connected to authorised records."}</div></section>
            <section className={styles.glassPanel}><div className={styles.panelHeader}><h2><WorkHubIcon name="megaphone" size={17}/> Announcements</h2><span className={styles.panelHint}>WCDA</span></div><div className={styles.panelBody}>Official departmental announcements will appear here when the messaging service is connected.</div></section>
          </div>
        </>}
        {showForm&&canCreate&&actor.mode==="organiser"&&<OrganiserApplication actor={actor} onCancel={()=>setShowForm(false)} onCreated={(reference)=>{setShowForm(false);setTab("My Events");void refresh().then(()=>setNotice("Event registered as "+reference+". Your application has been sent for assessment."));}}/>}
        {actor.mode==="staff"&&tab==="Capture in Office"&&canCreate&&<OfficeCapture actor={actor} events={events} onCaptured={()=>void refresh()} onFinance={()=>setTab("Finance & Payments")}/>}
        {actor.mode==="staff"&&tab==="Capture in Office"&&!canCreate&&<p className={styles.notice}>Your staff role does not have intake capture permission.</p>}
        {actor.mode==="staff"&&isInsight(tab)&&<InsightViews section={tab} actor={actor} events={events}
          onCapture={()=>setTab("Capture in Office")} onFinance={()=>setTab("Finance & Payments")}/>}
        {actor.mode==="staff"&&tab==="Finance & Payments"&&<FinanceDesk actor={actor} events={events}/>}
        {actor.mode==="staff"&&tab==="Documents & Records"&&<DocumentsCentre actor={actor} events={events}/>}
        {actor.mode==="staff"&&tab==="Correspondence & Cases"&&<CorrespondenceCentre actor={actor} events={events}/>}
        {actor.mode==="staff"&&tab!=="Capture in Office"&&tab!=="Finance & Payments"&&tab!=="Documents & Records"&&tab!=="Correspondence & Cases"&&!isInsight(tab)&&<StaffConsole key={tab} actor={actor} section={tab} onChange={()=>void refresh()}/>}
        {actor.mode!=="staff"&&registryTabs.includes(tab)&&<section className={styles.glassPanel+" "+styles.registryPanel}>
          <div className={styles.panelHeader}><h2><WorkHubIcon name="clipboard" size={18}/>My Events</h2><button className={styles.secondaryButton} type="button" onClick={()=>void refresh()}>Refresh</button></div>
          {loading?<p className={styles.empty}>Loading event records…</p>:found.length?<div className={styles.tableWrap}><table><thead><tr><th>Reference</th><th>Event</th><th>Organiser</th><th>Venue</th><th>Dates</th><th>Status</th></tr></thead><tbody>{found.map(e=><tr key={e.id}><td className={styles.reference}>{e.reference}</td><td>{e.name}</td><td>{e.organiser_name}</td><td>{e.venue_name}</td><td>{dateZA(e.start_date)} — {dateZA(e.end_date)}</td><td>{readable(e.status)}</td></tr>)}</tbody></table></div>:
          <p className={styles.empty}>{isStaffViewer?"No records are displayed until your WCDA EMS role is approved.":notice?"The event service needs configuration before records can be shown.":"No matching event records have been registered."}</p>}
        </section>}
        {actor.mode!=="staff"&&tab==="Payments & Invoices"&&<FinanceDesk actor={actor} events={events}/>}
        {actor.mode!=="staff"&&tab==="Documents & Compliance"&&<DocumentsCentre actor={actor} events={events}/>}
        {actor.mode!=="staff"&&tab==="Messages & Support"&&<CorrespondenceCentre actor={actor} events={events}/>}
        {actor.mode!=="staff"&&(tab==="Event Operations"||tab==="Letters & Certificates")&&<OrganiserOperations
          section={tab} events={events} onDocuments={()=>setTab("Documents & Compliance")} onMessages={()=>setTab("Messages & Support")}/>}
        {actor.mode!=="staff"&&!registryTabs.includes(tab)&&tab!=="Payments & Invoices"&&tab!=="Documents & Compliance"&&tab!=="Messages & Support"&&tab!=="Event Operations"&&tab!=="Letters & Certificates"&&<section className={styles.glassPanel+" "+styles.modulePanel}><div className={styles.panelHeader}><h2><WorkHubIcon name={iconFor(tab)} size={18}/>{tab}</h2><span className={styles.planned}>Configuration pending</span></div><p>This module is part of the WCDA EMS approved architecture. Records and actions will be enabled following secure integration and role approval. No sample approvals, certificates, invoices or incidents are presented as live data.</p>{/Finance|Payment|Certificate|Correspondence|Support/.test(tab)&&<div className={styles.mailGrid}>
          <a href="mailto:finances@wcsports.co.za">Finance · finances@wcsports.co.za</a>
          <a href="mailto:WCDA.Certificates@wcsports.co.za">Certificates · WCDA.Certificates@wcsports.co.za</a>
          <a href="mailto:WCDAEms@govapps.wcsports.co.za">System · WCDAEms@govapps.wcsports.co.za</a>
          <a href="mailto:ServiceDesk@wcsports.co.za">Support · ServiceDesk@wcsports.co.za</a>
        </div>}</section>}
        <footer className={styles.footer}>© MyWCDA Events · Western Cape Development Authority <Link href={actor.mode==="staff"?"/my-apps":"/"}>Back to GovApps ↗</Link></footer>
      </main>
    </div>
  </div>;
}
