import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
const pages: Record<string,string> = {
 employment:"My Employment",benefits:"My Benefits",leave:"My Leave",documents:"My Documents",requests:"My Requests",tickets:"My Tickets",work:"My Work",team:"My Team",learning:"My Learning",applications:"My Applications"
};
export default async function WorkHubSection({params}:{params:Promise<{section:string}>}) {
 const {section}=await params; const title=pages[section]; if(!title)notFound();
 const session=await auth();if(!session?.user)redirect("/login/staff?returnTo=%2Fworkhub%2F"+section);
 return <main style={{minHeight:"100vh",background:"linear-gradient(135deg,#e9eff6,#d2dce8)",padding:"32px",fontFamily:"Poppins,Arial,sans-serif",color:"#142d52"}}>
 <nav style={{marginBottom:25,display:"flex",gap:16}}><Link href="/workhub">← WorkHub Dashboard</Link><Link href="/my-apps">GovApps</Link></nav>
 <section style={{maxWidth:980,margin:"auto",padding:"35px",background:"rgba(255,255,255,.62)",border:"1px solid white",borderRadius:20,boxShadow:"0 15px 50px #8899aa30",backdropFilter:"blur(20px)"}}>
 <small>MYWCSA WORKHUB · EMPLOYEE SERVICES</small><h1 style={{fontSize:32,margin:"12px 0"}}>{title}</h1>
 <p>This employee service is being connected to authorised WCSA personnel data and workflows. No records are displayed until secure access and integration are completed.</p>
 <Link href="/workhub" style={{display:"inline-block",marginTop:15,padding:"12px 18px",background:"#2675d7",borderRadius:10,color:"#fff"}}>Return to dashboard</Link>
 </section></main>;
}