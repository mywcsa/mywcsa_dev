import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { auth } from "@/auth";

/* ============================================================
   MyWCSA AMS
   MASTER SHARED LAYOUT

   DESIGN STANDARD
   ------------------------------------------------------------
   Font: Century Gothic
   Primary WCG Blue: #001489
   Default navigation: Horizontal / Top
   Workspace: White with fine grey horizontal system lines

   ASSETS
   ------------------------------------------------------------
   /public/mywcsa-logo.png
   /public/images/cape-town-header.png
   /public/images/staff-avatar.png

   IMPORTANT
   ------------------------------------------------------------
   This layout contains the shared AMS application shell only.

   Individual AMS pages provide their own:
   - Breadcrumbs
   - Page headings
   - Forms
   - Tables
   - Registers
   - Document outputs
   - Page-specific actions
   ============================================================ */

const WCG_BLUE = "#001489";
const WCG_DARK_BLUE = "#00105f";
const BORDER_GREY = "#b9c0c8";
const LIGHT_GREY = "#e5e8eb";
const TEXT_BLUE = "#00145f";

/*
   ============================================================
   NAVIGATION POSITION

   TOP is the default.

   Later we can make this come from a user/system preference:
   "top" | "left" | "right" | "bottom"

   For now, TOP is deliberately locked as the AMS default.
   ============================================================
*/

const NAVIGATION_POSITION = "top";

/*
   ============================================================
   AMS MAIN NAVIGATION
   ============================================================
*/

