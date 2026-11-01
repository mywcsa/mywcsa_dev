"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CamsData, CamsStaff, Row } from "@/lib/cams/access";
import s from "./cams.module.css";

type View = "dash" | "organisations" | "schools" | "persons" | "assets" | "staff" | "audit" | "docs";
type Field = [key: string, label: string, options?: string[]];
const roles = ["system_admin", "registrar", "approver", "org_admin", "org_user", "read_only"];
const forms: Record<string, { table: string; fields: Field[] }> = {
  organisations: { table: "organisations", fields: [["name", "Organisation name"], ["type", "Type", ["school", "club", "department", "directorate", "initiative", "other"]], ["contact_email", "Contact email"]] },
  assets: { table: "assets", fields: [["tag", "Asset tag"], ["description", "Description"], ["location", "Location"], ["condition", "Condition"]] },
  staff: { table: "staff_access", fields: [["email", "Staff email"], ["full_name", "Full name"], ["role", "Role", roles], ["directorate", "Directorate"]] },
};
const labels: Record<string, string> = { dash: "Dashboard", organisations: "Organisations", schools: "Schools", persons: "Learners & Players", assets: "Assets", staff: "Staff & Roles", audit: "Audit Log", docs: "Documents" };
const icons: Record<string, string> = {
  dash: "M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z",
  organisations: "M4 21V8l8-5 8 5v13 M9 21v-6h6v6",
  schools: "M2 9l10-5 10 5-10 5z M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5",
  persons: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M17 4a4 4 0 0 1 0 7 M22 21a7 7 0 0 0-4-6",
  assets: "M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10",
  staff: "M12 3l8 3v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z M9 12l2 2 4-4",
  audit: "M9 3h6l5 5v13H4V3z M8 13h8 M8 17h8",
  docs: "M6 2h9l5 5v15H6z M14 2v6h6 M9 13h6 M9 17h6",
};
function Icon({ name }: { name: string }) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name] || icons.dash} /></svg>;
}
const wx = (c: number) => c === 0 ? "Clear" : c < 4 ? "Partly cloudy" : c < 50 ? "Fog" : c < 70 ? "Rain" : c < 90 ? "Showers" : "Storms";
const text = (v: unknown) => v === null || v === undefined ? "—" : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v).replace("T", " ").slice(0, 19);

