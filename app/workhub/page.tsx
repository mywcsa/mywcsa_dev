import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./workhub.module.css";

const nav = [
  ["⌂","Dashboard","/workhub"],
  ["▣","My Employment","/workhub/employment"],
  ["◈","My Benefits","/workhub/benefits"],
  ["▦","My Leave","/workhub/leave"],
  ["▤","My Documents","/workhub/documents"],
  ["◇","My Requests","/workhub/requests"],
  ["◉","My Tickets","/workhub/tickets"],
  ["▣","My Work","/workhub/work"],
  ["♧","My Team","/workhub/team"],
  ["◇","My Learning","/workhub/learning"],
  ["▢","My Applications","/workhub/applications"],
];
const quick = [
  ["▦","Apply for Leave","/workhub/leave"],
  ["▤","View Payslips","/workhub/documents"],
  ["➤","Submit a Request","/workhub/requests"],
  ["▣","Join a Meeting","/workhub/team"],
  ["◇","Browse Training","/workhub/learning"],
  ["▢","View Vacancies","/workhub/applications"],
];

export default async function WorkHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fworkhub");
  const name = session.user.name || "WCSA employee";
  return <div className={styles.shell}>
    <header className={styles.top}>
      <div className={styles.brand}><img src="/mywcsa-logo.png" alt="MyWCSA GovApps" /><span><strong>MyWCSA WorkHub</strong><small>People | Teams | Progress</small></span></div>
      <div className={styles.search}>⌕ &nbsp; Search WorkHub</div>
      <div className={styles.user}><Link href="/my-apps">My Apps ↗</Link><span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span><span>{name}<small>Employee</small></span></div>
    </header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <nav aria-label="WorkHub navigation">{nav.map(([icon,label,href],i)=><Link key={href} href={href} className={i===0?styles.active:""}><span className={styles.navIcon}>{icon}</span>{label}<span className={styles.chevron}>›</span></Link>)}</nav>
        <div className={styles.sideBottom}><strong>WCSA</strong><small>Western Cape Sports Association</small><p>Employee workspace</p></div>
      </aside>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}><span className={styles.eyebrow}>WELCOME BACK</span><h1>{name} <span aria-hidden="true">👋</span></h1><p>Your digital workplace for people, teams and progress.</p><Link href="/workhub/employment" className={styles.primary}>View My Profile →</Link></div>
          <div className={styles.heroQuote}>People.<br/>Participation.<br/>Progress.</div>
        </section>
        <section className={styles.metrics} aria-label="Employee overview">
          {([["☑","My Tasks","—","Pending tasks"],["▦","Leave Balance","—","Available days"],["✉","Messages","—","Unread messages"],["♧","Upcoming Meetings","—","This week"]] as const).map(([icon,title,value,subtitle],i)=><div className={styles.metric} key={title}><div className={styles.metricIcon} data-tone={i}>{icon}</div><div><strong>{title}</strong><b>{value}</b><small>{subtitle}</small></div><span className={styles.chevron}>›</span></div>)}
        </section>
        <div className={styles.panels}>
          <section className={styles.panel}><div className={styles.panelHead}><h2>◷ &nbsp; Recent Activity</h2><span>Private employee updates</span></div><div className={styles.empty}>Your leave approvals, payslips, requests and training updates will appear here once connected to authorised data.</div></section>
          <section className={styles.panel}><div className={styles.panelHead}><h2>▦ &nbsp; My Calendar</h2><span>Today</span></div><div className={styles.empty}>No calendar events loaded.<p>Upcoming meetings and assigned work will appear here.</p></div></section>
          <section className={styles.panel}><div className={styles.panelHead}><h2>♧ &nbsp; Announcements</h2><span>WCSA</span></div><div className={styles.empty}>Official internal announcements will appear here.</div></section>
          <section className={styles.panel+" "+styles.quick}><div className={styles.panelHead}><h2>⚡ &nbsp; Quick Actions</h2></div><div className={styles.quickGrid}>{quick.map(([icon,title,href])=><Link key={href} href={href}><span>{icon}</span><small>{title}</small></Link>)}</div></section>
          <section className={styles.panel}><div className={styles.panelHead}><h2>♧ &nbsp; My Team</h2></div><div className={styles.empty}>Chats, groups, channels and video meetings.</div></section>
        </div>
        <footer className={styles.footer}>© Western Cape Sports Association NPC · MyWCSA WorkHub <Link href="/my-apps">Back to GovApps</Link></footer>
      </main>
    </div>
  </div>;
}
