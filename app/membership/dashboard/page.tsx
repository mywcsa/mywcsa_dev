import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";
import Link from "next/link";
import { signOut } from "@/auth";
import type { CSSProperties } from "react";

const WCG_BLUE = "#001489";
const BORDER = "#d2d7df";
const MUTED = "#5f6875";
const TEXT = "#1f2937";

export default async function DashboardPage() {
  const session = await auth();
  const member = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!member) {
    return <p>Member record not found.</p>;
  }

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === member.membershipType);
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    active: { bg: "#eaf6ea", text: "#1a5e1a", border: "#c2e6c2" },
    pending: { bg: "#fff8e6", text: "#8a6d00", border: "#f0dca0" },
    expired: { bg: "#fdeaea", text: "#a31515", border: "#f5c2c2" },
    suspended: { bg: "#f0f0f0", text: "#555555", border: "#cccccc" },
  };
  const sc = statusColors[member.membershipStatus || "pending"] || statusColors.pending;

  return (
    <div style={styles.page}>
      {/* Welcome */}
      <h1 style={styles.title}>Member Dashboard</h1>
      <p style={styles.subtitle}>
        Welcome, {member.name || "Member"}.
      </p>

      {/* Status banner */}
      <div style={{ ...styles.statusBanner, background: sc.bg, borderColor: sc.border, color: sc.text }}>
        <strong style={styles.statusLabel}>
          Membership Status: {member.membershipStatus?.toUpperCase() || "PENDING"}
        </strong>
        <span style={styles.statusText}>
          {member.membershipStatus === "active"
            ? "Your membership is active and valid."
            : "Your membership application is pending approval by WCSA staff."}
        </span>
      </div>

      {/* Member info grid */}
      <div style={styles.grid}>
        <InfoCard label="WCSA ID" value={member.wcsaId || "—"} />
        <InfoCard label="Membership Tier" value={tier?.label || member.membershipType || "—"} />
        <InfoCard label="Member Since" value={formatDate(member.joinedAt)} />
        <InfoCard label="Expires" value={formatDate(member.expiresAt)} />
        <InfoCard label="Sport" value={member.sport || "—"} />
        <InfoCard label="Discipline" value={member.discipline || "—"} />
        <InfoCard label="Club / School" value={member.club || "—"} />
        <InfoCard label="Region" value={member.region || "—"} />
      </div>

      {/* Quick actions */}
      <h2 style={styles.sectionTitle}>Quick Actions</h2>
      <div style={styles.actions}>
        <Link href="/membership/profile" style={styles.actionCard}>
          <span style={styles.actionIcon}>✎</span>
          <span style={styles.actionText}>Edit My Profile</span>
        </Link>
        <Link href="/membership/card" style={styles.actionCard}>
          <span style={styles.actionIcon}>♳</span>
          <span style={styles.actionText}>View Membership Card</span>
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login/member" });
          }}
        >
          <button type="submit" style={{ ...styles.actionCard, ...styles.actionCardButton }}>
            <span style={styles.actionIcon}>⏻</span>
            <span style={styles.actionText}>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoCardLabel}>{label}</div>
      <div style={styles.infoCardValue}>{value}</div>
    </div>
  );
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const styles: Record<string, CSSProperties> = {
  page: { width: "100%", color: TEXT },
  title: {
    margin: "0 0 6px 0",
    color: WCG_BLUE,
    fontSize: "26px",
    fontWeight: 700,
  },
  subtitle: {
    margin: "0 0 24px 0",
    color: MUTED,
    fontSize: "14px",
  },
  statusBanner: {
    padding: "14px 18px",
    border: "1px solid",
    borderRadius: "4px",
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statusLabel: { fontSize: "14px", fontWeight: 700 },
  statusText: { fontSize: "13px", lineHeight: 1.5 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "30px",
  },
  infoCard: {
    padding: "16px",
    border: `1px solid ${BORDER}`,
    borderRadius: "4px",
    backgroundColor: "#fafbfc",
  },
  infoCardLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  infoCardValue: {
    fontSize: "16px",
    fontWeight: 600,
    color: TEXT,
  },
  sectionTitle: {
    margin: "0 0 14px 0",
    color: WCG_BLUE,
    fontSize: "16px",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 20px",
    border: `1px solid ${BORDER}`,
    borderRadius: "4px",
    textDecoration: "none",
    color: WCG_BLUE,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "#ffffff",
  },
  actionCardButton: {
    border: "none",
    fontFamily: "inherit",
  },
  actionIcon: {
    fontSize: "18px",
  },
  actionText: {},
};
