"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { EmsActor, EmsEvent } from "@/lib/ems/types";
import styles from "./workspace.module.css";

type NavGroup={name:string;items:string[]};
const staffNavigation:NavGroup[]=[
  {name:"Command Centre",items:["Dashboard","My Work","Events Calendar & GIS"]},
  {name:"Events Administration",items:["Event Applications","Event Registry","Organisers & Stakeholders","Venues & Locations","Programmes & Scheduling"]},
  {name:"Governance & Safety",items:["Reviews & Endorsements","Safety & Compliance","Inspections & Corrective Actions"]},
  {name:"People & Operations",items:["Contractors & Vendors","Personnel & Rosters","Logistics & Facilities","Access & Accreditation","Live Operations Centre","Incidents & Emergencies"]},
  {name:"Documentation",items:["Letters & Memoranda","Certificates & Verification","Documents & Records"]},
  {name:"Finance & Correspondence",items:["Finance & Payments","Correspondence & Cases"]},
  {name:"Intelligence & Administration",items:["Reports & Intelligence","Administration & Audit"]},
];
const organiserNavigation:NavGroup[]=[
  {name:"MyWCDA Organiser Portal",items:["Dashboard","Event Applications","My Events","Documents & Compliance","Event Operations","Payments & Invoices","Letters & Certificates","Messages & Support"]},
];
const categories=["Festival","Sport","Concert","Market","Conference","Cultural","Community","Religious","Exhibition","Other"];
const emptyForm={organiserName:"",name:"",category:"Festival",venueName:"",venueAddress:"",startDate:"",endDate:"",estimatedAttendance:""};
type EventForm=typeof emptyForm;
const dateZA=(date:string)=>date?new Date(date+"T12:00:00").toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"}):"—";
const titleCase=(value:string)=>value.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());

