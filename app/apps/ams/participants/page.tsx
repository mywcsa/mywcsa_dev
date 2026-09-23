import Link from "next/link";

export default function ParticipantsPage() {
  return (
    <main>
      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <section style={styles.pageHeading}>
        <div>
          <div style={styles.breadcrumb}>
            MyWCSA AMS / Registry / Participants
          </div>

          <h1 style={styles.pageTitle}>
            Participant Registry
          </h1>

          <p style={styles.pageSubtitle}>
            Search, register and manage WCSA participant records,
            participation information and affiliations.
          </p>
        </div>

        <Link
          href="/apps/ams/participants/register"
          style={styles.registerButton}
        >
          + REGISTER PARTICIPANT
        </Link>
      </section>

      {/* =====================================================
          SEARCH BEFORE REGISTRATION NOTICE
          ===================================================== */}

      <section style={styles.notice}>
        <div style={styles.noticeNumber}>
          01
        </div>

        <div>
          <div style={styles.noticeTitle}>
            SEARCH BEFORE REGISTRATION
          </div>

          <p style={styles.noticeText}>
            Every participant should have only one permanent
            MyWCSA participant record. Search the registry before
            creating a new participant.
          </p>
        </div>
      </section>

      {/* =====================================================
          PARTICIPANT SEARCH
          ===================================================== */}

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <span style={styles.panelNumber}>
              02
            </span>

            <span style={styles.panelTitle}>
              PARTICIPANT SEARCH
            </span>
          </div>
        </div>

        <div style={styles.searchBody}>
          <div style={styles.searchGrid}>
            <Field
              label="Participant Number"
              placeholder="Enter participant number"
            />

            <Field
              label="First Name"
              placeholder="Enter first name"
            />

            <Field
              label="Surname"
              placeholder="Enter surname"
            />

            <Field
              label="Date of Birth"
              type="date"
            />

            <SelectField
              label="Participant Type"
              options={[
                "All participant types",
                "Learner / Athlete",
                "Coach",
                "Official",
                "Sports Staff",
                "Volunteer",
                "Other",
              ]}
            />

            <SelectField
              label="Record Status"
              options={[
                "All statuses",
                "Active",
                "Pending",
                "Inactive",
                "Suspended",
                "Archived",
              ]}
            />
          </div>

          <div style={styles.searchActions}>
            <button
              type="button"
              style={styles.primaryButton}
            >
              SEARCH REGISTRY
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
            >
              CLEAR
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section style={styles.summaryGrid}>
        <SummaryBox
          label="Total Participants"
          value="—"
        />

        <SummaryBox
          label="Active Records"
          value="—"
        />

        <SummaryBox
          label="Pending Records"
          value="—"
        />

        <SummaryBox
          label="Pending Transfers"
          value="—"
        />
      </section>

      {/* =====================================================
          PARTICIPANT RECORDS
          ===================================================== */}

      <section style={styles.panel}>
        <div style={styles.resultsHeader}>
          <div>
            <div>
              <span style={styles.panelNumber}>
                03
              </span>

              <span style={styles.panelTitle}>
                PARTICIPANT RECORDS
              </span>
            </div>

            <div style={styles.resultsDescription}>
              Search results from the MyWCSA Participant Registry.
            </div>
          </div>

          <div style={styles.resultButtons}>
            <button
              type="button"
              style={styles.smallButton}
            >
              FILTERS
            </button>

            <button
              type="button"
              style={styles.smallButton}
            >
              EXPORT
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <TableHeading>
                  Participant No.
                </TableHeading>

                <TableHeading>
                  Participant
                </TableHeading>

                <TableHeading>
                  Date of Birth
                </TableHeading>

                <TableHeading>
                  Type
                </TableHeading>

                <TableHeading>
                  School / Organisation
                </TableHeading>

                <TableHeading>
                  Sporting Code
                </TableHeading>

                <TableHeading>
                  Status
                </TableHeading>

                <TableHeading>
                  Action
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={8}
                  style={styles.emptyCell}
                >
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      ◎
                    </div>

                    <div style={styles.emptyTitle}>
                      Search the Participant Registry
                    </div>

                    <div style={styles.emptyText}>
                      Enter participant information above and
                      select Search Registry to locate an
                      existing participant record.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.tableFooter}>
          <span>
            No participant records displayed
          </span>

          <span>
            Page 1
          </span>
        </div>
      </section>

      {/* =====================================================
          REGISTRY RULES
          ===================================================== */}

      <section style={styles.rulesGrid}>
        <div style={styles.rulePanel}>
          <div style={styles.ruleNumber}>
            04
          </div>

          <div>
            <div style={styles.ruleTitle}>
              PERMANENT PARTICIPANT NUMBER
            </div>

            <p style={styles.ruleText}>
              A participant receives one permanent WCSA
              Participant Number. The number remains attached
              to the participant throughout their participation
              history.
            </p>

            <div style={styles.numberExample}>
              <span style={styles.numberLabel}>
                EXAMPLE
              </span>

              <span style={styles.numberValue}>
                1312162014001
              </span>
            </div>
          </div>
        </div>

        <div style={styles.rulePanel}>
          <div style={styles.ruleNumber}>
            05
          </div>

          <div>
            <div style={styles.ruleTitle}>
              AFFILIATION HISTORY
            </div>

            <p style={styles.ruleText}>
              Changes between schools, clubs, teams and
              associations must be recorded through affiliation,
              release or transfer processes. Historical records
              should remain available in the participant profile.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK FUNCTIONS
          ===================================================== */}

      <div style={styles.sectionHeading}>
        <span style={styles.sectionNumber}>
          06
        </span>

        PARTICIPANT FUNCTIONS
      </div>

      <section style={styles.functionGrid}>
        <FunctionCard
          href="/apps/ams/participants/register"
          title="Register Participant"
          description="Start a new participant registration."
        />

        <FunctionCard
          href="/apps/ams/affiliations"
          title="Affiliations"
          description="View and manage participant affiliations."
        />

        <FunctionCard
          href="/apps/ams/affiliations/transfers"
          title="Transfers & Releases"
          description="Process affiliation changes and releases."
        />

        <FunctionCard
          href="/apps/ams/reports"
          title="Participant Reports"
          description="Access participant reports and exports."
        />
      </section>
    </main>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}
      </span>

      <select style={styles.input}>
        {options.map((option) => (
          <option key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.summaryBox}>
      <div style={styles.summaryLabel}>
        {label}
      </div>

      <div style={styles.summaryValue}>
        {value}
      </div>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th style={styles.tableHeading}>
      {children}
    </th>
  );
}

