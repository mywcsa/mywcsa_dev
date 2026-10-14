"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import styles from "../business-partner/business-partner-login.module.css";
import external from "./external-user.module.css";

type Props = {
  action: (formData: FormData) => Promise<void>;
  registrationUrl: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending} aria-busy={pending}>
      <span>{pending ? "Signing you in…" : "Sign in"}</span>
      {!pending && <span className={styles.arrow} aria-hidden="true">↗</span>}
    </button>
  );
}

export default function ExternalUserLoginForm({ action, registrationUrl }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <form className={styles.form} action={action}>
      <label className={styles.label} htmlFor="external-identifier">Email, username or date of birth</label>
      <div className={styles.inputWrap}>
        <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
        <input
          id="external-identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Email / username / YYYYDDMM"
          maxLength={254}
          aria-describedby="external-identifier-hint"
          required
        />
      </div>
      <p className={external.fieldHint} id="external-identifier-hint">
        Date of birth can be entered as YYYYDDMM or YYYY-MM-DD.
      </p>
      <label className={styles.label} htmlFor="external-password">Password</label>
      <div className={styles.inputWrap}>
        <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <input
          id="external-password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          maxLength={256}
          required
        />
        <button className={styles.passwordToggle} type="button"
          onClick={() => setVisible(value => !value)}
          aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <SubmitButton />
      <div className={styles.registration}>
        <a href={registrationUrl}>Create an External User account <span aria-hidden="true">↗</span></a>
      </div>
    </form>
  );
}
