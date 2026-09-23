import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { auth } from "@/auth";

/* ============================================================
   MyWCSA AMS — MASTER STAFF LAYOUT
   ============================================================

   DESIGN STANDARD
   ------------------------------------------------------------
   Primary blue:       #001489
   Typeface:           Century Gothic
   Navigation:         Horizontal / Top
   Header artwork:     /images/cape-town-header.png
   Workspace:          White + fine grey horizontal lines

   IMPORTANT
   ------------------------------------------------------------
   cape-town-header.png contains the completed header artwork.
   We DO NOT place another logo, avatar or greeting over it.

   The layout provides:
   - Header
   - Main AMS navigation
   - Main workspace
   - Government-style footer

   Individual pages provide:
   - Breadcrumbs
   - Page titles
   - Workflow
   - Forms
   - Registers
   - Tables
   - Actions
   ============================================================ */

const WCG_BLUE = "#001489";
const WCG_DARK_BLUE = "#000f5c";
const TEXT_BLUE = "#00175a";
const BORDER = "#b9c0c8";
const MUTED_TEXT = "#56616d";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/apps/ams",
    icon: "⌂",
  },
  {
    label: "Participants",
    href: "/apps/ams/participants",
    icon: "♟",
  },
  {
    label: "Schools",
    href: "/apps/ams/schools",
    icon: "▦",
  },
  {
    label: "Clubs & Teams",
    href: "/apps/ams/clubs",
    icon: "♟",
  },
  {
    label: "Associations",
    href: "/apps/ams/associations",
    icon: "⌘",
  },
  {
    label: "Sporting Codes",
    href: "/apps/ams/sporting-codes",
    icon: "⚒",
  },
  {
    label: "Competitions",
    href: "/apps/ams/competitions",
    icon: "♜",
  },
  {
    label: "Affiliations",
    href: "/apps/ams/affiliations",
    icon: "⌁",
  },
  {
    label: "Governance",
    href: "/apps/ams/governance",
    icon: "◇",
  },
  {
    label: "Documents",
    href: "/apps/ams/documents",
    icon: "▤",
  },
  {
    label: "Reports",
    href: "/apps/ams/reports",
    icon: "▥",
  },
];

export default async function AMSLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login/staff");
  }

  return (
    <div style={styles.application}>
      {/* =====================================================
          BAKED CAPE TOWN HEADER
          ===================================================== */}

      <header style={styles.header}>
        <img
          src="/images/cape-town-header.png"
          alt="MyWCSA"
          style={styles.headerImage}
        />
      </header>

      {/* =====================================================
          AMS MODULE NAVIGATION
          ===================================================== */}

      <nav
        aria-label="MyWCSA AMS modules"
        style={styles.navigation}
      >
        <div style={styles.navigationInner}>
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={styles.navigationItem}
            >
              <span style={styles.navigationIcon}>
                {item.icon}
              </span>

              <span style={styles.navigationText}>
                {item.label}
              </span>
            </Link>
          ))}

          <div style={styles.moreItem}>
            <span style={styles.moreDots}>•••</span>
            <span>More</span>
            <span style={styles.moreArrow}>⌄</span>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN WORKSPACE
          ===================================================== */}

      <main style={styles.workspace}>
        <div style={styles.workspaceBoundaryLeft} />
        <div style={styles.workspaceBoundaryRight} />

        <div style={styles.workspaceInner}>
          {children}
        </div>
      </main>

      {/* =====================================================
          SERVICE LINKS
          ===================================================== */}

      <div style={styles.serviceLinks}>
        <div style={styles.serviceLinksInner}>
          <div style={styles.serviceLinksLeft}>
            <span>Western Cape Government</span>

            <span style={styles.separator}>|</span>

            <span>MyWCSA e-Innovation</span>

            <span style={styles.separator}>|</span>

            <span>Western Cape Sports Association</span>
          </div>

          <div style={styles.serviceLinksRight}>
            <Link
              href="/my-apps"
              style={styles.serviceLink}
            >
              MyGovApps
            </Link>

            <span style={styles.separator}>|</span>

            <Link
              href="/apps/ams/help"
              style={styles.serviceLink}
            >
              Help &amp; Support
            </Link>

            <span style={styles.separator}>|</span>

            <span>Service Desk: 083 273 1459</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORMAL FOOTER
          ===================================================== */}

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerSection}>
            <div style={styles.footerHeading}>
              MyWCSA AMS
            </div>

            <div style={styles.footerSmall}>
              Western Cape Sports Association
            </div>
          </div>

          <div style={styles.footerLegal}>
            This computer system is for authorised use only.
          </div>

          <div style={styles.footerRight}>
            <Link
              href="/apps/ams/help"
              style={styles.footerLink}
            >
              Help &amp; Support
            </Link>

            <span style={styles.footerSeparator}>|</span>

            <Link
              href="/my-apps"
              style={styles.footerLink}
            >
              MyGovApps
            </Link>

            <span style={styles.footerSeparator}>|</span>

            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   MASTER STYLES
   ============================================================ */

