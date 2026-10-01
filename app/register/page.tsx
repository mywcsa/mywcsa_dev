"use client";

import { useState, useActionState } from "react";
import { registerMember, type RegistrationResult } from "./actions";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";

type Step = 1 | 2 | 3 | 4;

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);

  const [result, action, pending] = useActionState<RegistrationResult, FormData>(
    registerMember,
    { success: false },
  );

  if (result.success && result.wcsaId) {
    return <SuccessScreen wcsaId={result.wcsaId} />;
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <img
            src="/mywcsa-logo.png"
            alt="MyWCSA GovApps"
            style={styles.logo}
          />
        </div>

        <h1 style={styles.heading}>Member Registration</h1>
        <p style={styles.subheading}>
          Register as a new WCSA member. You will receive a WCSA ID on completion.
        </p>

        {/* Progress */}
        <div style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={s <= step ? styles.progressDotActive : styles.progressDot}
            >
              {s}
            </div>
          ))}
        </div>

        <form action={action}>
          {/* Step 1: Account */}
          {step === 1 && (
            <div style={styles.form}>
              <h2 style={styles.stepTitle}>Step 1 — Account</h2>
              <Field label="Full Name" name="name" type="text" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Password (min 8 characters)" name="password" type="password" required />
              <Field label="Confirm Password" name="confirmPassword" type="password" required />
              <div style={styles.buttonRow}>
                <button type="button" style={styles.buttonPrimary} onClick={() => setStep(2)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal */}
          {step === 2 && (
            <div style={styles.form}>
              <h2 style={styles.stepTitle}>Step 2 — Personal Details</h2>
              <Field label="Phone Number" name="phone" type="tel" />
              <Field label="ID / Passport Number" name="idNumber" type="text" />
              <Field label="Date of Birth" name="dateOfBirth" type="date" />
              <label style={styles.label}>
                Residential Address
                <textarea name="address" rows={3} style={styles.textarea} />
              </label>
              <div style={styles.buttonRow}>
                <button type="button" style={styles.buttonSecondary} onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" style={styles.buttonPrimary} onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sport & Membership */}
          {step === 3 && (
            <div style={styles.form}>
              <h2 style={styles.stepTitle}>Step 3 — Sport & Membership</h2>
              <Field label="Sport" name="sport" type="text" placeholder="e.g. Athletics" />
              <Field label="Discipline" name="discipline" type="text" placeholder="e.g. Track" />
              <Field label="Club / School" name="club" type="text" />
              <Field label="Region" name="region" type="text" placeholder="e.g. Cape Metro" />

              <label style={styles.label}>
                Membership Tier
                <select name="membershipType" style={styles.input} required defaultValue="">
                  <option value="" disabled>Select a tier…</option>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label} — {tier.description}
                    </option>
                  ))}
                </select>
              </label>

              <div style={styles.buttonRow}>
                <button type="button" style={styles.buttonSecondary} onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="button" style={styles.buttonPrimary} onClick={() => setStep(4)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Emergency & Submit */}
          {step === 4 && (
            <div style={styles.form}>
              <h2 style={styles.stepTitle}>Step 4 — Emergency Contact</h2>
              <Field label="Emergency Contact Name" name="emergencyContactName" type="text" />
              <Field label="Emergency Contact Phone" name="emergencyContactPhone" type="tel" />

              {result.error && <p style={styles.error}>{result.error}</p>}

              <p style={styles.reviewNote}>
                Review your details above. Click Register to submit your application.
                Your membership will be pending until approved by WCSA staff.
              </p>

              <div style={styles.buttonRow}>
                <button type="button" style={styles.buttonSecondary} onClick={() => setStep(3)}>
                  Back
                </button>
                <button type="submit" disabled={pending} style={styles.buttonPrimary}>
                  {pending ? "Registering…" : "Register"}
                </button>
              </div>
            </div>
          )}
        </form>

        <a href="/login/member" style={styles.returnLink}>
          Already have an account? Sign in
        </a>
      </div>
    </main>
  );
}

/* =====================================================
   Success Screen
   ===================================================== */

function SuccessScreen({ wcsaId }: { wcsaId: string }) {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.logoArea}>
          <img
            src="/mywcsa-logo.png"
            alt="MyWCSA GovApps"
            style={styles.logo}
          />
        </div>

        <div style={styles.successIcon}>✓</div>

        <h1 style={styles.heading}>Registration Successful</h1>

        <p style={styles.subheading}>
          Your membership application has been submitted and is pending approval.
        </p>

        <div style={styles.wcsaIdBox}>
          <span style={styles.wcsaIdLabel}>Your WCSA ID</span>
          <span style={styles.wcsaIdValue}>{wcsaId}</span>
        </div>

        <p style={styles.reviewNote}>
          Please save this ID. You will use it to sign in once your
          membership is approved.
        </p>

        <a href="/login/member" style={{ ...styles.buttonPrimary, display: "inline-block", textAlign: "center", textDecoration: "none" }}>
          Continue to Sign In
        </a>
      </div>
    </main>
  );
}

/* =====================================================
   Field Component
   ===================================================== */

function Field({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={styles.label}>
      {label}{required && " *"}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        style={styles.input}
        required={required}
      />
    </label>
  );
}

/* =====================================================
   Styles
   ===================================================== */

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#001489",
    fontFamily: '"Century Gothic", CenturyGothic, AppleGothic, Arial, sans-serif',
  },
  container: {
    width: "100%",
    maxWidth: "480px",
    padding: "40px",
    background: "#ffffff",
  },
  logoArea: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  logo: {
    width: "100%",
    maxWidth: "240px",
    height: "auto",
  },
  heading: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    fontWeight: "400",
    color: "#171717",
    textAlign: "center",
  },
  subheading: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#555555",
    textAlign: "center",
  },
  progress: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  progressDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e8e8e8",
    color: "#999999",
    fontSize: "14px",
    fontWeight: "600",
  },
  progressDotActive: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#001489",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  stepTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#001489",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
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
  textarea: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #c0c4cc",
    borderRadius: "4px",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  buttonPrimary: {
    flex: 1,
    minHeight: "42px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    background: "#0788f9",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttonSecondary: {
    flex: 1,
    minHeight: "42px",
    padding: "10px 20px",
    border: "1px solid #001489",
    borderRadius: "4px",
    background: "#ffffff",
    color: "#001489",
    fontFamily: "inherit",
    fontSize: "16px",
    cursor: "pointer",
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
  reviewNote: {
    margin: "8px 0",
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#777777",
    textAlign: "center",
  },
  returnLink: {
    display: "block",
    marginTop: "20px",
    textAlign: "center",
    color: "#001489",
    fontSize: "13px",
    textDecoration: "none",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a8a3f",
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: "700",
  },
  wcsaIdBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "20px",
    margin: "16px 0",
    background: "#f0f4ff",
    border: "1px solid #c5d4f5",
    borderRadius: "4px",
  },
  wcsaIdLabel: {
    fontSize: "12px",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  wcsaIdValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#001489",
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
  },
};
