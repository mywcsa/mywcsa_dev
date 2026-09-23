import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const WCG_BLUE = "#001489";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type AffiliationRecord = {
  affiliationNumber: string;
  category: string;
  organisation: string;
  sportingCode: string;
  programme: string;
  startDate: string;
  endDate: string;
  status: string;
};

const developmentAffiliations: AffiliationRecord[] = [];

export default async function SchoolAffiliationsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const registryNumber = decodeURIComponent(schoolId);
  const currentDate = formatDate(new Date());

  const activeCount = developmentAffiliations.filter(
    (record) => record.status === "Active"
  ).length;

  const pendingCount = developmentAffiliations.filter(
    (record) => record.status === "Pending"
  ).length;

  const inactiveCount = developmentAffiliations.filter(
    (record) =>
      record.status === "Inactive" ||
      record.status === "Expired" ||
      record.status === "Closed"
  ).length;

  const sportingCodeCount = new Set(
    developmentAffiliations
      .map((record) => record.sportingCode)
      .filter(Boolean)
  ).size;

  return (
    <main style={styles.page}>
      {/* TOP UTILITY */}

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

          <strong>Affiliations</strong>
        </div>

        <div style={styles.currentDate}>{currentDate}</div>
      </div>

      {/* PAGE HEADING */}

      <div style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY / AFFILIATIONS
          </div>

          <h1 style={styles.pageTitle}>SCHOOL AFFILIATIONS</h1>

          <p style={styles.pageSubtitle}>
            Manage the school&apos;s WCSA membership, sporting codes,
            programmes and organisational affiliations.
          </p>
        </div>

        <div style={styles.headingActions}>
          <Link
            href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
            style={styles.secondaryButton}
          >
            SCHOOL PROFILE
          </Link>

          <button type="button" style={styles.primaryButton}>
            ADD AFFILIATION
          </button>
        </div>
      </div>

      {/* SCHOOL REFERENCE */}

      <div style={styles.schoolReference}>
        <div>
          <div style={styles.referenceLabel}>SCHOOL REGISTRY NUMBER</div>
          <div style={styles.referenceValue}>{registryNumber}</div>
        </div>

        <div style={styles.referenceStatus}>
          <span style={styles.referenceStatusLabel}>REGISTER</span>

          <span style={styles.referenceStatusValue}>
            SCHOOL AFFILIATIONS
          </span>
        </div>
      </div>

      {/* PROFILE NAVIGATION */}

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
          style={styles.profileNavigationItem}
        >
          PARTICIPANTS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/affiliations`}
          style={styles.activeProfileNavigationItem}
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

      {/* NOTICE */}

      <div style={styles.notice}>
        <div style={styles.noticeMarker}>i</div>

        <div>
          <div style={styles.noticeTitle}>
            SCHOOL AFFILIATION CONTROL
          </div>

          <div style={styles.noticeText}>
            Affiliations must be maintained against the permanent School
            Registry record. Historical affiliations should be closed or
            expired rather than deleted.
          </div>
        </div>

        <div style={styles.noticeReference}>AMS-SCH-AFF</div>
      </div>

      {/* 01 SUMMARY */}

      <SectionTitle
        number="01"
        title="AFFILIATION SUMMARY"
        reference="SCH/AFF/01"
      />

      <div style={styles.summaryRegister}>
        <SummaryItem
          number="01.1"
          label="TOTAL AFFILIATIONS"
          value={String(developmentAffiliations.length)}
        />

        <SummaryItem
          number="01.2"
          label="ACTIVE"
          value={String(activeCount)}
        />

        <SummaryItem
          number="01.3"
          label="PENDING"
          value={String(pendingCount)}
        />

        <SummaryItem
          number="01.4"
          label="INACTIVE / CLOSED"
          value={String(inactiveCount)}
        />

        <SummaryItem
          number="01.5"
          label="SPORTING CODES"
          value={String(sportingCodeCount)}
          last
        />
      </div>

      {/* 02 MEMBERSHIP */}

      <SectionTitle
        number="02"
        title="WCSA SCHOOL MEMBERSHIP"
        reference="SCH/AFF/02"
      />

      <div style={styles.dataTable}>
        <DataRow
          number="02.1"
          leftLabel="Membership Type"
          leftValue="School Membership"
          rightLabel="Annual Tariff"
          rightValue="R350.00 / year"
        />

        <DataRow
          number="02.2"
          leftLabel="Membership Status"
          leftValue="Pending database connection"
          rightLabel="Membership Year"
          rightValue="2026"
        />

        <DataRow
          number="02.3"
          leftLabel="Effective Date"
          leftValue="Not available"
          rightLabel="Expiry / Renewal Date"
          rightValue="Not available"
        />

        <DataRow
          number="02.4"
          leftLabel="Finance Verification"
          leftValue="Not available"
          rightLabel="Certificate Status"
          rightValue="Not available"
          last
        />
      </div>

      {/* 03 SEARCH */}

      <SectionTitle
        number="03"
        title="SEARCH AFFILIATIONS"
        reference="SCH/AFF/03"
      />

      <div style={styles.searchFrame}>
        <div style={styles.searchTitleBar}>
          <span>AFFILIATION SEARCH</span>

          <span style={styles.searchTitleReference}>
            {registryNumber}
          </span>
        </div>

        <div style={styles.searchGrid}>
          <SearchField
            number="03.1"
            label="Affiliation Number"
            placeholder="Enter affiliation number"
          />

          <SearchField
            number="03.2"
            label="Category"
            placeholder="Enter affiliation category"
          />

          <SearchField
            number="03.3"
            label="Organisation"
            placeholder="Enter organisation"
          />

          <SearchField
            number="03.4"
            label="Sporting Code"
            placeholder="Enter sporting code"
          />

          <SearchField
            number="03.5"
            label="Programme"
            placeholder="Enter programme"
          />

          <SearchField
            number="03.6"
            label="Status"
            placeholder="Enter affiliation status"
          />
        </div>

        <div style={styles.searchActions}>
          <div style={styles.searchInformation}>
            Search within affiliations linked to this School Registry record.
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

      {/* 04 REGISTER */}

      <SectionTitle
        number="04"
        title="AFFILIATION REGISTER"
        reference="SCH/AFF/04"
      />

      <div style={styles.tableFrame}>
        <div style={styles.tableTitleBar}>
          <div>
            <span style={styles.tableTitle}>
              SCHOOL AFFILIATION RECORDS
            </span>

            <span style={styles.tableSubtitle}>
              {developmentAffiliations.length} RECORD(S)
            </span>
          </div>

          <button type="button" style={styles.titleBarButton}>
            ADD AFFILIATION
          </button>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeading}>NO.</th>
                <th style={styles.tableHeading}>AFFILIATION NO.</th>
                <th style={styles.tableHeading}>CATEGORY</th>
                <th style={styles.tableHeading}>ORGANISATION</th>
                <th style={styles.tableHeading}>SPORTING CODE</th>
                <th style={styles.tableHeading}>PROGRAMME</th>
                <th style={styles.tableHeading}>START DATE</th>
                <th style={styles.tableHeading}>END DATE</th>
                <th style={styles.tableHeading}>STATUS</th>
                <th style={styles.tableHeading}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {developmentAffiliations.length === 0 ? (
                <tr>
                  <td colSpan={10} style={styles.emptyCell}>
                    <div style={styles.emptyResults}>
                      <div style={styles.emptyResultCode}>SCH-AFF-000</div>

                      <div style={styles.emptyResultTitle}>
                        NO AFFILIATION RECORDS FOUND
                      </div>

                      <div style={styles.emptyResultText}>
                        No sporting code, programme or organisational
                        affiliations are currently linked to this school in
                        the development register.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                developmentAffiliations.map((record, index) => (
                  <tr key={record.affiliationNumber}>
                    <td style={styles.tableCell}>
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td style={styles.tableCell}>
                      {record.affiliationNumber}
                    </td>

                    <td style={styles.tableCell}>{record.category}</td>

                    <td style={styles.tableCell}>
                      {record.organisation}
                    </td>

                    <td style={styles.tableCell}>
                      {record.sportingCode}
                    </td>

                    <td style={styles.tableCell}>{record.programme}</td>

                    <td style={styles.tableCell}>{record.startDate}</td>

                    <td style={styles.tableCell}>{record.endDate}</td>

                    <td style={styles.tableCell}>{record.status}</td>

                    <td style={styles.tableCell}>
                      <button type="button" style={styles.inlineButton}>
                        VIEW
                      </button>
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
            TOTAL AFFILIATIONS: {developmentAffiliations.length}
          </span>
        </div>
      </div>

      {/* 05 SPORTING CODES */}

      <SectionTitle
        number="05"
        title="SPORTING CODE AFFILIATIONS"
        reference="SCH/AFF/05"
      />

      <div style={styles.codeRegister}>
        <CodeRow number="05.1" code="Athletics" />
        <CodeRow number="05.2" code="Basketball" />
        <CodeRow number="05.3" code="Chess" />
        <CodeRow number="05.4" code="Cricket" />
        <CodeRow number="05.5" code="Cross Country" />
        <CodeRow number="05.6" code="Cycling" />
        <CodeRow number="05.7" code="Football" />
        <CodeRow number="05.8" code="Gymnastics" />
        <CodeRow number="05.9" code="Hockey" />
        <CodeRow number="05.10" code="Judo" />
        <CodeRow number="05.11" code="Netball" />
        <CodeRow number="05.12" code="Rugby" />
        <CodeRow number="05.13" code="Softball" />
        <CodeRow number="05.14" code="Swimming" />
        <CodeRow number="05.15" code="Table Tennis" />
        <CodeRow number="05.16" code="Tennis" />
        <CodeRow number="05.17" code="Volleyball" last />
      </div>

      {/* 06 FUNCTIONS */}

      <SectionTitle
        number="06"
        title="AFFILIATION FUNCTIONS"
        reference="SCH/AFF/06"
      />

      <div style={styles.functionPanel}>
        <FunctionRow
          number="06.1"
          title="Participants"
          description="View participant records currently affiliated with this school."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/participants`}
        />

        <FunctionRow
          number="06.2"
          title="School Documents"
          description="View applications, membership records and supporting school documents."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/documents`}
        />

        <FunctionRow
          number="06.3"
          title="Certificates"
          description="View registration and affiliation certificates issued to this school."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/certificates`}
        />

        <FunctionRow
          number="06.4"
          title="School Profile"
          description="Return to the main School Registry profile."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}`}
          last
        />
      </div>

      {/* 07 CONTROLS */}

      <SectionTitle
        number="07"
        title="AFFILIATION CONTROL RULES"
        reference="SCH/AFF/07"
      />

      <div style={styles.controlGrid}>
        <ControlPanel
          number="07.1"
          title="Permanent School Record"
          text="All affiliations must remain linked to the school's permanent AMS School Registry record."
        />

        <ControlPanel
          number="07.2"
          title="Historical Affiliations"
          text="Expired, transferred or closed affiliations must retain their dates and status for historical and audit purposes."
        />

        <ControlPanel
          number="07.3"
          title="Sporting Codes"
          text="Sporting code participation must be recorded as an affiliation rather than changing the school's permanent identity information."
        />

        <ControlPanel
          number="07.4"
          title="Programme Participation"
          text="WCSA programmes may be linked independently from sporting codes so programme participation can be reported separately."
        />
      </div>

      {/* 08 INFORMATION */}

      <SectionTitle
        number="08"
        title="REGISTER INFORMATION"
        reference="SCH/AFF/08"
      />

      <div style={styles.informationTable}>
        <InformationRow
          label="School Registry Number"
          value={registryNumber}
        />

        <InformationRow
          label="Register"
          value="School Affiliations"
        />

        <InformationRow
          label="Membership Type"
          value="School Membership"
        />

        <InformationRow
          label="Annual Membership Tariff"
          value="R350.00"
        />

        <InformationRow
          label="Affiliation Records"
          value={String(developmentAffiliations.length)}
        />

        <InformationRow
          label="Data Source"
          value="Development dataset — production Schools and Affiliations database connection pending"
          last
        />
      </div>

      {/* BOTTOM ACTIONS */}

      <div style={styles.bottomActions}>
        <Link
          href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
          style={styles.secondaryButton}
        >
          RETURN TO SCHOOL PROFILE
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/documents`}
          style={styles.primaryButton}
        >
          SCHOOL DOCUMENTS
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

