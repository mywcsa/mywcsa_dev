import Link from "next/link";
import { auth } from "@/auth";
import { EmsError, EMS_MAILBOXES, getEmsActor } from "@/lib/ems/server";
import EmsWorkspace from "./workspace";
import styles from "./workspace.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "MyWCDA Events | GovApps",
  description: "Western Cape Development Authority Events Management System",
};

function AccessNotice({title,detail}:{title:string;detail:string}) {
  return <main className={styles.gateway}>
    <section className={styles.accessCard}>
      <span className={styles.eyebrow}>WESTERN CAPE DEVELOPMENT AUTHORITY</span>
      <h1>MyWCDA Events <span className={styles.emsTag}>EMS</span></h1>
      <h2>{title}</h2>
      <p>{detail}</p>
      <div className={styles.gatewayActions}>
        <Link href="/my-apps">Return to GovApps</Link>
        <Link href="/">Switch account</Link>
      </div>
      <small>Assistance: <a href={`mailto:${EMS_MAILBOXES.support}`}>{EMS_MAILBOXES.support}</a></small>
    </section>
  </main>;
}

export default async function WCDAEventsPage() {
  const session = await auth();
  if (!session?.user) {
    const returnTo = encodeURIComponent("/WCDA-Events");
    return <main className={styles.gateway}>
      <section className={styles.accessCard}>
        <span className={styles.eyebrow}>WESTERN CAPE DEVELOPMENT AUTHORITY</span>
        <h1>MyWCDA Events <span className={styles.emsTag}>EMS</span></h1>
        <p>Event registration, assessment, endorsements, certification and operational oversight in the existing MyWCSA GovApps environment.</p>
        <div className={styles.gatewayActions}>
          <Link href={`/login/staff?returnTo=${returnTo}`}>Staff sign in</Link>
          <Link href={`/login/business-partner?returnTo=${returnTo}`}>Business partner</Link>
          <Link href={`/login/external-user?returnTo=${returnTo}`}>External organiser</Link>
        </div>
        <small>Official access path: /WCDA-Events</small>
      </section>
    </main>;
  }

  let actor;
  try {
    actor = await getEmsActor();
  } catch(error) {
    return <AccessNotice title="EMS setup pending" detail={error instanceof EmsError ? error.message : "The EMS access service is unavailable. Existing GovApps services are unaffected."}/>;
  }
  if (!actor) return <AccessNotice title="EMS access not yet authorised" detail="Your current GovApps session does not have a verified EMS role, or it was created before EMS role tracking was enabled. Reauthenticate through GovApps, or request access from the WCDA administrator."/>;
  return <EmsWorkspace actor={actor}/>;
}
