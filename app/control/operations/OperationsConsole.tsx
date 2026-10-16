"use client";
import {useCallback,useEffect,useState,type FormEvent, type ReactNode} from "react";
import Link from "next/link";
import s from "./operations.module.css";
type RecordRow=Record<string,unknown>;
type Data={tickets:RecordRow[];notes:RecordRow[];visits:RecordRow[];bookings:RecordRow[];equipment:RecordRow[];
 incidents:RecordRow[];documents:RecordRow[];accounts:RecordRow[];partnerGrants:RecordRow[];
 operators:RecordRow[];serverCheckedAt:string;monitoringLabel:string};
type Payload={operator:{email:string;role:string;display_name?:string};data:Data};
type Tab="overview"|"users"|"apps"|"tickets"|"appointments"|"equipment"|"requests"|"documents"|"errors"|"reports";
const tabs:{id:Tab;label:string;icon:string}[]=[
 {id:"overview",label:"Live Operations",icon:"◉"},{id:"users",label:"Walk-in Users",icon:"♙"},
 {id:"apps",label:"App Allocations",icon:"▦"},{id:"tickets",label:"Ticket Resolution",icon:"☷"},
 {id:"appointments",label:"Appointments",icon:"▤"},{id:"equipment",label:"Equipment",icon:"▣"},
 {id:"requests",label:"Requests",icon:"✉"},{id:"documents",label:"Documents",icon:"▧"},
 {id:"errors",label:"Error Monitor",icon:"⚑"},{id:"reports",label:"Reports",icon:"▥"}];