const navigationItems = [
  {
    label: "Dashboard",
    href: "/apps/ams",
    icon: "⌂",
  },
  {
    label: "Participants",
    href: "/apps/ams/participants",
    icon: "♙",
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

/*
   ============================================================
   LAYOUT
   ============================================================
*/

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
    session.user.name?.trim() || "Staff User";

  const firstName =
    fullName.split(" ")[0] || "User";

  const greeting = getGreeting();

  const formattedDate = getFormattedDate();

  return (
    <div style={styles.application}>
      {/* =====================================================
          CAPE TOWN HERO HEADER
          ===================================================== */}

      <header style={styles.hero}>
        {/* BACKGROUND IMAGE */}

        <img
          src="/images/cape-town-header.png"
          alt=""
          style={styles.heroBackground}
        />

        {/* BLUE OVERLAY */}

        <div style={styles.heroBlueOverlay} />

        {/* SUBTLE SYSTEM LINES INSIDE HEADER */}

        <div style={styles.heroSystemLines} />

        {/* ===================================================
            LOGO
            =================================================== */}

        <div style={styles.logoArea}>
          <img
            src="/mywcsa-logo.png"
            alt="Western Cape Government"
            style={styles.logo}
          />
        </div>

        {/* ===================================================
            GREETING
            =================================================== */}

        <div style={styles.heroGreeting}>
          <div style={styles.heroGreetingLabel}>
            {greeting}
          </div>

          <div style={styles.heroWelcome}>
            Welcome, {firstName}
          </div>

          <div style={styles.heroSubtitle}>
            Your gateway to WCSA&apos;s digital workplace.
          </div>
        </div>

        {/* ===================================================
            STAFF PROFILE
            =================================================== */}

        <div style={styles.staffProfile}>
          <img
            src="/images/staff-avatar.png"
            alt="Staff profile"
            style={styles.staffAvatar}
          />

          <div style={styles.staffProfileDetails}>
            <div style={styles.staffHello}>
              HELLO {firstName.toUpperCase()}
            </div>

            <div style={styles.staffOrganisation}>
              Western Cape Sports Association
            </div>
          </div>

          <div style={styles.staffMenuArrow}>
            ▾
          </div>
        </div>
      </header>

      {/* =====================================================
          WCG BLUE SYSTEM BAR
          ===================================================== */}

      <div style={styles.primarySystemBar}>
        <div style={styles.primarySystemBarLeft}>
          <span style={styles.primarySystemBarTitle}>
            MyWCSA AMS
          </span>

          <span style={styles.primarySystemBarDivider}>
            |
          </span>

          <span style={styles.primarySystemBarText}>
            STAFF INTERFACE
          </span>
        </div>

        <div style={styles.primarySystemBarRight}>
          <span>{formattedDate}</span>

          <span style={styles.primarySystemBarDivider}>
            |
          </span>

          <span>
            Western Cape Sports Association
          </span>
        </div>
      </div>

      {/* =====================================================
          TOP HORIZONTAL NAVIGATION

          DEFAULT POSITION = TOP
          ===================================================== */}

      {NAVIGATION_POSITION === "top" && (
        <nav
          aria-label="MyWCSA AMS main navigation"
          style={styles.navigation}
        >
          <div style={styles.navigationScroll}>
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={styles.navigationItem}
              >
                <span style={styles.navigationIcon}>
                  {item.icon}
                </span>

                <span style={styles.navigationLabel}>
                  {item.label}
                </span>
              </Link>
            ))}

            <div style={styles.moreNavigationItem}>
              <span style={styles.navigationIcon}>
                •••
              </span>

              <span style={styles.navigationLabel}>
                More
              </span>

              <span style={styles.navigationArrow}>
                ▾
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* =====================================================
          THIN ADMINISTRATION INFORMATION LINE
          ===================================================== */}

      <div style={styles.informationStrip}>
        <div style={styles.informationStripLeft}>
          <span style={styles.informationStrong}>
            INTERFACE:
          </span>

          <span>STAFF</span>

          <span style={styles.informationDivider}>
            |
          </span>

          <span style={styles.informationStrong}>
            SYSTEM:
          </span>

          <span>AMS</span>

          <span style={styles.informationDivider}>
            |
          </span>

          <span style={styles.informationStrong}>
            STATUS:
          </span>

          <span style={styles.systemAvailable}>
            SYSTEM AVAILABLE
          </span>
        </div>

        <div style={styles.informationStripRight}>
          <Link
            href="/my-apps"
            style={styles.informationLink}
          >
            BACK TO MYGOVAPPS
          </Link>

          <span style={styles.informationDivider}>
            |
          </span>

          <Link
            href="/apps/ams/help"
            style={styles.informationLink}
          >
            HELP &amp; SUPPORT
          </Link>
        </div>
      </div>

      {/* =====================================================
          MAIN WORKSPACE

          IMPORTANT:
          White background + fine grey horizontal lines.
          ===================================================== */}

      <main style={styles.workspace}>
        {/* VERY LIGHT VERTICAL ALIGNMENT GUIDES */}

        <div style={styles.verticalGuideLeft} />

        <div style={styles.verticalGuideRight} />

        <div style={styles.workspaceInner}>
          {children}
        </div>
      </main>

      {/* =====================================================
          GOVERNMENT SERVICE INFORMATION
          ===================================================== */}

      <section style={styles.serviceInformation}>
        <div style={styles.serviceInformationInner}>
          <div style={styles.serviceColumn}>
            <div style={styles.serviceHeading}>
              MyWCSA e-Innovation
            </div>

            <div style={styles.serviceText}>
              Western Cape Sports Association
            </div>
          </div>

          <div style={styles.serviceColumn}>
            <div style={styles.serviceHeading}>
              Staff Support
            </div>

            <div style={styles.serviceText}>
              Service Desk: 083 273 1459
            </div>

            <div style={styles.serviceText}>
              service@westerncapegov.za
            </div>
          </div>

          <div style={styles.serviceColumn}>
            <div style={styles.serviceHeading}>
              MyWCSA GovApps
            </div>

            <div style={styles.serviceText}>
              Digital Workplace Services
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LEGAL FOOTER
          ===================================================== */}

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLeft}>
            <img
              src="/mywcsa-logo.png"
              alt=""
              style={styles.footerLogo}
            />

            <div>
              <div style={styles.footerGovernment}>
                Western Cape Government
              </div>

              <div style={styles.footerLegal}>
                This computer system is for authorised use only.
              </div>
            </div>
          </div>

          <div style={styles.footerCentre}>
            <span>
              MyWCSA AMS
            </span>

            <span style={styles.footerDivider}>
              |
            </span>

            <span>
              Staff Interface
            </span>

            <span style={styles.footerDivider}>
              |
            </span>

            <span>
              Western Cape Sports Association
            </span>
          </div>

          <div style={styles.footerRight}>
            <Link
              href="/apps/ams/help"
              style={styles.footerLink}
            >
              Help &amp; Support
            </Link>

            <span style={styles.footerDivider}>
              |
            </span>

            <Link
              href="/my-apps"
              style={styles.footerLink}
            >
              MyGovApps
            </Link>

            <span style={styles.footerDivider}>
              |
            </span>

            <span>
              © 2026
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "GOOD MORNING";
  }

  if (hour < 18) {
    return "GOOD AFTERNOON";
  }

  return "GOOD EVENING";
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/* ============================================================
   MASTER STYLES
   ============================================================ */

