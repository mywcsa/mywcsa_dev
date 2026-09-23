import Link from "next/link";
import type { CSSProperties } from "react";

/* ============================================================
   MyWCSA AMS — STAFF DASHBOARD
   ============================================================

   PURPOSE
   ------------------------------------------------------------
   Formal operational landing page for authorised WCSA staff.

   DESIGN
   ------------------------------------------------------------
   - Century Gothic inherited from AMS layout
   - WCG blue #001489
   - Restrained government-system typography
   - Numbered administrative sections
   - No marketing-style hero cards
   - No oversized headings
   - No unnecessary explanatory blocks
   - Tables used for operational information
   - Clean utility panels used for navigation/actions
   - Workspace grey lines inherited from layout.tsx
   ============================================================ */

const WCG_BLUE = "#001489";
const DARK_BLUE = "#00145f";
const TEXT_BLUE = "#00175a";
const BORDER = "#aeb6c0";
const LIGHT_BORDER = "#d5dae0";
const MUTED = "#5e6874";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

export default function AMSDashboardPage() {
  const currentDate = formatDate();

  return (
    <div style={styles.page}>
      {/* =====================================================
          BREADCRUMB / DATE
          ===================================================== */}

      <div style={styles.topUtilityRow}>
        <div style={styles.breadcrumb}>
          <Link href="/my-apps" style={styles.breadcrumbLink}>
            MyGovApps
          </Link>

          <span style={styles.breadcrumbSeparator}>/</span>

          <span>MyWCSA AMS</span>

          <span style={styles.breadcrumbSeparator}>/</span>

          <strong>Dashboard</strong>
        </div>

        <div style={styles.currentDate}>
          {currentDate}
        </div>
      </div>

      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <section style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / STAFF / DASHBOARD
          </div>

          <h1 style={styles.pageTitle}>
            STAFF DASHBOARD
          </h1>

          <p style={styles.pageSubtitle}>
            Western Cape Sports Association
          </p>
        </div>

        <div style={styles.statusArea}>
          <span style={styles.statusIndicator} />

          <div>
            <div style={styles.statusLabel}>
              SYSTEM STATUS
            </div>

            <div style={styles.statusValue}>
              AVAILABLE
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          01 OPERATIONAL OVERVIEW
          ===================================================== */}

      <SectionTitle
        number="01"
        title="OPERATIONAL OVERVIEW"
        reference="AMS-DASH-01"
      />

      <section style={styles.operationalOverview}>
        <OperationalMetric
          number="01.1"
          label="REGISTERED PARTICIPANTS"
          value="—"
          note="Participant Registry"
          href="/apps/ams/participants"
        />

        <OperationalMetric
          number="01.2"
          label="REGISTERED SCHOOLS"
          value="—"
          note="School Registry"
          href="/apps/ams/schools"
        />

        <OperationalMetric
          number="01.3"
          label="CLUBS & TEAMS"
          value="—"
          note="Organisation Registry"
          href="/apps/ams/clubs"
        />

        <OperationalMetric
          number="01.4"
          label="ASSOCIATIONS"
          value="—"
          note="Association Registry"
          href="/apps/ams/associations"
        />

        <OperationalMetric
          number="01.5"
          label="UPCOMING EVENTS"
          value="—"
          note="Competitions & Events"
          href="/apps/ams/competitions"
        />
      </section>

      {/* =====================================================
          TWO-COLUMN OPERATIONAL AREA
          ===================================================== */}

      <div style={styles.primaryGrid}>
        {/* ===================================================
            02 MY WORK
            =================================================== */}

        <section>
          <SectionTitle
            number="02"
            title="MY WORK"
            reference="AMS-DASH-02"
          />

          <div style={styles.tableContainer}>
            <div style={styles.tableTitleBar}>
              <span>WORK ITEMS REQUIRING ATTENTION</span>

              <Link
                href="/apps/ams/tasks"
                style={styles.tableTitleAction}
              >
                VIEW ALL
              </Link>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.numberHeader}>
                    #
                  </th>

                  <th style={styles.tableHeader}>
                    WORK ITEM
                  </th>

                  <th style={styles.statusHeader}>
                    STATUS
                  </th>

                  <th style={styles.countHeader}>
                    COUNT
                  </th>

                  <th style={styles.actionHeader}>
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>
                <WorkTableRow
                  number="1"
                  label="Pending Tasks"
                  status="Awaiting action"
                  count="—"
                  href="/apps/ams/tasks"
                />

                <WorkTableRow
                  number="2"
                  label="Applications Requiring Attention"
                  status="Awaiting review"
                  count="—"
                  href="/apps/ams/applications"
                />

                <WorkTableRow
                  number="3"
                  label="Pending Transfers"
                  status="Awaiting action"
                  count="—"
                  href="/apps/ams/affiliations"
                />

                <WorkTableRow
                  number="4"
                  label="Documents Awaiting Action"
                  status="Awaiting action"
                  count="—"
                  href="/apps/ams/documents"
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* ===================================================
            03 QUICK ACTIONS
            =================================================== */}

        <section>
          <SectionTitle
            number="03"
            title="QUICK ACTIONS"
            reference="AMS-DASH-03"
          />

          <div style={styles.actionPanel}>
            <QuickAction
              number="03.1"
              title="SEARCH PARTICIPANT"
              description="Search the participant registry."
              href="/apps/ams/participants"
            />

            <QuickAction
              number="03.2"
              title="REGISTER PARTICIPANT"
              description="Create a new participant record."
              href="/apps/ams/participants/register"
            />

            <QuickAction
              number="03.3"
              title="SEARCH SCHOOL"
              description="Search the school registry."
              href="/apps/ams/schools"
            />

            <QuickAction
              number="03.4"
              title="DOCUMENTS"
              description="Access AMS documents and records."
              href="/apps/ams/documents"
            />
          </div>
        </section>
      </div>

      {/* =====================================================
          04 AMS MODULES
          ===================================================== */}

      <SectionTitle
        number="04"
        title="AMS MODULES"
        reference="AMS-DASH-04"
      />

      <section style={styles.moduleRegister}>
        <div style={styles.moduleRegisterHeader}>
          <div style={styles.moduleNumberHeader}>
            REF.
          </div>

          <div style={styles.moduleNameHeader}>
            MODULE
          </div>

          <div style={styles.moduleFunctionHeader}>
            FUNCTION
          </div>

          <div style={styles.moduleActionHeader}>
            ACCESS
          </div>
        </div>

        <ModuleRow
          number="04.1"
          title="PARTICIPANTS"
          description="Participant registration, records, profiles and history."
          href="/apps/ams/participants"
        />

        <ModuleRow
          number="04.2"
          title="SCHOOLS"
          description="School registry, membership and institutional records."
          href="/apps/ams/schools"
        />

        <ModuleRow
          number="04.3"
          title="CLUBS & TEAMS"
          description="Club, team and local sporting structure records."
          href="/apps/ams/clubs"
        />

        <ModuleRow
          number="04.4"
          title="ASSOCIATIONS"
          description="Association records and organisational affiliations."
          href="/apps/ams/associations"
        />

        <ModuleRow
          number="04.5"
          title="SPORTING CODES"
          description="Sporting codes, structures and participation records."
          href="/apps/ams/sporting-codes"
        />

        <ModuleRow
          number="04.6"
          title="COMPETITIONS & EVENTS"
          description="Competitions, fixtures, programmes and events."
          href="/apps/ams/competitions"
        />

        <ModuleRow
          number="04.7"
          title="AFFILIATIONS"
          description="Affiliations, releases, transfers and history."
          href="/apps/ams/affiliations"
        />

        <ModuleRow
          number="04.8"
          title="GOVERNANCE"
          description="Committees, appointments, meetings and resolutions."
          href="/apps/ams/governance"
        />

        <ModuleRow
          number="04.9"
          title="DOCUMENTS"
          description="Generate, manage and retrieve AMS documents."
          href="/apps/ams/documents"
        />

        <ModuleRow
          number="04.10"
          title="REPORTS"
          description="Operational reports, exports and management information."
          href="/apps/ams/reports"
        />
      </section>

      {/* =====================================================
          05 NOTICES / ACTIVITIES
          ===================================================== */}

      <div style={styles.secondaryGrid}>
        <section>
          <SectionTitle
            number="05"
            title="AMS NOTICES"
            reference="AMS-DASH-05"
          />

          <div style={styles.informationPanel}>
            <div style={styles.informationIcon}>
              i
            </div>

            <div>
              <div style={styles.informationTitle}>
                NO CURRENT NOTICES
              </div>

              <div style={styles.informationText}>
                System and operational notices will be displayed
                in this section when published.
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle
            number="06"
            title="UPCOMING ACTIVITIES"
            reference="AMS-DASH-06"
          />

          <div style={styles.informationPanel}>
            <div style={styles.informationIcon}>
              i
            </div>

            <div style={styles.informationContent}>
              <div style={styles.informationTitle}>
                NO ACTIVITIES LOADED
              </div>

              <div style={styles.informationText}>
                Upcoming competitions, events and activities will
                be displayed in this section.
              </div>
            </div>

            <Link
              href="/apps/ams/competitions"
              style={styles.informationAction}
            >
              VIEW CALENDAR
            </Link>
          </div>
        </section>
      </div>

      {/* =====================================================
          07 SYSTEM INFORMATION
          ===================================================== */}

      <SectionTitle
        number="07"
        title="SYSTEM INFORMATION"
        reference="AMS-DASH-07"
      />

      <section style={styles.systemTableContainer}>
        <table style={styles.systemTable}>
          <tbody>
            <SystemRow
              label="System"
              value="MyWCSA Administration Management System"
            />

            <SystemRow
              label="Interface"
              value="Staff"
            />

            <SystemRow
              label="Organisation"
              value="Western Cape Sports Association"
            />

            <SystemRow
              label="Access"
              value="Authorised personnel only"
            />

            <SystemRow
              label="System Status"
              value="Available"
            />
          </tbody>
        </table>
      </section>
    </div>
  );
}

