"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./webos.module.css";

type AppItem = { name: string; category: string; description: string; href: string; mark: string; tone: string; external?: boolean };

const apps: AppItem[] = [
  { name: "GovApps", category: "WCSA", description: "Your WCSA digital gateway", href: "/", mark: "W", tone: "navy" },
  { name: "My Apps", category: "WCSA", description: "Your allocated applications", href: "/my-apps", mark: "▦", tone: "blue" },
  { name: "PERSAL", category: "WCSA", description: "Personnel management", href: "/persal", mark: "P", tone: "indigo" },
  { name: "WorkHub", category: "WCSA", description: "Work, people and benefits", href: "/workhub", mark: "✳", tone: "cyan" },
  { name: "ServiceDesk", category: "WCSA", description: "Support and service requests", href: "/servicedesk", mark: "⌘", tone: "violet" },
  { name: "Events", category: "WCSA", description: "Events and registrations", href: "/WCDA-Events", mark: "✦", tone: "pink" },
  { name: "ChatGPT", category: "AI & writing", description: "Research, write and think", href: "https://chatgpt.com", mark: "✳", tone: "dark", external: true },
  { name: "Microsoft 365", category: "Work", description: "Your work apps and files", href: "https://m365.cloud.microsoft/apps", mark: "▦", tone: "orange", external: true },
  { name: "Canva", category: "Design", description: "Create beautiful content", href: "https://www.canva.com", mark: "C", tone: "teal", external: true },
  { name: "GitHub", category: "Development", description: "Code and collaboration", href: "https://github.com", mark: "⌘", tone: "slate", external: true },
  { name: "Google Drive", category: "Work", description: "Cloud files and documents", href: "https://drive.google.com", mark: "△", tone: "green", external: true },
  { name: "Notion", category: "Work", description: "Notes and team knowledge", href: "https://www.notion.so", mark: "N", tone: "black", external: true },
];

const filters = ["All", "WCSA", "Work", "AI & writing", "Design", "Development"];

function Glyph({ children }: { children: React.ReactNode }) {
  return <span className={styles.glyph} aria-hidden="true">{children}</span>;
}

