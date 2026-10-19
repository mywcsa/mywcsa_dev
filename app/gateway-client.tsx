"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import styles from "./gateway.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

type Role = "staff" | "business-partner" | "external-user";
type IconName = "arrow" | "briefcase" | "people" | "person" | "shield" | "play";

function Icon({ name, size = 19 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "arrow" && <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>}
      {name === "briefcase" && <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 3 13 3 18 0"/></>}
      {name === "people" && <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/></>}
      {name === "person" && <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>}
      {name === "shield" && <><path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4z"/><path d="m9 12 2 2 4-4"/></>}
      {name === "play" && <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></>}
    </svg>
  );
}

const roles: {
  id: Role;
  title: string;
  badge: string;
  description: string;
  loginHref: string;
  registerHref?: string;
  videoHref: string;
  icon: IconName;
  tone: string;
}[] = [
  {
    id: "staff",
    title: "Staff",
    badge: "EMPLOYEE ACCESS",
    description: "For WCSA employees using an authorised organisational Microsoft account.",
    loginHref: "/login/staff",
    videoHref: "/videos/staff-login.mp4",
    icon: "briefcase",
    tone: "staff",
  },
  {
    id: "business-partner",
    title: "Business Partners",
    badge: "ORGANISATION ACCESS",
    description: "For schools, clubs, associations and registered partner organisations.",
    loginHref: "/login/business-partner",
    registerHref: "/login/business-partner/register",
    videoHref: "/videos/business-partner-login.mp4",
    icon: "people",
    tone: "business",
  },
  {
    id: "external-user",
    title: "External Users",
    badge: "INDIVIDUAL ACCESS",
    description: "For learners, athletes, participants, volunteers and other individual users.",
    loginHref: "/login/external-user",
    registerHref: "/login/external-user/register",
    videoHref: "/videos/external-user-login.mp4",
    icon: "person",
    tone: "external",
  },
];

export default function Home() {
  const [guide, setGuide] = useState<Role | null>(null);
  const [failedVideos, setFailedVideos] = useState<Role[]>([]);

  return (
    <div className={[styles.page, poppins.className].join(" ")}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="/" aria-label="MyWCSA GovApps homepage">
            <img src="/wcg-logo-transparent.svg" alt="Western Cape Government" />
            <span className={styles.brandDivider} aria-hidden="true" />
            <span className={styles.brandText}>
              <strong>MyWCSA GovApps</strong>
              <small>People | Services | Progress</small>
            </span>
          </a>
          <nav className={styles.headerLinks} aria-label="Main navigation">
            <a href="mailto:ServiceDesk@wcsports.co.za">Help &amp; Support</a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="govapps-welcome">
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}><span className={styles.eyebrowDot} aria-hidden="true" /> WELCOME TO MYWCSA GOVAPPS</span>
            <h1 id="govapps-welcome">One gateway.<br/><span>More possibilities.</span></h1>
            <p>Access your services, connect with opportunities and manage your work in one secure, connected digital space.</p>
          </div>
          <div className={styles.heroSignature}>People.<br/>Services.<br/>Progress.</div>
        </section>

        <section className={styles.accessSection} id="choose-access" aria-labelledby="choose-access-heading">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>YOUR ACCESS, YOUR WAY</span>
              <h2 id="choose-access-heading">Choose your sign-in</h2>
              <p>Select the account type that matches how you use MyWCSA GovApps.</p>
            </div>
            <div className={styles.secureNote}><Icon name="shield" size={18}/> Secure account access</div>
          </div>
          <div className={styles.accessGrid}>
            {roles.map((role) => {
              const open = guide === role.id;
              const videoFailed = failedVideos.includes(role.id);
              return (
                <article className={styles.accessCard} key={role.id} data-tone={role.tone}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardIcon}><Icon name={role.icon} size={27}/></span>
                    <span className={styles.cardLabel}>{role.badge}</span>
                  </div>
                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                  <div className={styles.cardActions}>
                    <a href={role.loginHref} className={styles.signInLink}>Sign in <Icon name="arrow" size={16}/></a>
                    {role.registerHref && <a href={role.registerHref} className={styles.registerLink}>Create account →</a>}
                  </div>
                  <button
                    className={styles.guideToggle}
                    type="button"
                    aria-expanded={open}
                    aria-controls={"guide-" + role.id}
                    onClick={() => setGuide(open ? null : role.id)}
                  >
                    <Icon name="play" size={15}/> {open ? "Hide sign-in guide" : "Watch sign-in guide"}
                  </button>
                  {open && (
                    <div className={styles.guidePanel} id={"guide-" + role.id}>
                      <strong>{role.title} sign-in guide</strong>
                      {videoFailed
                        ? <p>The video guide is currently unavailable. You can still sign in using the button above.</p>
                        : <video controls playsInline preload="metadata" onError={() => setFailedVideos(previous => previous.includes(role.id) ? previous : [...previous, role.id])} aria-label={role.title + " sign-in video guide"}>
                            <source src={role.videoHref} type="video/mp4"/>
                            Your browser does not support video playback.
                          </video>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Western Cape Sports Association NPC · MyWCSA GovApps</span>
        <span>Application access is subject to your account permissions. <a href="mailto:ServiceDesk@wcsports.co.za">Contact ServiceDesk</a></span>
      </footer>
    </div>
  );
}