/* ============================================================
   SECTION TITLE
   ============================================================ */

function SectionTitle({
  number,
  title,
  reference,
}: {
  number: string;
  title: string;
  reference: string;
}) {
  return (
    <div style={styles.sectionTitle}>
      <div style={styles.sectionTitleLeft}>
        <span style={styles.sectionNumber}>
          {number}
        </span>

        <span style={styles.sectionHeading}>
          {title}
        </span>
      </div>

      <div style={styles.sectionReference}>
        {reference}
      </div>
    </div>
  );
}

/* ============================================================
   OPERATIONAL METRIC
   ============================================================ */

function OperationalMetric({
  number,
  label,
  value,
  note,
  href,
}: {
  number: string;
  label: string;
  value: string;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={styles.operationalMetric}
    >
      <div style={styles.metricReference}>
        {number}
      </div>

      <div style={styles.metricLabel}>
        {label}
      </div>

      <div style={styles.metricValue}>
        {value}
      </div>

      <div style={styles.metricNote}>
        {note}
      </div>
    </Link>
  );
}

/* ============================================================
   WORK TABLE ROW
   ============================================================ */

function WorkTableRow({
  number,
  label,
  status,
  count,
  href,
}: {
  number: string;
  label: string;
  status: string;
  count: string;
  href: string;
}) {
  return (
    <tr>
      <td style={styles.numberCell}>
        {number}
      </td>

      <td style={styles.tableCell}>
        {label}
      </td>

      <td style={styles.tableCellMuted}>
        {status}
      </td>

      <td style={styles.countCell}>
        {count}
      </td>

      <td style={styles.actionCell}>
        <Link
          href={href}
          style={styles.tableAction}
        >
          OPEN
        </Link>
      </td>
    </tr>
  );
}

