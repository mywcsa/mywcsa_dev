import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkHubIcon, type WorkHubIconName } from "./WorkHubIcon";
import styles from "./workhub.module.css";
export const metadata: Metadata = {title:{absolute:"MyWCSA GovApps | WorkHub"},description:"Western Cape Sports Association employee WorkHub"};
const nav: [WorkHubIconName,string,string][] = [
["house","Dashboard","/workhub"],["id","My Employment","/workhub/employment"],["heart","My Benefits","/workhub/benefits"],["calendar","My Leave","/workhub/leave"],["file","My Documents","/workhub/documents"],["clipboard","My Requests","/workhub/requests"],["ticket","My Tickets","/workhub/tickets"],["check","My Work","/workhub/work"],["users","My Team","/workhub/team"],["graduation","My Learning","/workhub/learning"],["briefcase","My Applications","/workhub/applications"]];
export default async function WorkHubLayout({children}:Readonly<{children:React.ReactNode}>){
 const session=await auth();if(!session?.user)redirect("/login/staff?returnTo=%2Fworkhub");
 const name=session.user.name||"WCSA employee";
 return <div className={styles.shell}>
 <header className={styles.top}><div className={styles.brand}><img src="/mywcsa-logo.png" alt="MyWCSA GovApps"/><span><strong>MyWCSA WorkHub</strong><small>People | Teams | Progress</small></span></div><div className={styles.search}><WorkHubIcon name="search" size={17}/> <span>Search WorkHub</span></div><div className={styles.user}><Link href="/my-apps">My Apps <WorkHubIcon name="external" size={13}/></Link><span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span><span>{name}<small>Employee</small></span></div></header>
 <div className={styles.layout}><aside className={styles.sidebar}><nav aria-label="WorkHub navigation">{nav.map(([icon,label,href])=><Link key={href} href={href}><span className={styles.navIcon}><WorkHubIcon name={icon} size={19}/></span>{label}<span className={styles.chevron}><WorkHubIcon name="chevron" size={16}/></span></Link>)}</nav><div className={styles.sideBottom}><strong>WCSA</strong><small>Western Cape Sports Association</small><p>Employee workspace</p></div></aside><main className={styles.main}>{children}<footer className={styles.footer}>© Western Cape Sports Association NPC · MyWCSA WorkHub <Link href="/my-apps">Back to GovApps</Link></footer></main></div></div>;
}