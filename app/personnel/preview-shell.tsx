"use client";
import {createContext,useContext,useState,useEffect,type ReactNode} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {persalModules,workspaceNames} from "@/app/persal/modules";
import type {Official,Workspace} from "@/lib/persal/server";
const C=createContext<Workspace>("personnel");
export const usePersonnelWorkspace=()=>useContext(C);
const all:Workspace[]=["executive","management","personnel","finance","ict_bit","innovation","communications"];
export default function PersonnelShell({children,official}:{children:ReactNode;official:Official|null}){
 const pathname=usePathname(),allowed=official?.workspaces||all;
 const [workspace,setWorkspace]=useState<Workspace>(official?.primary||"personnel");
 const [menu,setMenu]=useState(false);
 useEffect(()=>{try{const s=localStorage.getItem("wcsa-personnel-workspace") as Workspace;if(allowed.includes(s))setWorkspace(s);}catch{}},[official?.id]);
 function change(next:Workspace){if(!allowed.includes(next))return;setWorkspace(next);try{localStorage.setItem("wcsa-personnel-workspace",next);}catch{}}
 return <C.Provider value={workspace}><div className="persal-app wcsp-preview-app">
  <aside className={"persal-sidebar "+(menu?"wcsp-open":"")}>
   <Link href="/personnel" className="persal-brand"><span className="persal-brandmark">W</span><span><strong>MyWCSA PERSAL</strong><small>GovApps · Personnel</small></span></Link>
   <div className="persal-navcaption">COMMAND CENTRE</div>
   <Link href="/personnel" onClick={()=>setMenu(false)} className={"persal-navlink "+(pathname==="/personnel"?"is-active":"")}><span>▦</span>Home & Command Centre</Link>
   <div className="persal-navcaption">ADMINISTRATION MODULES</div>
   {persalModules.map(m=><Link key={m.slug} href={"/personnel/"+m.slug} onClick={()=>setMenu(false)} className={"persal-navlink "+(pathname.startsWith("/personnel/"+m.slug)?"is-active":"")}><span>{m.icon}</span>{m.name}</Link>)}
   <div className="persal-sidefoot">WESTERN CAPE SPORTS ASSOCIATION NPC<br/><small>Secure employee and payroll administration</small></div>
  </aside>
  <div className="persal-body">
   <header className="persal-header">
    <button className="wcsp-menu-toggle" type="button" onClick={()=>setMenu(!menu)} aria-label="Toggle modules">☰</button>
    <div className="persal-header-label"><span className="persal-eyebrow">MYWCSA GOVAPPS / PERSONNEL</span><strong>PERSAL Administration</strong></div>
    <div className="persal-workspace-switch"><label htmlFor="personnel-workspace">Department {official?"workspace":"navigation"}</label><select id="personnel-workspace" value={workspace} onChange={e=>change(e.target.value as Workspace)}>{allowed.map(w=><option key={w} value={w}>{workspaceNames[w]}</option>)}</select></div>
    <div className="persal-user"><span className="persal-avatar">{official?.name.charAt(0)||"W"}</span><span><strong>{official?.name||"WCSA Staff"}</strong><small>{official?.title||"No personal information displayed"}</small></span></div>
    <Link className="persal-launcher" href="/my-apps">GovApps ↗</Link>
   </header>
   <nav className="persal-mobile-nav">{persalModules.map(m=><Link key={m.slug} href={"/personnel/"+m.slug}>{m.name}</Link>)}</nav>
   <main className="persal-content">
    <div className="wcsp-notice"><strong>{official?"Verified personnel workspace":"MyWCSA PERSAL — secure personnel administration"}</strong><span>{official?"Approved officials see only their authorised information.":"Open the modules, then sign in with an authorised WCSA organisational account for transactions and confidential records."}</span></div>
    {children}
    <footer className="wcsp-footer">Western Cape Sports Association NPC · Active application route: /personnel · Final URL after completion: /persal</footer>
   </main>
  </div>
 </div></C.Provider>;
}
