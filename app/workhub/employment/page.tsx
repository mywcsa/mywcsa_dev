import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkHubIcon, type WorkHubIconName } from "../WorkHubIcon";
import ui from "./employment.module.css";

const tiles: {title:string;desc:string;icon:WorkHubIconName;tag:string;href:string;tone:string}[]=[
 {title:"Personal details",desc:"Identity, contact information and emergency contacts.",icon:"id",tag:"PERSONAL",href:"/workhub/requests",tone:"violet"},
 {title:"My appointment",desc:"Employment status, post, contract and appointment.",icon:"briefcase",tag:"EMPLOYMENT",href:"/workhub/requests",tone:"blue"},
 {title:"Department & team",desc:"Directorate, reporting lines and work location.",icon:"users",tag:"ORGANISATION",href:"/workhub/team",tone:"mint"},
 {title:"Official documents",desc:"Letters, agreements and verified HR documents.",icon:"file",tag:"DOCUMENTS",href:"/workhub/employment/letters",tone:"amber"},
 {title:"Service history",desc:"Your employment milestones and role changes.",icon:"activity",tag:"HISTORY",href:"/workhub/requests",tone:"rose"},
 {title:"Qualifications",desc:"Qualifications and professional certifications.",icon:"graduation",tag:"LEARNING",href:"/workhub/learning",tone:"sky"}
];
export default async function EmploymentPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fworkhub%2Femployment");
 const name=session.user.name||"WCSA employee";
 const first=name.trim().split(/\s+/)[0]||"there";
 const initials=name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join("");
 return <main className={ui.page}>
  <div className={ui.ambientOne}/><div className={ui.ambientTwo}/>
  <div className={ui.container}>
   <header className={ui.topbar}>
    <Link href="/workhub" className={ui.brand}><span className={ui.brandMark}><WorkHubIcon name="briefcase" size={21}/></span><span><strong>MyWCSA <em>WorkHub</em></strong><small>YOUR WORKPLACE, SIMPLIFIED</small></span></Link>
    <div className={ui.topright}><span className={ui.private}><span className={ui.dot}/> Private employee workspace</span><Link className={ui.apps} href="/my-apps">GovApps <WorkHubIcon name="external" size={15}/></Link><span className={ui.smallAvatar}>{initials}</span></div>
   </header>
   <nav className={ui.breadcrumb}><Link href="/workhub">Workspace</Link><span>/</span><strong>My Employment</strong></nav>
   <section className={ui.hero}>
    <div className={ui.heroContent}>
     <span className={ui.eyebrow}><span className={ui.sparkle}>✦</span> YOUR EMPLOYEE SPACE</span>
     <h1>Everything about your <span>employment.</span></h1>
     <p>A beautiful, organised home for your employment profile, official documents and HR services. Welcome, {first}.</p>
     <div className={ui.heroActions}><Link href="/workhub/employment/letters" className={ui.cta}>Explore employment letters <WorkHubIcon name="arrow" size={18}/></Link><Link href="/workhub/requests" className={ui.secondary}>HR service requests <WorkHubIcon name="external" size={15}/></Link></div>
    </div>
    <div className={ui.heroArt} aria-hidden="true"><div className={ui.orbit}><div className={ui.artBadge}><WorkHubIcon name="id" size={53}/></div></div><span className={ui.floatOne}>✦</span><span className={ui.floatTwo}>✧</span><div className={ui.artMini}><WorkHubIcon name="shield" size={18}/> HR protected</div></div>
   </section>
   <div className={ui.columns}>
    <section className={ui.profile}>
     <div className={ui.sectionHeader}><div><span className={ui.kicker}>YOUR PROFILE</span><h2>Employee overview</h2></div><span className={ui.lockLabel}><WorkHubIcon name="shield" size={15}/> Confidential</span></div>
     <div className={ui.identity}><div className={ui.avatar}>{initials}</div><div className={ui.identityText}><strong>{name}</strong><span>Signed in with Microsoft 365</span></div></div>
     <div className={ui.profileGrid}><div><small>Personnel number</small><strong>Not linked</strong></div><div><small>Employment status</small><strong>Awaiting HR record</strong></div><div><small>Department</small><strong>Not available</strong></div><div><small>HR verification</small><strong>Not confirmed</strong></div></div>
     <div className={ui.notice}><WorkHubIcon name="shield" size={20}/><p>Your Microsoft sign-in is working. Verified employment information will appear after HR securely links your personnel record.</p></div>
    </section>
    <aside className={ui.sideCard}><span className={ui.kicker}>QUICK ACCESS</span><h2>What would you like to do?</h2><Link href="/workhub/employment/letters"><span className={ui.quickIcon}><WorkHubIcon name="file" size={22}/></span><span><strong>Employment letters</strong><small>Templates & eligibility</small></span><WorkHubIcon name="arrow" size={17}/></Link><Link href="/workhub/requests"><span className={ui.quickIcon}><WorkHubIcon name="clipboard" size={22}/></span><span><strong>Request a profile change</strong><small>HR approval required</small></span><WorkHubIcon name="arrow" size={17}/></Link><Link href="/workhub/documents"><span className={ui.quickIcon}><WorkHubIcon name="file" size={22}/></span><span><strong>My documents</strong><small>Employee document centre</small></span><WorkHubIcon name="arrow" size={17}/></Link></aside>
   </div>
   <div className={ui.servicesHeading}><div><span className={ui.kicker}>EXPLORE YOUR WORKHUB</span><h2>Employment services</h2><p>Everything in one place, designed around you.</p></div><span className={ui.count}>06 SERVICES</span></div>
   <section className={ui.tiles}>{tiles.map((t,i)=><Link href={t.href} className={ui.tile} key={t.title}><div className={ui.tileTop}><span className={ui.tileIcon} data-tone={t.tone}><WorkHubIcon name={t.icon} size={25}/></span><span className={ui.tileIndex}>0{i+1}</span></div><span className={ui.tileTag}>{t.tag}</span><h3>{t.title}</h3><p>{t.desc}</p><span className={ui.tileLink}>Open service <WorkHubIcon name="arrow" size={16}/></span></Link>)}</section>
   <footer className={ui.footer}><span>© Western Cape Sports Association NPC · MyWCSA GovApps</span><Link href="/workhub">Return to dashboard <WorkHubIcon name="arrow" size={15}/></Link></footer>
  </div>
 </main>;
}
