"use client";

import { useState, useActionState } from "react";
import { loginWithCredentials, sendMagicLink } from "./actions";

type Tab = "credentials" | "magic";

export default function LoginForm() {
  const [tab, setTab] = useState<Tab>("credentials");

  const [credState, credAction, credPending] = useActionState(
    loginWithCredentials,
    undefined,
  );

  const [magicState, magicAction, magicPending] = useActionState(
    sendMagicLink,
    undefined,
  );

  return (
    <div style={styles.container}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <img
          src="/mywcsa-logo.png"
          alt="MyWCSA GovApps"
          style={styles.logo}
        />
      </div>

      <h1 style={styles.heading}>Member Sign In</h1>
      <p style={styles.subheading}>
        Access your WCSA membership portal.
      </p>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          type="button"
          style={tab === "credentials" ? styles.tabActive : styles.tab}
          onClick={() => setTab("credentials")}
        >
          WCSA ID / Email
        </button>
        <button
          type="button"
          style={tab === "magic" ? styles.tabActive : styles.tab}
          onClick={() => setTab("magic")}
        >
          Magic Link
        </button>
      </div>

      {/* Credentials Tab */}
      {tab === "credentials" && (
        <form action={credAction} style={styles.form}>
          <label style={styles.label}>
            WCSA ID or Email
            <input
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder="e.g. WCSA-2026-0001 or you@example.com"
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              style={styles.input}
              required
            />
          </label>

          {credState?.error && (
            <p style={styles.error}>{credState.error}</p>
          )}

          <button
            type="submit"
            disabled={credPending}
            style={styles.button}
          >
            {credPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      )}

      {/* Magic Link Tab */}
      {tab === "magic" && (
        <form action={magicAction} style={styles.form}>
          <label style={styles.label}>
            Email Address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </label>

          {magicState?.error && (
            <p style={styles.error}>{magicState.error}</p>
          )}

          {magicState?.success && (
            <p style={styles.success}>
              A magic link has been sent to your email. Check the
              console in development.
            </p>
          )}

          <button
            type="submit"
            disabled={magicPending}
            style={styles.button}
          >
            {magicPending ? "Sending…" : "Send Magic Link"}
          </button>
        </form>
      )}

      {/* Register link */}
      <div style={styles.registerArea}>
        <p style={styles.registerText}>New to WCSA?</p>
        <a href="/register" style={styles.registerLink}>
          Register as a new member
        </a>
      </div>

      {/* Return link */}
      <a href="/" style={styles.returnLink}>
        Return to MyWCSA GovApps
      </a>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "90%",
    maxWidth: "440px",
    padding: "40px",
    background: "#ffffff",
    textAlign: "center",
  },
  logoArea: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "28px",
  },
  logo: {
    width: "100%",
    maxWidth: "260px",
    height: "auto",
  },
  heading: {
    margin: "0 0 10px 0",
    fontSize: "22px",
    fontWeight: "400",
    color: "#171717",
  },
  subheading: {
    margin: "0 0 25px 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#555555",
  },
  tabs: {
    display: "flex",
    marginBottom: "20px",
    borderBottom: "1px solid #d6d6d6",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "transparent",
    color: "#666666",
    fontSize: "14px",
    fontFamily: "inherit",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "transparent",
    color: "#001489",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "inherit",
    cursor: "pointer",
    borderBottom: "2px solid #001489",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    textAlign: "left",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#333333",
  },
  input: {
    width: "100%",
    minHeight: "42px",
    padding: "0 14px",
    border: "1px solid #c0c4cc",
    borderRadius: "4px",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    margin: 0,
    padding: "10px 14px",
    background: "#fdeaea",
    border: "1px solid #f5c2c2",
    borderRadius: "4px",
    color: "#a31515",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  success: {
    margin: 0,
    padding: "10px 14px",
    background: "#eaf6ea",
    border: "1px solid #c2e6c2",
    borderRadius: "4px",
    color: "#1a5e1a",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  button: {
    width: "100%",
    minHeight: "42px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    background: "#0788f9",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "4px",
  },
  registerArea: {
    marginTop: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
  },
  registerText: {
    margin: 0,
    fontSize: "13px",
    color: "#666666",
  },
  registerLink: {
    fontSize: "14px",
    color: "#001489",
    fontWeight: "600",
    textDecoration: "none",
  },
  returnLink: {
    display: "inline-block",
    marginTop: "20px",
    color: "#001489",
    fontSize: "13px",
    textDecoration: "none",
  },
};
