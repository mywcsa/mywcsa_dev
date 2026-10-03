"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useRef, type CSSProperties, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { brandFor, emptyDraft, initiatives, sections, type Draft } from "./portal-data";
import s from "./portal.module.css";

type MembershipContext = { draft: Draft; setDraft: Dispatch<SetStateAction<Draft>>; notice: (title: string, message: string) => void; requests: { subject: string; detail: string; kind: string }[]; setRequests: Dispatch<SetStateAction<{ subject: string; detail: string; kind: string }[]>>; messages: { subject: string; detail: string }[]; setMessages: Dispatch<SetStateAction<{ subject: string; detail: string }[]>>; users: { name: string; email: string; role: string }[]; setUsers: Dispatch<SetStateAction<{ name: string; email: string; role: string }[]>>; preferences: { email: boolean; reminders: boolean }; setPreferences: Dispatch<SetStateAction<{ email: boolean; reminders: boolean }>> };
const Context = createContext<MembershipContext | null>(null);
export function usePreview() { const context = useContext(Context); if (!context) throw new Error("Membership context missing"); return context; }

function IkmMark() {
  return <div aria-label="iKapa Kultuur Mosaic" style={{display:"grid",placeItems:"center",width:58,height:58,borderRadius:16,background:"linear-gradient(135deg,#082f9c 0 28%,#e40013 28% 52%,#f7c900 52% 72%,#50aa16 72%)",color:"white",fontWeight:900,fontSize:18,boxShadow:"0 7px 22px rgba(0,0,0,.14)"}}>iKM</div>;
}

export default function PortalShell({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [requests, setRequests] = useState<MembershipContext["requests"]>([]);
  const [messages, setMessages] = useState<MembershipContext["messages"]>([]);
  const [users, setUsers] = useState<MembershipContext["users"]>([]);
  const [preferences, setPreferences] = useState({ email: true, reminders: true });
  const [menu, setMenu] = useState(false);
  const [message, setMessage] = useState({ title: "", detail: "" });
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const current = sections.find(section => pathname.endsWith("/" + section.id));
  const brand = brandFor(draft.initiative);
  const initiative = initiatives.find(item => item.id === draft.initiative);
  const theme = { "--brand-primary": brand.primary, "--brand-secondary": brand.secondary, "--brand-accent": brand.accent, "--brand-surface": brand.surface } as CSSProperties;
  function notice(title: string, detail: string) { setMessage({ title, detail }); dialog.current?.showModal(); }
  function exchangeBrand(value: string) {
    const next = initiatives.find(item => item.id === value);
    if (!next) return;
    setDraft(d => ({ ...d, initiative: next.id, category: next.categories.includes(d.category as never) ? d.category : next.categories[0] }));
  }
  return <Context.Provider value={{ draft, setDraft, notice, requests, setRequests, messages, setMessages, users, setUsers, preferences, setPreferences }}>
    <div className={s.portal} style={theme}>
      <a className={s.skip} href="#membership-content">Skip to content</a>
      <header className={s.header}>
        <div className={s.brand}>
          {draft.initiative === "IKM" ? <IkmMark /> : <Image src={brand.logo || "/mywcsa-logo.png"} alt={brand.organisation} width={216} height={68} unoptimized priority />}
          <div><strong>{draft.initiative === "IKM" ? "iKapa" : "MyWCSA"}</strong><span>{draft.initiative === "IKM" ? "Kultuur Mosaic · Membership" : `${brand.shortName} · Membership`}</span></div>
        </div>
        <div className={s.headerActions}>
          <label style={{display:"flex",alignItems:"center",gap:8,fontWeight:700}}>Brand <select aria-label="Switch membership organisation" value={draft.initiative} onChange={e => exchangeBrand(e.target.value)}>{initiatives.map(item => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label>
          <button onClick={() => notice("Membership support", "For membership assistance, use Help & Support or contact ServiceDesk@wcsports.co.za.")}>Help & Support</button><Link href="/my-apps">GovApps</Link><button className={s.menuButton} aria-expanded={menu} aria-controls="membership-navigation" onClick={() => setMenu(!menu)}>{menu ? "Close menu" : "Menu"}</button>
        </div>
      </header>
      <div className={s.frame}>
        <aside id="membership-navigation" className={`${s.sidebar} ${menu ? s.menuOpen : ""}`} aria-label="Membership navigation">
          <div className={s.sidebarIdentity}><span>{draft.year} · {brand.shortName} MEMBERSHIP</span><strong>{draft.organisation.name || (initiative ? initiative.name : "Your organisation")}</strong><small>{draft.wcsaId ? `Member ID ${draft.wcsaId}` : `${draft.category} membership services`}</small></div>
          <nav>{sections.map(section => <Link key={section.id} href={`/membership/${section.id}`} aria-current={current?.id === section.id ? "page" : undefined} onClick={() => setMenu(false)}><span aria-hidden="true">{section.mark}</span>{section.label}</Link>)}</nav>
          <div className={s.sidebarFoot}>{brand.organisation}<span>MyWCSA GovApps · Membership Services</span></div>
        </aside>
        <div className={s.workspace}>
          <main id="membership-content" className={s.main}>{children}</main>
          <footer className={s.footer}>Membership Services<span>{brand.organisation}</span></footer>
        </div>
      </div>
      <dialog ref={dialog} className={s.dialog}><div className={s.row}><h2>{message.title}</h2><button aria-label="Close message" onClick={() => dialog.current?.close()}>×</button></div><p>{message.detail}</p><button className={s.primary} onClick={() => dialog.current?.close()}>Close</button></dialog>
    </div>
  </Context.Provider>;
}
