import Link from "next/link";
import s from "./portal.module.css";

export type LiveState = {
  hasApplication?: boolean;
  membershipStatus?: string;
  application?: {
    reference?: string;
    status?: string;
    year?: string;
    initiative?: string;
    category?: string;
    organisationName?: string;
    organisation?: Record<string, unknown>;
    submittedAt?: string;
    wcsaId?: string;
  } | null;
  invoice?: { reference?: string; status?: string; amount?: number; currency?: string; createdAt?: string } | null;
  receipt?: { number?: string; issuedAt?: string } | null;
  documents?: { type: string; number: string; path: string; issuedAt: string }[];
};

const money = (cents: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);

function date(value?: string) {
  if (!value) return "Not recorded";
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.valueOf()) ? "Not recorded" : timestamp.toLocaleDateString("en-ZA");
}

function safeDocumentPath(value: string) {
  try {
    const url = new URL(value, "https://govapps.wcsports.co.za");
    if (url.origin !== "https://govapps.wcsports.co.za" || !url.pathname.startsWith("/api/membership/documents/")) return null;
    return url.pathname;
  } catch { return null; }
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return <div><dt>{label}</dt><dd>{value || "Not recorded"}</dd></div>;
}

function PageHeading({ kicker, title, detail }: { kicker: string; title: string; detail: string }) {
  return <div className={s.pageTitle}><div><p className={s.eyebrow}>{kicker}</p><h1>{title}</h1><p>{detail}</p></div><Link className={s.secondary} href="/membership/dashboard">Dashboard <span aria-hidden="true">↗</span></Link></div>;
}

function StatusPill({ value }: { value?: string }) {
  return <span className={s.pill}>{value ? value.replace(/_/g, " ") : "Pending"}</span>;
}

