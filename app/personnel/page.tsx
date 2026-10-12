import Link from "next/link";
import styles from "./personnel.module.css";
const sections = [
  {name:"Employee Registry",description:"Staff profiles, appointments, employment history and reporting lines.",href:"/personnel/employees",tag:"People"},
  {name:"Recruitment & Careers",description:"Vacancies, applications, shortlisting, interviews and onboarding.",href:"/workhub/applications",tag:"Careers"},
  {name:"Leave & Attendance",description:"Requests, approvals, attendance and employee availability.",href:"/workhub/leave",tag:"WorkHub"},
  {name:"Employee Requests",description:"HR cases and requests submitted through WorkHub.",href:"/workhub/requests",tag:"WorkHub"},
  {name:"Training & Development",description:"Learning records, compulsory training and development plans.",href:"/workhub/learning",tag:"Learning"},
  {name:"AMS & Organisation Registry",description:"Organisation records and governance within MyWCSA AMS.",href:"/apps/ams",tag:"AMS"}
];
export default function PersonnelPage(){
return <div className={styles.page}><header className={styles.top}><Link href="/my-apps">← GovApps</Link><span>Western Cape Sports Association NPC</span><Link href="/workhub">WorkHub ↗</Link></header>
<main className={styles.content}><div className={styles.eyebrow}>MYWCSA GOVAPPS / HUMAN RESOURCES</div><h1>Personnel</h1><p className={styles.lead}>One workspace for the people, processes and departments behind WCSA.</p>
<div className={styles.summary}><div><span>Employee directory</span><strong>Registry</strong><small>Protected staff information</small></div><div><span>WorkHub</span><strong>Connected</strong><small>Employee self-service</small></div><div><span>Organisation</span><strong>WCSA</strong><small>GovApps ecosystem</small></div></div>
<h2>Personnel workspace</h2><div className={styles.grid}>{sections.map(s=><Link key={s.name} href={s.href} className={styles.card}><span className={styles.tag}>{s.tag}</span><h3>{s.name}</h3><p>{s.description}</p><span className={styles.open}>Open workspace →</span></Link>)}</div>
<p className={styles.note}>Sensitive HR and payroll information must be accessed only through authorised, audited server-side workflows. This foundation does not expose private records to the browser.</p>
</main></div>
}
