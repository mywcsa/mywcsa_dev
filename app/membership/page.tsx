import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { rpc, supabaseConfig } from "@/lib/ams/supabase";
import styles from "./landing.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-membership-poppins",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Membership Portal | MyWCSA GovApps",
  description: "Membership registration, renewals and services for Western Cape Sports Association NPC initiatives.",
};

type Fee = { initiative: string; category: string; year: string; amount: number; currency: string };
const memberships = [
  { name: "School", initiative: "WCSSA", note: "Schools and school-based programmes", icon: "school" },
  { name: "Club", initiative: "WCSA", note: "Clubs, teams and community activities", icon: "users" },
  { name: "Association", initiative: "WCSA", note: "Recognised associations and regional bodies", icon: "network" },
  { name: "Development Organisation", initiative: "WCDA", note: "Development and community programmes", icon: "spark" },
  { name: "Cultural Organisation", initiative: "IKM", note: "Arts, heritage and cultural initiatives", icon: "music" },
  { name: "Umbrella Body", initiative: "WCOB", note: "Organisations supporting affiliated bodies", icon: "building" },
] as const;

function CardIcon({ kind }: { kind: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "school" ? <><path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-7h6v7M7 11h1m8 0h1"/></> :
      kind === "users" ? <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 4 5v2"/></> :
      kind === "network" ? <><circle cx="12" cy="4" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m11 6-5 11m7-11 5 11M7 19h10"/></> :
      kind === "spark" ? <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></> :
      kind === "music" ? <><path d="M9 19V5l12-3v14"/><circle cx="6" cy="19" r="3"/><circle cx="18" cy="16" r="3"/></> :
      <><path d="M3 21h18M5 21V8l7-5 7 5v13M9 12h6M9 16h6"/></>}
  </svg>;
}

async function fees(): Promise<Fee[]> {
  try {
    const config = supabaseConfig();
    const response = await fetch(
      config.origin + "/rest/v1/wcsa_membership_fee_schedule?year=eq.2027&select=initiative,category,year,amount,currency",
      { headers: { apikey: config.secret, Authorization: "Bearer " + config.secret }, cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? data as Fee[] : [];
  } catch { return []; }
}

export default async function MembershipLanding() {
  const session = await auth();
  if (session?.user?.email) {
    // Active and submitted members belong in the real Registry dashboard.
    try {
      const state = await rpc<{ hasApplication?: boolean }>("wcsa_member_portal", {
        p_email: session.user.email.toLowerCase(),
      });
      if (state?.hasApplication) redirect("/membership/dashboard");
    } catch (error) {
      // Never hide a Next.js redirect.
      if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
      // Fail safely to the public entry if Registry is temporarily unavailable.
    }
  }

  const publishedFees = await fees();
  const price = (initiative: string, category: string) => {
    const entry = publishedFees.find(f => f.initiative === initiative && f.category === category && f.year === "2027");
    if (!entry || entry.currency !== "ZAR") return "Fee confirmed during application";
    return entry.amount === 0 ? "No annual fee" : new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(entry.amount / 100) + " / year";
  };

  return <div className={[styles.page, poppins.variable].join(" ")}>
    <header className={styles.header}>
      <Link className={styles.identity} href="/membership">
        <span className={styles.logoPlate}><img src="/mywcsa-logo.png" alt="MyWCSA GovApps" /></span>
        <span className={styles.brandTitle}><strong>MyWCSA Membership</strong><small>Members · Services · Progress</small></span>
      </Link>
      <div className={styles.accountActions}>
        <Link href="/membership/support">Help & Support</Link>
        {session?.user ? <Link className={styles.accountButton} href="/membership/apply">Start application ↗</Link> :
          <><Link className={styles.signin} href="/membership/login?returnTo=/membership">Sign in</Link>
          <Link className={styles.accountButton} href="/membership/login?returnTo=/membership/apply">Get started ↗</Link></>}
      </div>
    </header>

    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}><span className={styles.dot} aria-hidden="true"/> MYWCSA GOVAPPS · MEMBERSHIP</span>
          <h1>Membership made <span>simple.</span></h1>
          <p>One connected place to apply, renew and access your organisation's membership services across WCSA initiatives.</p>
          <div className={styles.heroActions}>
            <Link className={styles.accountButton} href={session?.user ? "/membership/apply" : "/membership/login?returnTo=/membership/apply"}>Start membership application <span aria-hidden="true">↗</span></Link>
            <a className={styles.ghostButton} href="#memberships">Explore memberships ↓</a>
          </div>
          <div className={styles.heroNote}><span className={styles.dot} aria-hidden="true"/> Registry-managed membership and verified payments</div>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <div className={styles.orbitOne}/><div className={styles.orbitTwo}/>
          <div className={styles.artGlass}><span>MyWCSA</span><strong>Membership Portal</strong><div><i/><i/><i/></div></div>
        </div>
      </section>

      <div className={styles.crumb}><Link href="/">GovApps</Link><span>/</span><strong>Membership</strong></div>

      <section id="memberships" className={styles.memberSection}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.sectionKicker}>FIND YOUR MEMBERSHIP</span><h2>Choose your membership</h2><p>Schools, associations, clubs, culture, development and community organisations.</p></div>
          <Link className={styles.individualLink} href="/membership/login?accountType=external-user&returnTo=/membership/apply">Individual access ↗</Link>
        </div>
        <div className={styles.grid}>
          {memberships.map(item => <article key={item.initiative + item.name}>
            <div className={styles.cardTop}><div className={styles.cardIcon}><CardIcon kind={item.icon} /></div><span>{item.initiative}</span></div>
            <div className={styles.cardBody}>
              <h3>{item.name}</h3>
              <p>{item.note}</p>
              <strong>{price(item.initiative, item.name)}</strong>
              <Link href={session?.user ? "/membership/apply" : "/membership/login?accountType=business-partner&returnTo=%2Fmembership%2Fapply"}>Apply or renew <span aria-hidden="true">↗</span></Link>
            </div>
          </article>)}
        </div>
      </section>

      <section className={styles.info} aria-label="Membership process">
        <div><span className={styles.processIcon}>01</span><div><strong>Apply online</strong><p>Choose your initiative and provide the required details through the application wizard.</p></div></div>
        <div><span className={styles.processIcon}>02</span><div><strong>Registry review</strong><p>Your submitted record is checked through MyWCSA membership services.</p></div></div>
        <div><span className={styles.processIcon}>03</span><div><strong>Payment and activation</strong><p>Pay only a verified invoice; certificates and services depend on approval and status.</p></div></div>
      </section>
    </main>

    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Western Cape Sports Association NPC · MyWCSA GovApps</span>
      <nav><a href="mailto:ServiceDesk@wcsports.co.za">ServiceDesk</a><a href="mailto:Finances@wcsports.co.za">Finance</a><Link href="/">GovApps</Link></nav>
    </footer>
  </div>;
}
