import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/ams/supabase";
import BusinessPartnerRegistrationForm from "./business-partner-registration-form";
import shared from "../business-partner-login.module.css";
import styles from "./register.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Register Business Partner | MyWCSA GovApps",
  description: "Register an authorised organisation's Business Partner account using an existing WCSA ID.",
};

type Query = { returnTo?: string; error?: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeDestination(value?: string) {
  return value && /^\/(?!\/|\\)[^\\\r\n]*$/.test(value) ? value : "/membership";
}

export default async function BusinessPartnerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const destination = safeDestination(query.returnTo);
  const signInUrl = "/login/business-partner?returnTo=" + encodeURIComponent(destination);
  const registerUrl = "/login/business-partner/register?returnTo=" + encodeURIComponent(destination);
  const session = await auth();
  if (session?.user) redirect(destination);

  async function registerPartner(form: FormData): Promise<void> {
    "use server";

    const redirectTarget = safeDestination(String(form.get("returnTo") || ""));
    const registerPath = "/login/business-partner/register?returnTo=" + encodeURIComponent(redirectTarget);
    const loginPath = "/login/business-partner?returnTo=" + encodeURIComponent(redirectTarget);
    const wcsaId = String(form.get("wcsaId") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    // These checks run on the server, independently of the browser form.
    if (
      !wcsaId || wcsaId.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      username.length < 4 || username.length > 64 ||
      password.length < 8 || Buffer.byteLength(password, "utf8") > 72 ||
      password !== confirmPassword
    ) {
      redirect(registerPath + "&error=invalid");
    }

    let response: Response;
    try {
      const config = supabaseConfig();
      response = await fetch(config.origin + "/rest/v1/rpc/govapps_create_account", {
        method: "POST",
        headers: {
          apikey: config.secret,
          Authorization: "Bearer " + config.secret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_account_type: "business_partner",
          p_email: email,
          p_username: username,
          p_password: password,
          p_wcsa_id: wcsaId,
          p_date_of_birth: null,
        }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      redirect(registerPath + "&error=unavailable");
    }

    if (!response.ok) {
      // Fail closed. Database errors never expose identity records or raw SQL.
      redirect(registerPath + "&error=registration");
    }

    const createdAccountId: unknown = await response.json().catch(() => null);
    if (typeof createdAccountId !== "string" || !UUID.test(createdAccountId)) {
      redirect(registerPath + "&error=unavailable");
    }

    // The account exists in Supabase; let the registrant sign in.
    redirect(loginPath + "&created=1");
  }

  return (
    <div className={[shared.page, poppins.className].join(" ")}>
      <div className={shared.ambientOne} aria-hidden="true" />
      <div className={shared.ambientTwo} aria-hidden="true" />
      <div className={shared.ambientThree} aria-hidden="true" />
      <div className={shared.shell}>
        <header className={shared.topBar}>
          <a href="/" className={shared.topBrand} aria-label="Return to MyWCSA GovApps">
            <span className={shared.brandMark} aria-hidden="true">M</span>
            <span>MyWCSA <b>GovApps</b></span>
          </a>
          <a className={shared.backLink} href={signInUrl}>
            <span aria-hidden="true">←</span> Back to sign in
          </a>
        </header>

        <main className={shared.main}>
          <div className={[shared.glassFrame, styles.registrationFrame].join(" ")}>
            <aside className={shared.identity}>
              <div className={shared.identityTop}>
                <div className={shared.logoPlate}>
                  <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
                </div>
                <div className={shared.identityDivider} />
                <p className={shared.identityEyebrow}>MyWCSA GovApps</p>
                <h1>Business Partner<br />Registration</h1>
                <p className={shared.identityDescription}>
                  Create your organisation's secure account for MyWCSA GovApps.
                </p>
                <div className={styles.idHelp}>
                  <strong>Already have a WCSA ID?</strong>
                  <p>Use the WCSA ID issued to your organisation. If you have not been issued one, contact <a href="mailto:ServiceDesk@wcsports.co.za">ServiceDesk</a> before registering.</p>
                </div>
              </div>
              <div className={shared.identityBottom}>
                <span className={shared.secureLight} aria-hidden="true" />
                <span>Protected organisational registration</span>
              </div>
            </aside>

            <section className={[shared.loginPanel, styles.registrationPanel].join(" ")} aria-labelledby="register-title">
              <div className={shared.loginHead}>
                <span className={shared.overline}>BUSINESS PARTNERS</span>
                <span className={shared.lockIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </div>
              <h2 id="register-title">Create your account</h2>
              <p className={shared.intro}>Complete the details below to register as a Business Partner.</p>

              {query.error && (
                <div className={shared.notice} role="alert">
                  {query.error === "unavailable"
                    ? "Registration is temporarily unavailable. Please try again later or contact the ServiceDesk."
                    : query.error === "invalid"
                      ? "Check all required fields and make sure your passwords match."
                      : "We couldn't create the account. Check that your WCSA ID is valid and your email and username are not already registered."}
                </div>
              )}

              <BusinessPartnerRegistrationForm
                action={registerPartner}
                returnTo={destination}
                signInUrl={signInUrl}
              />
              <p className={styles.securityNotice}>Your WCSA ID must be recognised by the Registry before an account can be created.</p>
              <div className={shared.support}>
                Need assistance? <a href="mailto:ServiceDesk@wcsports.co.za">ServiceDesk@wcsports.co.za</a>
              </div>
            </section>
          </div>
        </main>

        <footer className={shared.footer}>
          <span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span>
          <span>MyWCSA GovApps · Business Partner Registration</span>
        </footer>
      </div>
    </div>
  );
}
