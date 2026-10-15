import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { staffRpc } from "@/lib/govapps/staff-operations";
import Link from "next/link";

export const dynamic="force-dynamic";
export const metadata={title:"Set Staff Password | MyWCSA GovApps"};

export default async function StaffPasswordPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const session=await auth();
 const user=session?.user as ({email?:string|null;authProvider?:string}|undefined);
 if(!user?.email||user.authProvider!=="staff-password")redirect("/login/staff");
 const {error}=await searchParams;

 async function update(form:FormData){
  "use server";
  const current=String(form.get("current")||"");
  const password=String(form.get("password")||"");
  const confirm=String(form.get("confirm")||"");
  if(password!==confirm||password.length<14||password.length>128)
    redirect("/staff/password?error=validation");
  const signed=await auth();
  const actor=signed?.user as ({email?:string|null;authProvider?:string}|undefined);
  if(!actor?.email||actor.authProvider!=="staff-password")redirect("/login/staff");
  try{
    await staffRpc("govapps_staff_change_password",{p_email:actor.email,p_current:current,p_new:password});
  }catch{redirect("/staff/password?error=incorrect");}
  // Force a fresh JWT so the must-change claim is cleared after authentication.
  await signOut({redirectTo:"/login/staff"});
 }
 return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,
  background:"radial-gradient(at 80% 0%,#c6ddff,transparent 52%),linear-gradient(140deg,#e8f0fe,#dcecff)",fontFamily:"Poppins,Arial,sans-serif"}}>
  <section style={{width:"100%",maxWidth:530,background:"rgba(255,255,255,.78)",backdropFilter:"blur(20px)",border:"1px solid white",borderRadius:23,padding:"clamp(23px,5vw,43px)",boxShadow:"0 20px 70px #00148425"}}>
   <span style={{letterSpacing:2,color:"#3264b5",fontSize:10,fontWeight:800}}>MYWCSA GOVAPPS · STAFF SECURITY</span>
   <h1 style={{color:"#001484",fontSize:27,margin:"12px 0 8px"}}>Choose your own password</h1>
   <p style={{fontSize:13,color:"#526c94",lineHeight:1.75}}>Your temporary GovApps password must be changed before you can use the launcher. This password is separate from Microsoft Entra.</p>
   {error&&<p role="alert" style={{color:"#a92043",background:"#fff0f2",padding:12,borderRadius:10,fontSize:12}}>{error==="validation"?"Use matching passwords of at least 14 characters.":"The current password was not accepted. Try again or contact ServiceDesk."}</p>}
   <form action={update} style={{display:"grid",gap:13,marginTop:20}}>
    <label style={{display:"grid",gap:5,fontSize:12,color:"#153b81",fontWeight:650}}>Temporary or current password
      <input type="password" name="current" required autoComplete="current-password" style={{padding:12,border:"1px solid #b9cdeb",borderRadius:10}}/>
    </label>
    <label style={{display:"grid",gap:5,fontSize:12,color:"#153b81",fontWeight:650}}>New password (14+ characters)
      <input type="password" name="password" required minLength={14} maxLength={128} autoComplete="new-password" style={{padding:12,border:"1px solid #b9cdeb",borderRadius:10}}/>
    </label>
    <label style={{display:"grid",gap:5,fontSize:12,color:"#153b81",fontWeight:650}}>Confirm new password
      <input type="password" name="confirm" required minLength={14} maxLength={128} autoComplete="new-password" style={{padding:12,border:"1px solid #b9cdeb",borderRadius:10}}/>
    </label>
    <button type="submit" style={{background:"#001484",color:"white",border:0,borderRadius:11,padding:14,fontWeight:750,cursor:"pointer"}}>Save password and sign in again →</button>
   </form>
   <Link href="/login/staff" style={{display:"inline-block",marginTop:20,fontSize:12,color:"#315faa"}}>← Staff sign-in</Link>
  </section>
 </main>;
}
