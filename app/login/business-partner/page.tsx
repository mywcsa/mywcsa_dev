import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { Poppins } from "next/font/google";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import BusinessPartnerLoginForm from "./business-partner-login-form";
import styles from "./business-partner-login.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Business Partner Login | MyWCSA GovApps",
  description: "Business Partner account sign-in for MyWCSA GovApps.",
};

type Query = { returnTo?: string; mode?: string; error?: string; created?: string };

// Only allow destinations within this GovApps installation.
function safeDestination(value?: string) {
  return value && /^\/(?!\/|\\)[^\\\r\n]*$/.test(value) ? value : "/membership";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const q = await searchParams;
  const destination = safeDestination(q.returnTo);
  const registrationUrl =
    "/login/business-partner/register?returnTo=" + encodeURIComponent(destination);

  const session = await auth();
  if (session?.user) redirect(destination);
  if (q.mode === "register") redirect(registrationUrl);

  async function signInPartner(form: FormData): Promise<void> {
    "use server";
    const identifier = String(form.get("identifier") || "").trim();
    const password = String(form.get("password") || "");
    const loginUrl =
      "/login/business-partner?returnTo=" + encodeURIComponent(destination);

    if (!identifier || !password || identifier.length > 254 || password.length > 256) {
      redirect(loginUrl + "&error=invalid");
    }

    try {
      await signIn("business-partner", {
        identifier,
        password,
        redirectTo: destination,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        // Do not reveal whether an account identifier exists.
        redirect(loginUrl + "&error=invalid");
      }
      throw error;
    }
  }

  return (
    <div className={[styles.page, poppins.className].join(" ")}>
      <div className={styles.ambientOne} aria-hidden="true" />
      <div className={styles.ambientTwo} aria-hidden="true" />
      <div className={styles.ambientThree} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <a href="/" className={styles.topBrand} aria-label="MyWCSA GovApps home">
            <span className={styles.brandMark} aria-hidden="true">M</span>
            <span>MyWCSA <b>GovApps</b></span>
          </a>
          <a className={styles.backLink} href="/">
            <span aria-hidden="true">←</span> Back to GovApps
          </a>
        </header>

        <main className={styles.main}>
          <div className={styles.glassFrame}>
            <aside className={styles.identity} aria-label="MyWCSA GovApps Business Partner Access">
              <div className={styles.identityTop}>
                <div className={styles.logoPlate}>
                  <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
                </div>
                <div className={styles.identityDivider} />
                <p className={styles.identityEyebrow}>MyWCSA GovApps</p>
                <h1>Business Partner<br />Access</h1>
                <p className={styles.identityDescription}>
                  Secure sign-in for registered organisations.
                </p>
              </div>
              <div className={styles.identityBottom}>
                <span className={styles.secureLight} aria-hidden="true" />
                <span>Official organisational sign-in</span>
              </div>
            </aside>

            <section className={styles.loginPanel} aria-labelledby="login-title">
              <div className={styles.loginHead}>
                <span className={styles.overline}>BUSINESS PARTNERS</span>
                <span className={styles.lockIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10" width="14" height="11" rx="2"/>
                    <path d="M8 10V7a4 4 0 1 1 8 0v3"/>
                  </svg>
                </span>
              </div>
              <h2 id="login-title">Sign in</h2>
              <p className={styles.intro}>Enter your Business Partner account details.</p>
              {q.created === "1" && (
                <div className={styles.success} role="status">
                  Registration completed. You can now sign in.
                </div>
              )}
              {q.error && (
                <div className={styles.notice} role="alert">
                  Sign-in failed. Check your details and try again.
                </div>
              )}
              <BusinessPartnerLoginForm
                action={signInPartner}
                registrationUrl={registrationUrl}
              />
              <div className={styles.support}>
                Need help? <a href="mailto:ServiceDesk@wcsports.co.za">Contact the ServiceDesk</a>
              </div>
            </section>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span>
          <span>MyWCSA GovApps · Business Partner Access</span>
        </footer>
      </div>
    </div>
  );
}
