import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const WCG_BLUE = "#001489";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type ParticipantRecord = {
  participantNumber: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: string;
  participantType: string;
  sportingCode: string;
  role: string;
  affiliationStatus: string;
};

const developmentParticipants: ParticipantRecord[] = [];

export default async function SchoolParticipantsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const registryNumber = decodeURIComponent(schoolId);
  const currentDate = formatDate(new Date());

  const activeParticipants = developmentParticipants.filter(
    (participant) => participant.affiliationStatus === "Active"
  ).length;

  const inactiveParticipants = developmentParticipants.filter(
    (participant) => participant.affiliationStatus === "Inactive"
  ).length;

  const sportingCodes = new Set(
    developmentParticipants
      .map((participant) => participant.sportingCode)
      .filter(Boolean)
  ).size;

  return (
    <main style={styles.page}>
      <div style={styles.topUtilityRow}>
        <div style={styles.breadcrumb}>
          <Link href="/my-apps" style={styles.breadcrumbLink}>
            MyGovApps
          </Link>

          <span style={styles.separator}>/</span>

          <Link href="/apps/ams" style={styles.breadcrumbLink}>
            MyWCSA AMS
          </Link>

          <span style={styles.separator}>/</span>

          <Link href="/apps/ams/schools" style={styles.breadcrumbLink}>
            Schools
          </Link>

          <span style={styles.separator}>/</span>

          <Link
            href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
            style={styles.breadcrumbLink}
          >
            {registryNumber}
          </Link>

          <span style={styles.separator}>/</span>

          <strong>Participants</strong>
        </div>

        <div style={styles.currentDate}>{currentDate}</div>
      </div>

      <div style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY / PARTICIPANTS
          </div>

          <h1 style={styles.pageTitle}>SCHOOL PARTICIPANTS</h1>

          <p style={styles.pageSubtitle}>
            View and manage participant affiliations linked to this school.
          </p>
        </div>

        <div style={styles.headingActions}>
          <Link
            href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
            style={styles.secondaryButton}
          >
            SCHOOL PROFILE
          </Link>

          <Link
            href="/apps/ams/participants/register"
            style={styles.primaryButton}
          >
            REGISTER PARTICIPANT
          </Link>
        </div>
      </div>

      <div style={styles.schoolReference}>
        <div>
          <div style={styles.referenceLabel}>SCHOOL REGISTRY NUMBER</div>
          <div style={styles.referenceValue}>{registryNumber}</div>
        </div>

        <div style={styles.referenceStatus}>
          <span style={styles.referenceStatusLabel}>REGISTER</span>
          <span style={styles.referenceStatusValue}>PARTICIPANT AFFILIATIONS</span>
        </div>
      </div>

      <div style={styles.profileNavigation}>
        <Link
          href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
          style={styles.profileNavigationItem}
        >
          OVERVIEW
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/participants`}
          style={styles.activeProfileNavigationItem}
        >
          PARTICIPANTS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/affiliations`}
          style={styles.profileNavigationItem}
        >
          AFFILIATIONS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/documents`}
          style={styles.profileNavigationItem}
        >
          DOCUMENTS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/certificates`}
          style={styles.profileNavigationItem}
        >
          CERTIFICATES
        </Link>
      </div>

      <div style={styles.notice}>
        <div style={styles.noticeMarker}>i</div>

        <div>
          <div style={styles.noticeTitle}>PARTICIPANT AFFILIATION CONTROL</div>

          <div style={styles.noticeText}>
            Participants remain permanent individual records in the provincial
            Participant Registry. This register records their affiliation with
            this school and does not create duplicate participant records.
          </div>
        </div>

        <div style={styles.noticeReference}>AMS-SCH-PART</div>
      </div>

      <SectionTitle
        number="01"
        title="PARTICIPANT REGISTER SUMMARY"
        reference="SCH/PART/01"
      />

      <div style={styles.summaryRegister}>
        <SummaryItem
          number="01.1"
          label="TOTAL LINKED"
          value={String(developmentParticipants.length)}
        />

        <SummaryItem
          number="01.2"
          label="ACTIVE"
          value={String(activeParticipants)}
        />

        <SummaryItem
          number="01.3"
          label="INACTIVE"
          value={String(inactiveParticipants)}
        />

        <SummaryItem
          number="01.4"
          label="SPORTING CODES"
          value={String(sportingCodes)}
          last
        />
      </div>

      <SectionTitle
        number="02"
        title="SEARCH SCHOOL PARTICIPANTS"
        reference="SCH/PART/02"
      />

      <div style={styles.searchFrame}>
        <div style={styles.searchTitleBar}>
          <span>PARTICIPANT SEARCH</span>
          <span style={styles.searchTitleReference}>{registryNumber}</span>
        </div>

        <div style={styles.searchGrid}>
          <SearchField
            number="02.1"
            label="Participant Number"
            placeholder="Enter participant number"
          />

          <SearchField
            number="02.2"
            label="First Name"
            placeholder="Enter first name"
          />

          <SearchField
            number="02.3"
            label="Surname"
            placeholder="Enter surname"
          />

          <SearchField
            number="02.4"
            label="Sporting Code"
            placeholder="Enter sporting code"
          />
        </div>

        <div style={styles.searchActions}>
          <div style={styles.searchInformation}>
            Search applies to participant records affiliated with this school.
          </div>

          <div style={styles.searchButtonGroup}>
            <button type="button" style={styles.secondaryActionButton}>
              CLEAR
            </button>

            <button type="button" style={styles.primaryActionButton}>
              SEARCH
            </button>
          </div>
        </div>
      </div>

      <SectionTitle
        number="03"
        title="PARTICIPANT AFFILIATION REGISTER"
        reference="SCH/PART/03"
      />

      <div style={styles.tableFrame}>
        <div style={styles.tableTitleBar}>
          <div>
            <span style={styles.tableTitle}>SCHOOL PARTICIPANTS</span>
            <span style={styles.tableSubtitle}>
              {developmentParticipants.length} RECORD(S)
            </span>
          </div>

          <Link
            href="/apps/ams/participants"
            style={styles.titleBarButton}
          >
            PROVINCIAL REGISTRY
          </Link>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeading}>NO.</th>
                <th style={styles.tableHeading}>PARTICIPANT NO.</th>
                <th style={styles.tableHeading}>FIRST NAME</th>
                <th style={styles.tableHeading}>SURNAME</th>
                <th style={styles.tableHeading}>DATE OF BIRTH</th>
                <th style={styles.tableHeading}>GENDER</th>
                <th style={styles.tableHeading}>TYPE</th>
                <th style={styles.tableHeading}>SPORTING CODE</th>
                <th style={styles.tableHeading}>ROLE</th>
                <th style={styles.tableHeading}>STATUS</th>
                <th style={styles.tableHeading}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {developmentParticipants.length === 0 ? (
                <tr>
                  <td colSpan={11} style={styles.emptyCell}>
                    <div style={styles.emptyResults}>
                      <div style={styles.emptyResultCode}>SCH-PART-000</div>

                      <div style={styles.emptyResultTitle}>
                        NO PARTICIPANT AFFILIATIONS FOUND
                      </div>

                      <div style={styles.emptyResultText}>
                        No participant records are currently linked to this
                        school in the development register.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                developmentParticipants.map((participant, index) => (
                  <tr key={participant.participantNumber}>
                    <td style={styles.tableCell}>
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td style={styles.tableCell}>
                      {participant.participantNumber}
                    </td>

                    <td style={styles.tableCell}>{participant.name}</td>

                    <td style={styles.tableCell}>{participant.surname}</td>

                    <td style={styles.tableCell}>
                      {participant.dateOfBirth}
                    </td>

                    <td style={styles.tableCell}>{participant.gender}</td>

                    <td style={styles.tableCell}>
                      {participant.participantType}
                    </td>

                    <td style={styles.tableCell}>
                      {participant.sportingCode}
                    </td>

                    <td style={styles.tableCell}>{participant.role}</td>

                    <td style={styles.tableCell}>
                      {participant.affiliationStatus}
                    </td>

                    <td style={styles.tableCell}>
                      <Link
                        href={`/apps/ams/participants/${encodeURIComponent(
                          participant.participantNumber
                        )}`}
                        style={styles.tableAction}
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.tableFooter}>
          <span>SCHOOL: {registryNumber}</span>

          <span>
            TOTAL PARTICIPANT AFFILIATIONS: {developmentParticipants.length}
          </span>
        </div>
      </div>

      <SectionTitle
        number="04"
        title="AFFILIATION FUNCTIONS"
        reference="SCH/PART/04"
      />

      <div style={styles.functionPanel}>
        <FunctionRow
          number="04.1"
          title="Register New Participant"
          description="Search the provincial registry first and register a participant only where no permanent participant record exists."
          href="/apps/ams/participants/register"
        />

        <FunctionRow
          number="04.2"
          title="Participant Registry"
          description="Search all permanent participant records maintained in MyWCSA AMS."
          href="/apps/ams/participants"
        />

        <FunctionRow
          number="04.3"
          title="School Affiliations"
          description="Manage the school's sporting code, programme and organisation affiliations."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/affiliations`}
        />

        <FunctionRow
          number="04.4"
          title="School Documents"
          description="Open supporting documents and records maintained against this school."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/documents`}
          last
        />
      </div>

      <SectionTitle
        number="05"
        title="PARTICIPANT CONTROL RULES"
        reference="SCH/PART/05"
      />

      <div style={styles.controlGrid}>
        <ControlPanel
          number="05.1"
          title="Permanent Participant Record"
          text="Each participant must have one permanent MyWCSA Participant Number. A school affiliation must never create a second participant identity."
        />

        <ControlPanel
          number="05.2"
          title="School Affiliation"
          text="The school relationship is maintained separately from the participant's permanent personal record so historical school affiliations can be retained."
        />

        <ControlPanel
          number="05.3"
          title="Transfer & Release"
          text="Where a participant already has a conflicting active school affiliation, the transfer or release workflow must be completed before a new school affiliation is activated."
        />

        <ControlPanel
          number="05.4"
          title="Historical Records"
          text="Previous affiliations should be closed with appropriate dates and statuses rather than deleted from the registry."
        />
      </div>

      <SectionTitle
        number="06"
        title="REGISTER INFORMATION"
        reference="SCH/PART/06"
      />

      <div style={styles.informationTable}>
        <InformationRow
          label="School Registry Number"
          value={registryNumber}
        />

        <InformationRow
          label="Register"
          value="School Participant Affiliations"
        />

        <InformationRow
          label="Permanent Participant Registry"
          value="MyWCSA AMS Participant Registry"
        />

        <InformationRow
          label="Current Records"
          value={String(developmentParticipants.length)}
        />

        <InformationRow
          label="Data Source"
          value="Development dataset — production database connection pending"
          last
        />
      </div>

      <div style={styles.bottomActions}>
        <Link
          href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
          style={styles.secondaryButton}
        >
          RETURN TO SCHOOL PROFILE
        </Link>

        <Link
          href="/apps/ams/participants/register"
          style={styles.primaryButton}
        >
          REGISTER PARTICIPANT
        </Link>
      </div>
    </main>
  );
}

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
        <span style={styles.sectionNumber}>{number}</span>
        <span style={styles.sectionHeading}>{title}</span>
      </div>

      <span style={styles.sectionReference}>{reference}</span>
    </div>
  );
}

