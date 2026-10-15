import Link from "next/link";
import {notFound} from "next/navigation";
import {persalModules} from "@/app/persal/modules";
import {getPersalOfficial,getPersalEmployees} from "@/lib/persal/server";
const context:Record<string,{intro:string;steps:string[];outputs:string[]}> = {
 utilities:{intro:"Find transactions, review your work queue and maintain controlled reference information.",steps:["Locate authorised record","Capture proposed correction","Independent verification","Approve or return","Audit and close"],outputs:["Transaction history","Reference codes","Correction workflow"]},
 "human-resource-planning":{intro:"Plan staffing structures and maintain effective-dated posts, positions and funding status.",steps:["Establishment request","Budget and post verification","Delegated approval","Publish approved post","Update workforce view"],outputs:["Organograms","Funded positions","Vacancy management"]},
 "personnel-administration":{intro:"Maintain a reliable employee master with traceable appointments, contracts and career events.",steps:["Capture employee details","Validate documents","Personnel verification","Authorised approval","Record effective date"],outputs:["Employee master","Appointment history","Personnel documents"]},
 "salary-administration":{intro:"Prepare payroll securely with independent controls before any salary or banking transaction becomes effective.",steps:["Capture payroll input","Validate statutory rules","Independent payroll verification","Delegated approval","Reconcile and publish"],outputs:["Payroll register","Payslip documents","Payment reconciliation"]},
 "supporting-sub-systems":{intro:"Coordinate leave, attendance, training, benefits and employee service workflows.",steps:["Receive employee request","Check policy and balance","Supervisor review","Authorised decision","Sync approved record"],outputs:["Leave registers","Learning records","Benefit decisions"]},
 "management-information":{intro:"Explore the workforce through permission-filtered analytics, exceptions and governed exports.",steps:["Select report scope","Apply authorised filters","Inspect exceptions","Review report","Export with audit"],outputs:["Workforce dashboards","Establishment comparisons","Risk reports"]},
 "back-office":{intro:"Manage service operations, identity requests, event queues and integration controls without bypassing business approvals.",steps:["Open governed request","Verify requester and scope","Approve change","Apply through service","Log and reconcile"],outputs:["Access reviews","Integration status","Automation outbox"]}
};
export default async function PersonnelSection({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{tab?:string}>}){
 const {section}=await params;const {tab}=await searchParams;
 const module=persalModules.find(m=>m.slug===section);
 if(!module)notFound();
 const selected=module.tabs.find(t=>t===tab)||module.tabs[0];
 const info=context[section];
 const official=await getPersalOfficial();
 const isRegistry=section==="personnel-administration"&&selected==="Employee Registry";
 const allowed=Boolean(official?.workspaces.some(w=>w==="personnel"||w==="executive"));
 const employees=isRegistry&&official&&allowed?await getPersalEmployees(official):[];
 const currentIndex=module.tabs.findIndex(t=>t===selected);
 const nextTab=module.tabs[(currentIndex+1)%module.tabs.length];
 return <div className="persal-page wcsp-module">
  <header className="persal-module-header wcsp-module-hero"><span className="persal-eyebrow">WCSA / PERSONNEL / {module.name.toUpperCase()}</span><h1>{module.name}</h1><p>{info.intro}</p><span className="wcsp-module-tag">{module.tabs.length} sections · Development route</span></header>
  <nav className="persal-tabs" aria-label={module.name+" sections"}>{module.tabs.map(name=><Link key={name} href={"/personnel/"+section+"?tab="+encodeURIComponent(name)} className={selected===name?"active":""}>{name}</Link>)}</nav>
  <div className="wcsp-grid">
   <section className="persal-panel wcsp-panel wcsp-module-main">
    <div className="persal-panelhead"><div><span className="persal-eyebrow">CURRENT SECTION</span><h2>{selected}</h2><p>Secure administration · workflow design</p></div><Link href="/personnel">Home ↗</Link></div>
    {isRegistry?<div>{allowed?employees.length?<div className="persal-table-wrap"><table><thead><tr><th>Employee</th><th>Personnel no.</th><th>Division</th><th>Post</th><th>Status</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td>{e.first_name} {e.last_name}</td><td>{e.persal_number}</td><td>{e.division||"—"}</td><td>{e.post_title||"—"}</td><td>{e.employment_status}</td></tr>)}</tbody></table></div>:<div className="wcsp-empty"><span>♙</span><strong>No registered records</strong><p>There are no approved employee records to display at present.</p></div>:<div className="wcsp-empty"><span>♙</span><strong>Employee records remain private</strong><p>This design view is open for inspection, but identifiable employee records require verified Personnel or Executive permissions.</p></div>}</div>:
     <div className="wcsp-empty"><span>{module.icon}</span><strong>{selected}</strong><p>The screen structure is available for design review. Live transactions, approvals and integrations will be activated only after the relevant controls are tested.</p></div>}
    <div className="wcsp-function-footer"><span>Protective controls: role checks · dual approval · audit trail · no implicit privileges</span><Link href={"/personnel/"+section+"?tab="+encodeURIComponent(nextTab)}>Next section: {nextTab} ↗</Link></div>
   </section>
   <aside className="persal-panel wcsp-panel">
    <div className="persal-panelhead"><div><span className="persal-eyebrow">CONTROLLED PROCESS</span><h2>Workflow stages</h2><p>Recommended operating sequence</p></div></div>
    <ol className="wcsp-steps">{info.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}</ol>
    <div className="wcsp-control-note"><strong>Approval before action</strong><p>Automation does not bypass delegated authority, separation of duties or South African legal requirements.</p></div>
   </aside>
  </div>
  <div className="persal-section-heading"><h2>Module capabilities</h2><span>Planned controlled outputs</span></div>
  <div className="wcsp-features">{info.outputs.map((label,i)=><Link href={"/personnel/"+section+"?tab="+encodeURIComponent(module.tabs[i])} className="wcsp-feature" key={label}><span className="wcsp-feature-icon">{module.icon}</span><span><strong>{label}</strong><small>Review related section and workflow</small></span><span className="wcsp-feature-arrow">↗</span></Link>)}</div>
 </div>;
}
