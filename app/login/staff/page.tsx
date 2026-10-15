import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import styles from "./staff-login.module.css";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";

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
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const { returnTo, error } = await searchParams;
  const destination = safeDestination(returnTo);
  const session = await auth();
  const currentUser = session?.user as ({email?:string|null;authProvider?:string}|undefined);
  // Only an actual WCSA Microsoft staff session may skip the sign-in screen.
  // A Business Partner or legacy/unidentified JWT must never bounce back into
  // the staff launcher before the user has a chance to switch accounts.
  if (isMicrosoftStaff(currentUser)) redirect(currentUser?.staffMustChange ? "/staff/password" : destination);

  async function clearExistingSession() {
    "use server";
    await signOut({ redirectTo: "/login/staff?returnTo=" + encodeURIComponent(destination) });
  }

  async function continueWithPassword(formData: FormData) {
    "use server";
    const email=String(formData.get("email")||"").trim();
    const password=String(formData.get("password")||"");
    try {
      await signIn("staff-password",{email,password,redirectTo:destination});
    } catch (cause) {
      if (cause instanceof AuthError) {
        redirect("/login/staff?error=CredentialsSignin&returnTo="+encodeURIComponent(destination));
      }
      throw cause;
    }
  }

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

          {session?.user && (
            <div role="status" style={{ margin: "0 0 17px", padding: "14px 15px", background: "rgba(217,235,255,.75)", border: "1px solid rgba(48,107,188,.24)", borderRadius: 12, color: "#143f84", fontSize: 12, lineHeight: 1.65 }}>
              <strong>A different or older session is already signed in.</strong>
              <p style={{ margin: "5px 0 11px" }}>To use the staff workspace, sign in with your WCSA Microsoft account. Your current session will not be treated as staff permission.</p>
              <form action={clearExistingSession}>
                <button type="submit" style={{ padding: "9px 13px", background: "#001484", color: "white", border: 0, borderRadius: 9, cursor: "pointer", fontWeight: 650 }}>
                  Sign out of the old account
                </button>
              </form>
            </div>
          )}

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

          <div style={{margin:"20px 0",padding:"20px",border:"1px solid #ccdcf2",borderRadius:15,background:"rgba(245,250,255,.85)"}}>
            <strong style={{display:"block",fontSize:15,color:"#001484",marginBottom:5}}>Or sign in with your staff email &amp; password</strong>
            <p style={{fontSize:12,color:"#657c9f",lineHeight:1.65,margin:"0 0 14px"}}>For staff whose GovApps fallback account has been created by an authorised Command Centre administrator. This is not your Microsoft password.</p>
            {error&&<p role="alert" style={{color:"#ab2441",fontSize:12}}>Email/password sign-in failed. Check the details, or contact ServiceDesk if the account is not activated.</p>}
            <form action={continueWithPassword} style={{display:"grid",gap:11}}>
              <label style={{display:"grid",gap:5,fontSize:11,fontWeight:650,color:"#1a3975"}}>WCSA work email
                <input name="email" type="email" required autoComplete="username" placeholder="staff@wcsports.co.za" style={{padding:12,borderRadius:10,border:"1px solid #c1d5ee",color:"#102b5c"}}/>
              </label>
              <label style={{display:"grid",gap:5,fontSize:11,fontWeight:650,color:"#1a3975"}}>GovApps staff password
                <input name="password" type="password" required minLength={1} autoComplete="current-password" placeholder="Your separate GovApps password" style={{padding:12,borderRadius:10,border:"1px solid #c1d5ee",color:"#102b5c"}}/>
              </label>
              <button type="submit" style={{padding:"12px 16px",background:"#001484",color:"white",border:0,borderRadius:11,fontWeight:700,cursor:"pointer"}}>Sign in to GovApps →</button>
            </form>
          </div>
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
