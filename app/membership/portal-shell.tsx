"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useRef, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { emptyDraft, sections, type Draft } from "./portal-data";
import s from "./portal.module.css";

type PreviewContext = { draft: Draft; setDraft: Dispatch<SetStateAction<Draft>>; notice: (title: string, message: string) => void; requests: { subject: string; detail: string; kind: string }[]; setRequests: Dispatch<SetStateAction<{ subject: string; detail: string; kind: string }[]>>; messages: { subject: string; detail: string }[]; setMessages: Dispatch<SetStateAction<{ subject: string; detail: string }[]>>; users: { name: string; email: string; role: string }[]; setUsers: Dispatch<SetStateAction<{ name: string; email: string; role: string }[]>>; preferences: { email: boolean; reminders: boolean }; setPreferences: Dispatch<SetStateAction<{ email: boolean; reminders: boolean }>> };
const Context = createContext<PreviewContext | null>(null);
export function usePreview() { const context = useContext(Context); if (!context) throw new Error("Membership preview context missing"); return context; }

export default function PortalShell({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<Draft>(emptyDraft);
  function setDraft(update: SetStateAction<Draft>) {
    setDraftState(previous => {
      const next = typeof update === "function" ? update(previous) : update;
      const comparable = (value: Draft) => JSON.stringify({ ...value, step: 0, reviewedPreview: false });
      return comparable(previous) === comparable(next) ? next : { ...next, reviewedPreview: false };
    });
  }
  const [requests, setRequests] = useState<PreviewContext["requests"]>([]);
  const [messages, setMessages] = useState<PreviewContext["messages"]>([]);
  const [users, setUsers] = useState<PreviewContext["users"]>([]);
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
        <div className={s.brand}><Image src="/mywcsa-logo.png" alt="Western Cape Government" width={216} height={68} unoptimized priority /><div><strong>MyWCSA</strong><span>Membership Portal</span></div></div>
        <div className={s.headerActions}><span className={s.previewBadge}>PREVIEW</span><button onClick={() => notice("Registry support", "You can prepare an enquiry in Support & Requests. No enquiry is sent from this preview.")}>Help & Support</button><Link href="/membership/login">Login screen</Link><button className={s.menuButton} aria-expanded={menu} aria-controls="membership-navigation" onClick={() => setMenu(!menu)}>{menu ? "Close menu" : "Menu"}</button></div>
      </header>
      <div className={s.frame}>
        <aside id="membership-navigation" className={`${s.sidebar} ${menu ? s.menuOpen : ""}`} aria-label="Membership navigation">
          <div className={s.sidebarIdentity}><span>{draft.initiative} · {draft.year}</span><strong>{draft.organisation.name || "Your organisation"}</strong><small>{draft.sample ? "Sample record" : "Membership workspace"}</small></div>
          <nav>{sections.map(section => <Link key={section.id} href={`/membership/${section.id}`} aria-current={current?.id === section.id ? "page" : undefined} onClick={() => setMenu(false)}><span aria-hidden="true">{section.mark}</span>{section.label}</Link>)}</nav>
          <div className={s.sidebarFoot}>Western Cape Sports Association NPC<span>WCSA · WCSSA · iKM · WCDA · WCOB</span></div>
        </aside>
        <div className={s.workspace}>
          <div className={s.previewBanner}><strong>Interface preview</strong><span>Application details here remain a local preview and are not submitted to Registry. Drafts clear on refresh. Approved invoice payments use the separate Registry payment page.</span></div>
          <main id="membership-content" className={s.main}>{children}</main>
          <footer className={s.footer}>MyWCSA Membership Portal<span>Western Cape Sports Association NPC</span></footer>
        </div>
      </div>
      <dialog ref={dialog} className={s.dialog} aria-labelledby="preview-notice-title"><div className={s.row}><h2 id="preview-notice-title">{message.title}</h2><button aria-label="Close message" onClick={() => dialog.current?.close()}>×</button></div><p>{message.detail}</p><button className={s.primary} onClick={() => dialog.current?.close()}>Got it</button></dialog>
    </div>
  </Context.Provider>;
}
