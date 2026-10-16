import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { Poppins } from "next/font/google";
import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import ExternalUserLoginForm from "./external-user-login-form";
import shared from "../business-partner/business-partner-login.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "External User Login | MyWCSA GovApps",
  description: "Sign in to MyWCSA GovApps as a learner, athlete, participant, volunteer or other individual user.",
};

type Query = { returnTo?: string; mode?: string; error?: string; created?: string };
function safeDestination(value?: string) {
  return value && /^\/external(?:\/[^\\\r\n?#]*)?(?:\?[^\\\r\n#]*)?$/.test(value) ? value : "/external";
}

// The existing Supabase RPC accepts ISO dates. Also accept the agreed
// YYYYDDMM date-of-birth username convention, without changing the database.
function normalizeIdentifier(value: string) {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, day, month] = match;
  const iso = year + "-" + month + "-" + day;
  const date = new Date(iso + "T00:00:00.000Z");
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === iso
    ? iso
    : value;
}

export default async function ExternalUserLoginPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const q = await searchParams;
  const destination = safeDestination(q.returnTo);
  const registrationUrl = "/login/external-user/register?returnTo=" + encodeURIComponent(destination);
  const session = await auth();
  const provider = (session?.user as ({authProvider?:string}|undefined))?.authProvider;
  if (session?.user && provider === "external-user") redirect(destination);
  async function switchToExternal() {
    "use server";
    await signOut({redirectTo:"/login/external-user?returnTo=%2Fexternal"});
  }
  if (q.mode === "register") redirect(registrationUrl);

  async function signInExternalUser(form: FormData): Promise<void> {
    "use server";
    const rawIdentifier = String(form.get("identifier") || "").trim();
    const identifier = normalizeIdentifier(rawIdentifier);
    const password = String(form.get("password") || "");
    const loginPath = "/login/external-user?returnTo=" + encodeURIComponent(destination);

    if (!identifier || identifier.length > 254 || !password || password.length > 256) {
      redirect(loginPath + "&error=invalid");
    }

    try {
      await signIn("external-user", {
        identifier,
        password,
        redirectTo: destination,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(loginPath + "&error=invalid");
      }
      throw error;
    }
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
          <a className={shared.backLink} href="/">
            <span aria-hidden="true">←</span> Back to GovApps
          </a>
        </header>

        <main className={shared.main}>
          <div className={shared.glassFrame}>
            <aside className={shared.identity}>
              <div className={shared.identityTop}>
                <div className={shared.logoPlate}>
                  <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
                </div>
                <div className={shared.identityDivider} />
                <p className={shared.identityEyebrow}>MyWCSA GovApps</p>
                <h1>External User<br />Access</h1>
                <p className={shared.identityDescription}>
                  Secure sign-in for learners, athletes, participants, volunteers and individual users.
                </p>
              </div>
              <div className={shared.identityBottom}>
                <span className={shared.secureLight} aria-hidden="true" />
                <span>Personal account access</span>
              </div>
            </aside>

            <section className={shared.loginPanel} aria-labelledby="external-login-title">
              <div className={shared.loginHead}>
                <span className={shared.overline}>EXTERNAL USERS</span>
                <span className={shared.lockIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </div>
              <h2 id="external-login-title">Sign in</h2>
              <p className={shared.intro}>Enter your personal GovApps account details.</p>

              {session?.user && provider !== "external-user" && (
                <div className={shared.notice} role="status">
                  A different account type is signed in.
                  <form action={switchToExternal} style={{marginTop:9}}>
                    <button type="submit" style={{background:"#001484",color:"white",border:0,borderRadius:9,padding:"9px 12px",cursor:"pointer"}}>Switch to External User account</button>
                  </form>
                </div>
              )}
              {q.created === "1" && (
                <div className={shared.success} role="status">
                  Your account was created. You can now sign in.
                </div>
              )}
              {q.error && (
                <div className={shared.notice} role="alert">
                  Sign-in failed. Check your existing account details. If you need a password reset, contact ServiceDesk.
                </div>
              )}

              <ExternalUserLoginForm action={signInExternalUser} registrationUrl={registrationUrl} />

              <div className={shared.support}>
                Need help? <a href="mailto:ServiceDesk@wcsports.co.za">Contact the ServiceDesk</a>
              </div>
            </section>
          </div>
        </main>

        <footer className={shared.footer}>
          <span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span>
          <span>MyWCSA GovApps · External User Access</span>
        </footer>
      </div>
    </div>
  );
}
