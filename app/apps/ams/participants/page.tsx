import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/* ============================================================
   MyWCSA AMS
   PARTICIPANT REGISTRY
   ============================================================

   INTERFACE STANDARD
   ------------------------------------------------------------
   System:      MyWCSA Administration Management System
   Module:      Participants
   Interface:   Staff
   Primary:     #001489
   Typeface:    Century Gothic (inherited from AMS layout)

   DESIGN RULES
   ------------------------------------------------------------
   - Formal government administrative interface
   - Compact typography
   - Numbered sections
   - Actual forms use structured/double-line treatment
   - Actual registers/results use structured tables
   - Navigation/help/utility areas are NOT over-tabulated
   - No giant SaaS cards
   - No marketing-style hero areas
   ============================================================ */

const WCG_BLUE = "#001489";
const DARK_BLUE = "#00105f";
const TEXT_BLUE = "#00175a";
const BORDER = "#aeb6c0";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#626d78";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

export default function ParticipantsPage() {
  const currentDate = formatDate();

  return (
    <div style={styles.page}>
      {/* =====================================================
          TOP UTILITY ROW
          ===================================================== */}

      <div style={styles.topUtilityRow}>
        <div style={styles.breadcrumb}>
          <Link href="/my-apps" style={styles.breadcrumbLink}>
            MyGovApps
          </Link>

          <span style={styles.breadcrumbSeparator}>/</span>

          <Link href="/apps/ams" style={styles.breadcrumbLink}>
            MyWCSA AMS
          </Link>

          <span style={styles.breadcrumbSeparator}>/</span>

          <span>Registry</span>

          <span style={styles.breadcrumbSeparator}>/</span>

          <strong>Participants</strong>
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
            AMS / REGISTRY / PARTICIPANTS
          </div>

          <h1 style={styles.pageTitle}>
            PARTICIPANT REGISTRY
          </h1>

          <p style={styles.pageSubtitle}>
            Search, register and manage participant records.
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
          IMPORTANT REGISTRY NOTICE
          ===================================================== */}

      <section style={styles.registryNotice}>
        <div style={styles.noticeMarker}>
          !
        </div>

        <div style={styles.noticeContent}>
          <div style={styles.noticeTitle}>
            SEARCH BEFORE REGISTRATION
          </div>

          <div style={styles.noticeText}>
            Every participant must have only one permanent
            MyWCSA participant record. Search the registry
            before creating a new record.
          </div>
        </div>

        <div style={styles.noticeReference}>
          REGISTRY CONTROL
        </div>
      </section>

      {/* =====================================================
          01 PARTICIPANT SEARCH
          ===================================================== */}

      <SectionTitle
        number="01"
        title="PARTICIPANT SEARCH"
        reference="AMS-PRT-01"
      />

      <section style={styles.formFrame}>
        <div style={styles.formTitleBar}>
          <div>
            <span style={styles.formTitleNumber}>
              01.1
            </span>

            PARTICIPANT IDENTITY SEARCH
          </div>

          <span style={styles.formTitleReference}>
            REGISTRY ENQUIRY
          </span>
        </div>

        <div style={styles.formTable}>
          <FormRow
            number="01"
            leftLabel="Participant Number"
            leftControl={
              <input
                type="text"
                placeholder="Enter participant number"
                style={styles.input}
              />
            }
            rightLabel="Record Status"
            rightControl={
              <select style={styles.input}>
                <option>All statuses</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
                <option>Suspended</option>
                <option>Archived</option>
              </select>
            }
          />

          <FormRow
            number="02"
            leftLabel="First Name"
            leftControl={
              <input
                type="text"
                placeholder="Enter first name"
                style={styles.input}
              />
            }
            rightLabel="Surname"
            rightControl={
              <input
                type="text"
                placeholder="Enter surname"
                style={styles.input}
              />
            }
          />

          <FormRow
            number="03"
            leftLabel="Date of Birth"
            leftControl={
              <input
                type="date"
                style={styles.input}
              />
            }
            rightLabel="Participant Type"
            rightControl={
              <select style={styles.input}>
                <option>All participant types</option>
                <option>Learner / Athlete</option>
                <option>Coach</option>
                <option>Official</option>
                <option>Sports Staff</option>
                <option>Volunteer</option>
                <option>Other</option>
              </select>
            }
          />
        </div>

        <div style={styles.formActions}>
          <div style={styles.formActionInformation}>
            Complete one or more search fields.
          </div>

          <div style={styles.formActionButtons}>
            <button
              type="button"
              style={styles.secondaryButton}
            >
              CLEAR
            </button>

            <button
              type="button"
              style={styles.primaryButton}
            >
              SEARCH REGISTRY
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          02 REGISTRY SUMMARY
          ===================================================== */}

      <SectionTitle
        number="02"
        title="REGISTRY SUMMARY"
        reference="AMS-PRT-02"
      />

      <section style={styles.summaryRegister}>
        <SummaryItem
          number="02.1"
          label="TOTAL PARTICIPANTS"
          value="—"
        />

        <SummaryItem
          number="02.2"
          label="ACTIVE RECORDS"
          value="—"
        />

        <SummaryItem
          number="02.3"
          label="PENDING RECORDS"
          value="—"
        />

        <SummaryItem
          number="02.4"
          label="PENDING TRANSFERS"
          value="—"
        />
      </section>

      {/* =====================================================
          03 PARTICIPANT RECORDS
          ===================================================== */}

      <SectionTitle
        number="03"
        title="PARTICIPANT RECORDS"
        reference="AMS-PRT-03"
      />

      <section style={styles.resultsFrame}>
        <div style={styles.resultsTitleBar}>
          <div>
            <span style={styles.resultsTitle}>
              PARTICIPANT REGISTRY RESULTS
            </span>

            <span style={styles.resultsSubtitle}>
              Search results matching the selected criteria
            </span>
          </div>

          <div style={styles.resultActions}>
            <button
              type="button"
              style={styles.titleBarButton}
            >
              FILTERS
            </button>

            <button
              type="button"
              style={styles.titleBarButton}
            >
              EXPORT
            </button>
          </div>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <TableHeading width="55px">
                  #
                </TableHeading>

                <TableHeading width="145px">
                  PARTICIPANT NO.
                </TableHeading>

                <TableHeading width="190px">
                  PARTICIPANT
                </TableHeading>

                <TableHeading width="105px">
                  DATE OF BIRTH
                </TableHeading>

                <TableHeading width="115px">
                  TYPE
                </TableHeading>

                <TableHeading>
                  SCHOOL / ORGANISATION
                </TableHeading>

                <TableHeading width="125px">
                  SPORTING CODE
                </TableHeading>

                <TableHeading width="85px">
                  STATUS
                </TableHeading>

                <TableHeading width="75px">
                  ACTION
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={9}
                  style={styles.emptyCell}
                >
                  <div style={styles.emptyResults}>
                    <div style={styles.emptyResultCode}>
                      NO RESULTS
                    </div>

                    <div style={styles.emptyResultTitle}>
                      PARTICIPANT REGISTRY SEARCH
                    </div>

                    <div style={styles.emptyResultText}>
                      Enter participant information in the
                      search form above and select
                      <strong> Search Registry </strong>
                      to locate an existing record.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.tableFooter}>
          <span>
            RECORDS DISPLAYED: 0
          </span>

          <span>
            PAGE 1 OF 1
          </span>
        </div>
      </section>

      {/* =====================================================
          04 REGISTRY CONTROLS
          ===================================================== */}

      <SectionTitle
        number="04"
        title="REGISTRY CONTROLS"
        reference="AMS-PRT-04"
      />

      <section style={styles.controlGrid}>
        <RegistryControl
          number="04.1"
          title="PERMANENT PARTICIPANT NUMBER"
        >
          <p style={styles.controlText}>
            A participant receives one permanent WCSA
            Participant Number. The number remains linked
            to the participant throughout their participation
            history.
          </p>

          <div style={styles.numberExample}>
            <span style={styles.numberExampleLabel}>
              FORMAT EXAMPLE
            </span>

            <strong style={styles.numberExampleValue}>
              1312162014001
            </strong>
          </div>
        </RegistryControl>

        <RegistryControl
          number="04.2"
          title="AFFILIATION HISTORY"
        >
          <p style={styles.controlText}>
            Changes between schools, clubs, teams and
            associations must be recorded through the
            appropriate affiliation, release or transfer
            process.
          </p>

          <div style={styles.controlNote}>
            Historical affiliations remain attached to
            the participant record.
          </div>
        </RegistryControl>
      </section>

      {/* =====================================================
          05 PARTICIPANT FUNCTIONS
          ===================================================== */}

      <SectionTitle
        number="05"
        title="PARTICIPANT FUNCTIONS"
        reference="AMS-PRT-05"
      />

      <section style={styles.functionPanel}>
        <FunctionRow
          number="05.1"
          title="REGISTER PARTICIPANT"
          description="Create a new permanent participant record."
          href="/apps/ams/participants/register"
          action="START"
        />

        <FunctionRow
          number="05.2"
          title="AFFILIATIONS"
          description="View and manage participant affiliations."
          href="/apps/ams/affiliations"
          action="OPEN"
        />

        <FunctionRow
          number="05.3"
          title="TRANSFERS & RELEASES"
          description="Process participant affiliation changes."
          href="/apps/ams/affiliations/transfers"
          action="OPEN"
        />

        <FunctionRow
          number="05.4"
          title="PARTICIPANT REPORTS"
          description="Access participant reports and exports."
          href="/apps/ams/reports"
          action="OPEN"
        />
      </section>

      {/* =====================================================
          06 REGISTRY INFORMATION
          ===================================================== */}

      <SectionTitle
        number="06"
        title="REGISTRY INFORMATION"
        reference="AMS-PRT-06"
      />

      <section style={styles.informationFrame}>
        <div style={styles.informationRow}>
          <div style={styles.informationLabel}>
            Registry
          </div>

          <div style={styles.informationValue}>
            MyWCSA Participant Registry
          </div>
        </div>

        <div style={styles.informationRow}>
          <div style={styles.informationLabel}>
            Record Principle
          </div>

          <div style={styles.informationValue}>
            One permanent participant record per person
          </div>
        </div>

        <div style={styles.informationRow}>
          <div style={styles.informationLabel}>
            Participant Number
          </div>

          <div style={styles.informationValue}>
            Permanent once officially allocated
          </div>
        </div>

        <div style={styles.informationRow}>
          <div style={styles.informationLabel}>
            Historical Records
          </div>

          <div style={styles.informationValue}>
            Retained for audit and participation history
          </div>
        </div>
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

      <span style={styles.sectionReference}>
        {reference}
      </span>
    </div>
  );
}

