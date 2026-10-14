import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersalEmployees, getPersalOverview, requirePersalOfficial } from "@/lib/persal/server";
import { persalModules } from "../modules";
export default async function PersalModulePage({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{tab?:string}>}) {
 const official=await requirePersalOfficial();
 const {section}=await params;
 const module=persalModules.find(item=>item.slug===section);
 if(!module) notFound();
 const {tab}=await searchParams;
 const selected=module.tabs.find(value=>value===tab)||module.tabs[0];
 const isEmployees=section==="personnel-administration"&&selected==="Employee Registry";
 const isTasks=section==="utilities"&&selected==="My Tasks";
 const [employees,overview]=await Promise.all([isEmployees?getPersalEmployees(official):Promise.resolve([]),isTasks?getPersalOverview(official):Promise.resolve(null)]);
 const canSeeEmployees=official.workspaces.includes("personnel")||official.workspaces.includes("executive");
 return <div className="persal-page"><header className="persal-module-header"><span className="persal-eyebrow">PERSAL / {module.name.toUpperCase()}</span><h1>{module.name}</h1><p>{module.description}</p><small className="persal-module-credit">Architecture photography: <a href="https://unsplash.com/photos/glass-facade-of-a-modern-office-building-V5vF94h52r0" target="_blank" rel="noopener noreferrer">Fabian Kleiser / Unsplash</a></small></header>
  <nav className="persal-tabs" aria-label={module.name+" sections"}>{module.tabs.map(name=><Link key={name} className={selected===name?"active":""} href={"/persal/"+section+"?tab="+encodeURIComponent(name)}>{name}</Link>)}</nav>
  <section className="persal-panel persal-module-panel"><div className="persal-panelhead"><div><h2>{selected}</h2><p>Restricted official records and work queues</p></div><Link href="/persal">Return to Home ↗</Link></div>
  {isEmployees?(canSeeEmployees?(employees.length?<div className="persal-table-wrap"><table><thead><tr><th>Employee</th><th>Personnel number</th><th>Division</th><th>Post</th><th>Status</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td>{e.first_name} {e.last_name}</td><td>{e.persal_number}</td><td>{e.division||"—"}</td><td>{e.post_title||"—"}</td><td>{e.employment_status}</td></tr>)}</tbody></table></div>:<div className="persal-empty">No approved employee records have been entered.</div>):<div className="persal-empty">This workspace has no permission to view identifiable employee master records.</div>):
   isTasks?(overview?.workItems.length?<div>{overview.workItems.map(t=><div className="persal-task" key={t.id}><div><strong>{t.title}</strong><small>{t.reference} · {t.workspace} · {t.status}</small></div><span>{t.priority}</span></div>)}</div>:<div className="persal-empty">No tasks assigned to your account.</div>):
   <div className="persal-empty"><h3>{selected}</h3><p>No authorised transactions are available here yet. This section is reserved for controlled workflows, not example employee data.</p></div>}
  </section>
 </div>;
}
