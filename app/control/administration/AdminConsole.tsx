"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import s from "../control.module.css";
type StaffAccount={id:string;email:string;display_name:string;enabled:boolean;must_change:boolean;failed_attempts:number;blocked_until:string|null;created_at:string};
type Grant={email:string;app_slug:string;active:boolean;granted_by:string;updated_at:string};
type Notice={id:number;title:string;content:string;severity:string;active:boolean;created_at:string};
type Setting={key:string;enabled:boolean;updated_at:string};
type Data={operator:{email:string;role:string;display_name?:string};accounts:StaffAccount[];grants:Grant[];notices:Notice[];settings:Setting[]};
type Tab="accounts"|"apps"|"notices"|"settings";
const applications=[["membership","MyWCSA Membership"],["applications","MyWCSA Applications"],["csd","MyWCSA CSD"]];
export default function AdminConsole(){
 const [data,setData]=useState<Data|null>(null);
 const [tab,setTab]=useState<Tab>("accounts");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [oneTime,setOneTime]=useState<{email:string;password:string}|null>(null);
 const [email,setEmail]=useState("");
 const [name,setName]=useState("");
 const [grantEmail,setGrantEmail]=useState("");
 const [grantApp,setGrantApp]=useState("csd");
 const [grantActive,setGrantActive]=useState(true);
 const [noticeTitle,setNoticeTitle]=useState("");
 const [noticeBody,setNoticeBody]=useState("");
 const [noticeSeverity,setNoticeSeverity]=useState("information");
 const director=data?.operator.role==="director";

 async function load(){
  try{const response=await fetch("/api/control/administration",{cache:"no-store"});
   const value=await response.json();
   if(!response.ok)throw new Error(value.error||"Administration unavailable");
   setData(value);setError("");
  }catch(e){setError(e instanceof Error?e.message:"Could not load administration.");}finally{setLoading(false);}
 }
 useEffect(()=>{void load();},[]);
 async function commit(body:Record<string,unknown>,message:string){
  setSaving(true);setError("");setSuccess("");setOneTime(null);
  try{
   const response=await fetch("/api/control/administration",{method:"POST",
    headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const value=await response.json();
   if(!response.ok)throw new Error(value.error||"Command was rejected");
   if(typeof value.temporaryPassword==="string")setOneTime({email:String(body.email),password:value.temporaryPassword});
   setSuccess(message);
   await load();
  }catch(e){setError(e instanceof Error?e.message:"The operation failed.");}
  finally{setSaving(false);}
 }
 function createAccount(event:FormEvent){event.preventDefault();
  void commit({action:"create_staff_login",email,name},"Staff password account created. The temporary password is displayed once below.");
 }
 function allocate(event:FormEvent){event.preventDefault();
  void commit({action:"app_grant",email:grantEmail,app:grantApp,active:grantActive},
    grantActive?"App allocation activated.":"App allocation revoked.");
 }
 function publish(event:FormEvent){event.preventDefault();
  void commit({action:"publish_notice",title:noticeTitle,content:noticeBody,severity:noticeSeverity},"Notice published for the next staff sign-in.");
 }
 const frame={background:"rgba(255,255,255,.78)",border:"1px solid white",borderRadius:16,padding:20,boxShadow:"0 7px 26px #00148412"} as const;
 const input={padding:12,border:"1px solid #bbd0ec",borderRadius:10,color:"#13366d",width:"100%",fontSize:12,background:"#f9fcff"} as const;
 const label={display:"grid",gap:6,color:"#2c507f",fontSize:12,fontWeight:650} as const;
 const button={border:0,borderRadius:11,padding:"12px 17px",background:"#001484",color:"#fff",fontWeight:700,cursor:"pointer"} as const;
 return <div className={s.root} style={{minHeight:"100svh"}}>
  <header className={s.header}>
   <Link href="/control" style={{display:"flex",flexDirection:"column",color:"#001484",textDecoration:"none"}}><strong style={{fontSize:18}}>MyWCSA Command Centre</strong><small>ADMINISTRATION · E-INNOVATION</small></Link>
   <Link href="/control" className={s.headerButton}>← Back to Command Centre</Link>
  </header>
  <main style={{maxWidth:1200,margin:"0 auto",width:"100%",padding:"clamp(18px,4vw,37px)"}}>
   <section className={s.hero} style={{minHeight:175,marginBottom:18}}>
    <div><span className={s.kicker}>CONTROL & CONFIGURATION</span><h1>System administration</h1>
     <p>Manage staff access, allocate applications, publish sign-in notices and configure GovApps.</p></div>
   </section>
   <div style={{marginBottom:16}}><Link href="/control/administration/external" style={{display:"inline-flex",background:"#ffffffdf",color:"#001484",padding:"12px 17px",borderRadius:12,border:"1px solid white",boxShadow:"0 5px 19px #00148413",fontWeight:750,fontSize:12,textDecoration:"none"}}>External User App Requests · Review & Approve →</Link></div>
   {loading&&<p style={{padding:25}}>Loading authorised administration records…</p>}
   {error&&<p role="alert" style={{color:"#a12346",background:"#ffe9ee",borderRadius:10,padding:15}}>{error}</p>}
   {success&&<p role="status" style={{color:"#08614f",background:"#dff9ee",borderRadius:10,padding:15}}>{success}</p>}
   {oneTime&&<div style={{...frame,border:"2px solid #c7ac56",background:"#fff9e8",marginBottom:18}}>
    <strong style={{color:"#684e0b",fontSize:16}}>One-time temporary password for {oneTime.email}</strong>
    <p style={{fontSize:12,color:"#7e6d43"}}>Copy and deliver securely to the intended employee. This password is not stored in plaintext and cannot be viewed again. They must change it on first login.</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
     <code style={{fontSize:15,overflowWrap:"anywhere",background:"white",borderRadius:8,padding:12}}>{oneTime.password}</code>
     <button onClick={()=>navigator.clipboard.writeText(oneTime.password)} style={button}>Copy password</button>
     <button onClick={()=>setOneTime(null)} style={{...button,background:"#66758a"}}>Hide password</button>
    </div></div>}
   {data&&<>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
     {([["accounts","Staff accounts"],["apps","App allocations"],["notices","Notice board"],["settings","Configuration"]] as const).map(([id,title])=><button key={id} onClick={()=>setTab(id)}
       style={{...button,background:tab===id?"#001484":"rgba(255,255,255,.85)",color:tab===id?"white":"#001484",border:tab===id?"1px solid #001484":"1px solid #c7d9f0"}}>{title}</button>)}
    </div>
    {tab==="accounts"&&<div style={{display:"grid",gap:16}}>
     <section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Add staff email & password account</h2>
      <p style={{color:"#6681a4",fontSize:12,lineHeight:1.8}}>For existing or newly authorised WCSA personnel. This creates a separate GovApps fallback password, not an Entra identity or Microsoft mailbox. Administrators receive a temporary password once.</p>
      <form onSubmit={createAccount} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,alignItems:"end"}}>
       <label style={label}>Staff Microsoft email<input style={input} type="email" placeholder="person@wcsports.co.za" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
       <label style={label}>Employee display name<input style={input} required minLength={2} maxLength={120} placeholder="Full display name" value={name} onChange={e=>setName(e.target.value)}/></label>
       <button type="submit" disabled={saving} style={button}>Create staff login</button>
      </form>
     </section>
     <section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Provisioned fallback accounts</h2>
      {data.accounts.length===0?<p style={{fontSize:12,color:"#6e82a0"}}>No staff password accounts exist yet. Everyone can continue using Microsoft sign-in.</p>:
      <div style={{overflowX:"auto"}}><table className={s.table}><thead><tr><th>Employee</th><th>Login</th><th>Password status</th><th>Access</th>{director&&<th>Manage</th>}</tr></thead><tbody>
       {data.accounts.map(a=><tr key={a.id}><td><strong>{a.display_name}</strong><small>{a.email}</small></td><td>GovApps password</td><td>{a.must_change?"First login – rotation required":"Set by employee"}</td><td><span className={s.tag}>{a.enabled?"Active":"Disabled"}</span></td>
        {director&&<td><button className={s.tableAction} disabled={saving} onClick={()=>void commit({action:"staff_login_status",email:a.email,active:!a.enabled},a.enabled?"Account disabled.":"Account re-enabled.")}>{a.enabled?"Disable":"Enable"}</button></td>}</tr>)}
       </tbody></table></div>}
     </section>
    </div>}
    {tab==="apps"&&<div style={{display:"grid",gap:16}}>
     <section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Allocate an application</h2><p style={{fontSize:12,color:"#6b82a2"}}>Assign supported apps individually. PERSAL, Command Centre, AMS and WCDA Events are protected by separate authoritative access registers and cannot be granted from this general allocation form.</p>
      <form onSubmit={allocate} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,alignItems:"end"}}>
       <label style={label}>Employee email<input type="email" style={input} required placeholder="person@wcsports.co.za" value={grantEmail} onChange={e=>setGrantEmail(e.target.value)}/></label>
       <label style={label}>Application<select style={input} value={grantApp} onChange={e=>setGrantApp(e.target.value)}>{applications.map(([id,title])=><option key={id} value={id}>{title}</option>)}</select></label>
       <label style={label}>Access<select style={input} value={grantActive?"grant":"revoke"} onChange={e=>setGrantActive(e.target.value==="grant")}><option value="grant">Grant access</option><option value="revoke">Revoke access</option></select></label>
       <button disabled={saving} style={button}>Save app allocation</button>
      </form>
     </section>
     <section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Application allocation register</h2>
      {data.grants.length===0?<p style={{fontSize:12,color:"#6b82a2"}}>No individual app allocations have been recorded yet.</p>:
       <div style={{overflowX:"auto"}}><table className={s.table}><thead><tr><th>Employee</th><th>Application</th><th>State</th><th>Granted by</th></tr></thead><tbody>
       {data.grants.map(g=><tr key={g.email+g.app_slug}><td>{g.email}</td><td>{applications.find(a=>a[0]===g.app_slug)?.[1]||g.app_slug}</td><td><span className={s.tag}>{g.active?"Allocated":"Revoked"}</span></td><td>{g.granted_by}</td></tr>)}
       </tbody></table></div>}
     </section>
    </div>}
    {tab==="notices"&&<div style={{display:"grid",gap:16}}>
     {director&&<section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Publish an announcement</h2>
      <form onSubmit={publish} style={{display:"grid",gap:12}}>
       <label style={label}>Notice title<input style={input} value={noticeTitle} minLength={4} maxLength={140} required onChange={e=>setNoticeTitle(e.target.value)}/></label>
       <label style={label}>Message<textarea style={{...input,minHeight:110,resize:"vertical"}} minLength={5} maxLength={4000} required value={noticeBody} onChange={e=>setNoticeBody(e.target.value)}/></label>
       <label style={label}>Notice type<select style={input} value={noticeSeverity} onChange={e=>setNoticeSeverity(e.target.value)}><option value="information">Information</option><option value="important">Important</option><option value="urgent">Urgent</option></select></label>
       <button type="submit" disabled={saving} style={button}>Publish to sign-in notice board</button>
      </form>
     </section>}
     <section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Current and previous notices</h2>
      {data.notices.length===0?<p style={{fontSize:12,color:"#6b82a2"}}>No notices have been published yet. The board displays a welcome message.</p>:
       <div style={{display:"grid",gap:10}}>{data.notices.map(n=><article key={n.id} style={{background:"#f0f6ff",border:"1px solid #dbe8fa",borderRadius:12,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:9,flexWrap:"wrap"}}><strong style={{color:"#153b82"}}>{n.title}</strong>
         <span style={{fontSize:11,color:n.active?"#23734e":"#995167"}}>{n.active?"Published":"Unpublished"} · {n.severity}</span>
        </div><p style={{whiteSpace:"pre-wrap",fontSize:12,color:"#526c91",lineHeight:1.75}}>{n.content}</p>
        {director&&<button className={s.tableAction} disabled={saving} onClick={()=>void commit({action:"notice_status",id:n.id,active:!n.active},n.active?"Notice unpublished.":"Notice republished.")}>{n.active?"Unpublish":"Republish"}</button>}
       </article>)}</div>}
     </section>
    </div>}
    {tab==="settings"&&<section style={frame}><h2 style={{fontSize:18,color:"#001484"}}>Application configuration</h2>
     <p style={{fontSize:12,color:"#6c83a4"}}>Configuration changes are audited. Settings do not override staff identity or per-app permission checks.</p>
     {data.settings.map(setting=><div key={setting.key} style={{borderTop:"1px solid #e0eaf8",padding:"18px 0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
      <div><strong style={{color:"#1a3e7e"}}>{setting.key==="staff_password_login_enabled"?"Staff fallback password sign-in":"Login notice board"}</strong>
       <p style={{margin:"5px 0",fontSize:11,color:"#6a83a5"}}>{setting.key==="staff_password_login_enabled"?"Microsoft sign-in stays independent and enabled.":"Show the welcome/announcement page before the launcher."}</p></div>
      <button disabled={!director||saving} style={{...button,background:setting.enabled?"#1e7269":"#a04b62"}} onClick={()=>void commit({action:"setting",key:setting.key,enabled:!setting.enabled},"Configuration updated.")}>{setting.enabled?"Enabled · Turn off":"Disabled · Turn on"}</button>
     </div>)}
    </section>}
   </>}
  </main>
 </div>;
}
