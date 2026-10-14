"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useRef, useEffect, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { WorkHubIcon, type WorkHubIconName } from "../workhub/WorkHubIcon";
import { emptyDraft, type Draft } from "./portal-data";
import s from "./portal.module.css";

type RequestDraft = { subject: string; detail: string; kind: string };
type MessageDraft = { subject: string; detail: string };
type ProposedUser = { name: string; email: string; role: string };
type MembershipContext = {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  notice: (title: string, message: string) => void;
  requests: RequestDraft[];
  setRequests: Dispatch<SetStateAction<RequestDraft[]>>;
  messages: MessageDraft[];
  setMessages: Dispatch<SetStateAction<MessageDraft[]>>;
  users: ProposedUser[];
  setUsers: Dispatch<SetStateAction<ProposedUser[]>>;
  preferences: { email: boolean; reminders: boolean };
  setPreferences: Dispatch<SetStateAction<{ email: boolean; reminders: boolean }>>;
};
type MemberStatus = {
  hasApplication?: boolean;
  membershipStatus?: string;
  application?: { organisationName?: string; year?: string; reference?: string } | null;
  invoice?: { reference?: string; status?: string } | null;
};

const Context = createContext<MembershipContext | null>(null);
export function usePreview() {
  const context = useContext(Context);
  if (!context) throw new Error("Membership context missing");
  return context;
}

const nav: Array<{ id: string; label: string; href: string; icon: WorkHubIconName; requiresApplication?: boolean; activeOnly?: boolean }> = [
  { id: "dashboard", label: "Dashboard", href: "/membership/dashboard", icon: "house", requiresApplication: true },
  { id: "apply", label: "Applications", href: "/membership/apply", icon: "clipboard" },
  { id: "membership", label: "My Membership", href: "/membership/membership", icon: "id", requiresApplication: true },
  { id: "renewals", label: "Renewals", href: "/membership/renewals", icon: "calendar", requiresApplication: true },
  { id: "payments", label: "Payments & Invoices", href: "/membership/payments", icon: "briefcase", requiresApplication: true },
  { id: "certificates", label: "Certificates", href: "/membership/certificates", icon: "check", activeOnly: true },
  { id: "profile", label: "Member Profile", href: "/membership/profile", icon: "users", requiresApplication: true },
  { id: "documents", label: "Documents", href: "/membership/documents", icon: "file", requiresApplication: true },
  { id: "messages", label: "Correspondence", href: "/membership/messages", icon: "mail", requiresApplication: true },
  { id: "support", label: "Help & Support", href: "/membership/support", icon: "ticket" },
];

export default function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [registry, setRegistry] = useState<MemberStatus | null>(null);
  const [registryError, setRegistryError] = useState(false);
  const [requests, setRequests] = useState<RequestDraft[]>([]);
  const [messages, setMessages] = useState<MessageDraft[]>([]);
  const [users, setUsers] = useState<ProposedUser[]>([]);
  const [preferences, setPreferences] = useState({ email: true, reminders: true });
  const [message, setMessage] = useState({ title: "", detail: "" });
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mywcsa-membership-draft-v2");
      if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) });
    } catch {}
    setReady(true);

    const controller = new AbortController();
    fetch("/api/membership/status", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Registry unavailable");
        return response.json() as Promise<MemberStatus>;
      })
      .then(data => { setRegistry(data); setRegistryError(false); })
      .catch(error => {
        if (error?.name !== "AbortError") setRegistryError(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("mywcsa-membership-draft-v2", JSON.stringify(draft)); } catch {}
  }, [draft, ready]);

  function notice(title: string, detail: string) {
    setMessage({ title, detail });
    dialog.current?.showModal();
  }

  const active = registry?.membershipStatus === "active";
  const submitted = registry?.hasApplication === true;
  const visibleNav = nav.filter(item => {
    if (registryError) return !item.requiresApplication && !item.activeOnly;
    if (item.activeOnly) return active;
    if (item.requiresApplication) return submitted;
    return true;
  });
  const heading = registryError ? "Membership Registry unavailable" :
    registry === null ? "Connecting to Membership Registry…" :
    active ? "Your membership workspace" :
    submitted ? "Your application is with Registry" :
    "Start your membership application";
  const subtitle = registryError
    ? "We couldn't retrieve the live membership status. Please refresh or contact support."
    : active
      ? "Review your verified membership records, payments and documents."
      : submitted
        ? "Track your application and payment status using verified information."
        : "Choose your membership and send an application to the Registry.";

  return <Context.Provider value={{
    draft, setDraft, notice, requests, setRequests, messages, setMessages,
    users, setUsers, preferences, setPreferences,
  }}>
    <div className={s.portal}>
      <a className={s.skip} href="#membership-content">Skip to content</a>
      <header className={s.header}>
        <Link href="/membership" className={s.brand}>
          <span className={s.brandLogo}><Image src="/mywcsa-logo.png" alt="MyWCSA GovApps" width={145} height={52} unoptimized priority /></span>
          <span><strong>MyWCSA Membership</strong><small>Members · Services · Progress</small></span>
        </Link>
        <div className={s.headerActions}>
          <Link href="/membership/support"><WorkHubIcon name="ticket" size={16} /> Support</Link>
          <Link href="/my-apps"><WorkHubIcon name="external" size={16} /> My Apps</Link>
        </div>
      </header>

      <div className={s.workspace}>
        <aside className={s.sidebar} aria-label="Membership portal navigation">
          <div className={s.sideHeading}><span>MEMBERSHIP PORTAL</span><span className={s.sideIcon}><WorkHubIcon name="briefcase" size={16}/></span></div>
          <nav className={s.sideNav}>
            {visibleNav.map(item => <Link key={item.id} href={item.href} className={pathname === item.href ? s.navActive : undefined} aria-current={pathname === item.href ? "page" : undefined}>
              <WorkHubIcon name={item.icon} size={18} />
              <span>{item.label}</span>
              <WorkHubIcon name="chevron" size={15} className={s.navChevron} />
            </Link>)}
          </nav>
          <div className={s.sideSupport}>
            <WorkHubIcon name="ticket" size={19}/>
            <strong>Need assistance?</strong>
            <span>Membership Registry and GovApps support.</span>
            <Link href="/membership/support">Get help →</Link>
          </div>
        </aside>

        <div className={s.contentArea}>
          <div className={s.portalBanner}>
            <div>
              <small>MYWCSA GOVAPPS · MEMBERSHIP</small>
              <strong>{heading}</strong>
              <span>{subtitle}</span>
            </div>
            <span className={s.bannerSymbol} aria-hidden="true"><WorkHubIcon name="briefcase" size={45}/></span>
          </div>

          {registryError && <div className={s.registryWarning} role="alert">
            Live membership data couldn't be loaded. This page does not substitute draft or sample information for Registry records.
            <button type="button" onClick={() => window.location.reload()}>Retry</button>
          </div>}
          <main id="membership-content" className={s.main}>{children}</main>
          <footer className={s.footer}>
            <span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span>
            <span>MyWCSA GovApps · Membership Services</span>
          </footer>
        </div>
      </div>

      <dialog ref={dialog} className={s.dialog}>
        <div className={s.row}><h2>{message.title}</h2><button aria-label="Close notice" onClick={() => dialog.current?.close()}>×</button></div>
        <p>{message.detail}</p>
        <button className={s.primary} onClick={() => dialog.current?.close()}>Close</button>
      </dialog>
    </div>
  </Context.Provider>;
}
