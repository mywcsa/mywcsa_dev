"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import styles from "./business-partner-login.module.css";

type Props = {
  action: (form: FormData) => Promise<void>;
  registrationUrl: string;
};

function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.submit} type="submit" disabled={pending} aria-busy={pending}>
      <span>{pending ? "Verifying your account…" : "Sign in"}</span>
      {!pending && <span aria-hidden="true" className={styles.arrow}>↗</span>}
    </button>
  );
}

export default function BusinessPartnerLoginForm({ action, registrationUrl }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className={styles.form}>
      <label className={styles.label} htmlFor="partner-identifier">
        Email, username or WCSA ID
      </label>
      <div className={styles.inputWrap}>
        <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
        </svg>
        <input
          id="partner-identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          placeholder="yourname@organisation.co.za"
          required
        />
      </div>
      <label className={styles.label} htmlFor="partner-password">Password</label>
      <div className={styles.inputWrap}>
        <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <input
          id="partner-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          maxLength={256}
          required
        />
        <button
          className={styles.passwordToggle}
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword(value => !value)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <SignInButton />
      <div className={styles.registration}>
        <a href={registrationUrl}>Register a Business Partner account <span aria-hidden="true">↗</span></a>
      </div>
    </form>
  );
}
