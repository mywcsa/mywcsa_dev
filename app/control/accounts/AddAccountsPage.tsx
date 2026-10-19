"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import s from "../operations/operations.module.css";
type AccountType="staff"|"external_user"|"business_partner";
const choices:{id:AccountType;name:string;description:string}[]=[
 {id:"staff",name:"Staff account",description:"Create a separate GovApps password login for an existing WCSA email. Microsoft Entra identity is not created."},
 {id:"external_user",name:"External User",description:"Create a personal GovApps account with email, username and date of birth."},
 {id:"business_partner",name:"Business Partner",description:"Register a partner login against an existing, verified Registry-issued WCSA ID."},
];
const inputStyle={padding:"13px 14px",width:"100%",borderRadius:11,border:"1px solid #bed4f0",background:"#f9fcff",color:"#173767",fontSize:13} as const;
export default function AddAccountsPage(){
 const [type,setType]=useState<AccountType>("staff");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [created,setCreated]=useState<{email:string;password:string;login:string;type:AccountType;note:string}|null>(null);
 const [showPassword,setShowPassword]=useState(false);
 const selected=choices.find(c=>c.id===type)!;
 async function create(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setCreated(null);setShowPassword(false);
  const submittedForm=e.currentTarget;
  const fd=new FormData(submittedForm);
  const request:Record<string,unknown>={action:"create_account",account_type:type,
    name:String(fd.get("name")||"").trim(),email:String(fd.get("email")||"").trim(),
    username:String(fd.get("username")||"").trim(),dob:String(fd.get("dob")||""),
    wcsa_id:String(fd.get("wcsa_id")||"").trim(),guardian_confirmed:fd.get("guardian_confirmed")==="on"};
  try{
   const response=await fetch("/api/control/operations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(request)});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"The new account could not be created.");
   if(!data.temporaryPassword||data.result?.accountCreated!==true)throw new Error("The server did not confirm account provisioning.");
   setCreated({email:String(request.email),password:data.temporaryPassword,login:data.result.login,type,note:data.result.note});
   submittedForm.reset();
  }catch(cause){setError(cause instanceof Error?cause.message:"Account creation failed. Nothing has been confirmed.");}
  finally{setBusy(false);}
 }
 return <div className={s.root}>
  <header className={s.header}>
   <Link href="/control" className={s.brand}><span className={s.brandMark}>M</span><span><strong>MyWCSA Command Centre</strong><small>ACCOUNT REGISTRATION · WCSA E-INNOVATION</small></span></Link>
   <div className={s.headerActions}><Link href="/control/operations">← Back to Operations</Link></div>
  </header>
  <main style={{maxWidth:1070,margin:"auto",padding:"clamp(18px,4vw,40px)",display:"grid",gap:20}}>
   <section className={s.hero}><div><span>MYWCSA GOVAPPS · EXPRESS ONBOARDING</span><h1>Add Accounts</h1>
    <p>Register staff, external users and Business Partners at the ServiceDesk or during an office visit. All active Command Centre operators may use this workspace.</p></div><div className={s.heroSymbol} aria-hidden="true">✦</div></section>
   <div className={s.panel}>
    <div className={s.panelHead}><div><h2>1. Choose the new account type</h2><p>Select the appropriate GovApps account. This cannot create Microsoft Entra users or alter PERSAL access.</p></div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
     {choices.map(c=><button key={c.id} type="button" onClick={()=>{setType(c.id);setError("");setCreated(null);}}
      aria-pressed={type===c.id}
      style={{textAlign:"left",padding:20,borderRadius:15,cursor:"pointer",background:type===c.id?"linear-gradient(140deg,#001484,#285fb9)":"#f0f7ff",color:type===c.id?"white":"#1c4483",border:type===c.id?"2px solid #5486d5":"2px solid #d8e9fa",boxShadow:type===c.id?"0 11px 26px #00148426":"none"}}>
      <strong style={{display:"block",fontSize:14,marginBottom:6}}>{c.name}</strong>
      <span style={{fontSize:11,lineHeight:1.75,opacity:.87}}>{c.description}</span>
     </button>)}
    </div>
   </div>
   {error&&<div className={s.error} role="alert">{error}</div>}
   {created&&<section className={s.panel} style={{border:"2px solid #9dd0b8",background:"#eafbf1"}}>
    <h2 style={{color:"#116446",fontSize:19,margin:"0 0 10px"}}>Account created successfully</h2>
    <p style={{fontSize:12,color:"#326650"}}>{created.email} · {created.note}</p>
    <p style={{fontWeight:700,fontSize:12,color:"#115d49"}}>One-time temporary GovApps password</p>
    <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap"}}>
     <code style={{background:"white",borderRadius:9,padding:13,color:"#18365e",overflowWrap:"anywhere"}}>{showPassword?created.password:"••••••••••••••••••••••••"}</code>
     <button type="button" onClick={()=>setShowPassword(v=>!v)} className={s.lightButton}>{showPassword?"Hide":"Reveal"}</button>
     <button type="button" onClick={()=>void navigator.clipboard.writeText(created.password)} className={s.lightButton}>Copy password</button>
     <button type="button" onClick={()=>setCreated(null)} className={s.lightButton}>Clear</button>
    </div>
    <p style={{fontSize:11,color:"#356a58",lineHeight:1.7}}>Share only via an approved private handover. This value cannot be retrieved again. Never include it in a support ticket, an email thread or a document.</p>
    <a href={created.login} style={{fontWeight:750,fontSize:12,color:"#001484"}}>Open the relevant sign-in page ↗</a>
   </section>}
   <section className={s.panel}>
    <div className={s.panelHead}><div><h2>2. Account details</h2><p>{selected.description}</p></div></div>
    <form key={type} className={s.form} onSubmit={create}>
     <div className={s.grid2}>
      <label className={s.label}>Name and surname / Display name<input style={inputStyle} name="name" minLength={2} maxLength={120} required placeholder="Full name"/></label>
      <label className={s.label}>Email address<input style={inputStyle} name="email" type="email" required placeholder={type==="staff"?"name@wcsports.co.za":"name@example.com"}/></label>
      {type!=="staff"&&<label className={s.label}>GovApps username<input style={inputStyle} name="username" required minLength={4} maxLength={64} pattern="[a-zA-Z0-9_.\-]+" placeholder="Username"/></label>}
      {type==="external_user"&&<label className={s.label}>Date of birth<input style={inputStyle} name="dob" type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} required/></label>}
      {type==="business_partner"&&<label className={s.label}>Registry-issued WCSA ID<input style={inputStyle} name="wcsa_id" required placeholder="Existing verified organisation ID" maxLength={80}/></label>}
     </div>
     {type==="external_user"&&<label className={s.check}><input type="checkbox" name="guardian_confirmed"/> Guardian authorisation has been verified where required for a minor.</label>}
     <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
      <button className={s.primary} type="submit" disabled={busy}>{busy?"Creating account…":"Create "+selected.name+" →"}</button>
      <Link href="/control/operations" className={s.textButton}>Return to Operations</Link>
     </div>
    </form>
   </section>
   <div className={s.panel} style={{padding:18}}>
    <strong style={{fontSize:12,color:"#001484"}}>What happens next?</strong>
    <p className={s.note}>The new user signs in using the generated GovApps credentials and sees their own type-specific launcher. App allocations are managed separately and never grant PERSAL or Microsoft Entra tenant roles. Staff passwords must be changed on first use.</p>
   </div>
  </main>
 </div>;
}