function SummaryItem({
  number,
  label,
  value,
  last = false,
}: {
  number: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.summaryItem,
        ...(last ? { borderRight: "none" } : {}),
      }}
    >
      <div style={styles.summaryNumber}>{number}</div>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={styles.summaryValue}>{value}</div>
    </div>
  );
}

function SearchField({
  number,
  label,
  placeholder,
}: {
  number: string;
  label: string;
  placeholder: string;
}) {
  return (
    <div style={styles.searchField}>
      <div style={styles.searchFieldNumber}>{number}</div>

      <label style={styles.searchLabel}>{label}</label>

      <div style={styles.searchControl}>
        <input
          type="text"
          placeholder={placeholder}
          style={styles.input}
        />
      </div>
    </div>
  );
}

function FunctionRow({
  number,
  title,
  description,
  href,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.functionRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.functionNumber}>{number}</div>

      <div style={styles.functionTitle}>{title}</div>

      <div style={styles.functionDescription}>{description}</div>

      <div style={styles.functionAction}>
        <Link href={href} style={styles.functionButton}>
          OPEN
        </Link>
      </div>
    </div>
  );
}

function ControlPanel({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.controlPanel}>
      <div style={styles.controlHeader}>
        <span style={styles.controlNumber}>{number}</span>
        <span style={styles.controlTitle}>{title}</span>
      </div>

      <div style={styles.controlBody}>{text}</div>
    </div>
  );
}

function InformationRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.informationRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.informationLabel}>{label}</div>
      <div style={styles.informationValue}>{value}</div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    color: TEXT_BLUE,
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
  },

  topUtilityRow: {
    minHeight: "28px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    color: MUTED,
    fontSize: "9px",
  },

  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
  },

  breadcrumbLink: {
    color: WCG_BLUE,
    textDecoration: "none",
  },

  separator: {
    color: BORDER,
  },

  currentDate: {
    color: MUTED,
    fontSize: "9px",
    whiteSpace: "nowrap",
  },

  pageHeading: {
    minHeight: "66px",
    marginBottom: "12px",
    paddingBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    borderBottom: `1px solid ${BORDER}`,
  },

  pageReference: {
    marginBottom: "3px",
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.7px",
  },

  pageTitle: {
    margin: 0,
    color: WCG_BLUE,
    fontSize: "21px",
    fontWeight: 700,
    lineHeight: 1.1,
  },

  pageSubtitle: {
    margin: "5px 0 0",
    color: MUTED,
    fontSize: "10px",
    lineHeight: 1.45,
  },

  headingActions: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  primaryButton: {
    minHeight: "31px",
    padding: "0 13px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor: WCG_BLUE,
    border: `1px solid ${WCG_BLUE}`,
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  secondaryButton: {
    minHeight: "31px",
    padding: "0 13px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  schoolReference: {
    minHeight: "61px",
    marginBottom: "9px",
    padding: "9px 13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  referenceLabel: {
    marginBottom: "4px",
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  referenceValue: {
    color: WCG_BLUE,
    fontSize: "14px",
    fontWeight: 700,
  },

  referenceStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  referenceStatusLabel: {
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
  },

  referenceStatusValue: {
    marginTop: "3px",
    color: TEXT_BLUE,
    fontSize: "9px",
    fontWeight: 700,
  },

  profileNavigation: {
    minHeight: "36px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "#ffffff",
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  profileNavigationItem: {
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRight: `1px solid ${BORDER}`,
    color: WCG_BLUE,
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
  },

  activeProfileNavigationItem: {
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WCG_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
  },

  notice: {
    minHeight: "54px",
    marginBottom: "14px",
    padding: "9px 12px",
    display: "grid",
    gridTemplateColumns: "25px minmax(0, 1fr) auto",
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
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${WCG_BLUE}`,
    borderRadius: "50%",
    color: WCG_BLUE,
    fontSize: "10px",
    fontWeight: 700,
  },

  noticeTitle: {
    color: WCG_BLUE,
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.4px",
  },

  noticeText: {
    marginTop: "2px",
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.45,
  },

  noticeReference: {
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  sectionTitle: {
    minHeight: "32px",
    marginTop: "14px",
    marginBottom: "6px",
    padding: "0 9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    backgroundColor: PALE_BLUE,
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  sectionTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  sectionNumber: {
    minWidth: "25px",
    color: WCG_BLUE,
    fontSize: "9px",
    fontWeight: 700,
  },

  sectionHeading: {
    color: TEXT_BLUE,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  sectionReference: {
    color: MUTED,
    fontSize: "7px",
  },

  summaryRegister: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  summaryItem: {
    minHeight: "70px",
    padding: "10px 12px",
    boxSizing: "border-box",
    borderRight: `1px solid ${BORDER}`,
  },

  summaryNumber: {
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
  },

  summaryLabel: {
    marginTop: "5px",
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.4px",
  },

  summaryValue: {
    marginTop: "4px",
    color: WCG_BLUE,
    fontSize: "14px",
    fontWeight: 700,
  },

  searchFrame: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  searchTitleBar: {
    minHeight: "32px",
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: WCG_BLUE,
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 700,
  },

  searchTitleReference: {
    fontSize: "7px",
    fontWeight: 400,
  },

  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },

  searchField: {
    minHeight: "46px",
    display: "grid",
    gridTemplateColumns: "48px 145px minmax(140px, 1fr)",
    borderBottom: `1px solid ${BORDER}`,
    borderRight: `1px solid ${BORDER}`,
  },

  searchFieldNumber: {
    padding: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TABLE_HEADER,
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
  },

  searchLabel: {
    padding: "7px 9px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  searchControl: {
    padding: "7px",
    display: "flex",
    alignItems: "center",
  },

  input: {
    width: "100%",
    height: "29px",
    boxSizing: "border-box",
    padding: "0 8px",
    backgroundColor: "#ffffff",
    border: `1px solid ${BORDER}`,
    borderRadius: 0,
    outline: "none",
    color: "#303b47",
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
    fontSize: "8px",
  },

  searchActions: {
    minHeight: "44px",
    padding: "7px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    backgroundColor: "#fafbfc",
  },

  searchInformation: {
    color: MUTED,
    fontSize: "8px",
  },

  searchButtonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  primaryActionButton: {
    minHeight: "28px",
    padding: "0 12px",
    backgroundColor: WCG_BLUE,
    border: `1px solid ${WCG_BLUE}`,
    color: "#ffffff",
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
    fontSize: "7px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryActionButton: {
    minHeight: "28px",
    padding: "0 12px",
    backgroundColor: "#ffffff",
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
    fontSize: "7px",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableFrame: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  tableTitleBar: {
    minHeight: "34px",
    padding: "0 9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    backgroundColor: WCG_BLUE,
    color: "#ffffff",
  },

  tableTitle: {
    fontSize: "9px",
    fontWeight: 700,
  },

  tableSubtitle: {
    marginLeft: "10px",
    color: "#dce3f4",
    fontSize: "7px",
  },

  titleBarButton: {
    minHeight: "23px",
    padding: "0 8px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #ffffff",
    color: WCG_BLUE,
    textDecoration: "none",
    fontSize: "7px",
    fontWeight: 700,
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
    tableLayout: "auto",
    fontSize: "8px",
  },

  tableHeading: {
    padding: "8px",
    backgroundColor: TABLE_HEADER,
    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "7px",
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  tableCell: {
    padding: "8px",
    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,
    color: "#303b47",
    fontSize: "8px",
    whiteSpace: "nowrap",
  },

  tableAction: {
    color: WCG_BLUE,
    textDecoration: "none",
    fontSize: "7px",
    fontWeight: 700,
  },

  emptyCell: {
    padding: 0,
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
    marginBottom: "6px",
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  emptyResultTitle: {
    color: WCG_BLUE,
    fontSize: "10px",
    fontWeight: 700,
  },

  emptyResultText: {
    maxWidth: "500px",
    marginTop: "5px",
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.5,
  },

  tableFooter: {
    minHeight: "31px",
    padding: "0 9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALE_BLUE,
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
  },

  functionPanel: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  functionRow: {
    minHeight: "48px",
    display: "grid",
    gridTemplateColumns: "65px 190px minmax(250px, 1fr) 90px",
    alignItems: "stretch",
    borderBottom: `1px solid ${BORDER}`,
  },

  functionNumber: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TABLE_HEADER,
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
  },

  functionTitle: {
    padding: "8px 11px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "9px",
    fontWeight: 700,
  },

  functionDescription: {
    padding: "8px 11px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.4,
  },

  functionAction: {
    padding: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  functionButton: {
    minWidth: "55px",
    minHeight: "25px",
    padding: "0 7px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WCG_BLUE,
    border: `1px solid ${WCG_BLUE}`,
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "7px",
    fontWeight: 700,
  },

  controlGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
  },

  controlPanel: {
    minHeight: "100px",
    backgroundColor: "#ffffff",
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
    color: WCG_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  controlTitle: {
    color: TEXT_BLUE,
    fontSize: "9px",
    fontWeight: 700,
  },

  controlBody: {
    padding: "10px",
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.5,
  },

  informationTable: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  informationRow: {
    minHeight: "39px",
    display: "grid",
    gridTemplateColumns: "230px minmax(0, 1fr)",
    borderBottom: `1px solid ${BORDER}`,
  },

  informationLabel: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  informationValue: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    color: "#303b47",
    fontSize: "8px",
  },

  bottomActions: {
    marginTop: "18px",
    paddingTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    borderTop: `1px solid ${BORDER}`,
  },
};