const str=(r:RecordRow,key:string)=>r[key]==null?"":String(r[key]);
const stamp=(v:unknown)=>typeof v==="string"&&v?new Date(v).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}):"—";
const openTicket=(r:RecordRow)=>!["resolved","rejected","closed"].includes(str(r,"status"));
const isStaff=(r:RecordRow)=>str(r,"role")==="director"||str(r,"role")==="einnovation";
const field={padding:"11px 12px",border:"1px solid #b9d0eb",borderRadius:11,background:"#fafdff",color:"#16366d",fontSize:12,width:"100%"} as const;
function Label({name,children}:{name:string;children:ReactNode}){return <label className={s.label}>{name}{children}</label>}
function Box({title,subtitle,children,actions}:{title:string;subtitle?:string;children:ReactNode;actions?:ReactNode}){
 return <section className={s.panel}><div className={s.panelHead}><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{actions}</div>{children}</section>
}
function Badge({text}:{text:string}){return <span className={s.badge} data-state={text}>{text.replace(/_/g," ")}</span>}
function Blank({text}:{text:string}){return <div className={s.empty}>{text}</div>}
export default function OperationsConsole({initialRole}:{initialRole:string}){
 const [tab,setTab]=useState<Tab>("overview");
 const [payload,setPayload]=useState<Payload|null>(null);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [refreshing,setRefreshing]=useState(false);
 const [lastPoll,setLastPoll]=useState("");
 const [password,setPassword]=useState<{email:string;code:string}|null>(null);
 const [selectedTicket,setSelectedTicket]=useState<number|null>(null);
 const [selectedEquipment,setSelectedEquipment]=useState<number|null>(null);
 const [bookingId,setBookingId]=useState<number|null>(null);
 const [incidentId,setIncidentId]=useState<number|null>(null);
 const [accountType,setAccountType]=useState("external_user");
 const [createAccount,setCreateAccount]=useState(false);
 const [targetType,setTargetType]=useState("staff");
 const [targetApp,setTargetApp]=useState("csd");
 const [targetDecision,setTargetDecision]=useState("approved");
 
 const role=payload?.operator.role||initialRole;
 const mgr=["director","einnovation"].includes(role);
 const support=["director","einnovation","servicedesk"].includes(role);
 const canWrite=role!=="viewer";
 const data=payload?.data;
 const load=useCallback(async(silent=false)=>{
  if(!silent)setRefreshing(true);
  try{
   const r=await fetch("/api/control/operations",{cache:"no-store"});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"Could not retrieve operational records.");
   setPayload(d as Payload);setLastPoll(new Date().toLocaleTimeString("en-ZA"));
   if(!silent)setError("");
  }catch(e){setError(e instanceof Error?e.message:"Monitoring is unavailable.");}
  finally{if(!silent)setRefreshing(false);}
 },[]);
 useEffect(()=>{void load();const timer=setInterval(()=>void load(true),30000);return()=>clearInterval(timer);},[load]);
 async function send(body:Record<string,unknown>,success="Changes saved and audited."){
  setBusy(true);setMessage("");setError("");setPassword(null);
  try{
   const r=await fetch("/api/control/operations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const result=await r.json();
   if(!r.ok)throw new Error(result.error||"The command was not saved.");
   if(typeof result.temporaryPassword==="string")setPassword({email:String(body.email),code:result.temporaryPassword});
   setMessage(success);await load(true);
  }catch(e){setError(e instanceof Error?e.message:"Command could not be saved.");}
  finally{setBusy(false);}
 }
 function form(e:FormEvent<HTMLFormElement>,action:string,extras:Record<string,unknown>={}){
  e.preventDefault();const formData=new FormData(e.currentTarget);
  const body:Record<string,unknown>={action,...extras};
  for(const [k,v] of formData.entries())if(typeof v==="string")body[k]=v;
  if(action==="walkin"){body.create_account=createAccount;body.account_type=accountType;body.guardian_confirmed=formData.get("guardian_confirmed")==="on";}
  void send(body,action==="walkin"?(createAccount?"Account created and walk-in recorded. Safeguard the one-time password.":"Walk-in registered for service."):"Command saved and audit updated.");
 }
 const active=data?.tickets.filter(openTicket).length||0;
 const due=data?.bookings.filter(r=>r.status==="booked"||r.status==="arrived").length||0;
 const openIncidents=data?.incidents.filter(r=>r.status!=="resolved").length||0;
 const inUse=data?.equipment.filter(r=>r.status==="allocated").length||0;
 const tickets=data?.tickets||[];
 const accountOptions=(data?.accounts||[]).filter(r=>r.status==="active");
 return <div className={s.root}>
  <header className={s.header}><Link href="/control" className={s.brand}><span className={s.brandMark}>M</span><span><strong>MyWCSA Command Centre</strong><small>SERVICEDESK · E-INNOVATION · BIT · ICT</small></span></Link>
   <div className={s.headerActions}><span className={s.operator}>{payload?.operator.display_name||payload?.operator.email||"Authorised operator"}</span>
    <button className={s.lightButton} onClick={()=>void load()} disabled={refreshing}>{refreshing?"Checking…":"↻ Refresh"}</button>
    <Link href="/control">← Dashboard</Link></div></header>
  <div className={s.workspace}>
   <aside className={s.sidebar}><span className={s.sideEyebrow}>OPERATIONS & CONTROL</span>
    {tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setError("");setMessage("");}}
     className={tab===t.id?s.selected:""}><span className={s.navIcon}>{t.icon}</span>{t.label}<span className={s.arr}>›</span></button>)}
    <div className={s.sidebarLinks}><Link href="/control/administration">System administration ↗</Link>
     <Link href="/control/administration/external">External approvals ↗</Link>
     <a href="mailto:ServiceDesk@wcsports.co.za">Contact ServiceDesk ↗</a></div>
   </aside>
   <main className={s.main}>
    <div className={s.breadcrumb}>MyWCSA GovApps / Command Centre / <strong>{tabs.find(t=>t.id===tab)?.label}</strong></div>
    <section className={s.hero}><div><span>OPERATIONAL COMMAND · #001484</span>
     <h1>{tabs.find(t=>t.id===tab)?.label}</h1>
     <p>Manage real records, permitted access and accountable service delivery. Updates are recorded in Supabase and checked every 30 seconds.</p></div><div className={s.heroSymbol} aria-hidden="true">✦</div></section>
    <div className={s.statusLine}><span className={s.onlineDot}/> Database monitoring <strong>{lastPoll?"Last checked "+lastPoll:"Connecting…"}</strong>
     <span>30-second polling · not Vercel log streaming</span></div>
    {error&&<div className={s.error} role="alert">{error}<button onClick={()=>setError("")}>Dismiss ×</button></div>}
    {message&&<div className={s.success} role="status">{message}<button onClick={()=>setMessage("")}>×</button></div>}
    {password&&<div className={s.temporary} role="status">
     <strong>One-time GovApps password for {password.email}</strong>
     <p>Copy it to the visitor through an approved private handover. It is shown only now and never stored as plaintext. This is NOT a Microsoft Entra account/password.</p>
     <code>{password.code}</code><button onClick={()=>navigator.clipboard.writeText(password.code)}>Copy</button><button onClick={()=>setPassword(null)}>Hide</button>
    </div>}
    {!data&&<Box title="Connecting to operational services"><Blank text="Loading secure live records…" /></Box>}
    {data&&tab==="overview"&&<>
     <div className={s.stats}>
      <div><span>Open service tickets</span><strong>{active}</strong><small>Current case register</small></div>
      <div><span>Booked appointments</span><strong>{due}</strong><small>Awaiting service</small></div>
      <div><span>Allocated equipment</span><strong>{inUse}</strong><small>Registered devices</small></div>
      <div><span>Unresolved incidents</span><strong>{openIncidents}</strong><small>Reported operational errors</small></div>
     </div>
     <div className={s.dual}>
      <Box title="Operations queue" subtitle="Recent tickets — view details and resolve them">
       {tickets.slice(0,8).length? <div className={s.tableWrap}><table><thead><tr><th>Ref</th><th>Issue</th><th>Team</th><th>Status</th></tr></thead><tbody>{tickets.slice(0,8).map(r=><tr key={String(r.id)}><td>CC-{String(r.id)}</td><td>{str(r,"title")}</td><td>{str(r,"team")}</td><td><Badge text={str(r,"status")}/></td></tr>)}</tbody></table></div>:<Blank text="No recorded tickets yet."/>}
       <button className={s.textButton} onClick={()=>setTab("tickets")}>Manage tickets →</button>
      </Box>
      <Box title="Quick ServiceDesk actions" subtitle="Start the workflow you need">
       <div className={s.quick}>
        <button onClick={()=>setTab("users")}>♙ Register a walk-in visitor <span>→</span></button>
        <button onClick={()=>setTab("apps")}>▦ Allocate / request an app <span>→</span></button>
        <button onClick={()=>setTab("appointments")}>▤ Book an appointment <span>→</span></button>
        <button onClick={()=>setTab("equipment")}>▣ Add equipment <span>→</span></button>
        <button onClick={()=>setTab("documents")}>▧ Upload official documents <span>→</span></button>
       </div>
      </Box>
     </div>
     <Box title="Monitoring scope" subtitle="Actual production records, not simulated infrastructure statistics">
      <p className={s.note}>This page polls the Supabase service queues and incident register every 30 seconds. Vercel deployment logs, Microsoft Entra sign-in logs, network uptime and remote device telemetry are not yet connected. Error counts include only incidents actually recorded in this system.</p>
     </Box>
    </>}
    {data&&tab==="users"&&<>
     {support?<Box title="Walk-in registration & assisted account creation" subtitle="Quick intake for visitors who arrive at a WCSA office">
      <form className={s.form} onSubmit={e=>form(e,"walkin")}>
       <div className={s.grid2}>
        <Label name="Visitor category"><select value={accountType} onChange={e=>setAccountType(e.target.value)} style={field}><option value="external_user">External User</option><option value="business_partner">Business Partner</option><option value="staff">Staff</option></select></Label>
        <Label name="Visitor name and surname"><input name="name" minLength={2} maxLength={150} required style={field} placeholder="Name Surname"/></Label>
        <Label name="Email address"><input name="email" type="email" required style={field} placeholder={accountType==="staff"?"person@wcsports.co.za":"person@example.com"}/></Label>
        <Label name="Reason for office visit"><input name="purpose" minLength={4} maxLength={700} required style={field} placeholder="Account assistance, application or walk-in service"/></Label>
       </div>
       <label className={s.check}><input type="checkbox" checked={createAccount} onChange={e=>setCreateAccount(e.target.checked)} disabled={!mgr}/> {mgr?"Create a GovApps account during this visit":"Record visit only · account creation needs e-Innovation/Director"}</label>
       {createAccount&&mgr&&<div className={s.subPanel}>
        <strong>Account setup requirements</strong>
        <p>{accountType==="staff"?"Creates a separate GovApps password login ONLY. Microsoft Entra identities are NOT created.":accountType==="business_partner"?"A valid existing WCSA ID from the Registry is required.": "The visitor needs a valid username and date of birth. Record parent/guardian verification when applicable."}</p>
        {accountType!=="staff"&&<div className={s.grid2}>
          <Label name="Username"><input name="username" minLength={4} maxLength={64} required style={field} placeholder="Choose username"/></Label>
          {accountType==="external_user"?<Label name="Date of birth"><input name="dob" type="date" required style={field}/></Label>:
           <Label name="Issued WCSA ID"><input name="wcsa_id" required style={field} placeholder="Verified Registry identifier"/></Label>}
        </div>}
        {accountType==="external_user"&&<label className={s.check}><input type="checkbox" name="guardian_confirmed"/> Parent/guardian authorisation verified for minors, where applicable</label>}
       </div>}
       <button className={s.primary} type="submit" disabled={busy}>{busy?"Saving…":createAccount?"Create account & record visit":"Record visitor"}</button>
      </form>
     </Box>:<Box title="Walk-in intake"><Blank text="ServiceDesk / e-Innovation authority required." /></Box>}
     {support&&<Box title="Recent office visitors" subtitle="Served, referred or pending visits">
      {data.visits.length?<div className={s.tableWrap}><table><thead><tr><th>Visitor</th><th>Account type</th><th>Reason</th><th>Time</th><th>Status</th><th>Update</th></tr></thead><tbody>
       {data.visits.map(r=><tr key={String(r.id)}><td><strong>{str(r,"visitor_name")}</strong><small>{str(r,"visitor_email")}</small></td><td>{str(r,"account_type").replace(/_/g," ")}</td><td>{str(r,"purpose")}</td><td>{stamp(r.created_at)}</td><td><Badge text={str(r,"status")}/></td><td>{canWrite?<select defaultValue={str(r,"status")} onChange={e=>void send({action:"visit_status",id:r.id,status:e.target.value},"Visitor status updated.")} disabled={busy} style={field}>{["open","served","referred","cancelled"].map(x=><option key={x} value={x}>{x}</option>)}</select>:null}</td></tr>)}
      </tbody></table></div>:<Blank text="No walk-in visits registered yet."/>}
     </Box>}
    </>}
    {data&&tab==="apps"&&<>
     {mgr&&<Box title="Allocate applications per account" subtitle="Select staff, external or Business Partner. Protected PERSAL and internal roles remain separate.">
      <form className={s.form} onSubmit={e=>{
       e.preventDefault();const fd=new FormData(e.currentTarget);
       const accountId=String(fd.get("account_id")||"");
       const email=String(fd.get("staff_email")||"");
       const reason=String(fd.get("reason")||"");
       void send(targetType==="staff"?{action:"staff_app",email,app:targetApp,enabled:targetDecision==="approved"}:
        targetType==="external_user"?{action:"external_app",account_id:accountId,app:targetApp,reason}:
        {action:"partner_app",account_id:accountId,decision:targetDecision},
        targetType==="external_user"?"External access request submitted. Final approval is reviewed separately.":"App allocation saved and audited.");
      }}>
       <div className={s.grid2}>
        <Label name="Account type"><select style={field} value={targetType} onChange={e=>{setTargetType(e.target.value);setTargetApp(e.target.value==="business_partner"?"wcda-events":e.target.value==="external_user"?"membership":"csd");}}>
         <option value="staff">Staff</option><option value="external_user">External User</option><option value="business_partner">Business Partner</option></select></Label>
        {targetType==="staff"?<Label name="WCSA staff email"><input style={field} type="email" name="staff_email" required placeholder="person@wcsports.co.za"/></Label>:
         <Label name="Existing account"><select style={field} name="account_id" required defaultValue=""><option value="">Choose a registered account</option>
          {accountOptions.filter(r=>str(r,"account_type")===targetType).map(r=><option key={String(r.id)} value={String(r.id)}>{str(r,"username")} · {str(r,"email")}{targetType==="business_partner"?" · "+str(r,"wcsa_id"):""}</option>)}
         </select></Label>}
        <Label name="Application"><select style={field} value={targetApp} onChange={e=>setTargetApp(e.target.value)}>
         {(targetType==="staff"?["csd","applications","membership"]:targetType==="external_user"?["membership","wcda-events","applications"]:["wcda-events"]).map(a=><option key={a} value={a}>{a==="wcda-events"?"MyWCDA Events":a==="csd"?"MyWCSA CSD":"MyWCSA "+a.slice(0,1).toUpperCase()+a.slice(1)}</option>)}
        </select></Label>
        {targetType==="external_user"?<Label name="Application request reason"><input style={field} name="reason" maxLength={1200} placeholder="Office-assisted request for review"/></Label>:
         <Label name="Allocation decision"><select style={field} value={targetDecision} onChange={e=>setTargetDecision(e.target.value)}>
          <option value="approved">Allocate / approve</option><option value={targetType==="staff"?"revoked":"revoked"}>Revoke</option>
          {targetType==="business_partner"&&<option value="pending">Pending</option>}
         </select></Label>}
       </div>
       <button className={s.primary} disabled={busy}>Save application decision</button>
      </form>
      <p className={s.note}>External user requests require their separate approval queue. PERSAL, AMS, Command Centre and WCDA staff appointments cannot be granted from this general allocator.</p>
      <Link className={s.textButton} href="/control/administration/external">Review External User requests →</Link>
     </Box>}
     {support&&<Box title="Existing partner application decisions" subtitle="WCDA organiser access, linked to verified WCSA IDs">
      {data.partnerGrants.length?<div className={s.tableWrap}><table><thead><tr><th>Partner</th><th>App</th><th>Status</th><th>Reviewed</th></tr></thead><tbody>{data.partnerGrants.map(r=><tr key={String(r.account_id)+String(r.app_slug)}><td>{accountOptions.find(a=>a.id===r.account_id)?.email as string||String(r.account_id)}</td><td>{str(r,"app_slug")}</td><td><Badge text={str(r,"status")}/></td><td>{stamp(r.updated_at)}</td></tr>)}</tbody></table></div>:<Blank text="No Business Partner app decisions yet."/>}
     </Box>}
    </>}
    {data&&tab==="tickets"&&<>
     <Box title="Ticket monitoring & resolution" subtitle="Case status and ticket worklog, with audited solution records">
      {tickets.length?<div className={s.tableWrap}><table><thead><tr><th>Case</th><th>Issue</th><th>Team</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>{tickets.map(r=><tr key={String(r.id)}>
       <td>CC-{String(r.id)}</td><td><strong>{str(r,"title")}</strong><small>{str(r,"kind")} · {str(r,"priority")}</small></td><td>{str(r,"team")}</td><td><Badge text={str(r,"status")}/></td><td>{stamp(r.updated_at)}</td>
       <td><button className={s.textButton} onClick={()=>setSelectedTicket(Number(r.id))}>Open ticket →</button></td>
      </tr>)}</tbody></table></div>:<Blank text="No service tickets have been recorded."/>}
     </Box>
     {selectedTicket!==null&&(()=>{
      const current=tickets.find(r=>r.id===selectedTicket);
      if(!current)return null;
      const notes=data.notes.filter(r=>r.request_id===selectedTicket);
      return <Box title={"Case CC-"+selectedTicket} subtitle={str(current,"title")} actions={<button className={s.lightButton} onClick={()=>setSelectedTicket(null)}>Close detail ×</button>}>
       <p className={s.note}>{str(current,"description")}</p>
       <div className={s.info}>Owning team: <b>{str(current,"team")}</b> · Status: <Badge text={str(current,"status")}/> · Assignee: {str(current,"assignee")||"Unassigned"}</div>
       <h3 className={s.subhead}>Worklog & case history</h3>
       {notes.length?notes.map(r=><div className={s.logRow} key={String(r.id)}><b>{str(r,"update_kind")}</b> <span>{str(r,"actor_email")} · {stamp(r.created_at)}</span><p>{str(r,"content")}</p></div>):<Blank text="No ticket notes yet."/>}
       {canWrite&&<form className={s.form} onSubmit={e=>form(e,"ticket_note",{ticket_id:selectedTicket})}>
        <Label name="Add troubleshooting note"><textarea style={field} minLength={10} maxLength={3000} rows={3} name="content" required placeholder="Work completed, investigation or next action"/></Label>
        <input type="hidden" name="kind" value="worklog"/>
        <button className={s.primary} disabled={busy}>Save worklog note</button>
       </form>}
       {canWrite&&openTicket(current)&&!["staff_account","business_partner","access"].includes(str(current,"kind"))&&
        <form className={s.form} onSubmit={e=>form(e,"solve_ticket",{ticket_id:selectedTicket})}>
         <Label name="Record solution and resolve ticket"><textarea style={field} name="content" required minLength={10} maxLength={3000} rows={3} placeholder="Describe the verified resolution, steps performed and outcome"/></Label>
         <button className={s.primary} disabled={busy}>Record solution & resolve ticket</button>
        </form>}
       {["staff_account","business_partner","access"].includes(str(current,"kind"))&&<p className={s.note}>Identity and access tickets require separate e-Innovation approval and fulfilment confirmation. They cannot be marked solved here.</p>}
      </Box>;
     })()}
    </>}
    {data&&tab==="appointments"&&<>
     {support&&<Box title="New appointment / booking" subtitle="Reserve an available operator, prevent conflicting appointment times">
      <form className={s.form} onSubmit={e=>form(e,"book_appointment")}>
       <div className={s.grid2}>
        <Label name="Visitor name"><input name="name" style={field} required minLength={2} maxLength={150} placeholder="Name Surname"/></Label>
        <Label name="Visitor email"><input name="email" style={field} required type="email" placeholder="visitor@example.com"/></Label>
        <Label name="Appointment purpose"><input name="service" style={field} required minLength={4} maxLength={140} placeholder="Account, device, Helpdesk or onboarding support"/></Label>
        <Label name="Service team"><select style={field} name="team"><option value="servicedesk">ServiceDesk</option><option value="einnovation">e-Innovation</option><option value="ict">ICT</option><option value="bit">BiT</option></select></Label>
        <Label name="Assigned operator"><select name="assignee" style={field} required defaultValue=""><option value="">Choose active operator</option>{data.operators.filter(o=>o.active===true).map(o=><option key={String(o.email)} value={String(o.email)}>{str(o,"display_name")||str(o,"email")} · {str(o,"email")}</option>)}</select></Label>
        <Label name="Start date & time"><input style={field} type="datetime-local" name="starts_at" required/></Label>
        <Label name="Duration"><select style={field} name="minutes"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">90 minutes</option><option value="120">2 hours</option></select></Label>
        <Label name="Appointment notes"><input name="notes" style={field} maxLength={900} placeholder="Optional preparation details"/></Label>
       </div>
       <button className={s.primary} disabled={busy}>Confirm appointment</button>
      </form>
     </Box>}
     {support&&<Box title="Upcoming and historic bookings" subtitle="Bookings are protected against overlapping appointments for the same operator">
      {data.bookings.length?<div className={s.tableWrap}><table><thead><tr><th>Visitor</th><th>Purpose</th><th>Assigned to</th><th>Time</th><th>Status</th><th>Manage</th></tr></thead><tbody>{data.bookings.map(r=><tr key={String(r.id)}>
       <td><strong>{str(r,"visitor_name")}</strong><small>{str(r,"visitor_email")}</small></td><td>{str(r,"service")}</td><td>{str(r,"assigned_to")}</td><td>{stamp(r.starts_at)}</td><td><Badge text={str(r,"status")}/></td>
       <td>{canWrite&&["booked","arrived"].includes(str(r,"status"))?<select style={field} defaultValue="" disabled={busy} onChange={e=>{if(e.target.value)void send({action:"booking_status",id:r.id,status:e.target.value},"Appointment updated.");}}><option value="">Change state…</option>{["arrived","completed","cancelled","no_show"].map(v=><option value={v} key={v}>{v}</option>)}</select>:null}</td>
      </tr>)}</tbody></table></div>:<Blank text="No appointments have been booked."/>}
     </Box>}
    </>}
    {data&&tab==="equipment"&&<>
     {["director","einnovation","ict"].includes(role)&&<Box title="Register ICT equipment" subtitle="Permanent asset tag, category, serial, location and condition">
      <form className={s.form} onSubmit={e=>form(e,"equipment_add")}>
       <div className={s.grid2}>
        <Label name="Asset tag"><input name="asset_tag" style={field} required minLength={3} maxLength={100} placeholder="WCSA-ICT-0001"/></Label>
        <Label name="Device or equipment name"><input name="item_name" style={field} required minLength={3} maxLength={140} placeholder="Dell laptop / HP printer"/></Label>
        <Label name="Equipment category"><select style={field} name="equipment_type">{["computer","mobile","network","peripheral","other"].map(v=><option value={v} key={v}>{v}</option>)}</select></Label>
        <Label name="Serial number"><input style={field} name="serial_number" maxLength={140} placeholder="Manufacturer serial"/></Label>
        <Label name="Location / office"><input style={field} name="location" maxLength={180} placeholder="ICT storeroom / office"/></Label>
        <Label name="Notes"><input name="notes" style={field} maxLength={1200} placeholder="Condition, invoice ref, equipment details"/></Label>
       </div><button className={s.primary} disabled={busy}>Register equipment</button>
      </form>
     </Box>}
     <Box title="Equipment and custody register" subtitle="Actual equipment records, not a sample inventory">
      {data.equipment.length?<div className={s.tableWrap}><table><thead><tr><th>Asset tag</th><th>Device</th><th>Type</th><th>Condition</th><th>Custodian</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.equipment.map(r=><tr key={String(r.id)}>
       <td><strong>{str(r,"asset_tag")}</strong><small>{str(r,"serial_number")}</small></td><td>{str(r,"item_name")}</td><td>{str(r,"equipment_type")}</td><td>{str(r,"condition")}</td><td>{str(r,"custodian_email")||"Unallocated"}</td><td><Badge text={str(r,"status")}/></td>
       <td>{["director","einnovation","ict"].includes(role)?<button className={s.textButton} onClick={()=>setSelectedEquipment(Number(r.id))}>Update →</button>:null}</td>
      </tr>)}</tbody></table></div>:<Blank text="No equipment registered yet."/>}
     </Box>
     {selectedEquipment!==null&&["director","einnovation","ict"].includes(role)&&<Box title={"Update asset #"+selectedEquipment} subtitle="Assign, return, repair or retire equipment">
      <form className={s.form} onSubmit={e=>form(e,"equipment_update",{id:selectedEquipment})}>
       <div className={s.grid2}>
        <Label name="Asset status"><select name="status" style={field} defaultValue="available">{["available","allocated","repair","retired"].map(v=><option value={v} key={v}>{v}</option>)}</select></Label>
        <Label name="Physical condition"><select name="condition" style={field}>{["good","new","needs_repair","unusable"].map(v=><option value={v} key={v}>{v}</option>)}</select></Label>
        <Label name="Custodian email (required for allocation)"><input type="email" style={field} name="custodian_email" placeholder="staff@wcsports.co.za"/></Label>
       </div>
       <button disabled={busy} className={s.primary}>Save equipment custody</button>
      </form>
     </Box>}
     <Box title="Request a device / equipment" subtitle="Formal request routed to ICT, followed by allocation through the existing request workflow">
      <p className={s.note}>Device requisitions are recorded in the main Service Request queue, where ICT can manage approvals and fulfilment.</p><Link className={s.textButton} href="/control">Open Service Requests & create device request →</Link>
     </Box>
    </>}
    {data&&tab==="requests"&&<div className={s.dual}>
     <Box title="Operational request types" subtitle="Existing routed ServiceDesk workflow">
      <div className={s.quick}>{["Device request → ICT","Software request → BiT","Staff onboarding → e-Innovation","Business Partner onboarding → e-Innovation","Technical assistance → ServiceDesk"].map(label=><Link key={label} href="/control">{label} <span>→</span></Link>)}</div>
      <p className={s.note}>Requests and approvals use the original Command Centre queue. This page links to that existing functionality rather than creating disconnected duplicates.</p>
     </Box>
     <Box title="Pending service requests">
      {tickets.filter(openTicket).length?<div className={s.tableWrap}><table><thead><tr><th>Request</th><th>Team</th><th>Priority</th></tr></thead><tbody>{tickets.filter(openTicket).slice(0,12).map(r=><tr key={String(r.id)}><td>{str(r,"title")}</td><td>{str(r,"team")}</td><td>{str(r,"priority")}</td></tr>)}</tbody></table></div>:<Blank text="No outstanding service requests."/>}
     </Box>
    </div>}
    {data&&tab==="documents"&&<>
     {support&&<Box title="Secure document registration" subtitle="Private Supabase Storage · maximum 5 MB · PDF, PNG, JPEG or TXT">
      <form className={s.form} onSubmit={async e=>{
       e.preventDefault();setBusy(true);setError("");setMessage("");
       try{const fd=new FormData(e.currentTarget);
        const r=await fetch("/api/control/operations/files",{method:"POST",body:fd});
        const body=await r.json();if(!r.ok)throw new Error(body.error||"File could not be uploaded.");
        setMessage("Document securely stored. Download requires Command Centre authorisation.");await load(true);
       }catch(err){setError(err instanceof Error?err.message:"Document upload failed.");}finally{setBusy(false);}
      }}>
       <div className={s.grid2}>
        <Label name="Document title"><input style={field} name="title" required minLength={3} maxLength={160} placeholder="Official approval / handover record"/></Label>
        <Label name="Category"><select style={field} name="category">{["account","ticket","asset","appointment","policy","other"].map(v=><option key={v} value={v}>{v}</option>)}</select></Label>
        <Label name="Related reference ID (optional)"><input type="number" min={1} style={field} name="related_id" placeholder="Ticket / equipment / booking number"/></Label>
        <Label name="Choose file"><input style={field} name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" required/></Label>
       </div>
       <button className={s.primary} disabled={busy}>{busy?"Uploading…":"Upload to private register"}</button>
      </form>
     </Box>}
     {support&&<Box title="Document library" subtitle="Authorised downloads only; no public URLs or exposed storage keys">
      {data.documents.length?<div className={s.tableWrap}><table><thead><tr><th>Document</th><th>Category</th><th>Uploaded by</th><th>Date</th><th>Download</th></tr></thead><tbody>{data.documents.map(r=><tr key={String(r.id)}>
       <td><strong>{str(r,"title")}</strong><small>{str(r,"file_name")}</small></td><td>{str(r,"category")}</td><td>{str(r,"uploaded_by")}</td><td>{stamp(r.created_at)}</td><td><a className={s.textButton} href={"/api/control/operations/files?id="+encodeURIComponent(String(r.id))}>Download ↗</a></td>
      </tr>)}</tbody></table></div>:<Blank text="No official documents have been uploaded yet."/>}
     </Box>}
    </>}
    {data&&tab==="errors"&&<>
     <Box title="Operational incidents & error monitoring" subtitle="Actual Command Centre incidents. This is not a replacement for Vercel logs or Microsoft sign-in monitoring.">
      <div className={s.info}>Open incidents: <b>{openIncidents}</b> · Last database check: {lastPoll||"Pending"} · Source: Supabase incident records</div>
      {data.incidents.length?<div className={s.tableWrap}><table><thead><tr><th>Severity</th><th>Source</th><th>Message</th><th>Route</th><th>Time</th><th>Status</th><th>Change</th></tr></thead><tbody>{data.incidents.map(r=><tr key={String(r.id)}>
       <td><Badge text={str(r,"level")}/></td><td>{str(r,"source")}</td><td>{str(r,"message")}</td><td>{str(r,"route")}</td><td>{stamp(r.occurred_at)}</td><td><Badge text={str(r,"status")}/></td>
       <td>{support&&<select defaultValue="" disabled={busy} style={field} onChange={e=>{if(e.target.value)void send({action:"incident_status",id:r.id,status:e.target.value});}}><option value="">Update…</option>{["open","investigating","resolved"].map(v=><option key={v} value={v}>{v}</option>)}</select>}</td>
      </tr>)}</tbody></table></div>:<Blank text="No operational incidents have been logged."/>}
     </Box>
     {support&&<Box title="Record a reported error or incident" subtitle="Report an error without including passwords, secrets or personal ID numbers">
      <form className={s.form} onSubmit={e=>form(e,"incident")}>
       <div className={s.grid2}><Label name="Source"><input style={field} name="source" placeholder="GovApps launcher / WorkHub" minLength={2} maxLength={80} required/></Label>
        <Label name="Severity"><select style={field} name="level">{["info","warning","error","critical"].map(v=><option key={v} value={v}>{v}</option>)}</select></Label>
        <Label name="Affected route"><input style={field} name="route" maxLength={180} placeholder="/workhub"/></Label>
        <Label name="Description"><input style={field} name="message" minLength={5} maxLength={1000} required placeholder="Observed problem and impact"/></Label>
       </div><button className={s.primary} disabled={busy}>Record incident</button>
      </form>
     </Box>}
    </>}
    {data&&tab==="reports"&&<Box title="Operational reports & exports" subtitle="Current database extracts; no invented activity or figures">
     <div className={s.stats}>
      <div><span>Total service tickets</span><strong>{data.tickets.length}</strong><small>In retrieved 150-record window</small></div>
      <div><span>Walk-in visits</span><strong>{data.visits.length}</strong><small>Latest visitor register</small></div>
      <div><span>Equipment items</span><strong>{data.equipment.length}</strong><small>Registered devices</small></div>
      <div><span>Bookings</span><strong>{data.bookings.length}</strong><small>Latest appointments</small></div>
     </div>
     {support?<div className={s.reportGrid}>{["tickets","visits","equipment","bookings","incidents"].map(k=><a key={k} href={"/api/control/operations?report="+k} className={s.export}>▧ Export {k} CSV <span>↓</span></a>)}</div>:
      <p className={s.note}>Exports require ServiceDesk or management permission.</p>}
     <p className={s.note}>Exports use the latest records permitted for your role. Counts and charts are snapshots, not financial forecasts or authoritative Vercel performance analytics.</p>
    </Box>}
    <footer className={s.footer}>© {new Date().getFullYear()} WC Sports Association NPC · MyWCSA GovApps · Operations & Control <span>Authorised operators only · Audited actions</span></footer>
   </main>
  </div>
 </div>;
}
