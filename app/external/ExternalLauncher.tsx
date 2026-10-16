"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent,type ReactNode} from "react";
import type {ExternalAppSlug,ExternalRequest} from "@/lib/external/access";
import styles from "./external-launcher.module.css";
type App={slug:ExternalAppSlug;name:string;description:string;category:string;href:string|null;available:boolean};
type Data={identity:{id:string;email:string;name:string};requests:ExternalRequest[];apps:App[]};
const glyphs:Record<string,string>={membership:"◎","wcda-events":"▦",applications:"✧"};
function statusFor(app:App,requests:ExternalRequest[]){
 return requests.find(item=>item.app_slug===app.slug)?.status||"not_requested";
}
export default function ExternalLauncher({name,email,signOutControl}:{name:string;email:string;signOutControl:ReactNode}){
 const [data,setData]=useState<Data|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState<string|null>(null);
 const [reason,setReason]=useState<Record<string,string>>({});
 async function refresh(){
  try{
   const response=await fetch("/api/external/apps",{cache:"no-store"});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"App allocations currently unavailable.");
   setData(result as Data);setError("");
  }catch(e){setError(e instanceof Error?e.message:"Could not load your apps.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();},[]);
 async function requestApp(event:FormEvent<HTMLFormElement>,app:App){
  event.preventDefault();setBusy(app.slug);setError("");setNotice("");
  try{
   const response=await fetch("/api/external/apps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({app:app.slug,reason:reason[app.slug]||""})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Request could not be submitted.");
   await refresh();setNotice(app.name+" request submitted for review. You'll see the decision here.");
  }catch(e){setError(e instanceof Error?e.message:"Could not submit your request.");}
  finally{setBusy(null);}
 }
 const approved=data?.requests.filter(r=>r.status==="approved").length||0;
 const pending=data?.requests.filter(r=>r.status==="pending").length||0;
 return <div className={styles.root}>
  <header className={styles.header}>
   <Link className={styles.brand} href="/"><span className={styles.mark}>M</span><span><strong>MyWCSA <b>GovApps</b></strong><small>EXTERNAL USER WORKSPACE</small></span></Link>
   <div className={styles.headRight}><Link href="/" className={styles.headLink}>Main website ↗</Link>{signOutControl}</div>
  </header>
  <main className={styles.main}>
   <div className={styles.eyebrow}>MYWCSA GOVAPPS · PERSONAL WORKSPACE</div>
   <section className={styles.hero}>
    <div><span className={styles.heroKicker}>WELCOME TO YOUR LAUNCHER</span>
     <h1>Hello, {name}.</h1>
     <p>Find services, request access to applications and track your allocations. Only apps approved for your account can be launched.</p>
     <span className={styles.email}>{email}</span>
    </div><div className={styles.heroVisual} aria-hidden="true"><span>✦</span></div>
   </section>
   <div className={styles.metrics}>
    <div><span>Approved applications</span><strong>{approved}</strong><small>Ready when the app is live</small></div>
    <div><span>Requests in review</span><strong>{pending}</strong><small>Awaiting WCSA approval</small></div>
    <div><span>Your account</span><strong className={styles.statusGood}>Active</strong><small>External User · Personal profile</small></div>
   </div>
   {error&&<div role="alert" className={styles.error}>{error}</div>}
   {notice&&<div role="status" className={styles.success}>{notice}</div>}
   <div className={styles.sectionHead}><div><span className={styles.eyebrow}>APPLICATION ALLOCATIONS</span><h2>Explore and request apps</h2><p>Requesting an app does not automatically give access. An authorised WCSA official reviews the request.</p></div><button className={styles.reload} onClick={()=>void refresh()}>↻ Refresh</button></div>
   {loading&&<div className={styles.loading}>Loading your personal applications…</div>}
   {data&&<div className={styles.apps}>
    {data.apps.map(app=>{
     const state=statusFor(app,data.requests);
     return <section className={styles.appCard} key={app.slug}>
      <div className={styles.appTop}><span className={styles.appGlyph}>{glyphs[app.slug]||"✦"}</span><span className={styles.appCategory}>{app.category}</span></div>
      <h3>{app.name}</h3><p>{app.description}</p>
      <div className={styles.appBottom}>
       {state==="approved"&&app.available&&app.href?<Link className={styles.launch} href={app.href}>Open application ↗</Link>:
        state==="approved"?<span className={styles.pending}>Approved · Launch coming soon</span>:
        state==="pending"?<span className={styles.pending}><span className={styles.dot}/> Request under review</span>:
        <form onSubmit={e=>void requestApp(e,app)}>
         <label htmlFor={"reason-"+app.slug}>Why do you need access? <span>(optional)</span></label>
         <textarea id={"reason-"+app.slug} value={reason[app.slug]||""} maxLength={1200} rows={2}
          onChange={e=>setReason(prev=>({...prev,[app.slug]:e.target.value}))} placeholder="A short description helps the reviewing team."/>
         <button type="submit" disabled={busy!==null}>{busy===app.slug?"Submitting…":state==="declined"?"Request access again →":"Request this app →"}</button>
        </form>}
      </div>
     </section>;
    })}
   </div>}
   <section className={styles.support}>
    <div><strong>Need access help?</strong><p>Contact the WCSA ServiceDesk for registration, account recovery or application questions. Do not share your password with anyone.</p></div>
    <a href="mailto:ServiceDesk@wcsports.co.za?subject=External%20GovApps%20account%20assistance">Contact ServiceDesk ↗</a>
   </section>
   <footer className={styles.footer}>Western Cape Sports Association NPC · MyWCSA GovApps <span>People · Services · Progress</span></footer>
  </main>
 </div>;
}
