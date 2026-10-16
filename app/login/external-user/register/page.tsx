import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/ams/supabase";
import ExternalUserRegistrationForm from "./external-user-registration-form";
import shared from "../../business-partner/business-partner-login.module.css";
import external from "../external-user.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Register External User | MyWCSA GovApps",
  description: "Register a personal account for MyWCSA GovApps.",
};

type Query = { returnTo?: string; error?: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeDestination(value?: string) {
  return value && /^\/external(?:\/[^\\\r\n?#]*)?(?:\?[^\\\r\n#]*)?$/.test(value) ? value : "/external";
}

function validBirthDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso < "1900-01-01") return false;
  const date = new Date(iso + "T00:00:00.000Z");
  return !Number.isNaN(date.valueOf())
    && date.toISOString().slice(0, 10) === iso
    && iso <= new Date().toISOString().slice(0, 10);
}

export default async function ExternalUserRegisterPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const destination = safeDestination(query.returnTo);
  const signInUrl = "/login/external-user?returnTo=" + encodeURIComponent(destination);

  const session = await auth();
  const provider = (session?.user as ({authProvider?:string}|undefined))?.authProvider;
  if (session?.user && provider === "external-user") redirect(destination);
  async function switchToExternal() {
    "use server";
    await signOut({redirectTo:"/login/external-user?returnTo=%2Fexternal"});
  }

  async function registerExternalUser(form: FormData): Promise<void> {
    "use server";
    const target = safeDestination(String(form.get("returnTo") || ""));
    const registerPath = "/login/external-user/register?returnTo=" + encodeURIComponent(target);
    const loginPath = "/login/external-user?returnTo=" + encodeURIComponent(target);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const username = String(form.get("username") || "").trim();
    const dateOfBirth = String(form.get("dob") || "");
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmPassword") || "");

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      username.length < 4 || username.length > 64 ||
      !validBirthDate(dateOfBirth) ||
      password.length < 8 || Buffer.byteLength(password, "utf8") > 72 ||
      password !== confirmation
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
          p_account_type: "external_user",
          p_email: email,
          p_username: username,
          p_password: password,
          p_wcsa_id: null,
          p_date_of_birth: dateOfBirth,
        }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      redirect(registerPath + "&error=unavailable");
    }

    if (!response.ok) {
      // Duplicate email/username is not a server outage. Never expose which field
      // or whether an exact email exists to an unauthenticated visitor.
      const problem = await response.json().catch(() => null) as {code?:string}|null;
      redirect(registerPath + (problem?.code==="23505"?"&error=existing":"&error=registration"));
    }

    const accountId: unknown = await response.json().catch(() => null);
    if (typeof accountId !== "string" || !UUID.test(accountId)) {
      redirect(registerPath + "&error=unavailable");
    }

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
          <div className={[shared.glassFrame, external.registerFrame].join(" ")}>
            <aside className={shared.identity}>
              <div className={shared.identityTop}>
                <div className={shared.logoPlate}>
                  <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
                </div>
                <div className={shared.identityDivider} />
                <p className={shared.identityEyebrow}>MyWCSA GovApps</p>
                <h1>External User<br />Registration</h1>
                <p className={shared.identityDescription}>
                  Create your personal GovApps account to access authorised services.
                </p>

                <div className={external.noteBox}>
                  <strong>Who can register?</strong>
                  <p>Learners, athletes, participants, volunteers and other individual users. Your date of birth can also be used for sign-in in YYYYDDMM format.</p>
                </div>
              </div>
              <div className={shared.identityBottom}>
                <span className={shared.secureLight} aria-hidden="true" />
                <span>Personal account registration</span>
              </div>
            </aside>

            <section className={[shared.loginPanel, external.registerPanel].join(" ")} aria-labelledby="external-register-title">
              <div className={shared.loginHead}>
                <span className={shared.overline}>EXTERNAL USERS</span>
                <span className={shared.lockIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </div>
              <h2 id="external-register-title">Create your account</h2>
              <p className={shared.intro}>Enter your personal details below to register.</p>

              {session?.user && provider !== "external-user" && (
                <div className={shared.notice} role="status">
                  A different account type is signed in.
                  <form action={switchToExternal} style={{marginTop:9}}>
                    <button type="submit" style={{background:"#001484",color:"white",border:0,borderRadius:9,padding:"9px 12px",cursor:"pointer"}}>Switch to External User account</button>
                  </form>
                </div>
              )}
              {query.error && (
                <div className={shared.notice} role="alert">
                  {query.error === "unavailable"
                    ? "Registration is temporarily unavailable. Try again later or contact the ServiceDesk."
                    : query.error === "invalid"
                      ? "Check the required fields, date of birth and password confirmation."
                      : "We couldn't create the account. Please check your details or contact the ServiceDesk."}
                </div>
              )}

              {query.error && <p style={{fontSize:12,margin:"10px 0"}}><a href={signInUrl} style={{color:"#001484",fontWeight:750}}>Already registered? Sign in to your account →</a></p>}

              <ExternalUserRegistrationForm
                action={registerExternalUser}
                returnTo={destination}
                signInUrl={signInUrl}
              />

              <p className={external.noticeSmall}>
                Your registration is stored securely in the MyWCSA account database.
              </p>
              <div className={shared.support}>
                Need help? <a href="mailto:ServiceDesk@wcsports.co.za">ServiceDesk@wcsports.co.za</a>
              </div>
            </section>
          </div>
        </main>

        <footer className={shared.footer}>
          <span>© {new Date().getFullYear()} Western Cape Sports Association NPC</span>
          <span>MyWCSA GovApps · External User Registration</span>
        </footer>
      </div>
    </div>
  );
}