function DataRow({
  number,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  last = false,
}: {
  number: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.dataRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.dataRowNumber}>{number}</div>
      <div style={styles.dataLabel}>{leftLabel}</div>
      <div style={styles.dataValue}>{leftValue}</div>
      <div style={styles.dataLabel}>{rightLabel}</div>

      <div
        style={{
          ...styles.dataValue,
          borderRight: "none",
        }}
      >
        {rightValue}
      </div>
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

function CodeRow({
  number,
  code,
  last = false,
}: {
  number: string;
  code: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.codeRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.codeNumber}>{number}</div>

      <div style={styles.codeName}>{code}</div>

      <div style={styles.codeStatus}>NOT LINKED</div>

      <div style={styles.codeAction}>
        <button type="button" style={styles.inlineButton}>
          MANAGE
        </button>
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
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    cursor: "pointer",
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
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
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

  dataTable: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  dataRow: {
    minHeight: "42px",
    display: "grid",
    gridTemplateColumns:
      "55px 155px minmax(160px, 1fr) 155px minmax(160px, 1fr)",
    borderBottom: `1px solid ${BORDER}`,
  },

  dataRowNumber: {
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

  dataLabel: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  dataValue: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: "#303b47",
    fontSize: "8px",
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
    backgroundColor: "#ffffff",
    border: "1px solid #ffffff",
    color: WCG_BLUE,
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
    fontSize: "7px",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1050px",
    borderCollapse: "collapse",
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
    maxWidth: "520px",
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

  inlineButton: {
    minHeight: "24px",
    padding: "0 8px",
    backgroundColor: "#ffffff",
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif',
    fontSize: "7px",
    fontWeight: 700,
    cursor: "pointer",
  },

  codeRegister: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  codeRow: {
    minHeight: "39px",
    display: "grid",
    gridTemplateColumns: "70px minmax(220px, 1fr) 180px 100px",
    borderBottom: `1px solid ${BORDER}`,
  },

  codeNumber: {
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

  codeName: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  codeStatus: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
  },

  codeAction: {
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  functionPanel: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  functionRow: {
    minHeight: "48px",
    display: "grid",
    gridTemplateColumns: "65px 190px minmax(250px, 1fr) 90px",
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