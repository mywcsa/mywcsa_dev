"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type {
  ControlOperator, ControlRequest, ControlAllocation, ControlData,
  ControlRole,
} from "@/lib/control/centre";
import { WorkHubIcon, type WorkHubIconName } from "../workhub/WorkHubIcon";
import s from "./control.module.css";

type Data = ControlData & { operator: ControlOperator };
type Tab = "overview"|"requests"|"allocations"|"accounts"|"audit"|"permissions";
type Action = "create_request"|"update_request"|"create_allocation"|"update_allocation"|"set_operator";
type Modal = { action: Action; request?: ControlRequest; allocation?: ControlAllocation; operator?: ControlOperator };

const nav: { id: Tab; label: string; icon: WorkHubIconName }[] = [
  { id:"overview",label:"Command overview",icon:"house" },
  { id:"requests",label:"Service requests",icon:"ticket" },
  { id:"allocations",label:"Allocations & assets",icon:"briefcase" },
  { id:"accounts",label:"Accounts & onboarding",icon:"users" },
  { id:"audit",label:"Audit activity",icon:"activity" },
  { id:"permissions",label:"Operator permissions",icon:"shield" },
];
const kinds: Record<string,string> = {
  support:"Helpdesk support",staff_account:"Staff account",business_partner:"Business Partner",
  access:"Access & permissions",device:"ICT device",software:"BiT software",other:"Other request",
};
const teams: Record<string,string> = { servicedesk:"ServiceDesk",einnovation:"e-Innovation",bit:"BiT",ict:"ICT" };
const statuses: Record<string,string> = {
  new:"New",triage:"Triage",assigned:"Assigned",awaiting_approval:"Awaiting approval",
  approved:"Approved",in_progress:"In progress",resolved:"Resolved",rejected:"Rejected",closed:"Closed",
};
const roleNames: Record<string,string> = {
  director:"Executive Director",einnovation:"e-Innovation",servicedesk:"ServiceDesk",
  bit:"BiT",ict:"ICT",viewer:"Read-only",
};
const date = (v?: string | null) => v ? new Date(v).toLocaleDateString("en-ZA",{year:"numeric",month:"short",day:"numeric"}) : "—";
const ref = (id: number) => "CC-" + String(id).padStart(6,"0");
const openStatus = (status: string) => !["resolved","rejected","closed"].includes(status);
const writingRoles: ControlRole[] = ["director","einnovation","servicedesk","bit","ict"];