export default function CamsApp({ me, data }: { me: CamsStaff; data: CamsData }) {
  const router = useRouter();
  const writer = ["system_admin", "registrar", "approver"].includes(me.role);
  const admin = me.role === "system_admin";
  const nav: View[] = ["dash", "organisations", "schools", ...(writer ? ["persons" as View] : []), "assets", ...(admin ? ["staff" as View, "audit" as View] : []), "docs"];
  const [view, setView] = useState<View>("dash");
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tpl, setTpl] = useState("Affiliation certificate");
  const [font, setFont] = useState("Helvetica");
  const [org, setOrg] = useState("");

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => { fetch("/api/cams/weather").then(r => r.json()).then(j => j.temperature != null && setWeather(Math.round(j.temperature) + "°C · " + wx(j.weatherCode))).catch(() => {}); }, []);

  const lists: Record<string, Row[]> = { organisations: data.orgs, schools: data.schools, persons: data.persons, assets: data.assets, staff: data.staff, audit: data.audit };
  const rows = (lists[view] || []).filter(r => !q || Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()));
  const cols = rows[0] ? Object.keys(rows[0]) : [];
  const types = data.orgs.reduce<Record<string, number>>((a, o) => { const k = String(o.type); a[k] = (a[k] || 0) + 1; return a; }, {});
  const max = Math.max(1, ...Object.values(types));
  const kpis: [string, number, View][] = [["Organisations", data.counts.organisations, "organisations"], ["Schools", data.counts.schools, "schools"], ["Learners & players", data.counts.persons, "persons"], ["Assets", data.counts.assets, "assets"], ["Staff", data.counts.staff, "staff"]];
  const go = (v: View) => { setView(v); setQ(""); setOpen(false); setErr(""); };

  async function save() {
    const f = forms[view]; if (!f) return;
    setBusy(true); setErr("");
    const row: Record<string, string> = {}; f.fields.forEach(([k, , o]) => { const v = vals[k] || (o ? o[0] : ""); if (v) row[k] = v; });
    const r = await fetch("/api/cams/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: f.table, row }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error || "Could not save."); return; }
    setOpen(false); setVals({}); router.refresh();
  }

  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href="/my-apps" className={s.brand}>
          <span className={s.logoWrap}><img src="/mywcsa-logo.png" alt="MyWCSA GovApps" /></span>
          <span><strong>MyWCSA <b>CAMS</b></strong><small>CENTRALISED ADMINISTRATIVE MANAGEMENT SYSTEM</small></span>
        </Link>
        <div className={s.headerRight}>
          <span className={s.clock}><strong>{now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</strong><small>{now.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}{weather ? " · " + weather : ""}</small></span>
          <span className={s.authStatus}><i className={s.dot} /><strong>{me.full_name}</strong><small>{me.role.replace("_", " ")}</small></span>
          <Link href="/my-apps" className={s.headerButton}>← GovApps</Link>
        </div>
      </header>
      <div className={s.shell}>
        <nav className={s.side} aria-label="CAMS">
          {nav.map(v => <button key={v} className={view === v ? s.on : ""} onClick={() => go(v)}><Icon name={v} />{labels[v]}</button>)}
        </nav>
        <main className={s.main}>
          <div className={s.titleRow}><div><span className={s.eyebrow}>MYWCSA GOVAPPS · CAMS</span><h1>{labels[view]}</h1></div></div>
          {view === "dash" && <>
            <div className={s.kpis}>{kpis.filter(k => k[2] !== "persons" || writer).filter(k => k[2] !== "staff" || admin).map(([l, n, v]) => <button key={l} className={s.kpi} onClick={() => go(v)}><span>{l}</span><b>{n}</b></button>)}</div>
            <div className={s.cols}>
              <section className={s.card}><h2>Organisations by type</h2>
                {Object.keys(types).length ? Object.entries(types).map(([k, n]) => <div key={k} className={s.bar}><span>{k}</span><i style={{ width: (n / max * 100) + "%" }} /><em>{n}</em></div>) : <p className={s.muted}>No organisations registered yet. Add the first one under Organisations.</p>}
              </section>
              <section className={s.card}><h2>Recent activity</h2>
                {admin ? (data.audit.length ? data.audit.slice(0, 8).map((a, i) => <p key={i} className={s.act}><b>{text(a.action)}</b> {text(a.table_name)} · {text(a.actor_email)}<small>{text(a.at)}</small></p>) : <p className={s.muted}>No activity recorded yet.</p>) : <p className={s.muted}>Activity is visible to System Administrators.</p>}
              </section>
            </div>
          </>}
          {view !== "dash" && view !== "docs" && <section className={s.card}>
            <div className={s.toolbar}>
              <input placeholder={"Search " + labels[view].toLowerCase() + "…"} value={q} onChange={e => setQ(e.target.value)} />
              <span className={s.muted}>{rows.length} record{rows.length === 1 ? "" : "s"}</span>
              {forms[view] && (view === "staff" ? admin : writer) && <button className={s.primary} onClick={() => setOpen(!open)}>{open ? "Cancel" : "+ New"}</button>}
            </div>
            {open && forms[view] && <div className={s.form}>
              {forms[view].fields.map(([k, l, o]) => <label key={k}>{l}{o ? <select value={vals[k] || o[0]} onChange={e => setVals({ ...vals, [k]: e.target.value })}>{o.map(x => <option key={x}>{x}</option>)}</select> : <input value={vals[k] || ""} onChange={e => setVals({ ...vals, [k]: e.target.value })} />}</label>)}
              <button className={s.primary} disabled={busy} onClick={save}>{busy ? "Saving…" : "Save record"}</button>
              {err && <p className={s.error}>{err}</p>}
            </div>}
            <div className={s.scroll}>
              {rows.length ? <table><thead><tr>{cols.map(c => <th key={c}>{c.replace(/_/g, " ")}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{cols.map(c => <td key={c}>{c === "status" || c === "role" ? <span className={s.badge}>{text(r[c])}</span> : text(r[c])}</td>)}</tr>)}</tbody></table> : <p className={s.muted}>No records found.</p>}
            </div>
          </section>}
          {view === "docs" && <section className={s.card}>
            <div className={s.toolbar}>
              <select value={tpl} onChange={e => setTpl(e.target.value)}><option>Affiliation certificate</option><option>Registration confirmation</option><option>Asset transfer form</option></select>
              <select value={org} onChange={e => setOrg(e.target.value)}><option value="">Select organisation</option>{data.orgs.map(o => <option key={String(o.ref)} value={String(o.name)}>{String(o.name)}</option>)}</select>
              <select value={font} onChange={e => setFont(e.target.value)}><option>Helvetica</option><option>Century Gothic</option></select>
              <button className={s.primary} onClick={() => window.print()}>Print / Save as PDF</button>
            </div>
            <article className={s.doc} style={{ fontFamily: font === "Helvetica" ? "Helvetica, Arial, sans-serif" : "'Century Gothic', CenturyGothic, AppleGothic, sans-serif" }}>
              <h3>Western Cape Sports Association NPC</h3>
              <h4>{tpl}</h4>
              <p>{org ? "Issued to " + org + "." : "Select an organisation to complete this document."}</p>
              <p>Date: {now.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p>Issued by: {me.full_name}, {me.directorate || "WCSA"}</p>
            </article>
            <p className={s.muted}>Documents export in Helvetica or Century Gothic only. SharePoint filing follows once the document store is connected.</p>
          </section>}
        </main>
      </div>
    </div>
  );
}
