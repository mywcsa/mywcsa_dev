import { auth } from "@/auth";
import Link from "next/link";
import styles from "../workhub.module.css";
import {WorkHubIcon,type WorkHubIconName} from "../WorkHubIcon";
const sections:[WorkHubIconName,string,string,string][]=[
["id","Personal Information","Legal identity, contact details and emergency contacts","/workhub/requests"],
["briefcase","Employment & Appointment","Position, contract and verified appointment details","/workhub/requests"],
["users","Department & Reporting","Directorate, manager and organisational structure","/workhub/team"],
["file","Official Documents","Employment letters, agreements and records","/workhub/employment/letters"],
["activity","Service History","Transfers, promotions and service milestones","/workhub/requests"],
["graduation","Qualifications","Qualifications, certifications and learning","/workhub/learning"]];
export default async function EmploymentPage(){
 const session=await auth();const name=session?.user?.name||"WCSA employee";
 return <><section className={styles.hero} style={{background:"linear-gradient(105deg,rgba(240,248,255,.96),rgba(208,231,255,.74)),url('https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1800&q=85') center/cover"}}>
 <div className={styles.heroOverlay}><span className={styles.eyebrow}>MY EMPLOYMENT · HR & REGISTRY</span><h1>My Employment</h1><p>Manage your workplace information, employment documents and HR services in one place.</p><Link className={styles.primary} href="/workhub/employment/letters">Employment Letters <WorkHubIcon name="arrow" size={17}/></Link></div><div className={styles.heroQuote}>People.<br/>Participation.<br/>Progress.</div></section>
 <section className={styles.panel} style={{minHeight:"auto",margin:"16px 0",padding:24}}><div className={styles.panelHead}><h2><WorkHubIcon name="id" size={20}/> Employee Overview</h2><span>Confidential HR information</span></div><div style={{display:"flex",gap:14,alignItems:"center",padding:"20px 0"}}><span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span><div><strong style={{fontSize:18}}>{name}</strong><p style={{color:"#5d7595",margin:"5px 0"}}>Microsoft 365 authenticated · HR personnel record not yet linked</p></div></div><p style={{color:"#58708c",margin:0}}>Your personnel number, appointment and employment status will appear only after HR verifies and links your record. Official letter issuance remains disabled until then.</p></section>
 <div className={styles.panels} style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>{sections.map(([icon,title,desc,href],i)=><Link href={href} className={styles.panel} key={title} style={{minHeight:185,padding:22,display:"block",textDecoration:"none",color:"inherit",background:"rgba(255,255,255,.72)"}}><span className={styles.metricIcon} data-tone={i%4} style={{width:48,marginBottom:13}}><WorkHubIcon name={icon} size={23}/></span><h2 style={{fontSize:16,margin:"0 0 8px"}}>{title}</h2><p style={{color:"#647c9b",lineHeight:1.6}}>{desc}</p><span style={{color:"#2875cf",fontWeight:600}}>Explore <WorkHubIcon name="arrow" size={14}/></span></Link>)}</div>
 </>;
}