import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import styles from "./staff-login.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Staff Sign In | MyWCSA GovApps",
  description: "Secure Microsoft organisational sign-in for Western Cape Sports Association NPC staff.",
};

// Keep return destinations inside the GovApps installation.
function safeDestination(value?: string) {
  return value && /^\/(?!\/|\\)[^\\\r\n]*$/.test(value) ? value : "/my-apps";
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 2 9 4v6c0 5.5-3.4 9-9 10-5.6-1-9-4.5-9-10V6l9-4Z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const destination = safeDestination(returnTo);
  const session = await auth();
  if (session?.user) redirect(destination);

  async function continueWithMicrosoft() {
    "use server";
    // Preserve the existing Microsoft Entra authentication and callback destination.
    await signIn("microsoft-entra-id", { redirectTo: destination });
  }

  return (
    <div className={[styles.page, poppins.className].join(" ")}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="/" aria-label="MyWCSA GovApps homepage">
            <img className={styles.brandLogo} src="/wcg-logo-transparent.svg" alt="Western Cape Government" />
            <span className={styles.brandDivider} aria-hidden="true" />
            <span className={styles.brandText}>
              <strong>MyWCSA GovApps</strong>
              <small>People | Services | Progress</small>
            </span>
          </a>
          <a href="mailto:ServiceDesk@wcsports.co.za" className={styles.headerInfo}>
            <ShieldIcon />
            Help &amp; Support
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <aside className={styles.visual} aria-label="Western Cape Sports Association staff access">
          <span className={styles.visualTag}><ShieldIcon /> SECURE EMPLOYEE ACCESS</span>
          <div className={styles.visualCopy}>
            <p className={styles.visualEyebrow}>MYWCSA GOVAPPS · STAFF</p>
            <h1>One connected<br/><span>workplace.</span></h1>
            <p>Your people, your teams and the tools you need — connected in one digital workspace.</p>
          </div>
        </aside>

        <section className={styles.authPanel} aria-labelledby="staff-sign-in-heading">
          <div className={styles.logoWrap}>
            <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
          </div>

          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            STAFF ACCESS
          </p>
          <h2 id="staff-sign-in-heading">Staff Sign In</h2>
          <p className={styles.intro}>Sign in using your WCSA Microsoft organisational account.</p>

          <div className={styles.rule} aria-hidden="true" />

          <p className={styles.ssoTitle}>Microsoft organisational sign-in</p>
          <p className={styles.ssoDetail}>Continue to your organisation&apos;s secure Microsoft sign-in page.</p>

          <form className={styles.msForm} action={continueWithMicrosoft}>
            <button type="submit" className={styles.msButton}>
              <span className={styles.msButtonLabel}>
                <span className={styles.microsoftMark} aria-hidden="true"><span/><span/><span/><span/></span>
                Continue with Microsoft
              </span>
              <svg className={styles.buttonArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h16m-6-6 6 6-6 6"/>
              </svg>
            </button>
          </form>

          <div className={styles.security}>
            <ShieldIcon />
            <p><strong>Protected access.</strong> Staff sign-in uses Microsoft authentication. Access to individual GovApps services still depends on your assigned permissions.</p>
          </div>

          <a className={styles.returnLink} href="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 12H4m6 6-6-6 6-6"/>
            </svg>
            Return to MyWCSA GovApps
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Western Cape Sports Association NPC · MyWCSA GovApps</span>
        <span>Need assistance? <a href="mailto:ServiceDesk@wcsports.co.za">Contact ServiceDesk</a></span>
      </footer>
    </div>
  );
}