export default function EmsWorkspace({actor}:{actor:EmsActor}) {
  const nav=actor.mode==="staff"?staffNavigation:organiserNavigation;
  const [active,setActive]=useState("Dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [events,setEvents]=useState<EmsEvent[]>([]);
  const [loading,setLoading]=useState(true);
  const [notice,setNotice]=useState("");
  const [search,setSearch]=useState("");
  const [showForm,setShowForm]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState<EventForm>(emptyForm);
  const canCreate=actor.mode==="organiser" || ["registrar","manager","assessor"].includes(actor.role||"");
  const tabsWithEventRegistry=["Dashboard","Event Registry","Event Applications","My Events"];
  const filtered=useMemo(()=>events.filter(e=>(e.reference+" "+e.name+" "+e.organiser_name+" "+e.venue_name).toLowerCase().includes(search.toLowerCase())),[events,search]);

  async function refresh(){
    setLoading(true);
    try {
      const response=await fetch("/api/wcda-events/events",{cache:"no-store"});
      const json=await response.json() as {events?:EmsEvent[];error?:string};
      if(!response.ok)throw new Error(json.error||"Event records are unavailable.");
      setEvents(Array.isArray(json.events)?json.events:[]);
      setNotice("");
    } catch(error) {
      setNotice(error instanceof Error?error.message:"Could not load EMS event records.");
    } finally {setLoading(false);}
  }
  useEffect(()=>{void refresh();},[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(saving)return;
    setSaving(true);
    setNotice("");
    try{
      const response=await fetch("/api/wcda-events/events",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      const json=await response.json() as {event?:{reference:string};error?:string};
      if(!response.ok)throw new Error(json.error||"The application could not be submitted.");
      setShowForm(false);
      setForm(emptyForm);
      setActive(actor.mode==="staff"?"Event Registry":"My Events");
      await refresh();
      setNotice("Application registered successfully: "+(json.event?.reference||"see event registry"));
    } catch(error){
      setNotice(error instanceof Error?error.message:"Application submission failed.");
    } finally{setSaving(false);}
  }
  const summary=[
    {label:"Registered events",value:loading?"—":String(events.length),symbol:"▦"},
    {label:"Awaiting assessment",value:loading?"—":String(events.filter(e=>["submitted","under_review","corrections_requested"].includes(e.status)).length),symbol:"◷"},
    {label:"Endorsed",value:loading?"—":String(events.filter(e=>e.status==="endorsed").length),symbol:"✓"},
    {label:"Upcoming dates",value:loading?"—":String(events.filter(e=>e.start_date>=new Date().toISOString().slice(0,10)).length),symbol:"◇"},
  ];

  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${collapsed?styles.sidebarCollapsed:""}`}>
      <div className={styles.brand}><span className={styles.brandIcon}>W</span>{!collapsed&&<span><strong>MyWCDA Events</strong><small>EVENT MANAGEMENT SYSTEM</small></span>}</div>
      <button type="button" className={styles.collapse} onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?"Expand navigation":"Collapse navigation"}>{collapsed?"›":"‹"} {!collapsed&&"Collapse menu"}</button>
      <nav aria-label="EMS navigation">
        {nav.map(group=><section key={group.name} className={styles.navGroup}>
          {!collapsed&&<span className={styles.navHeading}>{group.name}</span>}
          {group.items.map((item,i)=><button key={item} title={item} type="button" aria-current={active===item?"page":undefined}
            className={`${styles.navItem} ${active===item?styles.navActive:""}`}
            onClick={()=>{setActive(item);setShowForm(false);}}>
            <span className={styles.navSymbol} aria-hidden="true">{item==="Dashboard"?"▦":item.includes("Event")?"▤":item.includes("Finance")||item.includes("Payment")?"◇":item.includes("Certificate")?"✧":item.includes("Support")?"◉":i%2?"◷":"▣"}</span>
            {!collapsed&&<span>{item}</span>}
          </button>)}
        </section>)}
      </nav>
      {!collapsed&&<div className={styles.sidebarBottom}><strong>WCDA</strong><span>Events & Safety Department</span><small>Access is governed by official delegation and permissions.</small></div>}
    </aside>

    <div className={styles.content}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}><span>GovApps</span><b>/</b><span>MyWCDA Events</span><b>/</b><strong>{active}</strong></div>
        <div className={styles.topActions}>
          <span className={styles.userBadge}>{actor.mode==="staff"?actor.role||"WCDA Staff":"Organiser"}</span>
          <Link href={actor.mode==="staff"?"/my-apps":"/"} className={styles.backLink}>GovApps ↗</Link>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.titleRow}>
          <div><span className={styles.eyebrow}>WESTERN CAPE DEVELOPMENT AUTHORITY · EVENTS & SAFETY</span>
          <h1>{active==="Dashboard"?"Welcome to MyWCDA Events":active}</h1>
          <p>{active==="Dashboard"?"One secure workspace for the event lifecycle, from registration to close-out.":"Event reference format: EMS YY/NNNNN · Official GovApps workspace."}</p></div>
          {canCreate&&tabsWithEventRegistry.includes(active)&&<button className={styles.primaryButton} onClick={()=>setShowForm(v=>!v)} type="button">{showForm?"Close form":"+ New event application"}</button>}
        </div>

        {notice&&<div className={styles.notice} role="status">{notice}</div>}

        {showForm&&canCreate&&<section className={styles.glassPanel} aria-label="Event application form">
          <div className={styles.panelHeader}><div><h2>New Event Application</h2><p>Complete the required details. Submission allocates an official EMS reference only after successful database registration.</p></div></div>
          <form onSubmit={submit} className={styles.eventForm}>
            <label>Organiser / legal entity<input required minLength={2} maxLength={200} value={form.organiserName} onChange={e=>setForm(v=>({...v,organiserName:e.target.value}))}/></label>
            <label>Event name<input required minLength={3} maxLength={200} value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
            <label>Category<select value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
            <label>Venue name<input required minLength={2} maxLength={200} value={form.venueName} onChange={e=>setForm(v=>({...v,venueName:e.target.value}))}/></label>
            <label className={styles.formWide}>Venue address<input maxLength={300} value={form.venueAddress} onChange={e=>setForm(v=>({...v,venueAddress:e.target.value}))}/></label>
            <label>First event date<input required type="date" value={form.startDate} onChange={e=>setForm(v=>({...v,startDate:e.target.value}))}/></label>
            <label>Last event date<input required type="date" min={form.startDate||undefined} value={form.endDate} onChange={e=>setForm(v=>({...v,endDate:e.target.value}))}/></label>
            <label>Estimated attendance<input type="number" min={0} max={100000000} placeholder="Optional" value={form.estimatedAttendance} onChange={e=>setForm(v=>({...v,estimatedAttendance:e.target.value}))}/></label>
            <div className={styles.formWide}><p className={styles.disclaimer}>Submitting an application does not grant endorsement, approval or any statutory permit. Additional documents and assessments will be required where applicable.</p>
            <button type="submit" disabled={saving} className={styles.primaryButton}>{saving?"Submitting…":"Submit event application"}</button></div>
          </form>
        </section>}

        {active==="Dashboard"&&<><div className={styles.hero}><div><span className={styles.heroKicker}>WCDA EVENTS COMMAND CENTRE</span><h2>Better oversight.<br/>Smarter event administration.</h2><p>Manage events, track assessment stages and keep one trusted administrative record.</p></div><div className={styles.heroOrb} aria-hidden="true">EMS</div></div>
          <div className={styles.stats}>{summary.map(s=><div className={styles.stat} key={s.label}><div className={styles.statTop}><span>{s.label}</span><span>{s.symbol}</span></div><strong>{s.value}</strong><small>{loading?"Loading verified data":"From authorised event records"}</small></div>)}</div>
        </>}

        {tabsWithEventRegistry.includes(active)&&<section className={styles.glassPanel}>
          <div className={styles.panelHeader}><div><h2>{actor.mode==="staff"?"Event Registry":"My Events"}</h2><p>Actual records returned from the secured EMS service. No example events are inserted.</p></div><button type="button" className={styles.secondaryButton} onClick={()=>void refresh()}>Refresh</button></div>
          <div className={styles.tableActions}><input aria-label="Search events" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reference, event, organiser or venue…"/><span>{filtered.length} record(s)</span></div>
          {loading?<p className={styles.empty}>Loading event records…</p>:
            filtered.length?<div className={styles.tableWrap}><table><thead><tr><th>Reference</th><th>Event / organiser</th><th>Venue</th><th>Date(s)</th><th>Status</th></tr></thead><tbody>{filtered.map(event=><tr key={event.id}><td className={styles.reference}>{event.reference}</td><td><strong>{event.name}</strong><small>{event.organiser_name}</small></td><td>{event.venue_name}</td><td>{dateZA(event.start_date)}{event.end_date!==event.start_date?" – "+dateZA(event.end_date):""}</td><td><span className={styles.status}>{titleCase(event.status)}</span></td></tr>)}</tbody></table></div>:
            <div className={styles.empty}><strong>No event records to show</strong><p>{notice?"The records service must be configured before applications can be managed.":"Submitted applications will appear here when available."}</p></div>}
        </section>}

        {!tabsWithEventRegistry.includes(active)&&<section className={styles.glassPanel}>
          <div className={styles.panelHeader}><div><h2>{active}</h2><p>This module is included in the approved EMS architecture but has not yet been activated. No simulated approvals, certificates, payments or messages are displayed.</p></div><span className={styles.planned}>Planned module</span></div>
          <div className={styles.moduleDetails}><p>Core event registration and the official GovApps route are the first implementation milestone. This module will require its own secured records, review actions and audited permissions before production enablement.</p>
            {(active.includes("Correspondence")||active.includes("Support")||active.includes("Certificates")||active.includes("Payments"))&&<div className={styles.mailGrid}>
              <a href="mailto:finances@wcsports.co.za">Finance · finances@wcsports.co.za</a>
              <a href="mailto:WCDA.Certificates@wcsports.co.za">Certificates · WCDA.Certificates@wcsports.co.za</a>
              <a href="mailto:WCDAEms@govapps.wcsports.co.za">Notifications · WCDAEms@govapps.wcsports.co.za</a>
              <a href="mailto:ServiceDesk@wcsports.co.za">Support · ServiceDesk@wcsports.co.za</a>
            </div>}
          </div>
        </section>}

        <footer className={styles.footer}>MyWCDA Events · Western Cape Development Authority · Official path /WCDA-Events <span>Access: {actor.email}</span></footer>
      </main>
    </div>
  </div>;
}
