"use client";
import {useEffect,useState} from "react";
import Link from "next/link";

type State="checking"|"paid"|"pending"|"error";
export default function PaymentReturn({reference}:{reference:string}){
 const[state,setState]=useState<State>("checking");
 const[message,setMessage]=useState("");
 const[receipt,setReceipt]=useState("");
 useEffect(()=>{
  if(!/^wcda-[a-f0-9]{32}$/.test(reference)){setState("error");setMessage("A valid payment reference was not returned.");return;}
  let cancelled=false;
  fetch("/api/wcda-events/payments",{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({action:"verify",reference})
  }).then(async r=>{
   const data=await r.json() as {paid?:boolean;receiptReference?:string;error?:string};
   if(!r.ok)throw new Error(data.error||"Payment verification is currently unavailable.");
   if(cancelled)return;
   if(data.paid){setState("paid");setReceipt(data.receiptReference||"");}
   else{setState("pending");setMessage("Paystack has not confirmed a successful transaction yet. Your event record has not been marked as paid.");}
  }).catch((e:unknown)=>{
   if(!cancelled){setState("error");setMessage(e instanceof Error?e.message:"Unable to check payment.");}
  });
  return()=>{cancelled=true};
 },[reference]);
 return <main style={{minHeight:"100svh",display:"grid",placeItems:"center",padding:24,background:"#f1f5fc",fontFamily:"Poppins,Arial,sans-serif"}}>
  <section style={{width:"min(100%,540px)",background:"#fff",border:"1px solid #dfe8f6",borderRadius:22,padding:"clamp(25px,5vw,48px)",boxShadow:"0 18px 50px #00148413",color:"#182747"}}>
   <span style={{fontSize:11,fontWeight:700,letterSpacing:1.8,color:"#001484"}}>MYWCDA EVENTS · SECURE PAYMENT</span>
   <h1 style={{fontSize:28,letterSpacing:"-1px",lineHeight:1.25,margin:"18px 0"}}>{state==="checking"?"Verifying your payment…":state==="paid"?"Payment confirmed":state==="pending"?"Payment not confirmed":"Payment verification unavailable"}</h1>
   {state==="paid"?<p style={{lineHeight:1.85,color:"#465b77"}}>Paystack verified your payment against the official WCDA event invoice. {receipt&&<>Your payment acknowledgement is <strong>{receipt}</strong>.</>} Payment does not automatically grant event endorsement or statutory permission.</p>:<p role="status" style={{lineHeight:1.85,color:"#526985"}}>{state==="checking"?"We are checking with Paystack. Please wait and do not pay again.":message}</p>}
   <p style={{fontSize:11,color:"#6b7891",overflowWrap:"anywhere"}}>Transaction reference: {reference||"Not supplied"}</p>
   <Link href="/WCDA-Events" style={{display:"inline-block",background:"#001484",color:"white",padding:"13px 20px",borderRadius:12,marginTop:15,fontSize:12,textDecoration:"none",fontWeight:700}}>Return to MyWCDA Events</Link>
   <p style={{fontSize:11,color:"#8290aa",lineHeight:1.7}}>If your bank shows a debit but confirmation is pending, contact <a href="mailto:finances@wcsports.co.za">finances@wcsports.co.za</a>. Do not submit another payment before checking.</p>
  </section>
 </main>;
}