const styles: Record<string, CSSProperties> = {
  /* =========================================================
     APPLICATION
     ========================================================= */

  application: {
    minHeight: "100vh",

    margin: 0,

    backgroundColor: "#ffffff",

    color: TEXT_BLUE,

    fontFamily:
      '"Century Gothic", CenturyGothic, AppleGothic, Arial, sans-serif',

    fontSize: "12px",
  },

  /* =========================================================
     HERO HEADER
     ========================================================= */

  hero: {
    position: "relative",

    height: "185px",

    overflow: "hidden",

    backgroundColor: WCG_BLUE,

    borderBottom: `1px solid ${WCG_BLUE}`,
  },

  heroBackground: {
    position: "absolute",

    inset: 0,

    width: "100%",
    height: "100%",

    objectFit: "cover",

    objectPosition: "center 46%",

    zIndex: 1,
  },

  heroBlueOverlay: {
    position: "absolute",

    inset: 0,

    zIndex: 2,

    background:
      "linear-gradient(90deg, rgba(0,20,137,0.34) 0%, rgba(0,20,137,0.08) 42%, rgba(0,20,137,0.34) 100%)",
  },

  heroSystemLines: {
    position: "absolute",

    inset: 0,

    zIndex: 3,

    pointerEvents: "none",

    opacity: 0.15,

    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 4px)",
  },

  /* =========================================================
     LOGO
     ========================================================= */

  logoArea: {
    position: "absolute",

    top: "24px",
    left: "34px",

    zIndex: 5,

    display: "flex",

    alignItems: "center",

    minHeight: "74px",

    padding: "8px 13px",

    background: "rgba(255,255,255,0.96)",

    border: `1px solid ${WCG_BLUE}`,

    boxShadow:
      "0 2px 6px rgba(0,0,0,0.12)",
  },

  logo: {
    display: "block",

    width: "auto",
    height: "60px",

    objectFit: "contain",
  },

  /* =========================================================
     GREETING
     ========================================================= */

  heroGreeting: {
    position: "absolute",

    left: "34px",
    bottom: "18px",

    zIndex: 5,

    color: "#ffffff",

    textShadow:
      "0 1px 3px rgba(0,0,0,0.35)",
  },

  heroGreetingLabel: {
    marginBottom: "2px",

    fontSize: "9px",

    fontWeight: 700,

    letterSpacing: "1.1px",
  },

  heroWelcome: {
    fontSize: "25px",

    fontWeight: 700,

    lineHeight: 1.1,

    letterSpacing: "-0.4px",
  },

  heroSubtitle: {
    marginTop: "4px",

    fontSize: "10px",

    fontWeight: 400,
  },

  /* =========================================================
     STAFF PROFILE
     ========================================================= */

  staffProfile: {
    position: "absolute",

    top: "28px",
    right: "36px",

    zIndex: 5,

    minWidth: "310px",

    display: "flex",

    alignItems: "center",

    justifyContent: "flex-end",

    gap: "13px",

    color: "#ffffff",

    textShadow:
      "0 1px 3px rgba(0,0,0,0.35)",
  },

  staffAvatar: {
    width: "66px",
    height: "66px",

    display: "block",

    objectFit: "contain",

    flexShrink: 0,
  },

  staffProfileDetails: {
    minWidth: "190px",
  },

  staffHello: {
    fontSize: "14px",

    fontWeight: 700,

    letterSpacing: "0.4px",
  },

  staffOrganisation: {
    marginTop: "4px",

    fontSize: "9px",

    lineHeight: 1.35,
  },

  staffMenuArrow: {
    fontSize: "13px",

    fontWeight: 700,
  },

  /* =========================================================
     PRIMARY BLUE SYSTEM BAR
     ========================================================= */

  primarySystemBar: {
    minHeight: "36px",

    padding: "0 34px",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "20px",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    borderTop: "1px solid rgba(255,255,255,0.18)",

    borderBottom: "1px solid #000d58",

    fontSize: "8px",

    fontWeight: 600,

    letterSpacing: "0.2px",
  },

  primarySystemBarLeft: {
    display: "flex",

    alignItems: "center",

    gap: "9px",
  },

  primarySystemBarRight: {
    display: "flex",

    alignItems: "center",

    gap: "9px",
  },

  primarySystemBarTitle: {
    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  primarySystemBarText: {
    fontWeight: 600,
  },

  primarySystemBarDivider: {
    opacity: 0.5,
  },

  /* =========================================================
     TOP NAVIGATION
     ========================================================= */

  navigation: {
    position: "relative",

    zIndex: 20,

    minHeight: "58px",

    backgroundColor: "#ffffff",

    borderTop: "1px solid #ffffff",

    borderBottom: `3px solid ${WCG_BLUE}`,

    boxShadow:
      "0 2px 5px rgba(0,0,0,0.08)",
  },

  navigationScroll: {
    width: "100%",

    display: "flex",

    alignItems: "stretch",

    overflowX: "auto",

    scrollbarWidth: "thin",
  },

  navigationItem: {
    minHeight: "55px",

    padding: "0 17px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "7px",

    flexShrink: 0,

    backgroundColor: "#ffffff",

    color: TEXT_BLUE,

    borderRight: `1px solid ${BORDER_GREY}`,

    textDecoration: "none",

    whiteSpace: "nowrap",
  },

  navigationIcon: {
    width: "20px",

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    color: WCG_BLUE,

    fontSize: "17px",

    fontWeight: 700,
  },

  navigationLabel: {
    fontSize: "9px",

    fontWeight: 700,
  },

  navigationArrow: {
    marginLeft: "2px",

    fontSize: "9px",
  },

  moreNavigationItem: {
    minHeight: "55px",

    padding: "0 18px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "7px",

    flexShrink: 0,

    backgroundColor: "#ffffff",

    color: TEXT_BLUE,

    cursor: "default",
  },

  /* =========================================================
     INFORMATION STRIP
     ========================================================= */

  informationStrip: {
    minHeight: "33px",

    padding: "0 34px",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "20px",

    backgroundColor: "rgba(255,255,255,0.98)",

    borderBottom: `1px solid ${BORDER_GREY}`,

    color: "#566373",

    fontSize: "7px",

    letterSpacing: "0.25px",
  },

  informationStripLeft: {
    display: "flex",

    alignItems: "center",

    gap: "7px",
  },

  informationStripRight: {
    display: "flex",

    alignItems: "center",

    gap: "7px",
  },

  informationStrong: {
    color: TEXT_BLUE,

    fontWeight: 700,
  },

  informationDivider: {
    color: "#a6afb8",
  },

  informationLink: {
    color: WCG_BLUE,

    textDecoration: "none",

    fontWeight: 700,
  },

  systemAvailable: {
    color: "#245c39",

    fontWeight: 700,
  },

  /* =========================================================
     MAIN WORKSPACE

     THIS IS THE WHITE + GREY-LINE BACKGROUND YOU REQUESTED.
     ========================================================= */

  workspace: {
    position: "relative",

    minHeight: "620px",

    overflow: "hidden",

    backgroundColor: "#ffffff",

    /*
       WHITE BACKGROUND
       +
       VERY FINE GREY HORIZONTAL LINES

       These are intentionally close together to create
       the systematic/government document feeling from
       your reference image.
    */

    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(90,96,103,0.105) 0px, rgba(90,96,103,0.105) 1px, transparent 1px, transparent 3px)",

    backgroundAttachment: "local",
  },

  workspaceInner: {
    position: "relative",

    zIndex: 2,

    width: "100%",

    maxWidth: "1600px",

    margin: "0 auto",

    boxSizing: "border-box",

    padding: "22px 34px 38px",
  },

  /*
     VERY SUBTLE VERTICAL SYSTEM GUIDES.

     These are deliberately much lighter than the horizontal
     lines. They give the workspace alignment without turning
     the whole page into graph paper.
  */

  verticalGuideLeft: {
    position: "absolute",

    top: 0,
    bottom: 0,
    left: "34px",

    width: "1px",

    zIndex: 1,

    backgroundColor:
      "rgba(90,96,103,0.08)",

    pointerEvents: "none",
  },

  verticalGuideRight: {
    position: "absolute",

    top: 0,
    bottom: 0,
    right: "34px",

    width: "1px",

    zIndex: 1,

    backgroundColor:
      "rgba(90,96,103,0.08)",

    pointerEvents: "none",
  },

  /* =========================================================
     SERVICE INFORMATION
     ========================================================= */

  serviceInformation: {
    backgroundColor: "#ffffff",

    borderTop: `2px solid ${WCG_BLUE}`,

    borderBottom: "1px solid #9fa8b2",
  },

  serviceInformationInner: {
    maxWidth: "1600px",

    minHeight: "78px",

    margin: "0 auto",

    padding: "0 34px",

    display: "grid",

    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",

    alignItems: "center",

    boxSizing: "border-box",
  },

  serviceColumn: {
    minHeight: "45px",

    padding: "0 22px",

    display: "flex",

    flexDirection: "column",

    justifyContent: "center",

    borderRight: `1px solid ${LIGHT_GREY}`,
  },

  serviceHeading: {
    marginBottom: "4px",

    color: WCG_BLUE,

    fontSize: "9px",

    fontWeight: 700,

    textTransform: "uppercase",

    letterSpacing: "0.5px",
  },

  serviceText: {
    color: "#5f6974",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  /* =========================================================
     FOOTER
     ========================================================= */

  footer: {
    backgroundColor: WCG_DARK_BLUE,

    borderTop: "1px solid #ffffff",
  },

  footerInner: {
    maxWidth: "1600px",

    minHeight: "64px",

    margin: "0 auto",

    padding: "0 34px",

    boxSizing: "border-box",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "25px",

    color: "#ffffff",

    fontSize: "7px",
  },

  footerLeft: {
    display: "flex",

    alignItems: "center",

    gap: "11px",

    minWidth: "280px",
  },

  footerLogo: {
    width: "auto",

    height: "34px",

    objectFit: "contain",

    backgroundColor: "#ffffff",

    padding: "3px",
  },

  footerGovernment: {
    marginBottom: "2px",

    fontSize: "8px",

    fontWeight: 700,
  },

  footerLegal: {
    color: "rgba(255,255,255,0.76)",

    fontSize: "6px",
  },

  footerCentre: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "8px",

    flexWrap: "wrap",

    textAlign: "center",
  },

  footerRight: {
    display: "flex",

    alignItems: "center",

    justifyContent: "flex-end",

    gap: "8px",

    minWidth: "260px",

    whiteSpace: "nowrap",
  },

  footerDivider: {
    opacity: 0.45,
  },

  footerLink: {
    color: "#ffffff",

    textDecoration: "none",
  },
};