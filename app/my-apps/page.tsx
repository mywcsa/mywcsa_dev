import Link from "next/link";
import styles from "./launcher.module.css";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyAppsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff");
  const staffName = session.user.name || session.user.email || "WCSA Staff Member";

  return <main style={{minHeight:"100vh",background:"#f4f6f8",fontFamily:"Poppins, Arial, Helvetica, sans-serif"}}>
    <header style={{minHeight:72,padding:"15px 30px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,background:"#fff",borderBottom:"1px solid #ddd"}}>
      <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" style={{display:"block",width:"auto",height:48,maxWidth:220,objectFit:"contain"}} />
      <form action={async()=>{"use server";await signOut({redirectTo:"/"});}}><button type="submit" style={{padding:"9px 18px",border:"1px solid #001489",borderRadius:4,background:"#fff",color:"#001489",fontFamily:"Poppins, Arial, Helvetica, sans-serif",cursor:"pointer"}}>Sign Out</button></form>
    </header>
    <section style={{width:"100%",maxWidth:1200,margin:"0 auto",padding:"45px 30px"}}>
      <p style={{margin:"0 0 5px",color:"#555",fontSize:14}}>MyWCSA GovApps</p>
      <h1 style={{margin:0,color:"#171717",fontSize:30,fontWeight:600}}>My Apps</h1>
      <p style={{margin:"10px 0 35px",color:"#555",fontSize:15}}>Welcome, {staffName}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))",gap:20}}>
        <AppCard title="MyWCSA WorkHub" href="/workhub" description="Employee workplace, services and collaboration" />
        <AppCard title="MyWCSA AMS" href="/apps/ams" description="Administration and management" />
        <AppCard title="MyWCSA Applications" href="/apps/applications" description="Applications and workflows" />
        <AppCard title="MyWCSA CSD" href="/apps/csd" description="Suppliers, procurement and assets" />
        <AppCard title="MyWCSA PERSAL" href="/persal" description="Personnel administration, HR and employee services" />
        <AppCard title="MyWCSA Membership" href="/membership/dashboard" description="Membership, organisation applications and renewals" />
        <AppCard title="MyWCDA Events" href="/WCDA-Events" description="WCDA event registration, assessment and operations" />
        <AppCard title="MyWCSA MSuite" href="/apps/msuite" description="Microsoft services" />
      </div>
    </section>
  </main>;
}

function AppCard({title,description,href}:{title:string;description:string;href:string}) {
  return <Link href={href} className={styles.card} style={{minHeight:150,padding:24,background:"#fff",border:"1px solid #e1e1e1",borderRadius:7,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}><h2 style={{margin:"0 0 10px",color:"#001489",fontSize:18,fontWeight:600}}>{title}</h2><p style={{margin:0,color:"#666",fontSize:14,lineHeight:1.5}}>{description}</p></Link>;
}
