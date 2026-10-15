import Link from "next/link";
import {notFound} from "next/navigation";
import {requirePersalOfficial} from "@/lib/persal/server";
import {persalModules} from "../modules";
import RecordWorkbench from "@/app/personnel/record-workbench";
export default async function PersalModulePage({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{tab?:string}>}){
 const official=await requirePersalOfficial();
 const {section}=await params;
 const m=persalModules.find(item=>item.slug===section);
 if(!m)notFound();
 const {tab}=await searchParams;
 const selected=m.tabs.find(t=>t===tab)||m.tabs[0];
 return <div className="persal-page">
   <header className="persal-module-header"><span className="persal-eyebrow">MYWCSA GOVAPPS / PERSAL</span><h1>{m.name}</h1><p>{m.description}</p></header>
   <nav className="persal-tabs" aria-label={m.name+" sections"}>{m.tabs.map(t=><Link key={t} href={"/persal/"+m.slug+"?tab="+encodeURIComponent(t)} className={selected===t?"active":""}>{t}</Link>)}</nav>
   <section className="persal-panel persal-module-panel"><RecordWorkbench module={section} tab={selected} official={official}/></section>
 </div>;
}
