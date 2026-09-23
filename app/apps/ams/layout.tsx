import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AMSLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login/staff");
  }

  const fullName =
    session.user.name ||
    session.user.email ||
    "WCSA Staff Member";

  const firstName = getFirstName(fullName);

  return (
    <div style={styles.page}>
      {/* =====================================================
          AMS SIDEBAR
          ===================================================== */}

      <aside style={styles.sidebar}>
        <div>
          {/* BRAND */}

          <div style={styles.sidebarBrand}>
            <div style={styles.amsLogo}>
              AMS
            </div>

            <div>
              <div style={styles.brandName}>
                MyWCSA
              </div>

              <div style={styles.brandDescription}>
                Administration Management System
              </div>
            </div>
          </div>

          {/* INTERFACE */}

          <div style={styles.interfaceBox}>
            <div style={styles.interfaceLabel}>
              CURRENT INTERFACE
            </div>

            <div style={styles.interfaceName}>
              Staff Interface
            </div>
          </div>

          {/* NAVIGATION */}

          <nav style={styles.navigation}>
            <NavHeading title="MAIN" />

            <NavItem
              href="/apps/ams"
              icon="▦"
              label="Dashboard"
            />

            <NavHeading title="REGISTRY" />

            <NavItem
              href="/apps/ams/participants"
              icon="◎"
              label="Participants"
            />

            <NavItem
              href="/apps/ams/schools"
              icon="▣"
              label="Schools"
            />

            <NavItem
              href="/apps/ams/clubs-teams"
              icon="◫"
              label="Clubs & Teams"
            />

            <NavItem
              href="/apps/ams/associations"
              icon="◇"
              label="Associations"
            />

            <NavHeading title="SPORT & PARTICIPATION" />

            <NavItem
              href="/apps/ams/sporting-codes"
              icon="○"
              label="Sporting Codes"
            />

            <NavItem
              href="/apps/ams/competitions-events"
              icon="◆"
              label="Competitions & Events"
            />

            <NavItem
              href="/apps/ams/affiliations"
              icon="⇄"
              label="Affiliations"
            />

            <NavHeading title="ORGANISATION" />

            <NavItem
              href="/apps/ams/governance"
              icon="▤"
              label="Governance"
            />

            <NavItem
              href="/apps/ams/documents"
              icon="□"
              label="Documents"
            />

            <NavItem
              href="/apps/ams/reports"
              icon="▥"
              label="Reports"
            />
          </nav>
        </div>

        {/* QUICK LINKS */}

        <div style={styles.sidebarBottom}>
          <div style={styles.quickHeading}>
            QUICK LINKS
          </div>

          <Link
            href="/my-apps"
            style={styles.quickLink}
          >
            ← Back to MyGovApps
          </Link>

          <Link
            href="/apps/ams/help"
            style={styles.quickLink}
          >
            Help & Support
          </Link>

          <Link
            href="/apps/ams/user-guide"
            style={styles.quickLink}
          >
            User Guide
          </Link>

          <Link
            href="/apps/ams/service-desk"
            style={styles.quickLink}
          >
            Service Desk
          </Link>
        </div>
      </aside>

      {/* =====================================================
          APPLICATION
          ===================================================== */}

      <div style={styles.application}>
        {/* ===================================================
            HEADER
            =================================================== */}

        <header style={styles.header}>
          {/* LEFT */}

          <div style={styles.headerLeft}>
            <div style={styles.wcgTemporary}>
              WCG
            </div>

            <div style={styles.headerDivider} />

            <div>
              <div style={styles.systemName}>
                MyWCSA AMS
              </div>

              <div style={styles.systemSubtitle}>
                Administration Management System
              </div>
            </div>
          </div>

          {/* SEARCH */}

          <div style={styles.headerSearch}>
            <span style={styles.searchIcon}>
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search MyWCSA AMS"
              aria-label="Search MyWCSA AMS"
              style={styles.searchInput}
            />
          </div>

          {/* USER */}

          <div style={styles.userArea}>
            {/* WHITE GENERIC AVATAR */}

            <div style={styles.avatar}>
              <div style={styles.avatarHead} />

              <div style={styles.avatarBody} />
            </div>

            <div>
              <div style={styles.hello}>
                HELLO {firstName.toUpperCase()}
              </div>

              <div style={styles.organisation}>
                Western Cape Sports Association
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            INTERFACE BAR
            =================================================== */}

        <div style={styles.interfaceBar}>
          <div>
            <span style={styles.interfaceBarLabel}>
              INTERFACE:
            </span>

            <span style={styles.interfaceBarValue}>
              STAFF
            </span>
          </div>

          <div style={styles.interfaceBarRight}>
            MyWCSA AMS
          </div>
        </div>

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <div style={styles.content}>
          {children}
        </div>

        {/* ===================================================
            LEGAL FOOTER
            =================================================== */}

        <footer style={styles.footer}>
          <div style={styles.footerBrand}>
            WCG
          </div>

          <div style={styles.footerLegal}>
            This computer system is the property of the
            Western Cape Government (WCG). It is for
            authorised use only.
          </div>

          <div style={styles.footerSupport}>
            <strong>Need help?</strong>
            <br />
            Service Desk: 083 273 1459
            <br />
            service@westerncapegov.za
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function getFirstName(name: string) {
  if (name.includes("@")) {
    return "USER";
  }

  const first = name.trim().split(/\s+/)[0];

  return first || "USER";
}

/* ============================================================
   NAVIGATION COMPONENTS
   ============================================================ */

