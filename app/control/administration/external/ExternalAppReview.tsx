"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Entry={id:number;account_id:string;app_slug:string;reason:string;status:string;reviewed_by:string|null;created_at:string;govapps_accounts?:{email:string;username:string}|null};
const pill=(status:string)=>status==="approved"?"#146c54":status==="declined"?"#a34257":"#9a6b1d";
export default function ExternalAppReview({canDecide}:{canDecide:boolean}){
 const [items,setItems]=useState<Entry[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<number|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 async function reload(){
  try{
   const r=await fetch("/api/control/external-requests",{cache:"no-store"});
   const body=await r.json();
   if(!r.ok)throw new Error(body.error||"Unable to load requests.");
   setItems(body.requests||[]);setError("");
  }catch(e){setError(e instanceof Error?e.message:"Unable to load requests.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void reload();},[]);
 async function decide(id:number,decision:"approved"|"declined"){
  setBusy(id);setError("");setNotice("");
  try{
   const r=await fetch("/api/control/external-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,decision})});
   const body=await r.json();
   if(!r.ok)throw new Error(body.error||"Unable to record decision.");
   await reload();
   setNotice("Request "+id+" "+decision+". The user's launcher will reflect the decision after refresh.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to save decision.");}
  finally{setBusy(null);}
 }
 return <main style={{minHeight:"100svh",padding:"clamp(18px,4vw,42px)",background:"radial-gradient(ellipse at 90% 0%,#c7dcfb,transparent 50%),linear-gradient(140deg,#eef6ff,#dceafb)",color:"#17366b",fontFamily:"Poppins,Arial,sans-serif"}}>
  <div style={{maxWidth:1250,margin:"auto"}}>
   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:18}}>
    <Link href="/control/administration" style={{fontSize:12,fontWeight:700,color:"#2055a2"}}>← Command Centre Administration</Link>
    <button onClick={()=>void reload()} style={{background:"#ffffffad",border:"1px solid white",color:"#2557a4",borderRadius:10,padding:"10px 13px",cursor:"pointer"}}>↻ Refresh requests</button>
   </div>
   <section style={{border:"1px solid #ffffff9e",borderRadius:22,background:"linear-gradient(110deg,#000d57,#001484,#2565be)",padding:"clamp(22px,5vw,38px)",color:"#fff",boxShadow:"0 17px 42px #0014842d"}}>
    <span style={{fontSize:10,letterSpacing:2,fontWeight:700,color:"#b4daff"}}>MYWCSA GOVAPPS · EXTERNAL USERS</span>
    <h1 style={{fontSize:30,margin:"9px 0"}}>Application Request Approvals</h1>
    <p style={{fontSize:12,color:"#d3e8ff",lineHeight:1.8}}>Review applications requested by registered External Users. Grant only appropriate access. Staff, PERSAL and Command Centre permissions are not available through this workflow.</p>
   </section>
   {error&&<p role="alert" style={{padding:13,borderRadius:10,background:"#ffedf0",color:"#a0384c"}}>{error}</p>}
   {notice&&<p role="status" style={{padding:13,borderRadius:10,background:"#e3f8ed",color:"#227254"}}>{notice}</p>}
   <section style={{border:"1px solid white",background:"#ffffffb8",backdropFilter:"blur(14px)",borderRadius:18,padding:21,marginTop:19,boxShadow:"0 6px 27px #00148413"}}>
    <h2 style={{fontSize:18,margin:"0 0 15px"}}>Review queue · {items.filter(v=>v.status==="pending").length} pending</h2>
    {loading?<p>Loading requests…</p>:items.length===0?<p style={{fontSize:12,color:"#6a82a4"}}>No external application requests submitted yet.</p>:
     <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",minWidth:790,textAlign:"left",fontSize:12}}>
      <thead><tr>{["External user","Requested application","Reason","Status","Submitted","Decision"].map(x=><th key={x} style={{padding:"12px 10px",color:"#6483ae",fontSize:10,textTransform:"uppercase",borderBottom:"1px solid #dce9f8"}}>{x}</th>)}</tr></thead>
      <tbody>{items.map(item=><tr key={item.id}>
       <td style={{padding:"15px 10px",borderBottom:"1px solid #e5edf8"}}><strong style={{display:"block"}}>{item.govapps_accounts?.username||"External user"}</strong><span style={{color:"#7388a8"}}>{item.govapps_accounts?.email||"Account "+item.account_id.slice(0,8)}</span></td>
       <td style={{padding:"15px 10px",borderBottom:"1px solid #e5edf8"}}>{item.app_slug.replace(/-/g," ")}</td>
       <td style={{padding:"15px 10px",borderBottom:"1px solid #e5edf8",maxWidth:250,overflowWrap:"anywhere"}}>{item.reason||"No reason supplied"}</td>
       <td style={{padding:"15px 10px",borderBottom:"1px solid #e5edf8"}}><span style={{color:pill(item.status),fontWeight:700,textTransform:"capitalize"}}>{item.status}</span></td>
       <td style={{padding:"15px 10px",borderBottom:"1px solid #e5edf8",whiteSpace:"nowrap"}}>{new Date(item.created_at).toLocaleDateString("en-ZA")}</td>
       <td style={{padding:"15px 10px",borderBottom:"1px solid #e5edf8"}}>
        {canDecide?<div style={{display:"flex",gap:6}}>
         <button type="button" disabled={busy!==null||item.status==="approved"||item.app_slug==="applications"} onClick={()=>void decide(item.id,"approved")} title={item.app_slug==="applications"?"This app is not operational yet":""} style={{background:"#e0f8ee",color:"#1d7454",border:"1px solid #b6e6d4",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}>Approve</button>
         <button type="button" disabled={busy!==null||item.status==="declined"} onClick={()=>void decide(item.id,"declined")} style={{background:"#fff0f1",color:"#a1394d",border:"1px solid #f5c4cd",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}>Decline</button>
        </div>:<span style={{fontSize:11,color:"#7a91b1"}}>Review-only</span>}
       </td>
      </tr>)}</tbody>
     </table></div>}
   </section>
  </div>
 </main>;
}
