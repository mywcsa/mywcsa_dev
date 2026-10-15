import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";
import { activeStaffNotices, markNoticesSeen, noticeBoardEnabled } from "@/lib/govapps/staff-operations";
import { Poppins } from "next/font/google";
import Link from "next/link";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"Notice Board | MyWCSA GovApps",robots:{index:false,follow:false}};
export default async function StaffNoticeBoard(){
 const session=await auth();
 const user=session?.user as ({email?:string|null;authProvider?:string;staffLoginNonce?:string;staffMustChange?:boolean}|undefined);
 if(!session?.user||!isMicrosoftStaff(user))redirect("/login/staff?returnTo=%2Fmy-apps");
 if(user?.staffMustChange)redirect("/staff/password");
 const notices=await activeStaffNotices().catch(()=>[]);
 const enabled=await noticeBoardEnabled();
 async function proceed(){
  "use server";
  const current=await auth();
  const actor=current?.user as ({email?:string|null;authProvider?:string;staffLoginNonce?:string}|undefined);
  if(!isMicrosoftStaff(actor))redirect("/login/staff");
  await markNoticesSeen(actor!);
  redirect("/my-apps");
 }
 return <main className={poppins.className} style={{minHeight:"100svh",padding:"min(8vw,58px) 20px",
  background:"radial-gradient(ellipse at 85% 0%,#bad7ff,transparent 50%),linear-gradient(145deg,#edf5ff,#dbe9fc)",color:"#1a3564"}}>
  <div style={{maxWidth:960,margin:"auto"}}>
   <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:22}}>
    <div><span style={{fontSize:10,letterSpacing:2.2,fontWeight:750,color:"#245db1"}}>WESTERN CAPE SPORTS ASSOCIATION NPC</span>
      <h1 style={{fontSize:"clamp(27px,4vw,41px)",letterSpacing:"-.05em",color:"#001484",margin:"7px 0 0"}}>MyWCSA Notice Board</h1></div>
    <div style={{padding:"11px 15px",background:"rgba(255,255,255,.65)",border:"1px solid #fff",borderRadius:14,fontSize:11,color:"#41689f"}}>STAFF INFORMATION · GOVAPPS</div>
   </header>
   <section style={{borderRadius:23,background:"linear-gradient(100deg,#000e63,#001484 65%,#2a67c0)",color:"white",padding:"clamp(22px,5vw,40px)",marginBottom:19,boxShadow:"0 18px 42px #0014842a"}}>
    <span style={{fontSize:10,letterSpacing:2,color:"#b8d9ff",fontWeight:800}}>WELCOME BACK</span>
    <h2 style={{fontSize:26,margin:"9px 0"}}>{session.user.name||"WCSA staff member"}</h2>
    <p style={{fontSize:12,color:"#d9e8ff",maxWidth:650,lineHeight:1.8}}>Please review the current organisational notices before entering your personalised application launcher. Only apps allocated to your account will appear.</p>
   </section>
   <div style={{display:"grid",gap:13,marginBottom:25}}>
    {enabled&&notices.length>0?notices.map(notice=><article key={notice.id} style={{borderRadius:17,padding:"22px 25px",background:"rgba(255,255,255,.78)",border:"1px solid white",boxShadow:"0 6px 24px #174b9f13"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}>
       <strong style={{fontSize:17,color:"#102f70"}}>{notice.title}</strong>
       <span style={{fontSize:10,textTransform:"uppercase",borderRadius:20,padding:"6px 10px",background:notice.severity==="urgent"?"#ffe7ec":notice.severity==="important"?"#fff0d4":"#ddecff",
        color:notice.severity==="urgent"?"#a32945":notice.severity==="important"?"#92601b":"#19549b",fontWeight:750}}>{notice.severity}</span>
      </div>
      <p style={{whiteSpace:"pre-wrap",color:"#47638b",fontSize:13,lineHeight:1.85,margin:"10px 0"}}>{notice.content}</p>
      <span style={{fontSize:10,color:"#7d92b1"}}>{new Date(notice.created_at).toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"})}</span>
    </article>):<div style={{padding:27,borderRadius:17,border:"1px solid white",background:"rgba(255,255,255,.7)"}}>
      <strong style={{color:"#143d83",fontSize:15}}>No new notices</strong>
      <p style={{margin:"6px 0 0",fontSize:12,color:"#6983a6"}}>There are no current announcements requiring your attention. Continue to your workspace.</p>
    </div>}
   </div>
   <form action={proceed}><button type="submit" style={{width:"100%",cursor:"pointer",padding:"16px 20px",border:0,borderRadius:14,
    background:"#001484",boxShadow:"0 12px 24px #00148427",color:"white",fontWeight:750,fontSize:13}}>I have reviewed the notice board · Proceed to my launcher →</button></form>
   <footer style={{marginTop:19,textAlign:"center",fontSize:10,color:"#6c88ac"}}>MyWCSA GovApps · WCSA e-Innovation · <Link href="/login/staff">Staff sign-in</Link></footer>
  </div>
 </main>;
}