function NavHeading({
  title,
}: {
  title: string;
}) {
  return (
    <div style={styles.navHeading}>
      {title}
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={styles.navItem}
    >
      <span style={styles.navIcon}>
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    background: "#eef1f5",
    color: "#20242a",
    fontFamily:
      "Poppins, Arial, Helvetica, sans-serif",
  },

  /* ==========================================================
     SIDEBAR
     ========================================================== */

  sidebar: {
    width: "270px",
    minWidth: "270px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "#071b3b",
    color: "#ffffff",
  },

  sidebarBrand: {
    minHeight: "88px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    borderBottom:
      "1px solid rgba(255,255,255,0.13)",
  },

  amsLogo: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    color: "#071b3b",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  brandName: {
    fontSize: "18px",
    fontWeight: 600,
  },

  brandDescription: {
    maxWidth: "150px",
    marginTop: "2px",
    color: "#aebdd0",
    fontSize: "8px",
    lineHeight: 1.4,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  interfaceBox: {
    padding: "15px 20px",
    background: "#0b2854",
    borderBottom:
      "1px solid rgba(255,255,255,0.1)",
  },

  interfaceLabel: {
    color: "#91a4bd",
    fontSize: "8px",
    fontWeight: 600,
    letterSpacing: "1.1px",
  },

  interfaceName: {
    marginTop: "4px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
  },

  navigation: {
    padding: "8px 0 25px",
  },

  navHeading: {
    padding: "19px 20px 7px",
    color: "#7f91ac",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "1.4px",
  },

  navItem: {
    minHeight: "42px",
    padding: "9px 20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#dce4ef",
    textDecoration: "none",
    fontSize: "11px",
    borderLeft:
      "3px solid transparent",
  },

  navIcon: {
    width: "20px",
    color: "#b8c7da",
    textAlign: "center",
    fontSize: "14px",
  },

  sidebarBottom: {
    padding: "20px",
    borderTop:
      "1px solid rgba(255,255,255,0.12)",
  },

  quickHeading: {
    marginBottom: "9px",
    color: "#7f91ac",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "1.3px",
  },

  quickLink: {
    display: "block",
    padding: "5px 0",
    color: "#dce4ef",
    textDecoration: "none",
    fontSize: "10px",
  },

  /* ==========================================================
     APPLICATION
     ========================================================== */

  application: {
    minWidth: 0,
    minHeight: "100vh",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#eef1f5",
  },

  /* ==========================================================
     HEADER
     ========================================================== */

  header: {
    minHeight: "78px",
    padding: "11px 28px",
    display: "grid",
    gridTemplateColumns:
      "1fr minmax(260px, 500px) 1fr",
    alignItems: "center",
    gap: "24px",
    background: "#ffffff",
    borderBottom:
      "1px solid #d9dde3",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  wcgTemporary: {
    color: "#071b3b",
    fontSize: "19px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  headerDivider: {
    width: "1px",
    height: "38px",
    background: "#d7dce2",
  },

  systemName: {
    color: "#071b3b",
    fontSize: "16px",
    fontWeight: 700,
  },

  systemSubtitle: {
    marginTop: "2px",
    color: "#737b85",
    fontSize: "8px",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },

  headerSearch: {
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    background: "#f4f5f7",
    border: "1px solid #d7dce2",
  },

  searchIcon: {
    paddingLeft: "13px",
    paddingRight: "8px",
    color: "#6c7783",
    fontSize: "17px",
  },

  searchInput: {
    width: "100%",
    height: "100%",
    padding: "0 12px 0 2px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#26313d",
    fontFamily: "inherit",
    fontSize: "10px",
  },

  userArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "11px",
  },

  /* ==========================================================
     AVATAR
     ========================================================== */

  avatar: {
    position: "relative",
    width: "43px",
    height: "43px",
    overflow: "hidden",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#0b2b58",
  },

  avatarHead: {
    position: "absolute",
    top: "8px",
    left: "50%",
    width: "12px",
    height: "12px",
    transform: "translateX(-50%)",
    borderRadius: "50%",
    background: "#ffffff",
  },

  avatarBody: {
    position: "absolute",
    left: "50%",
    bottom: "5px",
    width: "27px",
    height: "15px",
    transform: "translateX(-50%)",
    borderRadius:
      "16px 16px 5px 5px",
    background: "#ffffff",
  },

  hello: {
    color: "#071b3b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.2px",
  },

  organisation: {
    maxWidth: "220px",
    marginTop: "2px",
    color: "#747c86",
    fontSize: "8px",
  },

  /* ==========================================================
     INTERFACE BAR
     ========================================================== */

  interfaceBar: {
    minHeight: "34px",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0b2b58",
    color: "#ffffff",
  },

  interfaceBarLabel: {
    color: "#aabbd0",
    fontSize: "8px",
    fontWeight: 600,
    letterSpacing: "0.8px",
  },

  interfaceBarValue: {
    marginLeft: "6px",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.8px",
  },

  interfaceBarRight: {
    color: "#aabbd0",
    fontSize: "8px",
  },

  /* ==========================================================
     CONTENT
     ========================================================== */

  content: {
    width: "100%",
    maxWidth: "1550px",
    margin: "0 auto",
    padding: "28px 30px",
    flex: 1,
  },

  /* ==========================================================
     FOOTER
     ========================================================== */

  footer: {
    minHeight: "90px",
    padding: "18px 28px",
    display: "grid",
    gridTemplateColumns:
      "100px 1fr 260px",
    alignItems: "center",
    gap: "25px",
    background: "#ffffff",
    borderTop:
      "1px solid #d9dde3",
    color: "#5d6670",
  },

  footerBrand: {
    color: "#071b3b",
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  footerLegal: {
    fontSize: "8px",
    lineHeight: 1.6,
  },

  footerSupport: {
    fontSize: "8px",
    lineHeight: 1.6,
    textAlign: "right",
  },
};