const styles: Record<string, CSSProperties> = {
  /* =========================================================
     APPLICATION
     ========================================================= */

  application: {
    width: "100%",
    minHeight: "100vh",

    margin: 0,

    backgroundColor: "#ffffff",

    color: TEXT_BLUE,

    fontFamily:
      '"Century Gothic", "CenturyGothic", "AppleGothic", Arial, sans-serif',

    fontSize: "11px",

    lineHeight: 1.35,
  },

  /* =========================================================
     HEADER

     IMPORTANT:
     The image already contains its own branding and profile
     artwork, so NOTHING is layered over it.
     ========================================================= */

  header: {
    position: "relative",

    width: "100%",

    height: "154px",

    overflow: "hidden",

    backgroundColor: WCG_BLUE,

    borderBottom: `3px solid ${WCG_BLUE}`,
  },

  headerImage: {
    display: "block",

    width: "100%",
    height: "100%",

    objectFit: "cover",

    objectPosition: "center center",
  },

  /* =========================================================
     MAIN NAVIGATION

     Deliberately slim.
     This is navigation — NOT a row of giant cards.
     ========================================================= */

  navigation: {
    position: "relative",

    zIndex: 20,

    width: "100%",

    height: "44px",

    backgroundColor: "#ffffff",

    borderBottom: `3px solid ${WCG_BLUE}`,

    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  navigationInner: {
    width: "100%",
    height: "44px",

    display: "flex",

    alignItems: "stretch",

    overflowX: "auto",
    overflowY: "hidden",

    scrollbarWidth: "thin",
  },

  navigationItem: {
    height: "44px",

    padding: "0 14px",

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "6px",

    flexShrink: 0,

    boxSizing: "border-box",

    color: TEXT_BLUE,

    backgroundColor: "#ffffff",

    border: "none",

    borderRight: "1px solid #d1d5da",

    textDecoration: "none",

    whiteSpace: "nowrap",
  },

  navigationIcon: {
    width: "17px",

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    color: WCG_BLUE,

    fontSize: "14px",

    fontWeight: 700,

    lineHeight: 1,
  },

  navigationText: {
    fontSize: "10px",

    fontWeight: 600,

    letterSpacing: "0",

    lineHeight: 1,
  },

  moreItem: {
    height: "44px",

    padding: "0 14px",

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "6px",

    flexShrink: 0,

    boxSizing: "border-box",

    color: TEXT_BLUE,

    backgroundColor: "#ffffff",

    whiteSpace: "nowrap",

    fontSize: "10px",

    fontWeight: 600,
  },

  moreDots: {
    color: WCG_BLUE,

    fontWeight: 700,

    letterSpacing: "1px",
  },

  moreArrow: {
    color: WCG_BLUE,

    fontSize: "10px",

    fontWeight: 700,
  },

  /* =========================================================
     WORKSPACE

     EXACT DIRECTION:
     WHITE BACKGROUND + FINE GREY HORIZONTAL LINES
     ========================================================= */

  workspace: {
    position: "relative",

    width: "100%",

    minHeight: "680px",

    overflow: "hidden",

    backgroundColor: "#ffffff",

    backgroundImage:
      "repeating-linear-gradient(to bottom, rgba(110,115,120,0.12) 0px, rgba(110,115,120,0.12) 1px, transparent 1px, transparent 3px)",
  },

  workspaceInner: {
    position: "relative",

    zIndex: 2,

    width: "100%",

    maxWidth: "1540px",

    margin: "0 auto",

    padding: "22px 32px 38px",

    boxSizing: "border-box",
  },

  /*
     Only two very subtle alignment boundaries.

     We are NOT adding vertical grid lines across the page.
  */

  workspaceBoundaryLeft: {
    position: "absolute",

    zIndex: 1,

    top: 0,
    bottom: 0,

    left: "32px",

    width: "1px",

    backgroundColor: "rgba(100,105,110,0.08)",

    pointerEvents: "none",
  },

  workspaceBoundaryRight: {
    position: "absolute",

    zIndex: 1,

    top: 0,
    bottom: 0,

    right: "32px",

    width: "1px",

    backgroundColor: "rgba(100,105,110,0.08)",

    pointerEvents: "none",
  },

  /* =========================================================
     SERVICE LINKS

     Clean strip — NOT tabulated.
     ========================================================= */

  serviceLinks: {
    width: "100%",

    backgroundColor: "#ffffff",

    borderTop: `1px solid ${BORDER}`,

    borderBottom: `1px solid ${BORDER}`,
  },

  serviceLinksInner: {
    maxWidth: "1540px",

    minHeight: "36px",

    margin: "0 auto",

    padding: "0 32px",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "20px",

    boxSizing: "border-box",

    color: MUTED_TEXT,

    fontSize: "8px",
  },

  serviceLinksLeft: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    whiteSpace: "nowrap",
  },

  serviceLinksRight: {
    display: "flex",

    alignItems: "center",

    justifyContent: "flex-end",

    gap: "7px",

    whiteSpace: "nowrap",
  },

  serviceLink: {
    color: TEXT_BLUE,

    textDecoration: "none",

    fontWeight: 600,
  },

  separator: {
    color: "#a9afb6",
  },

  /* =========================================================
     FOOTER
     ========================================================= */

  footer: {
    width: "100%",

    backgroundColor: WCG_DARK_BLUE,

    borderTop: `3px solid ${WCG_BLUE}`,
  },

  footerInner: {
    maxWidth: "1540px",

    minHeight: "54px",

    margin: "0 auto",

    padding: "0 32px",

    display: "grid",

    gridTemplateColumns: "1fr 1fr 1fr",

    alignItems: "center",

    gap: "20px",

    boxSizing: "border-box",

    color: "#ffffff",
  },

  footerSection: {
    textAlign: "left",
  },

  footerHeading: {
    marginBottom: "2px",

    fontSize: "9px",

    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  footerSmall: {
    color: "rgba(255,255,255,0.75)",

    fontSize: "7px",
  },

  footerLegal: {
    color: "rgba(255,255,255,0.8)",

    fontSize: "7px",

    textAlign: "center",
  },

  footerRight: {
    display: "flex",

    alignItems: "center",

    justifyContent: "flex-end",

    gap: "7px",

    fontSize: "7px",

    whiteSpace: "nowrap",
  },

  footerLink: {
    color: "#ffffff",

    textDecoration: "none",
  },

  footerSeparator: {
    opacity: 0.5,
  },
};