function FunctionCard({
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
      style={styles.functionCard}
    >
      <div>
        <div style={styles.functionTitle}>
          {title}
        </div>

        <div style={styles.functionDescription}>
          {description}
        </div>
      </div>

      <div style={styles.functionArrow}>
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

  registerButton: {
    padding: "12px 17px",
    background: "#0b2b58",
    border: "1px solid #0b2b58",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  notice: {
    marginBottom: "18px",
    padding: "17px 19px",
    display: "grid",
    gridTemplateColumns: "38px 1fr",
    gap: "12px",
    background: "#e7eef6",
    borderLeft: "4px solid #0b2b58",
  },

  noticeNumber: {
    color: "#74879c",
    fontSize: "8px",
    fontWeight: 700,
  },

  noticeTitle: {
    color: "#0b2b58",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  noticeText: {
    maxWidth: "850px",
    margin: "4px 0 0",
    color: "#596a7b",
    fontSize: "9px",
    lineHeight: 1.6,
  },

  panel: {
    marginBottom: "18px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  panelHeader: {
    minHeight: "53px",
    padding: "0 19px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #e1e5e9",
  },

  panelNumber: {
    marginRight: "10px",
    color: "#8995a2",
    fontSize: "8px",
    fontWeight: 700,
  },

  panelTitle: {
    color: "#071b3b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  searchBody: {
    padding: "19px",
  },

  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
  },

  field: {
    display: "block",
  },

  fieldLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#53606d",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    height: "40px",
    padding: "0 11px",
    background: "#ffffff",
    border: "1px solid #cbd2d9",
    borderRadius: 0,
    outline: "none",
    color: "#27323d",
    fontFamily: "inherit",
    fontSize: "10px",
  },

  searchActions: {
    marginTop: "18px",
    display: "flex",
    gap: "9px",
  },

  primaryButton: {
    minHeight: "38px",
    padding: "0 18px",
    background: "#0b2b58",
    border: "1px solid #0b2b58",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: "38px",
    padding: "0 18px",
    background: "#ffffff",
    border: "1px solid #adb6c0",
    color: "#485561",
    fontFamily: "inherit",
    fontSize: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },

  summaryGrid: {
    marginBottom: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },

  summaryBox: {
    minHeight: "90px",
    padding: "17px 18px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  summaryLabel: {
    color: "#697581",
    fontSize: "8px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  summaryValue: {
    marginTop: "8px",
    color: "#071b3b",
    fontSize: "23px",
    fontWeight: 600,
  },

  resultsHeader: {
    minHeight: "65px",
    padding: "0 19px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    borderBottom: "1px solid #e1e5e9",
  },

  resultsDescription: {
    marginTop: "4px",
    color: "#87909a",
    fontSize: "8px",
  },

  resultButtons: {
    display: "flex",
    gap: "7px",
  },

  smallButton: {
    minHeight: "31px",
    padding: "0 11px",
    background: "#ffffff",
    border: "1px solid #c7ced5",
    color: "#53606d",
    fontFamily: "inherit",
    fontSize: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeading: {
    padding: "11px 12px",
    background: "#f4f6f8",
    borderBottom: "1px solid #dfe4e8",
    color: "#53606d",
    fontSize: "7px",
    fontWeight: 700,
    textAlign: "left",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  emptyCell: {
    padding: 0,
  },

  emptyState: {
    minHeight: "215px",
    padding: "35px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyIcon: {
    width: "47px",
    height: "47px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d5dbe1",
    borderRadius: "50%",
    color: "#718092",
    fontSize: "18px",
  },

  emptyTitle: {
    marginTop: "12px",
    color: "#394550",
    fontSize: "10px",
    fontWeight: 600,
  },

  emptyText: {
    maxWidth: "420px",
    marginTop: "5px",
    color: "#858e98",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  tableFooter: {
    minHeight: "42px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #e1e5e9",
    color: "#7c8690",
    fontSize: "8px",
  },

  rulesGrid: {
    marginBottom: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  rulePanel: {
    minHeight: "145px",
    padding: "18px",
    display: "grid",
    gridTemplateColumns: "34px 1fr",
    gap: "11px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  ruleNumber: {
    color: "#8793a0",
    fontSize: "8px",
    fontWeight: 700,
  },

  ruleTitle: {
    color: "#071b3b",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  ruleText: {
    margin: "5px 0 0",
    color: "#687480",
    fontSize: "8px",
    lineHeight: 1.7,
  },

  numberExample: {
    marginTop: "12px",
    display: "inline-flex",
    border: "1px solid #d4dae0",
  },

  numberLabel: {
    padding: "7px 9px",
    background: "#f1f3f5",
    color: "#737e89",
    fontSize: "7px",
    fontWeight: 700,
  },

  numberValue: {
    padding: "7px 11px",
    color: "#071b3b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  sectionHeading: {
    margin: "25px 0 11px",
    color: "#071b3b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  sectionNumber: {
    marginRight: "10px",
    color: "#8793a0",
    fontSize: "8px",
  },

  functionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "11px",
  },

  functionCard: {
    minHeight: "105px",
    padding: "16px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
    color: "inherit",
    textDecoration: "none",
  },

  functionTitle: {
    color: "#0b2b58",
    fontSize: "9px",
    fontWeight: 700,
  },

  functionDescription: {
    marginTop: "5px",
    color: "#7a8590",
    fontSize: "8px",
    lineHeight: 1.55,
  },

  functionArrow: {
    color: "#788594",
    fontSize: "13px",
  },
};