import { auth } from "@/auth";
import Link from "next/link";
import {notFound} from "next/navigation";
import styles from "../workhub.module.css";
import {WorkHubIcon,type WorkHubIconName} from "../WorkHubIcon";
const pages:Record<string,{title:string;icon:WorkHubIconName;desc:string;items:string[]}> = {
 benefits:{title:"My Benefits",icon:"heart",desc:"Your employee benefits and available programmes.",items:["Benefits overview","Benefit documents","Eligibility and enquiries"]},
 leave:{title:"My Leave",icon:"calendar",desc:"Leave balances, requests and approval history.",items:["Leave balance","Apply for leave","Request history"]},
 documents:{title:"My Documents",icon:"file",desc:"Your secure employment document centre.",items:["Employment documents","Payslips","Employment letters"]},
 requests:{title:"My Requests",icon:"clipboard",desc:"Submit and follow HR and workplace service requests.",items:["New HR request","My submissions","Approval history"]},
 tickets:{title:"My Tickets",icon:"ticket",desc:"Get help from the WorkHub service teams.",items:["Create a support ticket","My tickets","Help centre"]},
 work:{title:"My Work",icon:"check",desc:"Your tasks, assignments and workplace progress.",items:["Assigned tasks","My projects","Activity"]},
 team:{title:"My Team",icon:"users",desc:"Collaborate with your WCSA colleagues.",items:["Private chats","Groups & channels","Meetings","Newsletters"]},
 learning:{title:"My Learning",icon:"graduation",desc:"Learning opportunities and professional development.",items:["Training catalogue","My learning","Qualifications"]},
 applications:{title:"My Applications",icon:"briefcase",desc:"Manage your internal applications and opportunities.",items:["Available opportunities","My applications","Application history"]}
};
export default async function WorkHubSection({params}:{params:Promise<{section:string}>}){
 await auth();const {section}=await params;const page=pages[section];if(!page)notFound();
 return <><section className={styles.hero} style={{minHeight:210,background:"linear-gradient(105deg,#eaf4ff,#d1e7ff)"}}><div className={styles.heroOverlay}><span className={styles.eyebrow}>MYWCSA WORKHUB / EMPLOYEE SERVICES</span><h1>{page.title}</h1><p>{page.desc}</p></div><div className={styles.heroQuote}><WorkHubIcon name={page.icon} size={72}/></div></section>
 <div className={styles.panels} style={{marginTop:16,gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))"}}>{page.items.map((item,i)=><section className={styles.panel} style={{minHeight:170,padding:22}} key={item}><div className={styles.metricIcon} data-tone={i%4}><WorkHubIcon name={page.icon} size={24}/></div><h2 style={{fontSize:16}}>{item}</h2><p style={{color:"#61748e",lineHeight:1.6}}>This service will use authorised employee records and verified workflows. No private data is loaded yet.</p></section>)}</div>
 <section className={styles.panel} style={{marginTop:16,minHeight:"auto",padding:22}}><h2>Service availability</h2><p>These sections are prepared for integration. Actions involving personal records, payments, approvals or documents will only be enabled after the required secure connections and permissions are tested.</p><Link className={styles.primary} href="/workhub">Return to Dashboard <WorkHubIcon name="arrow" size={16}/></Link></section></>;
}