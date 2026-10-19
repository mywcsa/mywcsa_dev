"use client";
import {useState} from "react";
import Link from "next/link";
export default function PartnerLauncher({username,email,wcsaId,initialStatus}:{username:string;email:string;wcsaId:string;initialStatus:string}){
 const [status,setStatus]=useState(initialStatus),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function request(){
  setBusy(true);setError("");
  try{const r=await fetch("/api/partner/apps",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
   const v=await r.json();if(!r.ok)throw new Error(v.error||"Unable to save request");
   setStatus(v.status);
  }catch(e){setError(e instanceof Error?e.message:"Request failed");}finally{setBusy(false);}
 }
 const panel={border:"1px solid white",borderRadius:19,background:"rgba(255,255,255,.73)",boxShadow:"0 8px 32px #00148413",padding:25} as const;
 return <main style={{minHeight:"100svh",background:"radial-gradient(ellipse at 95% 0%,#bcd9ff,transparent 54%),linear-gradient(140deg,#eff6ff,#dceaff)",padding:"clamp(17px,4vw,39px)",color:"#193a71",fontFamily:"Poppins,Arial,sans-serif"}}>
  <div style={{maxWidth:1100,margin:"auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",gap:18,alignItems:"center",marginBottom:25}}>
    <Link href="/" style={{color:"#001484",fontWeight:800,textDecoration:"none",fontSize:16}}>MyWCSA GovApps</Link>
    <Link href="/" style={{color:"#225daf",fontWeight:700,fontSize:11}}>Main website ↗</Link>
   </header>
   <section style={{...panel,background:"linear-gradient(110deg,#000b56,#001484,#2b70ba)",color:"white",padding:"clamp(22px,5vw,37px)",marginBottom:19}}>
    <span style={{fontSize:10,letterSpacing:2,color:"#bcd9ff",fontWeight:700}}>BUSINESS PARTNER WORKSPACE</span>
    <h1 style={{fontSize:30,letterSpacing:"-.045em",margin:"10px 0"}}>Welcome, {username}</h1>
    <p style={{fontSize:12,color:"#d7e9ff",lineHeight:1.8}}>Your organisation's GovApps account is connected to its WCSA ID. Manage membership services and request access to other eligible applications.</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:11,color:"#e7f3ff"}}><span>{email}</span><span>· WCSA ID: {wcsaId}</span></div>
   </section>
   <h2 style={{fontSize:20,color:"#001484"}}>Your applications</h2>
   {error&&<p role="alert" style={{padding:14,background:"#ffedf2",borderRadius:10,color:"#9d304d"}}>{error}</p>}
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
    <section style={panel}><div style={{fontSize:27,color:"#1b5aaf"}}>◎</div><h3>MyWCSA Membership</h3>
     <p style={{fontSize:12,lineHeight:1.8,color:"#657e9e"}}>View your organisation's membership, registration, renewals and payments according to its approved account authority.</p>
     <Link href="/membership" style={{display:"inline-flex",padding:"11px 15px",borderRadius:10,background:"#001484",color:"white",fontSize:12,fontWeight:700,textDecoration:"none"}}>Open membership →</Link></section>
    <section style={panel}><div style={{fontSize:27,color:"#1b5aaf"}}>▦</div><h3>MyWCDA Events</h3>
     <p style={{fontSize:12,lineHeight:1.8,color:"#657e9e"}}>Event approvals and organiser services require an individual approved application allocation.</p>
     <p style={{fontSize:11,color:"#366197",fontWeight:700}}>Allocation status: {status.replace(/_/g," ")}</p>
     {status==="approved"?<Link href="/WCDA-Events" style={{display:"inline-flex",padding:"11px 15px",borderRadius:10,background:"#001484",color:"white",fontSize:12,fontWeight:700,textDecoration:"none"}}>Open approved WCDA Events →</Link>:
      <button onClick={request} disabled={busy||status==="pending"} style={{border:0,borderRadius:10,padding:"11px 15px",background:"#001484",color:"white",cursor:"pointer",fontSize:12,fontWeight:700,opacity:busy||status==="pending"?.6:1}}>{busy?"Submitting…":status==="pending"?"Awaiting approval":"Request WCDA Events access →"}</button>}
    </section>
   </div>
   <p style={{marginTop:27,fontSize:11,color:"#6a87a9"}}>Access to staff-only GovApps applications, Command Centre and PERSAL is never allocated through a Business Partner account.</p>
  </div>
 </main>;
}
