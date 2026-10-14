"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import shared from "../business-partner-login.module.css";
import styles from "./register.module.css";

type Props = {
  action: (form: FormData) => Promise<void>;
  returnTo: string;
  signInUrl: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={shared.submit} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Creating your account…" : "Create Business Partner account"}
      {!pending && <span className={shared.arrow} aria-hidden="true">↗</span>}
    </button>
  );
}

export default function BusinessPartnerRegistrationForm({
  action,
  returnTo,
  signInUrl,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const mismatch = confirmation.length > 0 && password !== confirmation;
  const tooShort = password.length > 0 && password.length < 8;

  return (
    <form
      className={[shared.form, styles.registerForm].join(" ")}
      action={action}
      onSubmit={event => {
        setSubmitted(true);
        if (password !== confirmation || password.length < 8) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className={styles.group}>
        <label className={shared.label} htmlFor="register-wcsa-id">
          WCSA ID <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M8 9h8M8 13h5M8 16h7" />
          </svg>
          <input id="register-wcsa-id" name="wcsaId" type="text" autoCapitalize="characters"
            placeholder="Your organisation's WCSA ID" maxLength={80} required />
        </div>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="register-email">
          Email address <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          <input id="register-email" name="email" type="email" autoComplete="email" autoCapitalize="none"
            spellCheck={false} placeholder="name@organisation.co.za" maxLength={254} required />
        </div>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="register-username">
          Choose a username <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <input id="register-username" name="username" type="text" autoComplete="username"
            autoCapitalize="none" spellCheck={false} placeholder="At least 4 characters"
            minLength={4} maxLength={64} required />
        </div>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="register-password">
          Create password <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <input id="register-password" name="password" type={visible ? "text" : "password"}
            autoComplete="new-password" placeholder="Minimum 8 characters" minLength={8} maxLength={72}
            value={password} onChange={event => setPassword(event.target.value)}
            aria-describedby="register-password-help" required />
          <button className={shared.passwordToggle} type="button" onClick={() => setVisible(value => !value)}
            aria-label={visible ? "Hide passwords" : "Show passwords"} aria-pressed={visible}>
            {visible ? "Hide" : "Show"}
          </button>
        </div>
        <p id="register-password-help" className={styles.help}>Use a unique password with at least 8 characters.</p>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="register-confirm">
          Confirm password <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m12 2 8 4v5c0 6-3.5 9.5-8 11-4.5-1.5-8-5-8-11V6l8-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <input id="register-confirm" name="confirmPassword" type={visible ? "text" : "password"}
            autoComplete="new-password" placeholder="Re-enter your password" maxLength={72}
            value={confirmation} onChange={event => setConfirmation(event.target.value)}
            aria-invalid={mismatch && submitted} aria-describedby="register-confirm-error" required />
        </div>
      </div>
      <div id="register-confirm-error" className={styles.validation} role={submitted && (mismatch || tooShort) ? "alert" : undefined}>
        {submitted && mismatch ? "Your passwords do not match." : submitted && tooShort ? "Your password must contain at least 8 characters." : ""}
      </div>

      <SubmitButton />
      <div className={styles.signInPrompt}>
        <span>Already have an account?</span>
        <a href={signInUrl}>Sign in <span aria-hidden="true">→</span></a>
      </div>
    </form>
  );
}
