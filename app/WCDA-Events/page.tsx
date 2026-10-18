import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { EmsError, EMS_MAILBOXES, getEmsActor } from "@/lib/ems/server";
import EmsWorkspace from "./workspace";
import styles from "./gateway.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "MyWCDA Events | Events Management System",
  description: "Western Cape Development Authority Events Management System. A connected workspace for event registration, assessment and operational oversight.",
};

function ArrowIcon() {
  return <svg className={styles.optionArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12h15m-6-6 6 6-6 6"/>
  </svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2 20 6v5c0 5-3.3 8.6-8 11-4.7-2.4-8-6-8-11V6l8-4Z"/><path d="m9 12 2 2 4-4"/>
  </svg>;
}
function StaffIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="3.3"/><path d="M5 20v-1.5A5.5 5.5 0 0 1 10.5 13h3A5.5 5.5 0 0 1 19 18.5V20M3 20h18"/>
  </svg>;
}
function PartnerIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 20h18M5 20V7l7-4 7 4v13M9 20v-5h6v5M9 9h.01M15 9h.01M9 12h.01M15 12h.01"/>
  </svg>;
}
function OrganiserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18m-12 5 2 2 4-4"/>
  </svg>;
}

function GatewayFrame({children}:{children:ReactNode}) {
  return <main className={styles.gatewayPage}>
    <div className={styles.gatewayFrame}>
      <header className={styles.gatewayHeader}>
        <Link href="/" className={styles.brand} aria-label="Go to MyWCSA GovApps home">
          <span className={styles.brandMark} aria-hidden="true">
            <span className={styles.brandMarkInner}><i/><i/><i/></span>
          </span>
          <span className={styles.brandText}>
            <strong>MyWCDA Events</strong>
            <small>WESTERN CAPE DEVELOPMENT AUTHORITY</small>
          </span>
        </Link>
        <span className={styles.platformLabel}><span className={styles.platformDot}/> A MYWCSA GOVAPPS APPLICATION</span>
      </header>

      <div className={styles.gatewayShell}>
        <section className={styles.gatewayStory} aria-label="About MyWCDA Events">
          <span className={styles.storyBloom} aria-hidden="true"/>
          <div className={styles.storyTop}>
            <span className={styles.storySeal}><OrganiserIcon/></span>
            <span>Events &amp; Safety Department</span>
          </div>
          <div className={styles.storyContent}>
            <span className={styles.storyEyebrow}>THE SMARTER WAY FORWARD</span>
            <h2>Thoughtful events.<em>Seamless oversight.</em></h2>
            <p>Bringing event organisers and authorised teams together in one connected space — from the first application to coordinated event operations.</p>
            <div className={styles.storySteps} aria-label="Events management journey">
              <div className={styles.storyStep}><small>01</small><strong>Register</strong></div>
              <div className={styles.storyStep}><small>02</small><strong>Assess</strong></div>
              <div className={styles.storyStep}><small>03</small><strong>Coordinate</strong></div>
            </div>
          </div>
        </section>
        <section className={styles.gatewayAccess} aria-label="MyWCDA Events secure access">
          {children}
        </section>
      </div>

      <footer className={styles.gatewayFooter}>
        <span>© {new Date().getFullYear()} Western Cape Development Authority</span>
        <span>Secure access through <strong>MyWCSA GovApps</strong></span>
      </footer>
    </div>
  </main>;
}

function AccessNotice({title,detail}:{title:string;detail:string}) {
  return <GatewayFrame>
    <div className={styles.noticePanel}>
      <span className={styles.noticeIcon}><ShieldIcon/></span>
      <span className={styles.accessEyebrow}>Account access</span>
      <h1 className={styles.accessTitle}>{title}</h1>
      <p>{detail}</p>
      <div className={styles.noticeActions}>
        <Link href="/my-apps">Return to GovApps</Link>
        <Link href="/">Switch account</Link>
      </div>
      <div className={styles.separator}/>
      <span className={styles.noticeHelp}>Need help? <a href={"mailto:" + EMS_MAILBOXES.support}>{EMS_MAILBOXES.support}</a></span>
    </div>
  </GatewayFrame>;
}

export default async function WCDAEventsPage() {
  const session = await auth();
  if (!session?.user) {
    const returnTo = encodeURIComponent("/WCDA-Events");
    return <GatewayFrame>
      <span className={styles.accessEyebrow}>Welcome to your workspace</span>
      <h1 className={styles.accessTitle}>Welcome to <span>MyWCDA Events.</span></h1>
      <p className={styles.accessIntro}>A dedicated platform for event registration, assessments, endorsements and operational coordination. Choose your account type to continue securely.</p>
      <div className={styles.separator}/>
      <div className={styles.accessSectionTitle}><h2>CHOOSE HOW TO CONTINUE</h2><span>Secure sign in</span></div>
      <div className={styles.accessOptions}>
        <Link href={"/login/staff?returnTo=" + returnTo} className={[styles.accessOption,styles.accessOptionPrimary].join(" ")}>
          <span className={styles.optionIcon}><StaffIcon/></span>
          <span className={styles.optionCopy}>
            <strong>Staff sign in</strong>
            <small>WCDA employees and authorised officials</small>
          </span>
          <ArrowIcon/>
        </Link>
        <Link href={"/login/business-partner?returnTo=" + returnTo} className={styles.accessOption}>
          <span className={styles.optionIcon}><PartnerIcon/></span>
          <span className={styles.optionCopy}>
            <strong>Business partner</strong>
            <small>Partner organisations and representatives</small>
          </span>
          <ArrowIcon/>
        </Link>
        <Link href={"/login/external-user?returnTo=" + returnTo} className={styles.accessOption}>
          <span className={styles.optionIcon}><OrganiserIcon/></span>
          <span className={styles.optionCopy}>
            <strong>External organiser</strong>
            <small>Submit or manage your event applications</small>
          </span>
          <ArrowIcon/>
        </Link>
      </div>
      <div className={styles.accessBottom}>
        <div className={styles.securityNote}>
          <ShieldIcon/>
          <p>Your access is managed through MyWCSA GovApps. Features and records are available according to your authorised role.</p>
        </div>
        <div className={styles.accessLinks}>
          <span>Need assistance? <a href={"mailto:" + EMS_MAILBOXES.support}>Contact ServiceDesk</a></span>
          <Link href="/">Back to GovApps ↗</Link>
        </div>
      </div>
    </GatewayFrame>;
  }

  let actor;
  try {
    actor = await getEmsActor();
  } catch(error) {
    return <AccessNotice title="EMS setup pending" detail={error instanceof EmsError ? error.message : "The EMS access service is unavailable. Existing GovApps services are unaffected."}/>;
  }
  if (!actor) return <AccessNotice title="Access not yet authorised" detail="Your current GovApps session does not have a verified EMS role, or it was created before EMS role tracking was enabled. Reauthenticate through GovApps or request access from the WCDA administrator."/>;
  return <EmsWorkspace actor={actor}/>;
}
