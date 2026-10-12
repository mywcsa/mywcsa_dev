import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./workhub.module.css";
import OutlookCalendar from "./OutlookCalendar";
import { WorkHubIcon, type WorkHubIconName } from "./WorkHubIcon";

const nav: [WorkHubIconName,string,string][] = [
["house","Dashboard","/workhub"],["id","My Employment","/workhub/employment"],["heart","My Benefits","/workhub/benefits"],["calendar","My Leave","/workhub/leave"],["file","My Documents","/workhub/documents"],["clipboard","My Requests","/workhub/requests"],["ticket","My Tickets","/workhub/tickets"],["check","My Work","/workhub/work"],["users","My Team","/workhub/team"],["graduation","My Learning","/workhub/learning"],["briefcase","My Applications","/workhub/applications"]
];
const quick: [WorkHubIconName,string,string][] = [
["calendar","Apply for Leave","/workhub/leave"],["file","View Payslips","/workhub/documents"],["arrow","Submit a Request","/workhub/requests"],["video","Join a Meeting","/workhub/team"],["graduation","Browse Training","/workhub/learning"],["briefcase","View Vacancies","/workhub/applications"]
];

export default async function WorkHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fworkhub");
  const name = session.user.name || "WCSA employee";
  return <>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}><span className={styles.eyebrow}>WELCOME BACK</span><h1>{name} <span aria-hidden="true">👋</span></h1><p>Your digital workplace for people, teams and progress.</p><Link href="/workhub/employment" className={styles.primary}>View My Profile <WorkHubIcon name="arrow" size={17}/></Link></div>
          <div className={styles.heroQuote}>People.<br/>Participation.<br/>Progress.</div>
        </section>
        <section className={styles.metrics} aria-label="Employee overview">
          {([["check","My Tasks","—","Pending tasks"],["calendar","Leave Balance","—","Available days"],["mail","Messages","—","Unread messages"],["video","Upcoming Meetings","—","This week"]] as const).map(([icon,title,value,subtitle],i)=><div className={styles.metric} key={title}><div className={styles.metricIcon} data-tone={i}><WorkHubIcon name={icon} size={24}/></div><div><strong>{title}</strong><b>{value}</b><small>{subtitle}</small></div><span className={styles.chevron}><WorkHubIcon name="chevron" size={16}/></span></div>)}
        </section>
        <div className={styles.panels}>
          <section className={styles.panel}><div className={styles.panelHead}><h2><WorkHubIcon name="activity" size={19}/> Recent Activity</h2><span>Private employee updates</span></div><div className={styles.empty}>Your leave approvals, payslips, requests and training updates will appear here once connected to authorised data.</div></section>
          <section className={styles.panel}><div className={styles.panelHead}><h2><WorkHubIcon name="calendar" size={19}/> My Calendar</h2><span>Today</span></div><div className={styles.empty}><OutlookCalendar/></div></section>
          <section className={styles.panel}><div className={styles.panelHead}><h2><WorkHubIcon name="megaphone" size={19}/> Announcements</h2><span>WCSA</span></div><div className={styles.empty}>Official internal announcements will appear here.</div></section>
          <section className={styles.panel+" "+styles.quick}><div className={styles.panelHead}><h2><WorkHubIcon name="bolt" size={19}/> Quick Actions</h2></div><div className={styles.quickGrid}>{quick.map(([icon,title,href])=><Link key={href} href={href}><span><WorkHubIcon name={icon} size={24}/></span><small>{title}</small></Link>)}</div></section>
          <section className={styles.panel}><div className={styles.panelHead}><h2><WorkHubIcon name="users" size={19}/> My Team</h2></div><div className={styles.empty}>Chats, groups, channels and video meetings.</div></section>
        </div>
        </>;
}
