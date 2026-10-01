"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({
  defaults,
}: {
  defaults: {
    name: string;
    phone: string;
    idNumber: string;
    dateOfBirth: string;
    address: string;
    sport: string;
    discipline: string;
    club: string;
    region: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} style={styles.form}>
      <h2 style={styles.sectionTitle}>Personal Details</h2>
      <div style={styles.grid}>
        <Field label="Full Name" name="name" defaultValue={defaults.name} />
        <Field label="Phone Number" name="phone" type="tel" defaultValue={defaults.phone} />
        <Field label="ID / Passport Number" name="idNumber" defaultValue={defaults.idNumber} />
        <Field label="Date of Birth" name="dateOfBirth" type="date" defaultValue={defaults.dateOfBirth} />
      </div>

      <label style={styles.label}>
        Residential Address
        <textarea name="address" rows={2} style={styles.textarea} defaultValue={defaults.address} />
      </label>

      <h2 style={styles.sectionTitle}>Sport & Membership</h2>
      <div style={styles.grid}>
        <Field label="Sport" name="sport" defaultValue={defaults.sport} />
        <Field label="Discipline" name="discipline" defaultValue={defaults.discipline} />
        <Field label="Club / School" name="club" defaultValue={defaults.club} />
        <Field label="Region" name="region" defaultValue={defaults.region} />
      </div>

      <h2 style={styles.sectionTitle}>Emergency Contact</h2>
      <div style={styles.grid}>
        <Field label="Emergency Contact Name" name="emergencyContactName" defaultValue={defaults.emergencyContactName} />
        <Field label="Emergency Contact Phone" name="emergencyContactPhone" type="tel" defaultValue={defaults.emergencyContactPhone} />
      </div>

      {state?.error && <p style={styles.error}>{state.error}</p>}
      {state?.success && <p style={styles.success}>Profile updated successfully.</p>}

      <button type="submit" disabled={pending} style={styles.button}>
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <label style={styles.label}>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        style={styles.input}
      />
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "100%",
  },
  sectionTitle: {
    margin: "10px 0 4px 0",
    color: "#001489",
    fontSize: "16px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
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
    minHeight: "40px",
    padding: "0 12px",
    border: "1px solid #c0c4cc",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #c0c4cc",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
  },
  error: {
    margin: 0,
    padding: "10px 14px",
    background: "#fdeaea",
    border: "1px solid #f5c2c2",
    borderRadius: "4px",
    color: "#a31515",
    fontSize: "13px",
  },
  success: {
    margin: 0,
    padding: "10px 14px",
    background: "#eaf6ea",
    border: "1px solid #c2e6c2",
    borderRadius: "4px",
    color: "#1a5e1a",
    fontSize: "13px",
  },
  button: {
    alignSelf: "flex-start",
    minHeight: "42px",
    padding: "10px 28px",
    border: "none",
    borderRadius: "4px",
    background: "#0788f9",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "4px",
  },
};