function Glyph({ name, size=18 }: { name:WorkHubIconName; size?:number }) {
  return <WorkHubIcon name={name} size={size}/>;
}
function Tag({ value }: { value:string }) {
  return <span className={s.tag} data-state={value}>{statuses[value]||value.replace(/_/g," ")}</span>;
}
function StatCard({label,value,detail,icon}:{label:string;value:number|string;detail:string;icon:WorkHubIconName}) {
  return <div className={s.statCard}>
    <div className={s.statIcon}><Glyph name={icon} size={22}/></div>
    <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
  </div>;
}
function Panel({title,subtitle,action,children}:{title:string;subtitle?:string;action?:ReactNode;children:ReactNode}) {
  return <section className={s.panel}>
    <div className={s.panelHead}><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>
    {children}
  </section>;
}
function Empty({text}:{text:string}) {
  return <div className={s.empty}><Glyph name="clipboard" size={26}/><strong>No records to display</strong><p>{text}</p></div>;
}
function Field({label,name,children}:{label:string;name:string;children:ReactNode}) {
  return <label className={s.field}><span>{label}</span>{children}</label>;
}
function Option({value,children}:{value:string;children:ReactNode}) {
  return <option value={value}>{children}</option>;
}
export default function ControlDashboard({ initial }: { initial:Data }) {
  const [data,setData]=useState(initial);
  const [tab,setTab]=useState<Tab>("overview");
  const [team,setTeam]=useState("all");
  const [query,setQuery]=useState("");
  const [modal,setModal]=useState<Modal|null>(null);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState<{type:"success"|"error";text:string}|null>(null);
  const [refreshing,setRefreshing]=useState(false);
  const role=data.operator.role;
  const canWrite=writingRoles.includes(role);
  const canAlloc=["director","einnovation","bit","ict"].includes(role);
  const canManage=role==="director";
  const canSeeAccounts=["director","einnovation","servicedesk"].includes(role);
  const openRequests=data.requests.filter(r=>openStatus(r.status));
  const onboarding=data.requests.filter(r=>["staff_account","business_partner","access"].includes(r.kind));
  const pendingApprovals=data.requests.filter(r=>r.status==="awaiting_approval");

  const visibleRequests=useMemo(()=>data.requests.filter(r=>
    (team==="all"||r.team===team) &&
    [r.title,r.description,r.target_email||"",r.wcsa_id||"",r.status,ref(r.id)].join(" ").toLowerCase().includes(query.toLowerCase())
  ),[data.requests,team,query]);

  async function reload() {
    setRefreshing(true);
    try {
      const response=await fetch("/api/control",{cache:"no-store"});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"Refresh failed.");
      setData(json as Data);
      setNotice(null);
    } catch(error) {
      setNotice({type:"error",text:error instanceof Error?error.message:"Unable to refresh."});
    } finally {setRefreshing(false);}
  }

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!modal) return;
    setBusy(true);
    setNotice(null);
    const body:Record<string,unknown>={action:modal.action};
    for(const [key,value] of new FormData(event.currentTarget).entries()) if(typeof value==="string") body[key]=value;
    if(modal.action==="update_request") body.id=modal.request?.id;
    if(modal.action==="update_allocation") body.id=modal.allocation?.id;
    if(modal.action==="set_operator") body.active=body.active==="true";
    if(modal.action==="create_allocation"&&!body.reference_request_id) body.reference_request_id=null;
    try {
      const response=await fetch("/api/control",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"The command could not be saved.");
      setModal(null);
      await reload();
      setNotice({type:"success",text:"Command recorded successfully. The audit log was updated."});
    } catch(error) {
      setNotice({type:"error",text:error instanceof Error?error.message:"The command could not be saved."});
    } finally {setBusy(false);}
  }

  function openRequest(kind="support") {
    setModal({action:"create_request",request:{kind} as ControlRequest});
  }

  const queue=(rows:ControlRequest[])=>rows.length?<div className={s.tableScroll}><table className={s.table}>
    <thead><tr><th>Reference / request</th><th>Route</th><th>Priority</th><th>Status</th><th>Submitted</th><th/></tr></thead>
    <tbody>{rows.map(r=><tr key={r.id}>
      <td><strong>{r.title}</strong><small>{ref(r.id)} · {kinds[r.kind]||r.kind}</small></td>
      <td>{teams[r.team]||r.team}<small>{r.assignee||"Not assigned"}</small></td>
      <td><span className={s.priority} data-priority={r.priority}>{r.priority}</span></td>
      <td><Tag value={r.status}/></td><td>{date(r.created_at)}</td>
      <td>{canWrite?<button className={s.tableAction} onClick={()=>setModal({action:"update_request",request:r})}>Manage ↗</button>:<span className={s.muted}>Read-only</span>}</td>
    </tr>)}</tbody>
  </table></div>:<Empty text="Submitted requests will appear here after an authorised operator creates one."/>;

  return <div className={s.root}>
    <header className={s.header}>
      <Link href="/my-apps" className={s.brand}><span className={s.logoWrap}><img src="/mywcsa-logo.png" alt="MyWCSA GovApps"/></span>
        <span><strong>MyWCSA <b>Command Centre</b></strong><small>SERVICEDESK · E-INNOVATION · BIT · ICT</small></span></Link>
      <div className={s.headerRight}>
        <div className={s.authStatus}><span className={s.greenDot}/><strong>Authorised operator</strong><small>{roleNames[role]}</small></div>
        <button className={s.headerButton} onClick={reload} disabled={refreshing}><Glyph name="activity" size={17}/>{refreshing?"Refreshing…":"Refresh"}</button>
        <Link href="/my-apps" className={s.headerButton}><Glyph name="external" size={17}/> GovApps</Link>
      </div>
    </header>
    <div className={s.workspace}>
      <aside className={s.sidebar}>
        <div className={s.sideLabel}>COMMAND & CONTROL</div>
        <nav className={s.navigation} aria-label="Control Centre">
          {nav.filter(n=>n.id!=="permissions"||canManage).map(n=><button key={n.id}
            className={tab===n.id?s.selected:""} onClick={()=>{setTab(n.id);setQuery("");}}>
            <Glyph name={n.icon}/><span>{n.label}</span><Glyph name="chevron" size={15}/>
          </button>)}
        </nav>
        <div className={s.sideDivider}/>
        <div className={s.sideLabel}>TEAM CHANNELS</div>
        <div className={s.teamChannels}>{Object.entries(teams).map(([key,name])=><button key={key} onClick={()=>{setTeam(key);setTab("requests");}}>
          <span className={s.teamBullet} data-team={key}/><span>{name}</span>
          <strong>{openRequests.filter(r=>r.team===key).length}</strong>
        </button>)}</div>
        <div className={s.sideHelp}><Glyph name="shield" size={21}/><strong>Protected operations</strong><span>Every command uses role-based approval and an audit trail.</span><a href="mailto:ServiceDesk@wcsports.co.za">Need help? ↗</a></div>
      </aside>
      <main className={s.main}>
        <div className={s.breadcrumb}>GovApps <span>/</span> Command Centre <span>/</span> <strong>{nav.find(n=>n.id===tab)?.label}</strong></div>
        <section className={s.hero}><div><span className={s.kicker}>MYWCSA · OPERATIONAL CONTROL</span>
          <h1>{tab==="overview"?"One command. Every service.":nav.find(n=>n.id===tab)?.label}</h1>
          <p>{tab==="overview"?"Route requests, coordinate technical teams, manage onboarding and maintain controlled allocations from one secure workspace.":"Authorised operational records, staff coordination and accountable service delivery."}</p>
          <div className={s.heroButtons}>{canWrite&&<button onClick={()=>openRequest()}><Glyph name="ticket" size={17}/> New service request</button>}
            {canAlloc&&<button onClick={()=>setModal({action:"create_allocation"})}><Glyph name="briefcase" size={17}/> Record allocation</button>}</div>
        </div><div className={s.heroOrbits} aria-hidden="true"><span><Glyph name="shield" size={37}/></span></div></section>

        {notice&&<div className={notice.type==="success"?s.successNotice:s.errorNotice} role="status"><span>{notice.text}</span><button onClick={()=>setNotice(null)} aria-label="Dismiss message">×</button></div>}

        {tab==="overview"&&<>
          <div className={s.statGrid}>
            <StatCard label="Active requests" value={openRequests.length} detail="Across all service teams" icon="ticket"/>
            <StatCard label="Awaiting approvals" value={pendingApprovals.length} detail="Restricted authorisation queue" icon="check"/>
            <StatCard label="Current allocations" value={data.allocations.filter(a=>a.status==="allocated").length} detail="Devices, software and access" icon="briefcase"/>
            <StatCard label="Account onboarding" value={onboarding.filter(r=>openStatus(r.status)).length} detail="Staff and Business Partners" icon="users"/>
          </div>
          <div className={s.twoCols}>
            <Panel title="Operational queue" subtitle="Latest requests routed to ServiceDesk, e-Innovation, BiT and ICT" action={<button className={s.textAction} onClick={()=>setTab("requests")}>View all →</button>}>
              {queue(data.requests.slice(0,7))}
            </Panel>
            <Panel title="Quick commands" subtitle="Choose an operational workflow">
              <div className={s.quickActions}>
                <button disabled={!canWrite} onClick={()=>openRequest("staff_account")}><Glyph name="users"/> <span><strong>Staff account onboarding</strong><small>Submit Entra identity provisioning request</small></span><Glyph name="arrow" size={17}/></button>
                <button disabled={!canWrite} onClick={()=>openRequest("business_partner")}><Glyph name="id"/> <span><strong>Business Partner onboarding</strong><small>Verification and account setup request</small></span><Glyph name="arrow" size={17}/></button>
                <button disabled={!canWrite} onClick={()=>openRequest("device")}><Glyph name="briefcase"/> <span><strong>ICT device request</strong><small>Equipment and hardware allocations</small></span><Glyph name="arrow" size={17}/></button>
                <button disabled={!canWrite} onClick={()=>openRequest("software")}><Glyph name="grid"/> <span><strong>BiT software request</strong><small>Apps, licensing and platform services</small></span><Glyph name="arrow" size={17}/></button>
              </div>
            </Panel>
          </div>
          <Panel title="Service ownership" subtitle="Requests are assigned to the correct specialist team">
            <div className={s.teamGrid}>{Object.entries(teams).map(([key,label])=><button key={key} onClick={()=>{setTeam(key);setTab("requests");}}>
              <span className={s.teamBullet} data-team={key}/><strong>{label}</strong><span>{openRequests.filter(r=>r.team===key).length} open</span><Glyph name="arrow" size={17}/></button>)}</div>
          </Panel>
        </>}

        {tab==="requests"&&<Panel title="Service request register" subtitle="Live work orders, account requests, support tickets and assignments"
          action={canWrite?<button className={s.primarySmall} onClick={()=>openRequest()}>+ New request</button>:null}>
          <div className={s.controls}><label><Glyph name="search" size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search references, people, descriptions…" aria-label="Search service requests"/></label>
            <select value={team} onChange={e=>setTeam(e.target.value)} aria-label="Filter team"><Option value="all">All teams</Option>{Object.entries(teams).map(([k,v])=><Option value={k} key={k}>{v}</Option>)}</select></div>
          {queue(visibleRequests)}
        </Panel>}

        {tab==="allocations"&&<Panel title="Asset & service allocations" subtitle="Track allocated devices, licences, software and controlled access"
          action={canAlloc?<button className={s.primarySmall} onClick={()=>setModal({action:"create_allocation"})}>+ Record allocation</button>:null}>
          {data.allocations.length?<div className={s.tableScroll}><table className={s.table}><thead><tr><th>Item</th><th>Recipient</th><th>Owning team</th><th>Asset tag</th><th>Status</th><th>Assigned</th><th/></tr></thead><tbody>
            {data.allocations.map(a=><tr key={a.id}><td><strong>{a.item_name}</strong><small>{a.category} · #{a.id}</small></td><td>{a.recipient_email}</td><td>{teams[a.team]||a.team}</td><td>{a.asset_tag||"—"}</td><td><Tag value={a.status}/></td><td>{date(a.assigned_at)}</td>
              <td>{canAlloc&&(["director","einnovation",a.team].includes(role))?<button className={s.tableAction} onClick={()=>setModal({action:"update_allocation",allocation:a})}>Update ↗</button>:null}</td></tr>)}</tbody></table></div>:
            <Empty text="Once equipment or software is actually assigned, record it here. This register does not itself issue Microsoft licences or deliver devices."/>}
        </Panel>}

        {tab==="accounts"&&<>
          <div className={s.twoCols}>
            <Panel title="Staff account requests" subtitle="Microsoft Entra ID · personnel verification · account allocation"
              action={canWrite?<button className={s.primarySmall} onClick={()=>openRequest("staff_account")}>+ Request staff account</button>:null}>
              {queue(data.requests.filter(r=>r.kind==="staff_account").slice(0,8))}
              <p className={s.disclosure}>Creating a request does not create a Microsoft 365 account. Provisioning requires authorised Entra administration and a recorded confirmation reference.</p>
            </Panel>
            <Panel title="Business Partner requests" subtitle="Organisation identity verification and onboarding"
              action={canWrite?<button className={s.primarySmall} onClick={()=>openRequest("business_partner")}>+ Partner onboarding</button>:null}>
              {queue(data.requests.filter(r=>r.kind==="business_partner").slice(0,8))}
              <p className={s.disclosure}>Organisations still complete secure Business Partner registration. Requests do not bypass WCSA ID checks.</p>
            </Panel>
          </div>
          {canSeeAccounts&&<div className={s.twoCols}>
            <Panel title="Existing Business Partner accounts" subtitle="Read-only live account directory · no passwords are exposed">
              {data.partners.length?<div className={s.tableScroll}><table className={s.table}><thead><tr><th>Username</th><th>Email</th><th>WCSA ID</th><th>Status</th></tr></thead><tbody>
                {data.partners.map(p=><tr key={p.id}><td><strong>{p.username}</strong></td><td>{p.email}</td><td>{p.wcsa_id||"—"}</td><td><Tag value={p.status}/></td></tr>)}</tbody></table></div>:<Empty text="No Business Partner accounts were returned by the live database."/>}
              <Link href="/login/business-partner/register" className={s.plainLink}>Open the authorised Business Partner registration →</Link>
            </Panel>
            <Panel title="WorkHub personnel profiles" subtitle="Read-only employee profile records; not a complete Entra directory">
              {data.staff.length?<div className={s.tableScroll}><table className={s.table}><thead><tr><th>Name</th><th>Email</th><th>Personnel status</th></tr></thead><tbody>
                {data.staff.map(p=><tr key={p.identity_email}><td>{p.display_name||"—"}</td><td>{p.identity_email}</td><td><Tag value={p.personnel_verified?"verified":p.employment_status}/></td></tr>)}</tbody></table></div>:
              <Empty text="WorkHub personnel profiles are currently empty. Staff account creation must be verified through the authorised Microsoft and Personnel processes."/>}
            </Panel>
          </div>}
        </>}

        {tab==="audit"&&<Panel title="Audit activity" subtitle="Who performed an action, what changed and when it occurred">
          {data.audit.length?<div className={s.tableScroll}><table className={s.table}><thead><tr><th>Action</th><th>Operator</th><th>Reference</th><th>Date</th><th>Details</th></tr></thead><tbody>
            {data.audit.map(a=><tr key={a.id}><td><strong>{a.action.replace(/_/g," ")}</strong></td><td>{a.actor_email}</td><td>{a.request_id?ref(a.request_id):a.allocation_id?"Allocation #"+a.allocation_id:"—"}</td><td>{date(a.happened_at)}</td><td><small>{Object.entries(a.detail).map(([k,v])=>k+": "+String(v??"—")).join(" · ").slice(0,230)}</small></td></tr>)}</tbody></table></div>:
            <Empty text="The audit register will record the first authorised operational action."/>}
        </Panel>}

        {tab==="permissions"&&canManage&&<Panel title="Operator permissions" subtitle="Executive approval required for command authority"
          action={<button className={s.primarySmall} onClick={()=>setModal({action:"set_operator"})}>+ Assign operator</button>}>
          <p className={s.disclosure}>Only verified Microsoft Entra staff accounts at wcsports.co.za may access this workspace. Roles never grant PERSAL access or Microsoft tenant administrative privileges.</p>
          {data.operators.length?<div className={s.tableScroll}><table className={s.table}><thead><tr><th>Operator</th><th>Command role</th><th>Access</th><th>Granted by</th><th/></tr></thead><tbody>
            {data.operators.map(o=><tr key={o.email}><td><strong>{o.email}</strong></td><td>{roleNames[o.role]}</td><td><Tag value={o.active?"active":"revoked"}/></td><td>{o.granted_by}</td><td><button className={s.tableAction} onClick={()=>setModal({action:"set_operator",operator:o})}>Edit ↗</button></td></tr>)}</tbody></table></div>:
            <Empty text="No command operator grants exist. A designated founding director must be securely authorised before this console is usable."/>}
        </Panel>}
        <footer className={s.footer}><span>© {new Date().getFullYear()} Western Cape Sports Association NPC · MyWCSA GovApps</span><span>ServiceDesk · e-Innovation · BiT · ICT</span></footer>
      </main>
    </div>

    {modal&&<div className={s.modalBackdrop} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setModal(null);}}>
      <section className={s.modal} role="dialog" aria-modal="true" aria-labelledby="control-modal-title">
        <div className={s.modalHeader}><div><span className={s.eyebrow}>MYWCSA COMMAND CENTRE</span><h2 id="control-modal-title">{modal.action==="create_request"?"Create service request":modal.action==="update_request"?"Manage "+ref(modal.request!.id):modal.action==="create_allocation"?"Record allocation":modal.action==="update_allocation"?"Update allocation":"Operator permission"}</h2></div>
          <button className={s.modalClose} onClick={()=>setModal(null)} disabled={busy} aria-label="Close form">×</button></div>
        <form onSubmit={submit} className={s.modalForm}>
          {modal.action==="create_request"&&<>
            <Field label="Request type" name="kind"><select name="kind" defaultValue={modal.request?.kind||"support"}>{Object.entries(kinds).map(([k,v])=><Option value={k} key={k}>{v}</Option>)}</select></Field>
            <Field label="Title" name="title"><input name="title" minLength={5} maxLength={140} placeholder="What needs to be done?" required/></Field>
            <Field label="Details and justification" name="description"><textarea name="description" minLength={10} maxLength={4000} rows={4} placeholder="Describe the work, account permissions, approvals, required date, and context. Do not enter passwords or ID numbers." required/></Field>
            <div className={s.formColumns}>
              <Field label="Target email (required for account requests)" name="target_email"><input name="target_email" type="email" placeholder="person@example.co.za"/></Field>
              <Field label="WCSA ID (if applicable)" name="wcsa_id"><input name="wcsa_id" placeholder="Organisation's WCSA ID" maxLength={80}/></Field>
            </div>
            <Field label="Priority" name="priority"><select name="priority" defaultValue="normal"><Option value="low">Low</Option><Option value="normal">Normal</Option><Option value="high">High</Option><Option value="critical">Critical</Option></select></Field>
            <p className={s.formNote}>Requests route automatically: ICT for devices, BiT for software, e-Innovation for identities, ServiceDesk for support.</p>
          </>}

          {modal.action==="update_request"&&<>
            <p className={s.formNote}><strong>{modal.request?.title}</strong><br/>{modal.request?.description}</p>
            <div className={s.formColumns}>
              <Field label="Status" name="status"><select name="status" defaultValue={modal.request?.status}>{Object.entries(statuses).map(([k,v])=><Option key={k} value={k}>{v}</Option>)}</select></Field>
              <Field label="Owning team" name="team"><select name="team" defaultValue={modal.request?.team}>{Object.entries(teams).map(([k,v])=><Option key={k} value={k}>{v}</Option>)}</select></Field>
            </div>
            <Field label="Assigned to (WCSA staff email)" name="assignee"><input name="assignee" type="email" defaultValue={modal.request?.assignee||""} placeholder="staff@wcsports.co.za"/></Field>
            <Field label="External confirmation / fulfilment reference" name="external_reference"><input name="external_reference" defaultValue={modal.request?.external_reference||""} maxLength={160} placeholder="Microsoft, Registry or approved workflow reference"/></Field>
            <p className={s.formNote}>Account requests require e-Innovation or executive authority and an actual fulfilment reference before they may be closed. Status changes are logged.</p>
          </>}

          {modal.action==="create_allocation"&&<>
            <Field label="Allocation type" name="category"><select name="category" defaultValue="device"><Option value="device">ICT device</Option><Option value="software">BiT software</Option><Option value="licence">BiT licence</Option><Option value="access">Controlled access</Option></select></Field>
            <Field label="Asset / software / entitlement" name="item_name"><input name="item_name" required minLength={3} maxLength={140} placeholder="e.g. Dell laptop, Microsoft 365 licence"/></Field>
            <div className={s.formColumns}>
              <Field label="Recipient email" name="recipient_email"><input name="recipient_email" type="email" placeholder="staff@wcsports.co.za" required/></Field>
              <Field label="Asset tag or serial" name="asset_tag"><input name="asset_tag" maxLength={100} placeholder="Optional"/></Field>
            </div>
            <Field label="Related request reference (numeric ID)" name="reference_request_id"><input name="reference_request_id" inputMode="numeric" placeholder="Optional"/></Field>
            <Field label="Allocation notes" name="note"><textarea name="note" maxLength={1500} rows={3} placeholder="Record handover or licence details. Never enter passwords, secrets or activation keys."/></Field>
            <p className={s.formNote}>Record an allocation only after the item or entitlement has genuinely been assigned.</p>
          </>}

          {modal.action==="update_allocation"&&<>
            <p className={s.formNote}>{modal.allocation?.item_name} · {modal.allocation?.recipient_email}</p>
            <Field label="Allocation status" name="status"><select name="status" defaultValue={modal.allocation?.status}><Option value="allocated">Allocated</Option><Option value="returned">Returned</Option><Option value="retired">Retired</Option><Option value="revoked">Revoked</Option></select></Field>
          </>}

          {modal.action==="set_operator"&&<>
            <Field label="WCSA Microsoft staff email" name="email"><input name="email" type="email" required readOnly={Boolean(modal.operator)} defaultValue={modal.operator?.email||""} placeholder="operator@wcsports.co.za"/></Field>
            <Field label="Control Centre role" name="role"><select name="role" defaultValue={modal.operator?.role||"viewer"}>{Object.entries(roleNames).map(([k,v])=><Option value={k} key={k}>{v}</Option>)}</select></Field>
            <Field label="Access state" name="active"><select name="active" defaultValue={modal.operator?.active===false?"false":"true"}><Option value="true">Active</Option><Option value="false">Disabled</Option></select></Field>
            <p className={s.formNote}>Executive operators may change Command Centre roles. This does not automatically add employees to Microsoft Entra or grant PERSAL rights.</p>
          </>}

          <div className={s.modalActions}><button type="button" className={s.cancel} onClick={()=>setModal(null)} disabled={busy}>Cancel</button><button type="submit" className={s.save} disabled={busy}>{busy?"Saving…":"Save & audit command"} <Glyph name="arrow" size={16}/></button></div>
        </form>
      </section>
    </div>}
  </div>;
}
