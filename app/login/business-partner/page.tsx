import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import BusinessPartnerLoginForm from "./business-partner-login-form";
import styles from "./business-partner-login.module.css";

export const metadata: Metadata = {
  title: "Business Partner Login | MyWCSA GovApps",
  description: "Secure MyWCSA GovApps access for schools, clubs, associations and authorised organisational partners.",
};

type Query = { returnTo?: string; mode?: string; error?: string; created?: string };

// Keep destinations inside GovApps; never honour an external redirect.
function safeDestination(value?: string) {
  return value && /^\/(?!\/|\\)[^\\\r\n]*$/.test(value) ? value : "/membership";
}

function ServiceCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.service}>
      <div className={styles.serviceIcon}>{children}</div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
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
        // Do not disclose whether the email, username or WCSA ID exists.
        redirect(loginUrl + "&error=invalid");
      }
      throw error;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <a className={styles.brand} href="/" aria-label="Return to MyWCSA GovApps gateway">
            <span className={styles.brandPlate}>
              <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
            </span>
            <span className={styles.brandText}>
              <strong>MyWCSA GovApps</strong>
              <span>Business Partner Services</span>
            </span>
          </a>
          <a className={styles.headerLink} href="/">← All access options</a>
        </header>

        <main className={styles.main}>
          <section className={styles.hero} aria-labelledby="welcome">
            <div className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              Organisation Access Portal
            </div>
            <h1 id="welcome">Your organisation.<br /><span>One connected workspace.</span></h1>
            <p className={styles.lead}>
              A simpler way for schools, clubs, associations and institutional partners
              to access their MyWCSA services from one secure account.
            </p>

            <div className={styles.services} aria-label="Partner portal service areas">
              <ServiceCard title="Organisation profile" description="Your institutional details">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1m4 0h1M9 14h1m4 0h1M10 21v-4h4v4" />
                </svg>
              </ServiceCard>
              <ServiceCard title="Membership access" description="Applications and renewals">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                  <rect x="4" y="3" width="16" height="18" rx="2"/>
                  <path d="M8 8h8M8 12h8M8 16h5"/>
                </svg>
              </ServiceCard>
              <ServiceCard title="Records & documents" description="Your digital paperwork">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                  <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v6h5M9 14h7M9 18h5" />
                </svg>
              </ServiceCard>
              <ServiceCard title="Protected sign-in" description="Controlled account access">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                  <path d="m12 2 8 4v5c0 6-3.5 9.5-8 11-4.5-1.5-8-5-8-11V6l8-4Z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </ServiceCard>
            </div>
          </section>

          <section className={styles.card} aria-labelledby="login-title">
            <div className={styles.cardTop}>
              <span className={styles.cardBadge}>
                <span aria-hidden="true">✦</span> Business Partner
              </span>
              <span className={styles.securityIcon} aria-label="Secure account access" role="img">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                </svg>
              </span>
            </div>
            <h2 id="login-title">Welcome back</h2>
            <p className={styles.intro}>
              Sign in with your registered organisational account to continue.
            </p>

            {q.created === "1" && (
              <div className={styles.success} role="status">
                Registration completed. You can now sign in.
              </div>
            )}
            {q.error && (
              <div className={styles.notice} role="alert">
                Sign-in was unsuccessful. Check your details and try again.
                If the problem continues, contact the ServiceDesk.
              </div>
            )}
            <BusinessPartnerLoginForm
              action={signInPartner}
              registrationUrl={registrationUrl}
            />
            <div className={styles.support}>
              Need assistance? Contact{" "}
              <a href="mailto:ServiceDesk@wcsports.co.za">ServiceDesk@wcsports.co.za</a>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Western Cape Sports Association NPC · MyWCSA GovApps</span>
          <span className={styles.footerLinks}>
            <a href="/">GovApps Gateway</a>
            <a href="mailto:ServiceDesk@wcsports.co.za">Help & Support</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
