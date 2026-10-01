import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

const WCG_BLUE = "#001489";
const WCG_DARK_BLUE = "#000d5c";
const TEXT_BLUE = "#00175a";
const TEXT = "#1f2937";
const MUTED = "#5f6875";
const BORDER = "#d2d7df";
const LIGHT_BG = "#f5f7fa";

const navItems = [
  { label: "Dashboard", href: "/membership/dashboard" },
  { label: "My Profile", href: "/membership/profile" },
  { label: "Membership Card", href: "/membership/card" },
];

export default async function MembershipLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "member") {
    redirect("/login/member");
  }

  const member = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const memberName = session.user.name || "WCSA Member";
  const memberEmail = session.user.email || "";
  const wcsaId = session.user.wcsaId || member?.wcsaId || "";
  const membershipStatus = member?.membershipStatus || "pending";

  return (
    <div style={styles.shell}>
      {/* Cape Town header */}
      <header style={styles.header}>
        <img
          src="/cape-town-header.png"
          alt="Western Cape Government"
          style={styles.headerImage}
        />
      </header>

      {/* Member identity bar */}
      <section style={styles.identityBar}>
        <div style={styles.identityInner}>
          <div style={styles.systemIdentity}>
            <div style={styles.systemName}>MyWCSA Membership Portal</div>
            <div style={styles.systemDivider} />
            <div style={styles.systemDescription}>
              Member Self-Service
            </div>
          </div>

          <div style={styles.staffIdentity}>
            <div style={styles.staffCaption}>SIGNED IN AS</div>
            <div style={styles.staffName}>{memberName}</div>
            <div style={styles.staffRole}>
              {wcsaId}
              {memberEmail ? ` • ${memberEmail}` : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav style={styles.navigation} aria-label="Membership navigation">
        <div style={styles.navigationInner}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={styles.navigationItem}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Workspace */}
      <main style={styles.workspace}>
        <div style={styles.workspaceInner}>{children}</div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerPrimary}>
          <div style={styles.footerLeft}>MyWCSA e-Innovation</div>
          <div style={styles.footerCentre}>
            Western Cape Sports Association
          </div>
          <div style={styles.footerRight}>Membership Portal</div>
        </div>

        <div style={styles.footerSecondary}>
          <div style={styles.footerBrand}>
            <div style={styles.footerBrandTitle}>MyWCSA GovApps</div>
            <div style={styles.footerBrandSubtitle}>
              Membership Portal
            </div>
          </div>
          <div style={styles.footerService}>
            <span>Authorised use only</span>
            <span style={styles.footerDivider} />
            <span>Service Desk: 083 273 1459</span>
            <span style={styles.footerDivider} />
            <span>service@westerncapegov.za</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    width: "100%",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#ffffff",
    color: TEXT,
    fontFamily:
      '"Century Gothic", "CenturyGothic", Arial, Helvetica, sans-serif',
  },
  header: {
    position: "relative",
    width: "100%",
    height: "150px",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    backgroundColor: WCG_BLUE,
    border: 0,
  },
  headerImage: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    objectFit: "cover",
    objectPosition: "center center",
    border: 0,
  },
  identityBar: {
    width: "100%",
    backgroundColor: WCG_BLUE,
    borderTop: "1px solid rgba(255,255,255,0.20)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },
  identityInner: {
    width: "100%",
    minHeight: "54px",
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    boxSizing: "border-box",
  },
  systemIdentity: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  systemName: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  },
  systemDivider: {
    width: "1px",
    height: "25px",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  systemDescription: {
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: 1.3,
    whiteSpace: "nowrap",
  },
  staffIdentity: {
    minWidth: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  },
  staffCaption: {
    marginBottom: "2px",
    color: "#dfe4ff",
    fontSize: "9px",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "0.8px",
  },
  staffName: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  staffRole: {
    marginTop: "2px",
    color: "#e4e8f7",
    fontSize: "10px",
    fontWeight: 400,
    lineHeight: 1.3,
  },
  navigation: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    margin: 0,
    padding: 0,
    backgroundColor: "#ffffff",
    borderBottom: `1px solid ${BORDER}`,
    boxShadow: "0 1px 4px rgba(15, 29, 64, 0.07)",
  },
  navigationInner: {
    width: "100%",
    minHeight: "44px",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "stretch",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  navigationItem: {
    minWidth: 0,
    height: "44px",
    padding: "0 24px",
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    borderRight: `1px solid ${BORDER}`,
    color: WCG_BLUE,
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  workspace: {
    width: "100%",
    minHeight: "650px",
    margin: 0,
    padding: "26px 32px 50px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  workspaceInner: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    padding: 0,
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    color: TEXT_BLUE,
  },
  footer: {
    width: "100%",
    margin: 0,
    padding: 0,
    backgroundColor: "#ffffff",
    borderTop: `1px solid ${BORDER}`,
  },
  footerPrimary: {
    minHeight: "44px",
    padding: "0 32px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center",
    boxSizing: "border-box",
    backgroundColor: WCG_DARK_BLUE,
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 700,
  },
  footerLeft: { textAlign: "left" },
  footerCentre: { textAlign: "center" },
  footerRight: { textAlign: "right" },
  footerSecondary: {
    minHeight: "72px",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    boxSizing: "border-box",
    backgroundColor: LIGHT_BG,
    color: MUTED,
  },
  footerBrand: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  footerBrandTitle: {
    color: WCG_BLUE,
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  footerBrandSubtitle: {
    color: MUTED,
    fontSize: "10px",
    fontWeight: 400,
    lineHeight: 1.3,
  },
  footerService: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: MUTED,
    fontSize: "10px",
    fontWeight: 400,
    lineHeight: 1.3,
  },
  footerDivider: {
    width: "1px",
    height: "16px",
    flexShrink: 0,
    backgroundColor: BORDER,
  },
};
