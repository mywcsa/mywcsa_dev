"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./launcher.module.css";

export type LauncherItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  category: "People" | "Operations" | "Administration" | "Services";
  icon: "users" | "grid" | "calendar" | "badge" | "file" | "briefcase" | "shield" | "layers";
  status: "available" | "preview" | "restricted";
  featured: boolean;
  sort_order: number;
};

type GlyphName = LauncherItem["icon"] | "search" | "home" | "star" | "arrow" | "menu" | "close" | "logout" | "help" | "sparkles" | "lock" | "check";

function Glyph({ name, size = 22 }: { name: GlyphName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<GlyphName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7.5"/><path d="m16.7 16.7 4.1 4.1"/></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/></>,
    star: <path d="m12 2.5 2.95 6.1 6.75.97-4.85 4.72 1.15 6.67L12 17.8l-6 3.16 1.15-6.67L2.3 9.57l6.75-.97z"/>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="M5 5l14 14M19 5 5 19"/></>,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M9 12h9"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.5"/></>,
    sparkles: <><path d="m12 2 2 7 7 3-7 2-2 8-2-8-7-2 7-3z"/><path d="m19 2 .7 1.5L21 4l-1.3.5L19 6l-.7-1.5L17 4l1.3-.5z"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    check: <><path d="m5 12 5 5L20 7"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 10h18M8 15h3"/></>,
    badge: <><circle cx="12" cy="9" r="6"/><path d="m8 14-1 7 5-3 5 3-1-7"/></>,
    file: <><path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v6h5M8 13h8M8 17h7"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 3 13 3 18 0M12 12v4"/></>,
    shield: <><path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6z"/><path d="M9 12l2 2 4-4"/></>,
    layers: <><path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const categories = ["All apps", "People", "Operations", "Administration", "Services"] as const;
type Category = (typeof categories)[number] | "Saved";

export default function LauncherDashboard({ name, email, apps, signOutControl }: { name: string; email: string; apps: LauncherItem[]; signOutControl: ReactNode }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<Category>("All apps");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    try {
      const value = JSON.parse(window.localStorage.getItem("mywcsa-launcher-favourites-v1") || "[]");
      if (Array.isArray(value)) setSaved(value.filter(v => typeof v === "string"));
    } catch { /* private browsing may disable storage */ }
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
      if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const toggleSaved = (slug: string) => setSaved(previous => {
    const next = previous.includes(slug) ? previous.filter(id => id !== slug) : [...previous, slug];
    try { window.localStorage.setItem("mywcsa-launcher-favourites-v1", JSON.stringify(next)); } catch {}
    return next;
  });
  // Old local favourites never reintroduce an app that the server has removed.
  const permittedSaved = useMemo(() => saved.filter(slug => apps.some(app => app.slug === slug)), [saved, apps]);
  const visible = useMemo(() => apps.filter(app =>
    (category === "All apps" || (category === "Saved" ? permittedSaved.includes(app.slug) : app.category === category)) &&
    [app.title, app.description, app.category].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  ), [apps, category, permittedSaved, query]);
  const available = apps.filter(app => app.status === "available").length;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0].toUpperCase()).join("");
  const firstName = name.trim().split(/\s+/)[0] || "there";

  const choose = (next: Category) => { setCategory(next); setDrawer(false); };
  return <div className={styles.root}>
    <div className={styles.ambient} aria-hidden="true"/>
    <header className={styles.header}>
      <div className={styles.brand}>
        <button type="button" className={styles.menuButton} onClick={() => setDrawer(!drawer)} aria-expanded={drawer} aria-controls="launcher-navigation" aria-label="Toggle navigation"><Glyph name={drawer ? "close" : "menu"}/></button>
        <Link href="/my-apps" aria-label="MyWCSA GovApps Home" className={styles.brandLogo}><img src="/wcg-logo-transparent.svg" alt="MyWCSA GovApps"/></Link>
        <div className={styles.brandTitle}><strong>MyWCSA <span>GovApps</span></strong><small>YOUR DIGITAL WORKSPACE</small></div>
      </div>
      <div className={styles.headerSearch}><Glyph name="search" size={20}/><input ref={searchRef} aria-label="Search applications" type="search" placeholder="Search apps and services..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>/</kbd></div>
      <div className={styles.headerActions}>
        <a href="mailto:ServiceDesk@wcsports.co.za" className={styles.supportLink}><Glyph name="help" size={19}/><span>Help & Support</span></a>
        <button type="button" className={styles.profileButton} aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}>
          <span className={styles.avatar}>{initials}</span><span className={styles.identity}><strong>{name}</strong><small>Staff workspace</small></span><span className={styles.profileChevron}>⌄</span>
        </button>
        {profileOpen && <div className={styles.profileMenu}><strong>{name}</strong><small>{email}</small><div className={styles.profileDivider}/><div className={styles.signout}><Glyph name="logout" size={17}/>{signOutControl}</div></div>}
      </div>
    </header>
    <div className={styles.shell}>
      <aside id="launcher-navigation" className={`${styles.sidebar} ${drawer ? styles.sidebarOpen : ""}`}>
        <div className={styles.sideEyebrow}>YOUR WORKSPACE</div>
        <button className={`${styles.navItem} ${category === "All apps" ? styles.navActive : ""}`} onClick={() => choose("All apps")}><Glyph name="home" size={19}/> <span>Overview</span></button>
        <button className={`${styles.navItem} ${category === "Saved" ? styles.navActive : ""}`} onClick={() => choose("Saved")}><Glyph name="star" size={19}/><span>Saved Apps</span><span className={styles.navCount}>{permittedSaved.length}</span></button>
        <div className={styles.navRule}/>
        <div className={styles.sideEyebrow}>BROWSE CATEGORIES</div>
        {categories.slice(1).map(item => <button key={item} className={`${styles.navItem} ${category === item ? styles.navActive : ""}`} onClick={() => choose(item)}><Glyph name={item === "People" ? "users" : item === "Operations" ? "grid" : item === "Administration" ? "briefcase" : "layers"} size={19}/><span>{item}</span></button>)}
        <div className={styles.sidebarBottom}><span className={styles.sidebarBottomIcon}><Glyph name="shield" size={20}/></span><strong>One secure workspace</strong><p>Find and access your authorised WCSA services in one place.</p><a href="mailto:ServiceDesk@wcsports.co.za">Contact ServiceDesk <Glyph name="arrow" size={14}/></a></div>
      </aside>
      {drawer && <button type="button" className={styles.mobileScrim} aria-label="Close navigation" onClick={() => setDrawer(false)}/>}
      <main className={styles.main}>
        <div className={styles.breadcrumb}><span>Workspace</span><span className={styles.breadcrumbDot}>/</span><strong>{category === "All apps" ? "Overview" : category === "Saved" ? "Saved Apps" : category}</strong></div>
        <section className={styles.hero}>
          <div className={styles.heroImage} aria-hidden="true"/>
          <div className={styles.heroContent}><div className={styles.heroEyebrow}><Glyph name="sparkles" size={15}/> YOUR WORKSPACE, SIMPLIFIED</div><h1>Good day, {firstName}<span className={styles.wave} aria-hidden="true"> 👋</span></h1><p>Everything you need to work, connect and make progress — together in one intelligent workspace.</p><a className={styles.heroCta} href="#applications">Explore my apps <Glyph name="arrow" size={17}/></a></div>
          <div className={styles.heroSignature}>People.<br/>Services.<br/><span>Progress.</span></div>
        </section>
        <section className={styles.stats} aria-label="Application overview">
          <div className={styles.stat}><span className={styles.statIcon} data-tone="blue"><Glyph name="grid" size={25}/></span><span><strong>{apps.length}</strong><small>Apps in your directory</small></span></div>
          <div className={styles.stat}><span className={styles.statIcon} data-tone="mint"><Glyph name="check" size={25}/></span><span><strong>{available}</strong><small>Active destinations</small></span></div>
          <div className={styles.stat}><span className={styles.statIcon} data-tone="lavender"><Glyph name="star" size={25}/></span><span><strong>{permittedSaved.length}</strong><small>Saved favourites</small></span></div>
        </section>
        <section className={styles.appSection} id="applications" aria-label="My applications">
          <div className={styles.sectionHead}><div><span className={styles.sectionEyebrow}>YOUR APPLICATIONS</span><h2>{category === "All apps" ? "Explore GovApps" : category === "Saved" ? "Saved applications" : category}</h2><p>Choose an application to continue to its workspace.</p></div><span className={styles.resultCount}>Showing {visible.length} of {apps.length} apps</span></div>
          <div className={styles.filters}>{categories.map(item => <button key={item} type="button" onClick={() => choose(item)} aria-pressed={category === item} className={category === item ? styles.filterActive : ""}>{item}</button>)}</div>
          {visible.length ? <div className={styles.appGrid}>{visible.map(app => <article className={styles.appCard} key={app.slug}>
            <div className={styles.appTop}><span className={styles.appIcon} data-icon={app.icon}><Glyph name={app.icon} size={26}/></span><button type="button" className={`${styles.favourite} ${saved.includes(app.slug) ? styles.favourited : ""}`} onClick={() => toggleSaved(app.slug)} aria-label={saved.includes(app.slug) ? `Remove ${app.title} from favourites` : `Save ${app.title} to favourites`} aria-pressed={saved.includes(app.slug)}><Glyph name="star" size={19}/></button></div>
            <span className={styles.categoryLabel}>{app.category.toUpperCase()}</span><h3>{app.title}</h3><p className={styles.description}>{app.description}</p>
            <div className={styles.cardFooter}><span className={`${styles.status} ${app.status === "available" ? styles.live : app.status === "restricted" ? styles.restricted : styles.preview}`}>{app.status === "available" ? "Available" : app.status === "restricted" ? "Restricted" : "Preview"}</span>
              {app.status === "restricted" ? <span className={styles.openDisabled}><Glyph name="lock" size={16}/> Access controlled</span> : app.href.startsWith("https://") ? <a className={styles.openApp} href={app.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${app.title} in a new tab`}>Open app <Glyph name="arrow" size={17}/></a> : <Link className={styles.openApp} href={app.href} aria-label={`Open ${app.title}`}>Open app <Glyph name="arrow" size={17}/></Link>}
            </div>
          </article>)}</div> : <div className={styles.empty}><Glyph name="search" size={34}/><h3>No applications found</h3><p>Try another search or category.</p><button onClick={() => { setQuery(""); choose("All apps"); }}>Show all apps</button></div>}
        </section>
        <footer className={styles.footer}><span>© {new Date().getFullYear()} Western Cape Sports Association NPC · MyWCSA GovApps</span><span>People <b>·</b> Services <b>·</b> Progress</span></footer>
      </main>
    </div>
  </div>;
}
