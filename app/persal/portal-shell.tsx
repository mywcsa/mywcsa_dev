"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Official, EmployeeSummary, Workspace } from "@/lib/persal/server";
import { persalModules, workspaceNames } from "./modules";

const WorkspaceContext=createContext<Workspace>("personnel");
export function useActiveWorkspace(){return useContext(WorkspaceContext);}
export default function PortalShell({official,children}:{official:Official;children:ReactNode}){
  const pathname=usePathname();
  const [workspace,setWorkspace]=useState<Workspace>(official.primary);
  const [query,setQuery]=useState("");
  const [results,setResults]=useState<EmployeeSummary[]>([]);
  const [searched,setSearched]=useState(false);
  useEffect(()=>{
    const saved=window.localStorage.getItem("persal-workspace-"+official.id) as Workspace|null;
    if(saved && official.workspaces.includes(saved)) setWorkspace(saved);
  },[official.id,official.workspaces]);
  function changeWorkspace(next:Workspace) {
    if(!official.workspaces.includes(next)) return;
    setWorkspace(next);
    window.localStorage.setItem("persal-workspace-"+official.id,next);
  }
  async function findEmployee(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setSearched(true);
    if(query.trim().length<2){setResults([]);return;}
    try {
      const response=await fetch("/api/persal/search?q="+encodeURIComponent(query.trim()),{cache:"no-store"});
      if(!response.ok){setResults([]);return;}
      const body=await response.json();
      setResults(Array.isArray(body.results)?body.results:[]);
    }catch{setResults([]);}
  }
  return <WorkspaceContext.Provider value={workspace}><div className="persal-app">
    <aside className="persal-sidebar" aria-label="PERSAL main navigation">
      <Link href="/persal" className="persal-brand"><span className="persal-brandmark">W</span><span><strong>MyWCSA PERSAL</strong><small>GovApps · Restricted</small></span></Link>
      <div className="persal-navcaption">COMMAND CENTRE</div>
      <Link href="/persal" className={"persal-navlink "+(pathname==="/persal"?"is-active":"")}><span>▦</span> Home & Command Centre</Link>
      <div className="persal-navcaption">ADMINISTRATION MODULES</div>
      {persalModules.map(m=><Link key={m.slug} href={"/persal/"+m.slug} className={"persal-navlink "+(pathname.startsWith("/persal/"+m.slug)?"is-active":"")}><span>{m.icon}</span>{m.name}</Link>)}
      <div className="persal-sidefoot">WESTERN CAPE SPORTS ASSOCIATION NPC<br/><small>Internal personnel & payroll administration</small></div>
    </aside>
    <div className="persal-body">
      <header className="persal-header">
        <div className="persal-header-label"><span className="persal-eyebrow">MYWCSA GOVAPPS | PERSAL</span><strong>Home & Command Centre</strong></div>
        <div className="persal-workspace-switch"><label htmlFor="persal-workspace">Active workspace</label><select id="persal-workspace" value={workspace} onChange={e=>changeWorkspace(e.target.value as Workspace)}>{official.workspaces.map(w=><option key={w} value={w}>{workspaceNames[w]}</option>)}</select></div>
        <div className="persal-user"><span className="persal-avatar">{official.name.charAt(0)}</span><span><strong>{official.name}</strong><small>{official.title}</small></span></div>
        <Link className="persal-launcher" href="/my-apps">GovApps ↗</Link>
      </header>
      <div className="persal-mobile-nav"><Link href="/persal">Home</Link>{persalModules.map(m=><Link key={m.slug} href={"/persal/"+m.slug}>{m.name}</Link>)}</div>
      <main className="persal-content">
        <div className="persal-search-wrap">
          <form className="persal-global-search" onSubmit={findEmployee}><label className="sr-only" htmlFor="persal-search">Search employee by name or PERSAL number</label><span aria-hidden>⌕</span><input id="persal-search" value={query} onChange={e=>{setQuery(e.target.value);setSearched(false);}} placeholder="Search authorised employees by name or PERSAL number" /><button type="submit">Search</button></form>
          {searched && <section className="persal-search-results" aria-label="Search results"><strong>Employee lookup</strong>{results.length?results.map(r=><div key={r.id}><span>{r.first_name} {r.last_name}</span><small>{r.persal_number} · {r.post_title||"No post"} · {r.employment_status}</small></div>):<p>No accessible matching records. Personnel and Executive permissions are required for identifiable search.</p>}</section>}
        </div>
        {children}
      </main>
    </div>
  </div></WorkspaceContext.Provider>;
}
