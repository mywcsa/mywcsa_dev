"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import shared from "../../business-partner/business-partner-login.module.css";
import styles from "../external-user.module.css";

type Props = {
  action: (formData: FormData) => Promise<void>;
  returnTo: string;
  signInUrl: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={shared.submit} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Creating your account…" : "Create External User account"}
      {!pending && <span aria-hidden="true" className={shared.arrow}>↗</span>}
    </button>
  );
}

export default function ExternalUserRegistrationForm({
  action,
  returnTo,
  signInUrl,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mismatch = confirm.length > 0 && password !== confirm;
  const shortPassword = password.length > 0 && password.length < 8;

  return (
    <form
      action={action}
      className={shared.form}
      onSubmit={event => {
        setSubmitted(true);
        if (password !== confirm || password.length < 8) event.preventDefault();
      }}
    >
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className={styles.group}>
        <label className={shared.label} htmlFor="external-register-email">
          Email address <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" />
          </svg>
          <input id="external-register-email" name="email" type="email" autoComplete="email"
            autoCapitalize="none" spellCheck={false} placeholder="name@example.co.za"
            maxLength={254} required />
        </div>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="external-register-username">
          Choose a username <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <input id="external-register-username" name="username" type="text" autoComplete="username"
            autoCapitalize="none" spellCheck={false} placeholder="At least 4 characters"
            minLength={4} maxLength={64} required />
        </div>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="external-register-dob">
          Date of birth <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="5" width="18" height="17" rx="2" /><path d="M7 2v5M17 2v5M3 10h18" />
          </svg>
          <input id="external-register-dob" name="dob" type="date"
            autoComplete="bday" min="1900-01-01" aria-describedby="external-dob-help" required />
        </div>
        <p className={styles.help} id="external-dob-help">
          You can also use your date of birth to sign in.
        </p>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="external-register-password">
          Create password <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <input id="external-register-password" name="password" type={visible ? "text" : "password"}
            autoComplete="new-password" placeholder="Minimum 8 characters"
            minLength={8} maxLength={72} value={password}
            onChange={event => setPassword(event.target.value)}
            aria-describedby="external-password-help" required />
          <button type="button" className={shared.passwordToggle}
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? "Hide passwords" : "Show passwords"} aria-pressed={visible}>
            {visible ? "Hide" : "Show"}
          </button>
        </div>
        <p className={styles.help} id="external-password-help">
          Use a unique password with at least 8 characters.
        </p>
      </div>

      <div className={styles.group}>
        <label className={shared.label} htmlFor="external-register-confirm">
          Confirm password <span aria-hidden="true">*</span>
        </label>
        <div className={shared.inputWrap}>
          <svg className={shared.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m12 2 8 4v5c0 6-3.5 9.5-8 11-4.5-1.5-8-5-8-11V6l8-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <input id="external-register-confirm" name="confirmPassword"
            type={visible ? "text" : "password"} autoComplete="new-password"
            placeholder="Repeat your password" maxLength={72} value={confirm}
            onChange={event => setConfirm(event.target.value)}
            aria-describedby="external-confirm-error" aria-invalid={submitted && mismatch}
            required />
        </div>
      </div>
      <div className={styles.validation} id="external-confirm-error" role={submitted && (mismatch || shortPassword) ? "alert" : undefined}>
        {submitted && mismatch ? "Passwords do not match." : submitted && shortPassword ? "Password must contain at least 8 characters." : ""}
      </div>

      <SubmitButton />
      <div className={styles.switchPrompt}>
        <span>Already registered?</span>
        <a href={signInUrl}>Sign in <span aria-hidden="true">→</span></a>
      </div>
    </form>
  );
}
