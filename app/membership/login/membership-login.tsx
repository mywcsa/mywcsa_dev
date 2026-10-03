"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.css";

function Icon({ name }: { name: "arrow" | "lock" | "help" }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" /><path d="M12 16h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function MembershipLogin() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image src="/mywcsa-logo.png" alt="MyWCSA GovApps" width={258} height={81} priority className={styles.logo} unoptimized />
          <span className={styles.brandDivider} aria-hidden="true" />
          <div className={styles.portalTitle}>MyWCSA<span>Account Registration</span></div>
        </div>
        <Link href="mailto:ServiceDesk@wcsports.co.za" className={styles.help}><Icon name="help" /><span>Help & Support</span></Link>
      </header>

      <main className={styles.main}>
        <div className={styles.background} aria-hidden="true" />
        <div className={styles.content}>
          <section className={styles.welcome} aria-labelledby="welcome-title">
            <span className={styles.eyebrow}><span aria-hidden="true" /> ONE MYWCSA ACCOUNT</span>
            <h1 id="welcome-title">Your account first.<br />Applications second.</h1>
            <p className={styles.intro}>MyWCSA uses one GovApps identity across Membership, Applications and the organisation services you are authorised to access.</p>
            <div className={styles.features}>
              <div><span className={styles.featureNumber}>01</span><p><strong>Sign in once</strong><span>Existing staff and GovApps users are recognised automatically.</span></p></div>
              <div><span className={styles.featureNumber}>02</span><p><strong>Create an account if needed</strong><span>New external users register before starting an organisation application.</span></p></div>
              <div><span className={styles.featureNumber}>03</span><p><strong>Start organisation applications</strong><span>After authentication, continue to the Membership workspace and application process.</span></p></div>
            </div>
            <div className={styles.initiatives} aria-label="Participating initiatives"><span>WCSA</span><span>WCSSA</span><span>iKM</span><span>WCDA</span><span>WCOB</span></div>
            <p className={styles.parent}>Western Cape Sports Association NPC · MyWCSA GovApps</p>
          </section>

          <section className={styles.card} aria-labelledby="signin-title">
            <div className={styles.cardIcon}><Icon name="lock" /></div>
            <span className={styles.cardEyebrow}>MYWCSA GOVAPPS ACCOUNT</span>
            <h2 id="signin-title">Account access</h2>
            <p className={styles.cardIntro}>If you already use MyWCSA GovApps, do not create another account. Sign in with the same account.</p>

            <Link className={styles.primary} href="/login/staff">Staff sign in <Icon name="arrow" /></Link>
            <Link className={styles.secondary} href="/login/business-partner">Business Partner sign in <Icon name="arrow" /></Link>
            <Link className={styles.secondary} href="/login/external-user">External User sign in <Icon name="arrow" /></Link>

            <div className={styles.separator}><span>New to MyWCSA GovApps?</span></div>
            <Link className={styles.secondary} href="/login/external-user?mode=register&returnTo=/membership/dashboard">Create a MyWCSA account <Icon name="arrow" /></Link>
            <p className={styles.cardIntro} style={{marginTop:16}}>After sign-in or registration you will enter the Membership workspace, where you can start or manage organisation applications.</p>
          </section>
        </div>
      </main>

      <footer className={styles.footer}><p>Western Cape Sports Association NPC</p><nav aria-label="Footer"><Link href="mailto:ServiceDesk@wcsports.co.za">Support</Link></nav></footer>
    </div>
  );
}
