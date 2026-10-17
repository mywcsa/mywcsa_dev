"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
type Event={id:number;category:string;status:string;error_category:string|null;reference_type:string|null;reference_id:string|null;actor_email:string|null;created_at:string};
type Status={sender:{ready:boolean;enabled:boolean;sender:string|null;provider:string;needs:string[]};events:Event[];operator:string};
const box={background:"rgba(255,255,255,.78)",border:"1px solid rgba(255,255,255,.9)",borderRadius:20,
 boxShadow:"0 15px 35px #00148413",padding:"clamp(19px,3vw,30px)",backdropFilter:"blur(18px)"} as const;
export default function EmailCentre(){
 const [data,setData]=useState<Status|null>(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const load=useCallback(async()=>{
  try{
   const response=await fetch("/api/control/email",{cache:"no-store"});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Cannot load Email Centre.");
   setData(result);
   setError("");
  }catch(e){setError(e instanceof Error?e.message:"Email Centre unavailable.");}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 async function testEmail(){
  setBusy(true);setError("");setMessage("");
  try{
   const response=await fetch("/api/control/email",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action:"send_test"})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Microsoft did not accept the test.");
   setMessage(result.message||"Message accepted by Microsoft Graph.");
   await load();
  }catch(e){setError(e instanceof Error?e.message:"Could not send test.");}finally{setBusy(false);}
 }
 const date=(s:string)=>new Date(s).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"});
 return <main style={{minHeight:"100svh",padding:"clamp(18px,4vw,42px)",color:"#16356d",
  background:"radial-gradient(ellipse at 93% 2%,#bcd9ff,transparent 50%),linear-gradient(145deg,#eaf3ff,#d9e8fb)",
  fontFamily:"Poppins,Arial,sans-serif"}}>
  <div style={{maxWidth:1170,margin:"auto",display:"grid",gap:19}}>
   <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:15}}>
    <div><span style={{fontSize:10,letterSpacing:2,fontWeight:800,color:"#3a6eb2"}}>MYWCSA GOVAPPS · E-INNOVATION</span>
     <h1 style={{fontSize:31,color:"#001484",margin:"3px 0",letterSpacing:"-.04em"}}>Email Centre</h1></div>
    <Link href="/control/operations" style={{fontSize:12,fontWeight:700,color:"#245ba8"}}>← Command Centre</Link>
   </header>
   <section style={{...box,background:"linear-gradient(110deg,#000c57,#001484 60%,#245db0)",color:"white",padding:30}}>
    <span style={{fontWeight:800,letterSpacing:2,fontSize:10,color:"#add6ff"}}>OUTBOUND TRANSACTIONAL MAIL</span>
    <h2 style={{fontSize:25,margin:"8px 0"}}>Microsoft 365 mail delivery</h2>
    <p style={{lineHeight:1.85,color:"#e0edff",fontSize:12,maxWidth:680}}>Connect an authorised WCSA mailbox to send real account, ticket, appointment and application-status notifications. Nothing is sent as an unverified email alias.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:12,fontSize:12,marginTop:17}}>
     <span style={{background:"#ffffff1d",border:"1px solid #ffffff55",borderRadius:20,padding:"9px 13px"}}>
      {loading?"Checking configuration…":data?.sender.ready?"● Server credentials configured":"○ Connection setup required"}
     </span>
     {data?.sender.sender&&<span style={{padding:"9px 13px"}}>Sending mailbox: {data.sender.sender}</span>}
     <span style={{background:data?.sender.enabled?"#186b56":"#805d2b",padding:"9px 13px",borderRadius:20,fontSize:11}}>
      {data?.sender.enabled?"Production notifications enabled":"Production notifications disabled until tested"}
     </span>
    </div>
   </section>
   {error&&<p role="alert" style={{...box,color:"#a43b53",background:"#fff0f2",fontSize:12}}>{error}</p>}
   {message&&<p role="status" style={{...box,color:"#196b52",background:"#e8fff3",fontSize:12}}>{message}</p>}
   <section style={box}>
    <h2 style={{fontSize:19,color:"#001484",marginTop:0}}>Connection & test</h2>
    <p style={{fontSize:12,color:"#6480a5",lineHeight:1.8}}>A verified sender mailbox and Microsoft Graph application permissions are required. The connected Outlook ChatGPT app does not automatically authorise the GovApps server to send email.</p>
    {!data?.sender.ready&&<div style={{background:"#f0f6ff",borderRadius:13,padding:18,margin:"18px 0",border:"1px solid #d2e3f9"}}>
     <strong style={{fontSize:12}}>Complete these private Vercel environment settings:</strong>
     <p style={{fontSize:11,lineHeight:2.15,marginBottom:0,fontFamily:"ui-monospace,monospace",color:"#35639d"}}>
      GOVAPPS_MAIL_TENANT_ID<br/>GOVAPPS_MAIL_CLIENT_ID<br/>GOVAPPS_MAIL_CLIENT_SECRET<br/>GOVAPPS_MAIL_FROM
     </p>
     <p style={{color:"#7288a8",fontSize:11}}>Microsoft Graph application permission <strong>Mail.Send</strong> requires tenant admin approval. Scope the application to its authorised sending mailbox.</p>
    </div>}
    <div style={{display:"flex",flexWrap:"wrap",gap:13,alignItems:"center",marginTop:14}}>
     <button type="button" onClick={()=>void testEmail()} disabled={!data?.sender.ready||busy}
      style={{padding:"12px 18px",background:"#001484",color:"white",border:0,borderRadius:11,fontWeight:750,cursor:"pointer",opacity:!data?.sender.ready||busy?.5:1}}>
      {busy?"Requesting send…":"Send a test email to my account →"}</button>
     <button type="button" onClick={()=>void load()} style={{padding:"12px 16px",border:"1px solid #bbd1eb",background:"#e9f3ff",borderRadius:11,color:"#265ba0",cursor:"pointer"}}>↻ Refresh status</button>
     <span style={{fontSize:11,color:"#657da0"}}>{data?.operator||"Signed-in Command Centre operator"}</span>
    </div>
    <p style={{fontSize:11,color:"#7d92ae",lineHeight:1.8}}>A successful test means Microsoft Graph accepted the message, not that the recipient has received it. Confirm delivery in Outlook. After mailbox-scoped permission checks and confirmed delivery, a deployment administrator may set GOVAPPS_MAIL_ENABLED=true in Vercel Production and redeploy.</p>
   </section>
   <section style={box}>
    <h2 style={{fontSize:18,color:"#001484",margin:"0 0 10px"}}>Recent email activity</h2>
    <p style={{fontSize:11,color:"#738aac"}}>Private delivery attempts and Microsoft acceptance status · No email bodies or recipient addresses are stored here.</p>
    {data?.events.length?<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:560,fontSize:11,textAlign:"left"}}>
     <thead><tr>{["Date","Notification","Result","Reference","Operator"].map(t=><th key={t} style={{padding:"12px 9px",borderBottom:"1px solid #d2e0f2",color:"#6684ad"}}>{t}</th>)}</tr></thead>
     <tbody>{data.events.map(e=><tr key={e.id}>
      <td style={{padding:"13px 9px",borderBottom:"1px solid #e2ebf7"}}>{date(e.created_at)}</td>
      <td style={{padding:"13px 9px",borderBottom:"1px solid #e2ebf7"}}>{e.category.replace(/_/g," ")}</td>
      <td style={{padding:"13px 9px",borderBottom:"1px solid #e2ebf7",fontWeight:750,color:e.status==="accepted"?"#147653":e.status==="unconfigured"?"#9d711f":"#b03952"}}>{e.status}{e.error_category?" · "+e.error_category:""}</td>
      <td style={{padding:"13px 9px",borderBottom:"1px solid #e2ebf7"}}>{e.reference_type||"—"} {e.reference_id||""}</td>
      <td style={{padding:"13px 9px",borderBottom:"1px solid #e2ebf7"}}>{e.actor_email||"System"}</td>
     </tr>)}</tbody></table></div>:<p style={{fontSize:12,color:"#7d93af",padding:"25px 0"}}>No email activity recorded yet.</p>}
   </section>
  </div>
 </main>;
}
