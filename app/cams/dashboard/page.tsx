"use client";
import { signOut as signOutGovApps } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

type Session={authenticated:boolean;user?:{id:string;email:string};profile?:{display_name:string;job_title:string|null;roles:{role_key:string;display_name:string}[]}};
const paths:Record<string,string>={
grid:"M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
users:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87",
building:"M3 21h18 M5 21V5l7-3 7 3v16 M9 9h.01 M15 9h.01 M9 13h.01 M15 13h.01 M10 21v-4h4v4",
folder:"M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 9h18",
file:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8",
package:"M12 2 21 7l-9 5-9-5 9-5Z M3 7v10l9 5 9-5V7 M12 12v10",
chart:"M3 3v18h18 M8 16V9 M13 16V5 M18 16v-4",
calendar:"M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16",
search:"M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35",
bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
settings:"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5L9 5.5a8 8 0 0 0-1.7 1L5 5.5l-2 3.5L5 10.5a7 7 0 0 0 0 2L3 14l2 3.5 2.3-1a8 8 0 0 0 1.7 1L9.5 20h5l.3-2.5a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1.5Z",
logout:"M10 17l5-5-5-5 M15 12H3 M21 19V5a2 2 0 0 0-2-2h-6",
shield:"M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z",
clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2"
};
function Icon({name}:{name:string}){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.grid}/></svg>}
const groups=[
{label:"WORKSPACE",items:[["Overview","grid"],["My tasks","calendar"]]},
{label:"INSTITUTION",items:[["Organisations","building"],["Structure","grid"],["Personnel","users"],["Education","users"],["Sports administration","chart"]]},
{label:"ADMINISTRATION",items:[["Documents","file"],["Assets and equipment","package"],["Projects and programmes","folder"],["Meetings and calendar","calendar"]]},
{label:"INFORMATION",items:[["Reports","chart"],["System administration","settings"]]}
];
export default function CamsDashboardPage(){
 const router=useRouter();const [session,setSession]=useState<Session|null>(null);const [loading,setLoading]=useState(true);const [now,setNow]=useState(new Date());const [search,setSearch]=useState("");const [notice,setNotice]=useState("Phase 1 foundation: institutional registers and workflows will appear as each module is approved and activated.");
 useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),30000);fetch("/api/cams/auth/session",{cache:"no-store"}).then(async r=>{if(!r.ok)throw new Error("Unauthorised");return r.json()}).then(d=>{if(!d.authenticated)throw new Error("Unauthorised");setSession(d)}).catch(()=>router.replace("/cams")).finally(()=>setLoading(false));return()=>window.clearInterval(timer)},[router]);
 async function signOut(){await signOutGovApps({callbackUrl:"/login/staff"})}
 if(loading||!session?.authenticated)return <main className={styles.dashboardLoading}><div className={styles.loadingMark}>W</div><span>Verifying your CAMS session…</span></main>;
 const name=session.profile?.display_name||"Authorised staff member";const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"WS";
 const date=new Intl.DateTimeFormat("en-ZA",{timeZone:"Africa/Johannesburg",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(now);
 const time=new Intl.DateTimeFormat("en-ZA",{timeZone:"Africa/Johannesburg",hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
 return <main className={styles.dashboardShell}>
  <aside className={styles.sidebar}>
   <div className={styles.sideBrand}><div className={styles.sideBrandMark}>W</div><div><strong>MyWCSA CAMS</strong><span>Central Administration</span></div></div>
   <div className={styles.sideDivider}/>
   <div className={styles.orgSwitcher}><span className={styles.orgIcon}><Icon name="building"/></span><span><strong>WCSA NPC</strong><small>Institutional workspace</small></span><span className={styles.chevron}>⌄</span></div>
   <nav className={styles.sideNav}>{groups.map(group=><div className={styles.navGroup} key={group.label}><div className={styles.navLabel}>{group.label}</div>{group.items.map(([label,icon])=><button key={label} className={label==="Overview"?styles.navItemActive:styles.navItem} type="button" onClick={()=>setNotice(label+" is part of the CAMS implementation roadmap and will be activated in its development phase.")}><Icon name={icon}/><span>{label}</span>{label==="Overview"&&<i className={styles.activeBar}/>}</button>)}</div>)}</nav>
   <div className={styles.sideBottom}><div className={styles.systemStatus}><i className={styles.statusDot}/><span>System status</span><strong>Online</strong></div><button className={styles.signOutButton} type="button" onClick={signOut}><Icon name="logout"/> Sign out</button></div>
  </aside>
  <section className={styles.mainArea}>
   <header className={styles.topbar}><div className={styles.breadcrumb}><span>MyWCSA CAMS</span><b>/</b><strong>Overview</strong></div><div className={styles.topActions}><div className={styles.searchBox}><Icon name="search"/><input aria-label="Search CAMS" placeholder="Search authorised records…" value={search} onChange={e=>setSearch(e.target.value)}/></div><button className={styles.iconButton} type="button" aria-label="Notifications" onClick={()=>setNotice("You are up to date. New notifications will appear here.")}><Icon name="bell"/></button><div className={styles.userMenu}><div className={styles.avatar}>{initials}</div><div><strong>{name}</strong><span>{session.profile?.job_title||"WCSA Staff"}</span></div></div></div></header>
   <div className={styles.contentArea}>
    <div className={styles.welcomeRow}><div><div className={styles.pageEyebrow}>INSTITUTIONAL WORKSPACE</div><h1>Good day, {name.split(" ")[0]}</h1><p>{date} <span>·</span> Your authorised administrative overview.</p></div><div className={styles.timeChip}><Icon name="clock"/><strong>{time}</strong><span>SAST</span></div></div>
    <div className={styles.noticeBar}><span className={styles.noticeIcon}>i</span><p>{notice}</p><button type="button" onClick={()=>setNotice("Phase 1 foundation: institutional registers and workflows will appear as each module is approved and activated.")}>Dismiss</button></div>
    <div className={styles.sectionHeading}><div><h2>Institutional overview</h2><p>Key areas across your authorised workspace</p></div><span className={styles.periodLabel}>CURRENT SYSTEM STATE</span></div>
    <div className={styles.metricGrid}>{[{label:"Staff records",note:"Personnel module pending",icon:"users"},{label:"Organisations",note:"Register not yet activated",icon:"building"},{label:"Active projects",note:"Project module pending",icon:"folder"},{label:"Registered assets",note:"Asset register pending",icon:"package"}].map(m=><div className={styles.metricCard} key={m.label}><div className={styles.metricTop}><span>{m.label}</span><span className={styles.metricIcon}><Icon name={m.icon}/></span></div><strong>—</strong><small>{m.note}</small></div>)}</div>
    <div className={styles.dashboardColumns}>
     <section className={styles.panel}><div className={styles.panelHeader}><div><h3>My workspace</h3><p>Your personal administrative tools</p></div><span className={styles.panelMore}>PHASE 1</span></div><div className={styles.workspaceList}>
      <button type="button" onClick={()=>setNotice("Your task inbox will be enabled when the workflow module is implemented.")}><span className={styles.workspaceIcon}><Icon name="calendar"/></span><span><strong>My tasks and approvals</strong><small>Assigned work and pending decisions</small></span><b>›</b></button>
      <button type="button" onClick={()=>setNotice("The central document centre is scheduled for the document management phase.")}><span className={styles.workspaceIcon}><Icon name="file"/></span><span><strong>Document centre</strong><small>Official records and document templates</small></span><b>›</b></button>
      <button type="button" onClick={()=>setNotice("Your organisation and role profile is managed by an authorised CAMS administrator.")}><span className={styles.workspaceIcon}><Icon name="shield"/></span><span><strong>My access and permissions</strong><small>Authorised role and institutional scope</small></span><b>›</b></button>
     </div></section>
     <section className={styles.panel}><div className={styles.panelHeader}><div><h3>System activity</h3><p>Recent events in your workspace</p></div><span className={styles.panelMore}>LIVE</span></div><div className={styles.emptyActivity}><div className={styles.emptyIcon}><Icon name="chart"/></div><strong>No activity recorded yet</strong><p>Once approved modules are activated, authorised activity will be displayed here.</p></div></section>
    </div>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h3>Institutional modules</h3><p>Access is introduced in controlled development phases</p></div><span className={styles.panelMore}>ROADMAP</span></div><div className={styles.moduleGrid}>{[["Organisations","Institutional registers","building"],["Personnel","Staff establishment and records","users"],["Education","Schools and learner administration","users"],["Sports","Players, clubs and competitions","chart"],["Documents","Official documents and records","file"],["Assets","Equipment and inventory","package"]].map(([title,desc,icon])=><div className={styles.moduleTile} key={title}><span className={styles.moduleIcon}><Icon name={icon}/></span><span><strong>{title}</strong><small>{desc}</small></span><em>Planned</em></div>)}</div></section>
    <footer className={styles.dashboardFooter}><span>MyWCSA CAMS · Internal institutional system</span><span>Western Cape Sports Association NPC · South Africa</span></footer>
   </div>
  </section>
 </main>;
}
