"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import styles from "./login.module.css";
import { useHydrated } from "../use-hydrated";

type Notice = { title: string; message: string };

function Icon({ name }: { name: "arrow" | "mail" | "lock" | "eye" | "help" }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" /><path d="M12 16h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function MembershipLogin() {
  const hydrated = useHydrated();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const notices: Record<string, Notice> = {
    help: { title: "Membership help", message: "This is a preview of the membership login screen. Help and Registry support will be connected in the next stage." },
    register: { title: "Create your membership account", message: "Account registration will be added next. This screen does not create accounts or send information." },
    reset: { title: "Reset your password", message: "Password recovery will be connected when account verification is built. No reset email is sent from this preview." },
    privacy: { title: "Privacy notice", message: "This preview does not submit or save your login details. The membership privacy notice will be added before registration opens." },
    terms: { title: "Portal terms", message: "Membership portal terms will be available before registration opens. This preview does not accept applications or payments." },
  };

  function openNotice(key: string) {
    setNotice(notices[key]);
    dialog.current?.showModal();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = event.currentTarget.elements.namedItem("password");
    if (password instanceof HTMLInputElement) password.value = "";
    setShowPassword(false);
    setNotice({ title: "Login preview", message: "Sign-in is not connected yet. Your details have not been sent or saved. This screen is ready for the account-verification stage." });
    dialog.current?.showModal();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image src="/mywcsa-logo.png" alt="Western Cape Government" width={258} height={81} priority className={styles.logo} unoptimized />
          <span className={styles.brandDivider} aria-hidden="true" />
          <div className={styles.portalTitle}>MyWCSA<span>Membership Portal</span></div>
        </div>
        <button type="button" className={styles.help} onClick={() => openNotice("help")}><Icon name="help" /><span>Help & Support</span></button>
      </header>

      <main className={styles.main}>
        <div className={styles.background} aria-hidden="true" />
        <div className={styles.content}>
          <section className={styles.welcome} aria-labelledby="welcome-title">
            <span className={styles.eyebrow}><span aria-hidden="true" /> YOUR MEMBERSHIP STARTS HERE</span>
            <h1 id="welcome-title">One community.<br />More possibilities.</h1>
            <p className={styles.intro}>Your connection to sport, arts, culture and development across the Western Cape.</p>
            <div className={styles.features}>
              <div><span className={styles.featureNumber}>01</span><p><strong>Apply or renew</strong><span>Start your membership journey.</span></p></div>
              <div><span className={styles.featureNumber}>02</span><p><strong>Track your application</strong><span>Keep up with your Registry review.</span></p></div>
              <div><span className={styles.featureNumber}>03</span><p><strong>Manage your membership</strong><span>Find your documents and payment records.</span></p></div>
            </div>
            <div className={styles.initiatives} aria-label="Participating initiatives"><span>WCSA</span><span>WCSSA</span><span>iKM</span><span>WCDA</span><span>WCOB</span></div>
            <p className={styles.parent}>An initiative of Western Cape Sports Association NPC</p>
          </section>

          <section className={styles.card} aria-labelledby="signin-title">
            <div className={styles.cardIcon}><Icon name="lock" /></div>
            <span className={styles.cardEyebrow}>MYWCSA MEMBERSHIP</span>
            <h2 id="signin-title">Welcome back</h2>
            <p className={styles.cardIntro}>Sign in to your membership account.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label htmlFor="membership-email">Email address</label>
              <div className={styles.inputWrap}><Icon name="mail" /><input id="membership-email" name="email" type="email" autoComplete="username" placeholder="Enter your email address" required maxLength={254} spellCheck={false} autoCapitalize="none" /></div>

              <div className={styles.passwordLabel}><label htmlFor="membership-password">Password</label><button type="button" onClick={() => openNotice("reset")}>Forgot password?</button></div>
              <div className={styles.inputWrap}><Icon name="lock" /><input id="membership-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" className={styles.showPassword} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><Icon name="eye" /></button></div>

              <button type="submit" className={styles.primary} disabled={!hydrated}>Sign in<Icon name="arrow" /></button>
            </form>

            <div className={styles.separator}><span>New to MyWCSA?</span></div>
            <Link className={styles.secondary} href="/membership/apply">Create an account<Icon name="arrow" /></Link>
            <p className={styles.preview}><span aria-hidden="true" /> Screen preview · Sign-in opens soon</p>
            <Link href="/membership/dashboard" className={styles.previewLink}>Explore dashboard preview →</Link>
          </section>
        </div>
      </main>

      <footer className={styles.footer}><p>Western Cape Sports Association NPC</p><nav aria-label="Footer"><button type="button" onClick={() => openNotice("privacy")}>Privacy</button><button type="button" onClick={() => openNotice("terms")}>Terms</button><button type="button" onClick={() => openNotice("help")}>Support</button></nav></footer>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="notice-title" aria-describedby="notice-message" onClose={() => setNotice(null)}>
        <div className={styles.dialogHeading}><h2 id="notice-title">{notice?.title}</h2><button type="button" aria-label="Close message" onClick={() => dialog.current?.close()}>×</button></div>
        <p id="notice-message">{notice?.message}</p>
        <button type="button" className={styles.primary} onClick={() => dialog.current?.close()}>Got it<Icon name="arrow" /></button>
      </dialog>
    </div>
  );
}
