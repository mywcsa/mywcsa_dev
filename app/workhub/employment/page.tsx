import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkHubIcon } from "../WorkHubIcon";
import styles from "../workhub.module.css";

const areas = [
 {title:"Personal Information",icon:"id",detail:"HR-verified legal identity and contact details"},
 {title:"Employment & Appointment",icon:"briefcase",detail:"Appointment, employment status and position"},
 {title:"Department & Reporting",icon:"users",detail:"Directorate, department and line manager"},
 {title:"Official Documents",icon:"file",detail:"Employment contracts, appointments and letters"},
 {title:"Service History",icon:"activity",detail:"Transfers, promotions and contract history"},
 {title:"Qualifications",icon:"graduation",detail:"Qualifications and HR verification"},
] as const;
export default async function EmploymentPage() {
 const session=await auth();
 if(!session?.user) redirect("/login/staff?returnTo=%2Fworkhub%2Femployment");
 const name=session.user.name || "Employee";
 return <main className={styles.shell} style={{padding:"28px max(18px,5vw)"}}>
  <nav style={{display:"flex",gap:18,marginBottom:22}}><Link href="/workhub">← WorkHub</Link><Link href="/my-apps">GovApps</Link></nav>
  <section className={styles.panel} style={{minHeight:"auto",padding:26,marginBottom:18}}>
   <small>MYWCSA WORKHUB / EMPLOYEE SERVICES</small><h1 style={{fontSize:30,margin:"10px 0"}}>My Employment</h1>
   <p>View your employment services and request changes through the HR / Registry Department.</p>
   <div style={{display:"flex",alignItems:"center",gap:16,padding:20,borderRadius:16,background:"rgba(255,255,255,.55)"}}>
    <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><div style={{color:"#60738c"}}>Microsoft signed-in employee · HR record not yet linked</div></div>
   </div>
   <p style={{marginBottom:0,color:"#566a83"}}>Verified personnel number, appointment and employment status will appear only after HR identity linking. No employment eligibility is assumed from sign-in alone.</p>
  </section>
  <div className={styles.panels} style={{gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))"}}>
  {areas.map(area=><section key={area.title} className={styles.panel} style={{minHeight:160}}>
    <WorkHubIcon name={area.icon} size={26}/><h2 style={{fontSize:16}}>{area.title}</h2><p>{area.detail}</p><small style={{color:"#526f90"}}>Awaiting verified HR registry connection</small>
  </section>)}
  </div>
  <section className={styles.panel} style={{minHeight:"auto",marginTop:18}}>
   <h2>Employment Letters & HR Requests</h2>
   <p>Automatic letters require active employment, HR verification, an approved template and mandatory preview. All profile changes require HR approval.</p>
   <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
    <Link href="/workhub/employment/letters" className={styles.primary}>Employment letters →</Link>
    <Link href="/workhub/requests" className={styles.primary}>HR requests →</Link>
   </div>
  </section>
 </main>;
}
