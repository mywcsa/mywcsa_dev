"use client";

import type { CSSProperties } from "react";

interface MemberData {
  name: string;
  wcsaId: string;
  tierLabel: string;
  sport: string;
  discipline: string;
  joinedAt: string;
  expiresAt: string;
  status: string;
}

export default function MembershipCard({ member }: { member: MemberData }) {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Membership Card</h1>
      <p style={styles.subtitle}>
        Your digital WCSA membership card. Print or save for your records.
      </p>

      <div className="print-area" style={styles.cardWrapper}>
        <div style={styles.card}>
          {/* Card header */}
          <div style={styles.cardHeader}>
            <img
              src="/mywcsa-logo.png"
              alt="MyWCSA"
              style={styles.cardLogo}
            />
            <div style={styles.cardHeaderText}>
              <div style={styles.cardOrg}>
                Western Cape Sports Association
              </div>
              <div style={styles.cardPortal}>Membership Portal</div>
            </div>
          </div>

          {/* Card body */}
          <div style={styles.cardBody}>
            <div style={styles.cardPhotoArea}>
              <div style={styles.cardPhoto}>👤</div>
            </div>

            <div style={styles.cardInfo}>
              <CardField label="Name" value={member.name || "—"} large />
              <CardField label="WCSA ID" value={member.wcsaId || "—"} />
              <CardField label="Tier" value={member.tierLabel || "—"} />
              <CardField label="Sport" value={member.sport || "—"} />
              <CardField label="Discipline" value={member.discipline || "—"} />
            </div>
          </div>

          {/* Card footer */}
          <div style={styles.cardFooter}>
            <div>
              <span style={styles.cardFooterLabel}>Member Since</span>
              <span style={styles.cardFooterValue}>{member.joinedAt}</span>
            </div>
            <div>
              <span style={styles.cardFooterLabel}>Valid Until</span>
              <span style={styles.cardFooterValue}>{member.expiresAt}</span>
            </div>
            <div>
              <span style={styles.cardFooterLabel}>Status</span>
              <span style={styles.cardFooterValue}>{member.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.printButtonArea}>
        <button
          type="button"
          onClick={() => window.print()}
          style={styles.printButton}
        >
          Print Membership Card
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

function CardField({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <div style={styles.cardFieldLabel}>{label}</div>
      <div style={large ? styles.cardFieldValueLarge : styles.cardFieldValue}>
        {value}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { width: "100%" },
  title: {
    margin: "0 0 6px 0",
    color: "#001489",
    fontSize: "26px",
    fontWeight: 700,
  },
  subtitle: {
    margin: "0 0 24px 0",
    color: "#5f6875",
    fontSize: "14px",
  },
  cardWrapper: { maxWidth: "500px" },
  card: {
    background: "#ffffff",
    border: "2px solid #001489",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0, 20, 137, 0.15)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px 20px",
    backgroundColor: "#001489",
    color: "#ffffff",
  },
  cardLogo: {
    height: "44px",
    width: "auto",
    maxWidth: "120px",
    objectFit: "contain",
  },
  cardHeaderText: { display: "flex", flexDirection: "column", gap: "2px" },
  cardOrg: { fontSize: "14px", fontWeight: 700 },
  cardPortal: { fontSize: "11px", opacity: 0.85 },
  cardBody: { display: "flex", gap: "20px", padding: "24px 20px" },
  cardPhotoArea: { flexShrink: 0 },
  cardPhoto: {
    width: "80px",
    height: "80px",
    borderRadius: "4px",
    border: "1px solid #d2d7df",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    backgroundColor: "#f5f7fa",
  },
  cardInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
  cardFieldLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#5f6875",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },
  cardFieldValue: { fontSize: "14px", fontWeight: 600, color: "#1f2937" },
  cardFieldValueLarge: { fontSize: "18px", fontWeight: 700, color: "#001489" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 20px",
    backgroundColor: "#f5f7fa",
    borderTop: "1px solid #d2d7df",
    gap: "16px",
  },
  cardFooterLabel: {
    display: "block",
    fontSize: "9px",
    fontWeight: 700,
    color: "#5f6875",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "3px",
  },
  cardFooterValue: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#1f2937",
  },
  printButtonArea: { marginTop: "24px" },
  printButton: {
    padding: "10px 28px",
    border: "1px solid #001489",
    borderRadius: "4px",
    background: "#ffffff",
    color: "#001489",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