export default function WebOSPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [dark, setDark] = useState(true);
  const [activeTab, setActiveTab] = useState("Home");
  const [showAll, setShowAll] = useState(false);

  const visibleApps = useMemo(() => apps.filter((app) => {
    const matchesFilter = filter === "All" || app.category === filter;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || (app.name + " " + app.description + " " + app.category).toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  }), [filter, query]);

  function searchWeb(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) window.open("https://www.bing.com/search?q=" + encodeURIComponent(value), "_blank", "noopener,noreferrer");
  }

  return (
    <main className={dark ? styles.shell : styles.shell + " " + styles.light}>
      <div className={styles.wallpaper} />
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <section className={styles.browser} aria-label="WCSA WebOS browser preview">
        <header className={styles.chrome}>
          <div className={styles.chromeTop}>
            <div className={styles.traffic} aria-label="Window controls"><i/><i/><i/></div>
            <div className={styles.brand}><span className={styles.brandMark}>W</span><span>WCSA <b>WebOS</b></span><em>PREVIEW</em></div>
            <div className={styles.chromeActions}>
              <button className={styles.iconButton} aria-label="Toggle appearance" onClick={() => setDark(!dark)}>{dark ? "☼" : "☾"}</button>
              <button className={styles.profile} aria-label="User profile">T</button>
            </div>
          </div>
          <div className={styles.tabRow}>
            {["Home", "WCSA Workspace", "Productivity"].map((tab) => (
              <button key={tab} className={activeTab === tab ? styles.activeTab : styles.tab} onClick={() => { setActiveTab(tab); setFilter(tab === "WCSA Workspace" ? "WCSA" : tab === "Productivity" ? "Work" : "All"); }}>
                <span className={styles.tabDot}/>{tab}<span className={styles.tabClose}>×</span>
              </button>
            ))}
            <button className={styles.newTab} aria-label="New tab" onClick={() => { setActiveTab("Home"); setFilter("All"); }}>＋</button>
          </div>
          <div className={styles.toolbar}>
            <div className={styles.navControls}><button aria-label="Back" onClick={() => history.back()}>‹</button><button aria-label="Forward" onClick={() => history.forward()}>›</button><button aria-label="Refresh" onClick={() => location.reload()}>↻</button></div>
            <form className={styles.address} onSubmit={searchWeb}>
              <span className={styles.lock}>⌕</span>
              <input aria-label="Search or enter address" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the web or enter an address" />
              <span className={styles.addressHint}>Bing</span>
            </form>
            <button className={styles.toolbarMore} aria-label="More browser options">•••</button>
          </div>
        </header>

        <div className={styles.content}>
          <aside className={styles.rail} aria-label="Browser navigation">
            <button className={styles.railActive} title="Home">⌂</button>
            <button title="Bookmarks" onClick={() => setFilter("All")}>☆</button>
            <button title="WCSA Workspace" onClick={() => setFilter("WCSA")}>▦</button>
            <button title="Productivity" onClick={() => setFilter("Work")}>✧</button>
            <span className={styles.railSpacer}/>
            <button title="Settings" onClick={() => setDark(!dark)}>⚙</button>
          </aside>

          <div className={styles.mainPanel}>
            <div className={styles.topLine}><span><span className={styles.liveDot}/> YOUR DIGITAL WORKSPACE</span><span>WESTERN CAPE · SOUTH AFRICA</span></div>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>A BETTER WAY TO WORK</span>
                <h1>Your work.<br/><span>One beautiful space.</span></h1>
                <p>Welcome to your connected WCSA workspace. Find your tools, explore ideas and get things moving.</p>
                <form className={styles.searchBox} onSubmit={searchWeb}>
                  <span className={styles.searchIcon}>⌕</span>
                  <input aria-label="Search Bing or your apps" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What would you like to find today?" />
                  <button type="submit" aria-label="Search the web">→</button>
                </form>
                <div className={styles.searchMeta}><span>POWERED BY BING SEARCH</span><span>WCSA PRODUCTIVITY SPACE</span></div>
              </div>
              <div className={styles.heroOrb} aria-hidden="true"><div className={styles.orbRing}/><div className={styles.orbCore}>W</div><span className={styles.orbCaption}>UNITED · EMPOWERED · EXCELLING</span></div>
            </section>

            <section className={styles.appsSection}>
              <div className={styles.sectionHead}>
                <div><span className={styles.eyebrow}>YOUR DIGITAL TOOLKIT</span><h2>Quick access</h2></div>
                <button className={styles.viewAll} onClick={() => setShowAll(!showAll)}>{showAll ? "Show essentials" : "Explore all"} <span>↗</span></button>
              </div>
              <div className={styles.filters}>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? styles.filterActive : styles.filter}>{item}</button>)}</div>
              <div className={styles.appGrid}>
                {visibleApps.slice(0, showAll ? visibleApps.length : 8).map((app) => (
                  <a className={styles.appCard} href={app.href} key={app.name} target={app.external ? "_blank" : undefined} rel={app.external ? "noreferrer" : undefined}>
                    <span className={styles.appIcon} data-tone={app.tone}><Glyph>{app.mark}</Glyph></span>
                    <span className={styles.appName}>{app.name}</span>
                    <span className={styles.appDescription}>{app.description}</span>
                    {app.external && <span className={styles.externalMark}>↗</span>}
                  </a>
                ))}
                {visibleApps.length === 0 && <div className={styles.empty}>No apps match that search. Try another name or category.</div>}
              </div>
            </section>

            <section className={styles.bottomGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>✧</div><div><span className={styles.eyebrow}>MADE FOR FOCUS</span><h3>Less searching.<br/>More doing.</h3><p>Your approved work tools, gathered in one place.</p></div><span className={styles.featureGlow}/>
              </div>
              <div className={styles.infoCard}><span className={styles.eyebrow}>WCSA WEBOS</span><h3>A connected digital ecosystem.</h3><p>This is the first design preview. Hosting, domain management and browser features will be introduced in later releases.</p><a href="mailto:ServiceDesk@wcsports.co.za">Need help? Contact ServiceDesk ↗</a></div>
            </section>
            <footer className={styles.footer}><span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span><span>WCSA WebOS · Design preview</span></footer>
          </div>
        </div>
      </section>
      <div className={styles.bottomNote}>A WCSA digital experience <span>•</span> United. Empowered. Excelling.</div>
    </main>
  );
}