/* ============================================================
   QUICK ACTION
   ============================================================ */

function QuickAction({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={styles.quickAction}
    >
      <div style={styles.quickActionNumber}>
        {number}
      </div>

      <div style={styles.quickActionContent}>
        <div style={styles.quickActionTitle}>
          {title}
        </div>

        <div style={styles.quickActionDescription}>
          {description}
        </div>
      </div>

      <div style={styles.quickActionArrow}>
        ›
      </div>
    </Link>
  );
}

/* ============================================================
   MODULE REGISTER ROW
   ============================================================ */

function ModuleRow({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div style={styles.moduleRow}>
      <div style={styles.moduleNumber}>
        {number}
      </div>

      <div style={styles.moduleName}>
        {title}
      </div>

      <div style={styles.moduleFunction}>
        {description}
      </div>

      <div style={styles.moduleAction}>
        <Link
          href={href}
          style={styles.moduleButton}
        >
          OPEN
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   SYSTEM INFORMATION ROW
   ============================================================ */

function SystemRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <tr>
      <th style={styles.systemLabelCell}>
        {label}
      </th>

      <td style={styles.systemValueCell}>
        {value}
      </td>
    </tr>
  );
}

/* ============================================================
   DATE
   ============================================================ */

function formatDate() {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    color: TEXT_BLUE,
  },

  /* =========================================================
     TOP UTILITY ROW
     ========================================================= */

  topUtilityRow: {
    minHeight: "24px",

    marginBottom: "14px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "20px",

    color: MUTED,

    fontSize: "9px",
  },

  breadcrumb: {
    display: "flex",
    alignItems: "center",

    gap: "7px",

    whiteSpace: "nowrap",
  },

  breadcrumbLink: {
    color: TEXT_BLUE,

    textDecoration: "none",
  },

  breadcrumbSeparator: {
    color: "#9aa3ad",
  },

  currentDate: {
    color: TEXT_BLUE,

    fontSize: "9px",

    whiteSpace: "nowrap",
  },

  /* =========================================================
     PAGE HEADING
     ========================================================= */

  pageHeading: {
    minHeight: "65px",

    marginBottom: "18px",

    paddingBottom: "12px",

    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",

    gap: "25px",

    borderBottom: `1px solid ${BORDER}`,
  },

  pageReference: {
    marginBottom: "4px",

    color: "#687482",

    fontSize: "8px",

    fontWeight: 600,

    letterSpacing: "0.65px",
  },

  pageTitle: {
    margin: 0,

    color: WCG_BLUE,

    fontSize: "21px",

    fontWeight: 700,

    lineHeight: 1.1,

    letterSpacing: "0.1px",
  },

  pageSubtitle: {
    margin: "4px 0 0",

    color: MUTED,

    fontSize: "10px",

    lineHeight: 1.35,
  },

  statusArea: {
    minWidth: "145px",

    padding: "7px 10px",

    display: "flex",
    alignItems: "center",

    gap: "8px",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,
  },

  statusIndicator: {
    width: "7px",
    height: "7px",

    flexShrink: 0,

    borderRadius: "50%",

    backgroundColor: "#2f7b4c",
  },

  statusLabel: {
    color: "#6d7782",

    fontSize: "7px",

    fontWeight: 600,
  },

  statusValue: {
    marginTop: "1px",

    color: "#255c3a",

    fontSize: "8px",

    fontWeight: 700,
  },

  /* =========================================================
     SECTION TITLE
     ========================================================= */

  sectionTitle: {
    minHeight: "30px",

    marginTop: "20px",
    marginBottom: "8px",

    padding: "0 8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor: "rgba(255,255,255,0.92)",

    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  sectionTitleLeft: {
    display: "flex",
    alignItems: "center",

    gap: "10px",
  },

  sectionNumber: {
    minWidth: "26px",

    color: WCG_BLUE,

    fontSize: "8px",

    fontWeight: 700,
  },

  sectionHeading: {
    color: TEXT_BLUE,

    fontSize: "10px",

    fontWeight: 700,

    letterSpacing: "0.55px",
  },

  sectionReference: {
    color: "#818b96",

    fontSize: "7px",

    letterSpacing: "0.3px",
  },

  /* =========================================================
     OPERATIONAL OVERVIEW
     ========================================================= */

  operationalOverview: {
    display: "grid",

    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,
  },

  operationalMetric: {
    minHeight: "103px",

    padding: "12px 14px",

    boxSizing: "border-box",

    display: "flex",
    flexDirection: "column",

    color: TEXT_BLUE,

    backgroundColor: "#ffffff",

    borderRight: `1px solid ${LIGHT_BORDER}`,

    textDecoration: "none",
  },

  metricReference: {
    color: "#78838f",

    fontSize: "7px",

    fontWeight: 700,
  },

  metricLabel: {
    marginTop: "6px",

    color: TEXT_BLUE,

    fontSize: "8px",

    fontWeight: 700,

    letterSpacing: "0.25px",
  },

  metricValue: {
    marginTop: "8px",

    color: WCG_BLUE,

    fontSize: "20px",

    fontWeight: 700,

    lineHeight: 1,
  },

  metricNote: {
    marginTop: "auto",

    paddingTop: "8px",

    color: "#737e89",

    fontSize: "7px",
  },

  /* =========================================================
     PRIMARY GRID
     ========================================================= */

  primaryGrid: {
    display: "grid",

    gridTemplateColumns:
      "minmax(0, 1.45fr) minmax(300px, 0.75fr)",

    gap: "18px",
  },

  /* =========================================================
     FORMAL TABLE
     ========================================================= */

  tableContainer: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  tableTitleBar: {
    minHeight: "31px",

    padding: "0 10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    boxSizing: "border-box",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    fontSize: "8px",

    fontWeight: 700,

    letterSpacing: "0.35px",
  },

  tableTitleAction: {
    color: "#ffffff",

    textDecoration: "underline",

    textUnderlineOffset: "2px",

    fontSize: "7px",
  },

  table: {
    width: "100%",

    borderCollapse: "collapse",

    tableLayout: "fixed",

    fontSize: "8px",
  },

  numberHeader: {
    width: "38px",

    padding: "7px",

    backgroundColor: TABLE_HEADER,

    color: TEXT_BLUE,

    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,

    fontSize: "7px",

    fontWeight: 700,

    textAlign: "center",
  },

  tableHeader: {
    padding: "7px 9px",

    backgroundColor: TABLE_HEADER,

    color: TEXT_BLUE,

    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,

    fontSize: "7px",

    fontWeight: 700,

    textAlign: "left",
  },

  statusHeader: {
    width: "115px",

    padding: "7px 9px",

    backgroundColor: TABLE_HEADER,

    color: TEXT_BLUE,

    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,

    fontSize: "7px",

    fontWeight: 700,

    textAlign: "left",
  },

  countHeader: {
    width: "55px",

    padding: "7px",

    backgroundColor: TABLE_HEADER,

    color: TEXT_BLUE,

    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,

    fontSize: "7px",

    fontWeight: 700,

    textAlign: "center",
  },

  actionHeader: {
    width: "65px",

    padding: "7px",

    backgroundColor: TABLE_HEADER,

    color: TEXT_BLUE,

    borderBottom: `1px solid ${BORDER}`,

    fontSize: "7px",

    fontWeight: 700,

    textAlign: "center",
  },

  numberCell: {
    height: "34px",

    padding: "5px",

    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,

    color: "#687482",

    textAlign: "center",
  },

  tableCell: {
    height: "34px",

    padding: "5px 9px",

    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,

    color: TEXT_BLUE,

    fontWeight: 600,
  },

  tableCellMuted: {
    height: "34px",

    padding: "5px 9px",

    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,

    color: "#6b7580",
  },

  countCell: {
    height: "34px",

    padding: "5px",

    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,

    color: TEXT_BLUE,

    fontWeight: 700,

    textAlign: "center",
  },

  actionCell: {
    height: "34px",

    padding: "5px",

    borderBottom: `1px solid ${LIGHT_BORDER}`,

    textAlign: "center",
  },

  tableAction: {
    color: WCG_BLUE,

    textDecoration: "underline",

    textUnderlineOffset: "2px",

    fontSize: "7px",

    fontWeight: 700,
  },

  /* =========================================================
     QUICK ACTIONS
     NOT TABULATED AS A FORM.
     ========================================================= */

  actionPanel: {
    backgroundColor: "rgba(255,255,255,0.94)",

    border: `1px solid ${BORDER}`,
  },

  quickAction: {
    minHeight: "54px",

    padding: "8px 10px",

    display: "grid",

    gridTemplateColumns: "42px 1fr 18px",

    alignItems: "center",

    gap: "8px",

    boxSizing: "border-box",

    color: TEXT_BLUE,

    backgroundColor: "#ffffff",

    borderBottom: `1px solid ${LIGHT_BORDER}`,

    textDecoration: "none",
  },

  quickActionNumber: {
    color: "#7c8792",

    fontSize: "7px",

    fontWeight: 700,
  },

  quickActionContent: {
    minWidth: 0,
  },

  quickActionTitle: {
    color: WCG_BLUE,

    fontSize: "8px",

    fontWeight: 700,

    letterSpacing: "0.25px",
  },

  quickActionDescription: {
    marginTop: "2px",

    color: "#707b86",

    fontSize: "7px",

    lineHeight: 1.35,
  },

  quickActionArrow: {
    color: WCG_BLUE,

    fontSize: "15px",

    fontWeight: 700,

    textAlign: "right",
  },

  /* =========================================================
     MODULE REGISTER
     ========================================================= */

  moduleRegister: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  moduleRegisterHeader: {
    minHeight: "29px",

    display: "grid",

    gridTemplateColumns:
      "80px 190px 1fr 85px",

    alignItems: "stretch",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    fontSize: "7px",

    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  moduleNumberHeader: {
    padding: "8px 10px",

    borderRight:
      "1px solid rgba(255,255,255,0.35)",
  },

  moduleNameHeader: {
    padding: "8px 10px",

    borderRight:
      "1px solid rgba(255,255,255,0.35)",
  },

  moduleFunctionHeader: {
    padding: "8px 10px",

    borderRight:
      "1px solid rgba(255,255,255,0.35)",
  },

  moduleActionHeader: {
    padding: "8px 10px",

    textAlign: "center",
  },

  moduleRow: {
    minHeight: "42px",

    display: "grid",

    gridTemplateColumns:
      "80px 190px 1fr 85px",

    alignItems: "stretch",

    backgroundColor: "#ffffff",

    borderBottom: `1px solid ${LIGHT_BORDER}`,
  },

  moduleNumber: {
    padding: "9px 10px",

    display: "flex",
    alignItems: "center",

    color: "#737e89",

    borderRight: `1px solid ${LIGHT_BORDER}`,

    fontSize: "7px",

    fontWeight: 700,
  },

  moduleName: {
    padding: "9px 10px",

    display: "flex",
    alignItems: "center",

    color: TEXT_BLUE,

    borderRight: `1px solid ${LIGHT_BORDER}`,

    fontSize: "8px",

    fontWeight: 700,
  },

  moduleFunction: {
    padding: "9px 10px",

    display: "flex",
    alignItems: "center",

    color: "#66717c",

    borderRight: `1px solid ${LIGHT_BORDER}`,

    fontSize: "8px",
  },

  moduleAction: {
    padding: "7px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  moduleButton: {
    minWidth: "48px",

    padding: "5px 7px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    border: `1px solid ${WCG_BLUE}`,

    textDecoration: "none",

    fontSize: "7px",

    fontWeight: 700,
  },

  /* =========================================================
     SECONDARY GRID
     ========================================================= */

  secondaryGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "18px",
  },

  informationPanel: {
    minHeight: "78px",

    padding: "13px",

    display: "flex",

    alignItems: "center",

    gap: "11px",

    boxSizing: "border-box",

    backgroundColor: "rgba(255,255,255,0.95)",

    border: `1px solid ${BORDER}`,
  },

  informationIcon: {
    width: "26px",
    height: "26px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border: `1px solid ${WCG_BLUE}`,

    borderRadius: "50%",

    color: WCG_BLUE,

    fontSize: "10px",

    fontWeight: 700,
  },

  informationContent: {
    flex: 1,
  },

  informationTitle: {
    color: TEXT_BLUE,

    fontSize: "8px",

    fontWeight: 700,

    letterSpacing: "0.2px",
  },

  informationText: {
    marginTop: "3px",

    maxWidth: "480px",

    color: "#707a84",

    fontSize: "7px",

    lineHeight: 1.45,
  },

  informationAction: {
    marginLeft: "auto",

    color: WCG_BLUE,

    textDecoration: "underline",

    textUnderlineOffset: "2px",

    fontSize: "7px",

    fontWeight: 700,

    whiteSpace: "nowrap",
  },

  /* =========================================================
     SYSTEM INFORMATION TABLE
     ========================================================= */

  systemTableContainer: {
    marginBottom: "5px",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  systemTable: {
    width: "100%",

    borderCollapse: "collapse",

    fontSize: "8px",
  },

  systemLabelCell: {
    width: "190px",

    padding: "8px 10px",

    backgroundColor: PALE_BLUE,

    color: TEXT_BLUE,

    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,

    textAlign: "left",

    fontSize: "8px",

    fontWeight: 700,
  },

  systemValueCell: {
    padding: "8px 10px",

    backgroundColor: "#ffffff",

    color: "#5d6873",

    borderBottom: `1px solid ${LIGHT_BORDER}`,

    fontSize: "8px",
  },
};