export default function LiveMemberContent({
  section, state,
}: {
  section: string;
  state: LiveState;
}) {
  const application = state.application || {};
  const invoice = state.invoice;
  const receipt = state.receipt;
  const active = state.membershipStatus === "active";
  const paid = invoice?.status === "paid";
  const name = application.organisationName || "Your membership";
  const status = state.membershipStatus || application.status || "submitted";
  const ref = application.reference || "Pending";
  const docs = state.documents || [];

  if (section === "dashboard") return <>
    <section className={s.welcomeCard}>
      <div>
        <p className={s.eyebrow}>MYWCSA MEMBERSHIP · LIVE REGISTRY</p>
        <h1>{name}</h1>
        <p>{active ? "Your membership is active. Manage verified records and your next steps." : "Your submitted application is being managed through the Membership Registry."}</p>
        <div className={s.welcomeMeta}>
          <StatusPill value={status} />
          <span>Reference: <strong>{ref}</strong></span>
        </div>
      </div>
      <Link className={s.primary} href={invoice ? "/membership/payments" : "/membership/membership"}>
        {invoice ? (paid ? "View payment records" : "View invoice") : "View membership"} <span aria-hidden="true">↗</span>
      </Link>
    </section>
    <div className={s.stats}>
      <div><span>Membership status</span><strong>{status.replace(/_/g, " ")}</strong><small>Verified against Registry</small></div>
      <div><span>Application</span><strong>{ref}</strong><small>{date(application.submittedAt)}</small></div>
      <div><span>Membership year</span><strong>{application.year || "—"}</strong><small>{application.initiative || "WCSA"}</small></div>
      <div><span>Invoice</span><strong>{invoice ? money(Number(invoice.amount || 0)) : "Pending"}</strong><small>{invoice ? (invoice.status || "Awaiting confirmation") : "No invoice issued"}</small></div>
    </div>
    <div className={s.twoColumns}>
      <section className={s.panel}>
        <div className={s.panelHeading}><h2>Membership overview</h2><StatusPill value={status} /></div>
        <dl className={s.details}>
          <Row label="Member / organisation" value={application.organisationName} />
          <Row label="Membership category" value={application.category} />
          <Row label="Programme" value={application.initiative} />
          <Row label="WCSA ID" value={application.wcsaId} />
          <Row label="Application reference" value={application.reference} />
        </dl>
        <Link className={s.secondary} href="/membership/membership">View membership details →</Link>
      </section>
      <section className={s.panel}>
        <div className={s.panelHeading}><h2>Next steps</h2><span className={s.pill}>Your progress</span></div>
        <div className={s.taskList}>
          <Link href="/membership/membership"><span className={s.complete}>✓</span><div><strong>Application submitted</strong><small>Application reference {ref}</small></div><span aria-hidden="true">↗</span></Link>
          <Link href="/membership/payments"><span className={paid ? s.complete : s.taskMark}>{paid ? "✓" : "2"}</span><div><strong>{invoice ? "Invoice & payment" : "Registry invoicing"}</strong><small>{invoice ? "View your real invoice and transaction status" : "An invoice has not yet been issued"}</small></div><span aria-hidden="true">↗</span></Link>
          <Link href={active ? "/membership/certificates" : "/membership/support"}><span className={active ? s.complete : s.taskMark}>{active ? "✓" : "3"}</span><div><strong>Membership documents</strong><small>{active ? "Review certificates issued by Registry" : "Available after verification and activation"}</small></div><span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
    <section className={s.panel}>
      <div className={s.panelHeading}><h2>Quick access</h2></div>
      <div className={s.quickLinks}>
        <Link href="/membership/payments">Payments & invoices ↗</Link>
        <Link href="/membership/profile">Member profile ↗</Link>
        <Link href="/membership/support">Help & support ↗</Link>
        {active && <Link href="/membership/certificates">Certificates ↗</Link>}
      </div>
    </section>
  </>;

  if (section === "membership") return <>
    <PageHeading kicker="MEMBERSHIP · VERIFIED RECORD" title="My Membership" detail="Your current membership details come directly from the Membership Registry." />
    <section className={s.panel}>
      <div className={s.panelHeading}><h2>{name}</h2><StatusPill value={status} /></div>
      <dl className={s.details}>
        <Row label="Application reference" value={application.reference} />
        <Row label="WCSA ID" value={application.wcsaId} />
        <Row label="Membership year" value={application.year} />
        <Row label="Programme / initiative" value={application.initiative} />
        <Row label="Category" value={application.category} />
        <Row label="Current status" value={status} />
        <Row label="Submitted on" value={date(application.submittedAt)} />
      </dl>
      <div className={s.quickLinks}><Link href="/membership/payments">Invoices & receipts ↗</Link><Link href="/membership/support">Ask Registry for assistance ↗</Link></div>
    </section>
  </>;

  if (section === "profile") {
    const details = application.organisation || {};
    const fields = [
      ["Member / organisation", application.organisationName],
      ["Organisation email", details.email],
      ["Telephone", details.phone],
      ["Address", details.address],
      ["Town / city", details.town],
      ["Postal code", details.postalCode],
      ["District", details.district],
      ["Municipality", details.municipality],
      ["Province", details.province],
      ["Representative", details.representative],
      ["Representative role", details.position],
    ] as const;
    return <>
      <PageHeading kicker="MEMBER PROFILE · REGISTRY" title="Member Profile" detail="Details submitted with your latest membership application." />
      <section className={s.panel}>
        <div className={s.panelHeading}><h2>Registered information</h2><StatusPill value={status} /></div>
        <dl className={s.details}>
          {fields.map(([label, value]) => <Row key={label} label={label} value={typeof value === "string" ? value : undefined} />)}
        </dl>
        <p className={s.muted}>Need to correct an official record? Contact Registry. Updating a local draft does not modify your submitted application.</p>
        <a className={s.primary} href="mailto:ServiceDesk@wcsports.co.za?subject=Membership%20profile%20correction">Request a correction ↗</a>
      </section>
    </>;
  }

  if (section === "renewals") return <>
    <PageHeading kicker="MEMBERSHIP · RENEWAL" title="Renewals" detail="Renewals are submitted as new applications and reviewed by the Registry." />
    <section className={s.panel}>
      <h2>Your existing membership</h2>
      <dl className={s.details}><Row label="WCSA ID" value={application.wcsaId}/><Row label="Membership year" value={application.year}/><Row label="Membership status" value={status}/></dl>
      <p className={s.muted}>Use your existing WCSA ID during the renewal process. Any payment must follow a verified Registry invoice.</p>
      <Link className={s.primary} href="/membership/apply">Begin renewal application ↗</Link>
    </section>
  </>;

  if (section === "documents") return <>
    <PageHeading kicker="MEMBERSHIP · OFFICIAL RECORDS" title="Membership Documents" detail="Documents listed here have been recorded by the Registry." />
    <section className={s.panel}><div className={s.panelHeading}><h2>Issued documents</h2><StatusPill value={status}/></div>
      {docs.length ? <div className={s.tableWrap}><table><thead><tr><th>Document</th><th>Reference</th><th>Issued</th><th>Download</th></tr></thead><tbody>
        {docs.map((document, index) => <tr key={document.number + index}><td>{document.type}</td><td>{document.number}</td><td>{date(document.issuedAt)}</td><td>{safeDocumentPath(document.path) ? <a className={s.secondary} href={safeDocumentPath(document.path)!}>Download PDF</a> : "Contact Registry"}</td></tr>)}
      </tbody></table></div> : <p className={s.muted}>No issued documents have been recorded yet. Documents appear after the required Registry steps are completed.</p>}
      {active && <Link className={s.primary} href="/membership/certificates">View certificates ↗</Link>}
    </section>
  </>;

  if (section === "messages") return <>
    <PageHeading kicker="MEMBERSHIP · CORRESPONDENCE" title="Registry Correspondence" detail="Official messages and membership enquiries." />
    <section className={s.panel}><h2>Contact Registry</h2>
      <p className={s.muted}>In-portal messaging is not yet connected to the Registry. No messages will be marked as sent without a confirmed delivery.</p>
      <a className={s.primary} href="mailto:ServiceDesk@wcsports.co.za?subject=Membership%20Registry%20enquiry">Email Registry & ServiceDesk ↗</a>
    </section>
  </>;

  if (section === "support") return <>
    <PageHeading kicker="MYWCSA · MEMBER SERVICES" title="Help & Support" detail="Contact the appropriate team for your account, membership or payment enquiry." />
    <div className={s.twoColumns}>
      <section className={s.panel}><h2>Membership & access</h2><p className={s.muted}>For membership applications, WCSA IDs, account assistance and Registry corrections.</p><a className={s.primary} href="mailto:ServiceDesk@wcsports.co.za?subject=MyWCSA%20Membership%20Assistance">Contact ServiceDesk ↗</a></section>
      <section className={s.panel}><h2>Payments & invoices</h2><p className={s.muted}>For invoices, Paystack verification, receipts or payment queries.</p><a className={s.primary} href="mailto:Finances@wcsports.co.za?subject=MyWCSA%20Membership%20Finance">Contact Finance ↗</a></section>
    </div>
    <section className={s.panel}><h2>Include your application reference</h2><p className={s.muted}>When contacting support, quote <strong>{application.reference || "the reference on your application"}</strong> to help locate the relevant Registry record.</p></section>
  </>;

  return <section className={s.panel}><h1>Membership section unavailable</h1><p className={s.muted}>This part of the portal has not been connected to a trusted live service.</p><Link className={s.primary} href="/membership/dashboard">Return to dashboard</Link></section>;
}