/* ============================================================
   FORM ROW
   ============================================================ */

function FormRow({
  number,
  leftLabel,
  leftControl,
  rightLabel,
  rightControl,
}: {
  number: string;
  leftLabel: string;
  leftControl: ReactNode;
  rightLabel: string;
  rightControl: ReactNode;
}) {
  return (
    <div style={styles.formRow}>
      <div style={styles.formRowNumber}>
        {number}
      </div>

      <div style={styles.formLabel}>
        {leftLabel}
      </div>

      <div style={styles.formControl}>
        {leftControl}
      </div>

      <div style={styles.formLabel}>
        {rightLabel}
      </div>

      <div style={styles.formControl}>
        {rightControl}
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY ITEM
   ============================================================ */

function SummaryItem({
  number,
  label,
  value,
}: {
  number: string;
  label: string;
  value: string;
}) {
  return (
    <div style={styles.summaryItem}>
      <div style={styles.summaryNumber}>
        {number}
      </div>

      <div style={styles.summaryLabel}>
        {label}
      </div>

      <div style={styles.summaryValue}>
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   TABLE HEADING
   ============================================================ */

function TableHeading({
  children,
  width,
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <th
      style={{
        ...styles.tableHeading,
        ...(width ? { width } : {}),
      }}
    >
      {children}
    </th>
  );
}

/* ============================================================
   REGISTRY CONTROL
   ============================================================ */

function RegistryControl({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.registryControl}>
      <div style={styles.controlHeader}>
        <span style={styles.controlNumber}>
          {number}
        </span>

        <span style={styles.controlTitle}>
          {title}
        </span>
      </div>

      <div style={styles.controlBody}>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   FUNCTION ROW
   ============================================================ */

function FunctionRow({
  number,
  title,
  description,
  href,
  action,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div style={styles.functionRow}>
      <div style={styles.functionNumber}>
        {number}
      </div>

      <div style={styles.functionTitle}>
        {title}
      </div>

      <div style={styles.functionDescription}>
        {description}
      </div>

      <div style={styles.functionAction}>
        <Link
          href={href}
          style={styles.functionButton}
        >
          {action}
        </Link>
      </div>
    </div>
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
     TOP UTILITY
     ========================================================= */

  topUtilityRow: {
    minHeight: "24px",
    marginBottom: "14px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "20px",

    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  /* =========================================================
     PAGE HEADING
     ========================================================= */

  pageHeading: {
    minHeight: "65px",

    marginBottom: "15px",
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

    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.65px",
  },

  pageTitle: {
    margin: 0,

    color: WCG_BLUE,

    fontSize: "21px",
    fontWeight: 700,

    lineHeight: 1.1,
  },

  pageSubtitle: {
    margin: "4px 0 0",

    color: MUTED,

    fontSize: "13px",
  },

  registerButton: {
    minHeight: "32px",

    padding: "0 13px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: WCG_BLUE,

    border: `1px solid ${WCG_BLUE}`,

    color: "#ffffff",

    textDecoration: "none",

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  /* =========================================================
     NOTICE
     ========================================================= */

  registryNotice: {
    minHeight: "51px",

    marginBottom: "18px",
    padding: "8px 11px",

    display: "grid",

    gridTemplateColumns: "27px 1fr auto",

    alignItems: "center",

    gap: "10px",

    boxSizing: "border-box",

    backgroundColor: PALE_BLUE,

    borderLeft: `4px solid ${WCG_BLUE}`,
    borderTop: `1px solid ${LIGHT_BORDER}`,
    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,
  },

  noticeMarker: {
    width: "21px",
    height: "21px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    border: `1px solid ${WCG_BLUE}`,
    borderRadius: "50%",

    color: WCG_BLUE,

    fontSize: "13px",
    fontWeight: 700,
  },

  noticeContent: {
    minWidth: 0,
  },

  noticeTitle: {
    color: WCG_BLUE,

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  noticeText: {
    marginTop: "2px",

    color: "#5d6975",

    fontSize: "13px",

    lineHeight: 1.4,
  },

  noticeReference: {
    color: "#77828d",

    fontSize: "13px",
    fontWeight: 700,

    whiteSpace: "nowrap",
  },

  /* =========================================================
     SECTION TITLE
     ========================================================= */

  sectionTitle: {
    minHeight: "30px",

    marginTop: "19px",
    marginBottom: "8px",

    padding: "0 8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor: "rgba(255,255,255,0.93)",

    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  sectionTitleLeft: {
    display: "flex",
    alignItems: "center",

    gap: "10px",
  },

  sectionNumber: {
    minWidth: "27px",

    color: WCG_BLUE,

    fontSize: "13px",
    fontWeight: 700,
  },

  sectionHeading: {
    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.55px",
  },

  sectionReference: {
    color: "#818b96",

    fontSize: "13px",

    letterSpacing: "0.3px",
  },

  /* =========================================================
     SEARCH FORM
     ACTUAL FORM = DOUBLE-LINE TREATMENT
     ========================================================= */

  formFrame: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  formTitleBar: {
    minHeight: "31px",

    padding: "0 10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    boxSizing: "border-box",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.35px",
  },

  formTitleNumber: {
    marginRight: "9px",

    color: "rgba(255,255,255,0.72)",

    fontSize: "13px",
  },

  formTitleReference: {
    color: "rgba(255,255,255,0.8)",

    fontSize: "13px",

    fontWeight: 600,
  },

  formTable: {
    width: "100%",
  },

  formRow: {
    minHeight: "48px",

    display: "grid",

    gridTemplateColumns:
      "45px 145px minmax(180px, 1fr) 145px minmax(180px, 1fr)",

    alignItems: "stretch",

    borderBottom: `1px solid ${BORDER}`,
  },

  formRowNumber: {
    padding: "8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#f2f4f6",

    borderRight: `1px solid ${BORDER}`,

    color: "#6c7782",

    fontSize: "13px",
    fontWeight: 700,
  },

  formLabel: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    backgroundColor: PALE_BLUE,

    borderRight: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,
  },

  formControl: {
    padding: "6px 8px",

    display: "flex",
    alignItems: "center",

    borderRight: `1px solid ${BORDER}`,
  },

  input: {
    width: "100%",
    height: "31px",

    boxSizing: "border-box",

    padding: "0 9px",

    backgroundColor: "#ffffff",

    border: `1px solid #9fa8b2`,
    borderRadius: 0,

    outline: "none",

    color: "#25303a",

    fontFamily: "inherit",

    fontSize: "13px",
  },

  formActions: {
    minHeight: "45px",

    padding: "6px 8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "20px",

    backgroundColor: "#f7f8f9",
  },

  formActionInformation: {
    color: "#707a85",

    fontSize: "13px",
  },

  formActionButtons: {
    display: "flex",
    alignItems: "center",

    gap: "7px",
  },

  primaryButton: {
    minHeight: "30px",

    padding: "0 14px",

    backgroundColor: WCG_BLUE,

    border: `1px solid ${WCG_BLUE}`,

    color: "#ffffff",

    fontFamily: "inherit",

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.25px",

    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: "30px",

    padding: "0 14px",

    backgroundColor: "#ffffff",

    border: `1px solid #929ca7`,

    color: TEXT_BLUE,

    fontFamily: "inherit",

    fontSize: "13px",
    fontWeight: 700,

    cursor: "pointer",
  },

  /* =========================================================
     SUMMARY
     ========================================================= */

  summaryRegister: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,
  },

  summaryItem: {
    minHeight: "74px",

    padding: "10px 12px",

    boxSizing: "border-box",

    borderRight: `1px solid ${LIGHT_BORDER}`,
  },

  summaryNumber: {
    color: "#7b8691",

    fontSize: "13px",
    fontWeight: 700,
  },

  summaryLabel: {
    marginTop: "5px",

    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.2px",
  },

  summaryValue: {
    marginTop: "7px",

    color: WCG_BLUE,

    fontSize: "18px",
    fontWeight: 700,

    lineHeight: 1,
  },

  /* =========================================================
     RESULTS TABLE
     ========================================================= */

  resultsFrame: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  resultsTitleBar: {
    minHeight: "38px",

    padding: "0 10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "20px",

    boxSizing: "border-box",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",
  },

  resultsTitle: {
    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  resultsSubtitle: {
    marginLeft: "10px",

    color: "rgba(255,255,255,0.72)",

    fontSize: "13px",
  },

  resultActions: {
    display: "flex",
    alignItems: "center",

    gap: "5px",
  },

  titleBarButton: {
    minHeight: "24px",

    padding: "0 8px",

    backgroundColor: "#ffffff",

    border: "1px solid rgba(255,255,255,0.8)",

    color: WCG_BLUE,

    fontFamily: "inherit",

    fontSize: "13px",
    fontWeight: 700,

    cursor: "pointer",
  },

  tableScroll: {
    width: "100%",

    overflowX: "auto",
  },

  table: {
    width: "100%",

    minWidth: "1120px",

    borderCollapse: "collapse",

    tableLayout: "fixed",

    fontSize: "13px",
  },

  tableHeading: {
    padding: "7px 8px",

    backgroundColor: TABLE_HEADER,

    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,

    textAlign: "left",

    whiteSpace: "nowrap",
  },

  emptyCell: {
    padding: 0,

    borderBottom: `1px solid ${LIGHT_BORDER}`,
  },

  emptyResults: {
    minHeight: "145px",

    padding: "25px",

    display: "flex",
    flexDirection: "column",

    alignItems: "center",
    justifyContent: "center",

    textAlign: "center",

    backgroundColor: "#ffffff",
  },

  emptyResultCode: {
    marginBottom: "7px",

    color: "#7b8690",

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  emptyResultTitle: {
    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,
  },

  emptyResultText: {
    maxWidth: "430px",

    marginTop: "5px",

    color: "#737e89",

    fontSize: "13px",

    lineHeight: 1.5,
  },

  tableFooter: {
    minHeight: "32px",

    padding: "0 9px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#f6f7f8",

    color: "#6d7883",

    fontSize: "13px",
    fontWeight: 600,
  },

  /* =========================================================
     REGISTRY CONTROLS
     ========================================================= */

  controlGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "12px",
  },

  registryControl: {
    minHeight: "135px",

    backgroundColor: "rgba(255,255,255,0.95)",

    border: `1px solid ${BORDER}`,
  },

  controlHeader: {
    minHeight: "31px",

    padding: "0 10px",

    display: "flex",
    alignItems: "center",

    gap: "9px",

    backgroundColor: PALE_BLUE,

    borderBottom: `1px solid ${BORDER}`,
  },

  controlNumber: {
    color: "#74808c",

    fontSize: "13px",
    fontWeight: 700,
  },

  controlTitle: {
    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,

    letterSpacing: "0.25px",
  },

  controlBody: {
    padding: "11px 12px",
  },

  controlText: {
    margin: 0,

    color: "#626e79",

    fontSize: "13px",

    lineHeight: 1.55,
  },

  numberExample: {
    marginTop: "10px",

    display: "inline-flex",

    border: `1px solid ${BORDER}`,
  },

  numberExampleLabel: {
    padding: "6px 8px",

    display: "inline-flex",
    alignItems: "center",

    backgroundColor: "#f1f3f5",

    borderRight: `1px solid ${BORDER}`,

    color: "#6f7a85",

    fontSize: "13px",
    fontWeight: 700,
  },

  numberExampleValue: {
    padding: "6px 9px",

    color: WCG_BLUE,

    fontSize: "13px",

    letterSpacing: "0.8px",
  },

  controlNote: {
    marginTop: "10px",

    paddingTop: "7px",

    borderTop: `1px solid ${LIGHT_BORDER}`,

    color: "#697580",

    fontSize: "13px",

    fontStyle: "italic",
  },

  /* =========================================================
     PARTICIPANT FUNCTIONS
     ========================================================= */

  functionPanel: {
    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,
  },

  functionRow: {
    minHeight: "47px",

    display: "grid",

    gridTemplateColumns:
      "65px 190px 1fr 80px",

    alignItems: "stretch",

    borderBottom: `1px solid ${LIGHT_BORDER}`,
  },

  functionNumber: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    borderRight: `1px solid ${LIGHT_BORDER}`,

    color: "#74808b",

    fontSize: "13px",
    fontWeight: 700,
  },

  functionTitle: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    borderRight: `1px solid ${LIGHT_BORDER}`,

    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,
  },

  functionDescription: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    borderRight: `1px solid ${LIGHT_BORDER}`,

    color: "#69747f",

    fontSize: "13px",
  },

  functionAction: {
    padding: "6px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  functionButton: {
    minWidth: "48px",

    padding: "5px 7px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: WCG_BLUE,

    border: `1px solid ${WCG_BLUE}`,

    color: "#ffffff",

    textDecoration: "none",

    fontSize: "13px",
    fontWeight: 700,
  },

  /* =========================================================
     REGISTRY INFORMATION
     ========================================================= */

  informationFrame: {
    marginBottom: "4px",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  informationRow: {
    minHeight: "35px",

    display: "grid",

    gridTemplateColumns: "210px 1fr",

    borderBottom: `1px solid ${LIGHT_BORDER}`,
  },

  informationLabel: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    backgroundColor: PALE_BLUE,

    borderRight: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "13px",
    fontWeight: 700,
  },

  informationValue: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    color: "#606c77",

    fontSize: "13px",
  },
};