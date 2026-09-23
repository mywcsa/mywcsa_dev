import Link from "next/link";

export default function AMSDashboardPage() {
  return (
    <main>
      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <section style={styles.pageHeading}>
        <div>
          <div style={styles.breadcrumb}>
            MyWCSA AMS / Dashboard
          </div>

          <h1 style={styles.pageTitle}>
            Staff Dashboard
          </h1>

          <p style={styles.pageSubtitle}>
            Access WCSA registries, operational services,
            documents and administrative functions.
          </p>
        </div>

        <div style={styles.systemStatus}>
          <span style={styles.statusDot} />

          SYSTEM AVAILABLE
        </div>
      </section>

      {/* =====================================================
          WELCOME
          ===================================================== */}

      <section style={styles.welcomePanel}>
        <div style={styles.welcomeNumber}>
          01
        </div>

        <div style={styles.welcomeContent}>
          <div style={styles.welcomeEyebrow}>
            MyWCSA ADMINISTRATION MANAGEMENT SYSTEM
          </div>

          <h2 style={styles.welcomeTitle}>
            Staff Interface
          </h2>

          <p style={styles.welcomeText}>
            Use this interface to access the common operational
            functions available to authorised Western Cape
            Sports Association personnel.
          </p>
        </div>
      </section>

      {/* =====================================================
          OVERVIEW
          ===================================================== */}

      <SectionHeader
        number="02"
        title="OPERATIONAL OVERVIEW"
        description="Current information from the MyWCSA AMS."
      />

      <section style={styles.summaryGrid}>
        <SummaryCard
          title="Participants"
          value="—"
          description="Registered participant records"
          href="/apps/ams/participants"
        />

        <SummaryCard
          title="Schools"
          value="—"
          description="Schools in the registry"
          href="/apps/ams/schools"
        />

        <SummaryCard
          title="Organisations"
          value="—"
          description="Clubs, teams and associations"
          href="/apps/ams/associations"
        />

        <SummaryCard
          title="Upcoming Activities"
          value="—"
          description="Competitions and events"
          href="/apps/ams/competitions-events"
        />
      </section>

      {/* =====================================================
          MY WORK + QUICK ACTIONS
          ===================================================== */}

      <section style={styles.twoColumnGrid}>
        {/* MY WORK */}

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelNumber}>
                03
              </div>

              <div style={styles.panelTitle}>
                MY WORK
              </div>
            </div>

            <Link
              href="/apps/ams/tasks"
              style={styles.panelLink}
            >
              VIEW ALL
            </Link>
          </div>

          <div style={styles.workRows}>
            <WorkRow
              label="Pending Tasks"
              value="—"
            />

            <WorkRow
              label="Applications Requiring Attention"
              value="—"
            />

            <WorkRow
              label="Pending Transfers"
              value="—"
            />

            <WorkRow
              label="Documents Awaiting Action"
              value="—"
            />
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelNumber}>
                04
              </div>

              <div style={styles.panelTitle}>
                QUICK ACTIONS
              </div>
            </div>
          </div>

          <div style={styles.quickActionGrid}>
            <QuickAction
              href="/apps/ams/participants"
              title="Search Participant"
              description="Search the provincial participant registry."
            />

            <QuickAction
              href="/apps/ams/participants/register"
              title="Register Participant"
              description="Begin a new participant registration."
            />

            <QuickAction
              href="/apps/ams/schools"
              title="Find School"
              description="Search registered schools."
            />

            <QuickAction
              href="/apps/ams/documents"
              title="Documents"
              description="Access AMS documents and records."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          REGISTRY & OPERATIONS
          ===================================================== */}

      <SectionHeader
        number="05"
        title="REGISTRY & OPERATIONS"
        description="Select an AMS module to continue."
      />

      <section style={styles.moduleGrid}>
        <ModuleCard
          number="01"
          title="Participants"
          description="Participant records, registration, profiles and history."
          href="/apps/ams/participants"
        />

        <ModuleCard
          number="02"
          title="Schools"
          description="School registry, membership and institutional records."
          href="/apps/ams/schools"
        />

        <ModuleCard
          number="03"
          title="Clubs & Teams"
          description="Manage affiliated clubs, teams and local sporting structures."
          href="/apps/ams/clubs-teams"
        />

        <ModuleCard
          number="04"
          title="Associations"
          description="Manage associations and organisational affiliations."
          href="/apps/ams/associations"
        />

        <ModuleCard
          number="05"
          title="Sporting Codes"
          description="Manage sporting codes, structures and participation."
          href="/apps/ams/sporting-codes"
        />

        <ModuleCard
          number="06"
          title="Competitions & Events"
          description="Competitions, fixtures, activities and events."
          href="/apps/ams/competitions-events"
        />

        <ModuleCard
          number="07"
          title="Affiliations"
          description="Participant and organisation affiliations, releases and transfers."
          href="/apps/ams/affiliations"
        />

        <ModuleCard
          number="08"
          title="Governance"
          description="Committees, appointments, meetings and resolutions."
          href="/apps/ams/governance"
        />

        <ModuleCard
          number="09"
          title="Documents"
          description="Generate, manage and retrieve official AMS documents."
          href="/apps/ams/documents"
        />

        <ModuleCard
          number="10"
          title="Reports"
          description="Operational reports, exports and management information."
          href="/apps/ams/reports"
        />
      </section>

      {/* =====================================================
          NOTICES + UPCOMING
          ===================================================== */}

      <section style={styles.twoColumnGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelNumber}>
                06
              </div>

              <div style={styles.panelTitle}>
                AMS NOTICES
              </div>
            </div>
          </div>

          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              !
            </div>

            <div>
              <div style={styles.emptyTitle}>
                No notices to display
              </div>

              <div style={styles.emptyText}>
                System and operational notices will appear here.
              </div>
            </div>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelNumber}>
                07
              </div>

              <div style={styles.panelTitle}>
                UPCOMING ACTIVITIES
              </div>
            </div>

            <Link
              href="/apps/ams/competitions-events"
              style={styles.panelLink}
            >
              VIEW CALENDAR
            </Link>
          </div>

          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              ○
            </div>

            <div>
              <div style={styles.emptyTitle}>
                No activities loaded
              </div>

              <div style={styles.emptyText}>
                Upcoming competitions and events will appear here.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SYSTEM INFORMATION
          ===================================================== */}

      <section style={styles.systemInformation}>
        <div style={styles.systemInformationNumber}>
          08
        </div>

        <div>
          <div style={styles.systemInformationTitle}>
            STAFF INTERFACE
          </div>

          <p style={styles.systemInformationText}>
            The Staff Interface provides common AMS functions.
            Additional interfaces and restricted functions are
            displayed according to the permissions assigned to
            the signed-in staff member.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <span style={styles.sectionNumber}>
          {number}
        </span>

        <span style={styles.sectionTitle}>
          {title}
        </span>
      </div>

      <div style={styles.sectionDescription}>
        {description}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={styles.summaryCard}
    >
      <div style={styles.summaryTop}>
        <div style={styles.summaryTitle}>
          {title}
        </div>

        <div style={styles.summaryArrow}>
          →
        </div>
      </div>

      <div style={styles.summaryValue}>
        {value}
      </div>

      <div style={styles.summaryDescription}>
        {description}
      </div>
    </Link>
  );
}

function WorkRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.workRow}>
      <div style={styles.workLabel}>
        {label}
      </div>

      <div style={styles.workValue}>
        {value}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={styles.quickAction}
    >
      <div style={styles.quickActionTitle}>
        {title}
      </div>

      <div style={styles.quickActionDescription}>
        {description}
      </div>

      <div style={styles.quickActionArrow}>
        →
      </div>
    </Link>
  );
}

function ModuleCard({
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
      style={styles.moduleCard}
    >
      <div style={styles.moduleNumber}>
        {number}
      </div>

      <div style={styles.moduleContent}>
        <div style={styles.moduleTitle}>
          {title}
        </div>

        <div style={styles.moduleDescription}>
          {description}
        </div>
      </div>

      <div style={styles.moduleArrow}>
        →
      </div>
    </Link>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  pageHeading: {
    marginBottom: "22px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "25px",
  },

  breadcrumb: {
    marginBottom: "6px",
    color: "#697582",
    fontSize: "9px",
    fontWeight: 500,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
  },

  pageTitle: {
    margin: 0,
    color: "#071b3b",
    fontSize: "28px",
    fontWeight: 600,
  },

  pageSubtitle: {
    margin: "5px 0 0",
    color: "#747d87",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  systemStatus: {
    padding: "9px 12px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#ffffff",
    border: "1px solid #d8dde3",
    color: "#53606c",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  statusDot: {
    width: "7px",
    height: "7px",
    display: "inline-block",
    borderRadius: "50%",
    background: "#378052",
  },

  welcomePanel: {
    minHeight: "145px",
    marginBottom: "28px",
    padding: "25px",
    display: "grid",
    gridTemplateColumns: "45px 1fr",
    gap: "15px",
    background: "#0b2b58",
    color: "#ffffff",
  },

  welcomeNumber: {
    paddingTop: "3px",
    color: "#9db1c9",
    fontSize: "9px",
    fontWeight: 700,
  },

  welcomeContent: {
    maxWidth: "800px",
  },

  welcomeEyebrow: {
    color: "#aebed1",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  welcomeTitle: {
    margin: "7px 0 4px",
    fontSize: "24px",
    fontWeight: 500,
  },

  welcomeText: {
    maxWidth: "680px",
    margin: 0,
    color: "#d6e0ec",
    fontSize: "10px",
    lineHeight: 1.7,
  },

  sectionHeader: {
    margin: "27px 0 12px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
  },

  sectionNumber: {
    marginRight: "10px",
    color: "#84909e",
    fontSize: "8px",
    fontWeight: 700,
  },

  sectionTitle: {
    color: "#071b3b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.7px",
  },

  sectionDescription: {
    color: "#858e98",
    fontSize: "8px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "13px",
  },

  summaryCard: {
    minHeight: "125px",
    padding: "18px",
    display: "block",
    background: "#ffffff",
    border: "1px solid #dce1e6",
    color: "inherit",
    textDecoration: "none",
  },

  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },

  summaryTitle: {
    color: "#586470",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  summaryArrow: {
    color: "#87929e",
    fontSize: "13px",
  },

  summaryValue: {
    marginTop: "13px",
    color: "#071b3b",
    fontSize: "25px",
    fontWeight: 600,
  },

  summaryDescription: {
    marginTop: "6px",
    color: "#858e98",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  twoColumnGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  panelHeader: {
    minHeight: "57px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom: "1px solid #e1e5e9",
  },

  panelNumber: {
    display: "inline-block",
    marginRight: "10px",
    color: "#8994a0",
    fontSize: "8px",
    fontWeight: 700,
  },

  panelTitle: {
    display: "inline-block",
    color: "#071b3b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  panelLink: {
    color: "#0b2b58",
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
  },

  workRows: {
    padding: "4px 18px",
  },

  workRow: {
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom: "1px solid #edf0f2",
  },

  workLabel: {
    color: "#596570",
    fontSize: "9px",
  },

  workValue: {
    minWidth: "30px",
    color: "#071b3b",
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "right",
  },

  quickActionGrid: {
    padding: "13px",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "9px",
  },

  quickAction: {
    position: "relative",
    minHeight: "88px",
    padding: "14px 32px 14px 14px",
    background: "#f7f8fa",
    border: "1px solid #e2e6ea",
    color: "inherit",
    textDecoration: "none",
  },

  quickActionTitle: {
    color: "#0b2b58",
    fontSize: "9px",
    fontWeight: 700,
  },

  quickActionDescription: {
    marginTop: "5px",
    color: "#7d8792",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  quickActionArrow: {
    position: "absolute",
    right: "12px",
    bottom: "10px",
    color: "#778493",
    fontSize: "12px",
  },

  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  moduleCard: {
    minHeight: "92px",
    padding: "17px",
    display: "grid",
    gridTemplateColumns: "36px 1fr 25px",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
    color: "inherit",
    textDecoration: "none",
  },

  moduleNumber: {
    color: "#8a96a3",
    fontSize: "9px",
    fontWeight: 700,
  },

  moduleContent: {
    minWidth: 0,
  },

  moduleTitle: {
    color: "#071b3b",
    fontSize: "11px",
    fontWeight: 700,
  },

  moduleDescription: {
    marginTop: "4px",
    color: "#7b858f",
    fontSize: "8px",
    lineHeight: 1.55,
  },

  moduleArrow: {
    color: "#778493",
    fontSize: "14px",
    textAlign: "right",
  },

  emptyState: {
    minHeight: "150px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "13px",
  },

  emptyIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d8dde3",
    borderRadius: "50%",
    color: "#718091",
    fontSize: "12px",
  },

  emptyTitle: {
    color: "#48545f",
    fontSize: "9px",
    fontWeight: 600,
  },

  emptyText: {
    marginTop: "3px",
    color: "#89919a",
    fontSize: "8px",
  },

  systemInformation: {
    marginTop: "18px",
    padding: "18px",
    display: "grid",
    gridTemplateColumns: "38px 1fr",
    gap: "12px",
    background: "#e8eef5",
    borderLeft: "4px solid #0b2b58",
  },

  systemInformationNumber: {
    color: "#718297",
    fontSize: "8px",
    fontWeight: 700,
  },

  systemInformationTitle: {
    color: "#0b2b58",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  systemInformationText: {
    maxWidth: "850px",
    margin: "5px 0 0",
    color: "#58697a",
    fontSize: "9px",
    lineHeight: 1.6,
  },
};