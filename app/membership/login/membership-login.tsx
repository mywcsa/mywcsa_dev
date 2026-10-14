"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import styles from "./login.module.css";

function Arrow() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6"/>
  </svg>;
}
function safeReturnTo(value: string | null) {
  return value && /^\/(?!\/|\\)[^\\\r\n]*$/.test(value) ? value : "/membership";
}

export default function MembershipLogin() {
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("returnTo"));
  const selected = params.get("accountType");
  const paths = {
    partner: "/login/business-partner?returnTo=" + encodeURIComponent(returnTo),
    external: "/login/external-user?returnTo=" + encodeURIComponent(returnTo),
    staff: "/login/staff?returnTo=" + encodeURIComponent(returnTo),
    registerPartner: "/login/business-partner/register?returnTo=" + encodeURIComponent(returnTo),
    registerExternal: "/login/external-user/register?returnTo=" + encodeURIComponent(returnTo),
  };

  return <div className={styles.page}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/membership">
        <span className={styles.logoPlate}><Image src="/mywcsa-logo.png" alt="MyWCSA GovApps" width={132} height={55} unoptimized priority /></span>
        <span className={styles.portalTitle}>MyWCSA Membership<span>Secure account access</span></span>
      </Link>
      <Link href="/membership" className={styles.help}>← Membership Portal</Link>
    </header>

    <main className={styles.main}>
      <div className={styles.content}>
        <section className={styles.welcome}>
          <span className={styles.eyebrow}><span/> MYWCSA GOVAPPS · MEMBERSHIP</span>
          <h1>One portal.<br/><em>Secure access.</em></h1>
          <p className={styles.intro}>Choose how you access MyWCSA Membership. Your account type determines the services available to you.</p>
          <div className={styles.glassNote}>
            <strong>Business Partner</strong><span>Schools, clubs, associations and other organisations</span>
            <strong>External User</strong><span>Individuals, participants, learners and volunteers</span>
          </div>
        </section>
        <section className={styles.card} aria-labelledby="access-title">
          <span className={styles.cardEyebrow}>MYWCSA GOVAPPS</span>
          <h2 id="access-title">Sign in</h2>
          <p className={styles.cardIntro}>Select your account to continue.</p>
          <Link className={selected === "business-partner" ? styles.primary : styles.secondary} href={paths.partner}>Business Partner <Arrow/></Link>
          <Link className={selected === "external-user" ? styles.primary : styles.secondary} href={paths.external}>External User <Arrow/></Link>
          <Link className={styles.secondary} href={paths.staff}>WCSA Staff <Arrow/></Link>
          <div className={styles.separator}><span>New to MyWCSA?</span></div>
          <Link className={styles.registerLink} href={paths.registerPartner}>Register Business Partner <Arrow/></Link>
          <Link className={styles.registerLink} href={paths.registerExternal}>Register External User <Arrow/></Link>
          <p className={styles.helpNote}>Need assistance? <a href="mailto:ServiceDesk@wcsports.co.za">Contact ServiceDesk</a></p>
        </section>
      </div>
    </main>

    <footer className={styles.footer}><span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span><span>MyWCSA GovApps · Membership</span></footer>
  </div>;
}
