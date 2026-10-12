import Link from "next/link";
import { auth } from "@/auth";
import styles from "./personnel.module.css";

const navigation = [
  ["▦","Dashboard","/persal"],
  ["♙","Employee Registry","/personnel/employees"],
  ["▤","Appointments","/workhub/employment"],
  ["▣","Recruitment & Careers","/workhub/applications"],
  ["◷","Leave & Attendance","/workhub/leave"],
  ["▥","Payroll & Benefits","/workhub/benefits"],
  ["◇","Employee Documents","/workhub/documents"],
  ["☷","HR Requests","/workhub/requests"],
  ["♧","Training & Development","/workhub/learning"],
  ["⚙","Organisation Registry","/apps/ams"]
];
const services = [
  {icon:"♙",title:"Employee Registry",detail:"Personnel files, staff profiles and appointments",href:"/personnel/employees",tone:"slate"},
  {icon:"▣",title:"Recruitment",detail:"Vacancies, candidates and onboarding",href:"/workhub/applications",tone:"blue"},
  {icon:"◷",title:"Leave & Attendance",detail:"Absences, requests and approvals",href:"/workhub/leave",tone:"green"},
  {icon:"▤",title:"Employment",detail:"Contracts and employee information",href:"/workhub/employment",tone:"violet"},
  {icon:"▥",title:"Benefits",detail:"Employee benefits and related services",href:"/workhub/benefits",tone:"amber"},
  {icon:"☷",title:"HR Service Requests",detail:"Cases, tickets and staff support",href:"/workhub/requests",tone:"rose"}
];
export default async function PersonnelPage(){
 const session=await auth();
 const name=session?.user?.name||"WCSA Colleague";
 return <div className={styles.shell}>
  <header className={styles.header}>
   <Link href="/my-apps" className={styles.brand}><img src="/mywcsa-logo.png" alt="MyWCSA"/><span className={styles.brandText}><strong>MyWCSA PERSAL</strong><small>People | Personnel | Progress</small></span></Link>
   <div className={styles.search}><span>⌕</span><span>Search personnel, departments and services...</span><kbd>⌘ K</kbd></div>
   <div className={styles.account}><Link href="/my-apps">My Apps ↗</Link><span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span><span><strong>{name}</strong><small>Staff member</small></span></div>
  </header>
  <div className={styles.body}>
   <aside className={styles.sidebar}>
    <div className={styles.navHeading}>PERSONNEL MANAGEMENT</div>
    <nav>{navigation.map(([icon,label,href],i)=><Link key={label} href={href} className={i===0?styles.selected:styles.navLink}><span className={styles.navIcon}>{icon}</span><span>{label}</span><span className={styles.navArrow}>›</span></Link>)}</nav>
    <div className={styles.sideFoot}><strong>WCSA</strong><span>Western Cape Sports Association NPC</span><small>Personnel management workspace</small></div>
   </aside>
   <main className={styles.main}>
    <section className={styles.hero}>
     <div className={styles.heroContent}><span className={styles.eyebrow}>WELCOME TO PERSONNEL</span><h1>{name} <span>👋</span></h1><p>Manage people, strengthen teams and support a better working environment across WCSA.</p><div className={styles.heroActions}><Link href="/personnel/employees">Employee Registry <span>→</span></Link><Link href="/workhub">Explore WorkHub</Link></div></div>
     <div className={styles.heroQuote}>“People.<br/>Purpose.<br/>Progress.”</div>
    </section>
    <section className={styles.stats} aria-label="Personnel overview">
     <Link href="/personnel/employees" className={styles.stat}><span className={styles.statIcon}>♙</span><div><strong>Employee Registry</strong><b>Personnel</b><small>Staff records and profiles</small></div><span className={styles.statArrow}>›</span></Link>
     <Link href="/workhub/applications" className={styles.stat}><span className={styles.statIcon}>▣</span><div><strong>Recruitment</strong><b>Careers</b><small>Applications and vacancies</small></div><span className={styles.statArrow}>›</span></Link>
     <Link href="/workhub/leave" className={styles.stat}><span className={styles.statIcon}>▦</span><div><strong>Leave & Attendance</strong><b>WorkHub</b><small>Employee self-service</small></div><span className={styles.statArrow}>›</span></Link>
     <Link href="/apps/ams" className={styles.stat}><span className={styles.statIcon}>⌘</span><div><strong>Organisation Registry</strong><b>AMS</b><small>Organisation administration</small></div><span className={styles.statArrow}>›</span></Link>
    </section>
    <div className={styles.sectionTitle}><h2>Personnel Services</h2><span>Choose a service to continue →</span></div>
    <section className={styles.services}>{services.map(s=><Link href={s.href} key={s.title} className={styles.service}><span className={styles.serviceIcon} data-tone={s.tone}>{s.icon}</span><div><h3>{s.title}</h3><p>{s.detail}</p></div><span className={styles.go}>↗</span></Link>)}</section>
    <section className={styles.bottom}>
     <div className={styles.panel}><div className={styles.panelHeading}><h2>Quick Actions</h2><span>PERSONNEL</span></div><div className={styles.quick}><Link href="/personnel/employees">♙<span>View Registry</span></Link><Link href="/workhub/requests">▤<span>HR Request</span></Link><Link href="/workhub/leave">▦<span>Leave</span></Link><Link href="/workhub/applications">▣<span>Careers</span></Link></div></div>
     <div className={styles.panel}><div className={styles.panelHeading}><h2>Connected Platforms</h2><span>GOVAPPS</span></div><div className={styles.platforms}><Link href="/workhub"><strong>MyWCSA WorkHub</strong><span>Employee services ↗</span></Link><Link href="/apps/ams"><strong>MyWCSA AMS</strong><span>Organisation management ↗</span></Link><Link href="/my-apps"><strong>GovApps Launcher</strong><span>All applications ↗</span></Link></div></div>
    </section>
    <footer className={styles.footer}>© Western Cape Sports Association NPC · MyWCSA PERSAL <Link href="/my-apps">Back to GovApps ↗</Link></footer>
   </main>
  </div>
 </div>;
}
