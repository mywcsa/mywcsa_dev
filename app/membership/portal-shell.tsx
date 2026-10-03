"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useRef, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { emptyDraft, sections, type Draft } from "./portal-data";
import s from "./portal.module.css";

type MembershipContext = { draft: Draft; setDraft: Dispatch<SetStateAction<Draft>>; notice: (title: string, message: string) => void; requests: { subject: string; detail: string; kind: string }[]; setRequests: Dispatch<SetStateAction<{ subject: string; detail: string; kind: string }[]>>; messages: { subject: string; detail: string }[]; setMessages: Dispatch<SetStateAction<{ subject: string; detail: string }[]>>; users: { name: string; email: string; role: string }[]; setUsers: Dispatch<SetStateAction<{ name: string; email: string; role: string }[]>>; preferences: { email: boolean; reminders: boolean }; setPreferences: Dispatch<SetStateAction<{ email: boolean; reminders: boolean }>> };
const Context = createContext<MembershipContext | null>(null);
export function usePreview() { const context = useContext(Context); if (!context) throw new Error("Membership context missing"); return context; }

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
  function notice(title: string, detail: string) { setMessage({ title, detail }); dialog.current?.showModal(); }
  return <Context.Provider value={{ draft, setDraft, notice, requests, setRequests, messages, setMessages, users, setUsers, preferences, setPreferences }}>
    <div className={s.portal}>
      <a className={s.skip} href="#membership-content">Skip to content</a>
      <header className={s.header}>
        <div className={s.brand}><Image src="/mywcsa-logo.png" alt="Western Cape Government" width={216} height={68} unoptimized priority /><div><strong>MyWCSA</strong><span>Membership</span></div></div>
        <div className={s.headerActions}><button onClick={() => notice("Membership support", "For membership assistance, use Help & Support or contact ServiceDesk@wcsports.co.za.")}>Help & Support</button><Link href="/my-apps">GovApps</Link><button className={s.menuButton} aria-expanded={menu} aria-controls="membership-navigation" onClick={() => setMenu(!menu)}>{menu ? "Close menu" : "Menu"}</button></div>
      </header>
      <div className={s.frame}>
        <aside id="membership-navigation" className={`${s.sidebar} ${menu ? s.menuOpen : ""}`} aria-label="Membership navigation">
          <div className={s.sidebarIdentity}><span>{draft.year} MEMBERSHIP</span><strong>{draft.organisation.name || "Your organisation"}</strong><small>{draft.wcsaId ? `WCSA ID ${draft.wcsaId}` : "Membership services"}</small></div>
          <nav>{sections.map(section => <Link key={section.id} href={`/membership/${section.id}`} aria-current={current?.id === section.id ? "page" : undefined} onClick={() => setMenu(false)}><span aria-hidden="true">{section.mark}</span>{section.label}</Link>)}</nav>
          <div className={s.sidebarFoot}>Western Cape Sports Association NPC<span>MyWCSA Membership Services</span></div>
        </aside>
        <div className={s.workspace}>
          <main id="membership-content" className={s.main}>{children}</main>
          <footer className={s.footer}>MyWCSA Membership<span>Western Cape Sports Association NPC</span></footer>
        </div>
      </div>
      <dialog ref={dialog} className={s.dialog}><div className={s.row}><h2>{message.title}</h2><button aria-label="Close message" onClick={() => dialog.current?.close()}>×</button></div><p>{message.detail}</p><button className={s.primary} onClick={() => dialog.current?.close()}>Close</button></dialog>
    </div>
  </Context.Provider>;
}
