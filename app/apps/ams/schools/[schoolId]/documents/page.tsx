import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const WCG_BLUE = "#001489";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type SchoolDocument = {
  documentNumber: string;
  documentType: string;
  documentName: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  version: string;
};

const developmentDocuments: SchoolDocument[] = [];

export default async function SchoolDocumentsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const registryNumber = decodeURIComponent(schoolId);
  const currentDate = formatDate(new Date());

  const activeDocuments = developmentDocuments.filter(
    (document) => document.status === "Active"
  ).length;

  const pendingDocuments = developmentDocuments.filter(
    (document) => document.status === "Pending"
  ).length;

  const expiredDocuments = developmentDocuments.filter(
    (document) =>
      document.status === "Expired" ||
      document.status === "Superseded" ||
      document.status === "Archived"
  ).length;

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

          <strong>Documents</strong>
        </div>

        <div style={styles.currentDate}>{currentDate}</div>
      </div>

      {/* PAGE HEADING */}

      <div style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY / DOCUMENTS
          </div>

          <h1 style={styles.pageTitle}>SCHOOL DOCUMENTS</h1>

          <p style={styles.pageSubtitle}>
            Maintain official applications, membership records, supporting
            documents and correspondence linked to this school.
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
            ADD DOCUMENT
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
          <span style={styles.referenceStatusLabel}>DOCUMENT REGISTER</span>

          <span style={styles.referenceStatusValue}>
            SCHOOL RECORDS &amp; CORRESPONDENCE
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
          style={styles.profileNavigationItem}
        >
          AFFILIATIONS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/documents`}
          style={styles.activeProfileNavigationItem}
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
          <div style={styles.noticeTitle}>DOCUMENT CONTROL</div>

          <div style={styles.noticeText}>
            Documents must remain linked to the permanent School Registry
            record. Superseded or historical records should be retained for
            audit purposes rather than deleted.
          </div>
        </div>

        <div style={styles.noticeReference}>AMS-SCH-DOC</div>
      </div>

      {/* 01 SUMMARY */}

      <SectionTitle
        number="01"
        title="DOCUMENT REGISTER SUMMARY"
        reference="SCH/DOC/01"
      />

      <div style={styles.summaryRegister}>
        <SummaryItem
          number="01.1"
          label="TOTAL DOCUMENTS"
          value={String(developmentDocuments.length)}
        />

        <SummaryItem
          number="01.2"
          label="ACTIVE"
          value={String(activeDocuments)}
        />

        <SummaryItem
          number="01.3"
          label="PENDING"
          value={String(pendingDocuments)}
        />

        <SummaryItem
          number="01.4"
          label="ARCHIVED / EXPIRED"
          value={String(expiredDocuments)}
          last
        />
      </div>

      {/* 02 SEARCH */}

      <SectionTitle
        number="02"
        title="SEARCH SCHOOL DOCUMENTS"
        reference="SCH/DOC/02"
      />

      <div style={styles.searchFrame}>
        <div style={styles.searchTitleBar}>
          <span>DOCUMENT SEARCH</span>

          <span style={styles.searchTitleReference}>{registryNumber}</span>
        </div>

        <div style={styles.searchGrid}>
          <SearchField
            number="02.1"
            label="Document Number"
            placeholder="Enter document number"
          />

          <SearchField
            number="02.2"
            label="Document Type"
            placeholder="Enter document type"
          />

          <SearchField
            number="02.3"
            label="Document Name"
            placeholder="Enter document name"
          />

          <SearchField
            number="02.4"
            label="Category"
            placeholder="Enter category"
          />

          <SearchField
            number="02.5"
            label="Status"
            placeholder="Enter document status"
          />

          <SearchField
            number="02.6"
            label="Version"
            placeholder="Enter version"
          />
        </div>

        <div style={styles.searchActions}>
          <div style={styles.searchInformation}>
            Search documents maintained against this School Registry record.
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

      {/* 03 DOCUMENT REGISTER */}

      <SectionTitle
        number="03"
        title="SCHOOL DOCUMENT REGISTER"
        reference="SCH/DOC/03"
      />

      <div style={styles.tableFrame}>
        <div style={styles.tableTitleBar}>
          <div>
            <span style={styles.tableTitle}>DOCUMENT RECORDS</span>

            <span style={styles.tableSubtitle}>
              {developmentDocuments.length} RECORD(S)
            </span>
          </div>

          <button type="button" style={styles.titleBarButton}>
            ADD DOCUMENT
          </button>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeading}>NO.</th>
                <th style={styles.tableHeading}>DOCUMENT NO.</th>
                <th style={styles.tableHeading}>TYPE</th>
                <th style={styles.tableHeading}>DOCUMENT NAME</th>
                <th style={styles.tableHeading}>CATEGORY</th>
                <th style={styles.tableHeading}>ISSUE DATE</th>
                <th style={styles.tableHeading}>EXPIRY DATE</th>
                <th style={styles.tableHeading}>VERSION</th>
                <th style={styles.tableHeading}>STATUS</th>
                <th style={styles.tableHeading}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {developmentDocuments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={styles.emptyCell}>
                    <div style={styles.emptyResults}>
                      <div style={styles.emptyResultCode}>SCH-DOC-000</div>

                      <div style={styles.emptyResultTitle}>
                        NO SCHOOL DOCUMENTS FOUND
                      </div>

                      <div style={styles.emptyResultText}>
                        No documents are currently linked to this school in
                        the development register.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                developmentDocuments.map((document, index) => (
                  <tr key={document.documentNumber}>
                    <td style={styles.tableCell}>
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td style={styles.tableCell}>
                      {document.documentNumber}
                    </td>

                    <td style={styles.tableCell}>
                      {document.documentType}
                    </td>

                    <td style={styles.tableCell}>
                      {document.documentName}
                    </td>

                    <td style={styles.tableCell}>
                      {document.category}
                    </td>

                    <td style={styles.tableCell}>
                      {document.issueDate}
                    </td>

                    <td style={styles.tableCell}>
                      {document.expiryDate}
                    </td>

                    <td style={styles.tableCell}>{document.version}</td>

                    <td style={styles.tableCell}>{document.status}</td>

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

          <span>TOTAL DOCUMENTS: {developmentDocuments.length}</span>
        </div>
      </div>

      {/* 04 DOCUMENT CATEGORIES */}

      <SectionTitle
        number="04"
        title="DOCUMENT CATEGORIES"
        reference="SCH/DOC/04"
      />

      <div style={styles.categoryRegister}>
        <CategoryRow
          number="04.1"
          title="Registration & Membership"
          description="School registration forms, membership applications, renewals and approvals."
        />

        <CategoryRow
          number="04.2"
          title="Affiliation Records"
          description="Sporting code, programme and organisational affiliation documents."
        />

        <CategoryRow
          number="04.3"
          title="Finance & Payments"
          description="Invoices, receipts, payment confirmations and finance verification records."
        />

        <CategoryRow
          number="04.4"
          title="Governance & Compliance"
          description="Governance, declarations, compliance records and supporting approvals."
        />

        <CategoryRow
          number="04.5"
          title="Correspondence"
          description="Official letters, notices and communication issued to or received from the school."
        />

        <CategoryRow
          number="04.6"
          title="Supporting Documents"
          description="Other approved supporting evidence maintained against the school record."
          last
        />
      </div>

      {/* 05 DOCUMENT FUNCTIONS */}

      <SectionTitle
        number="05"
        title="DOCUMENT FUNCTIONS"
        reference="SCH/DOC/05"
      />

      <div style={styles.functionPanel}>
        <FunctionRow
          number="05.1"
          title="Certificates"
          description="Open the school's registration and affiliation certificate register."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/certificates`}
        />

        <FunctionRow
          number="05.2"
          title="Affiliations"
          description="View affiliations associated with the school and supporting affiliation records."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/affiliations`}
        />

        <FunctionRow
          number="05.3"
          title="Participants"
          description="View participant affiliations currently linked to the school."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/participants`}
        />

        <FunctionRow
          number="05.4"
          title="School Profile"
          description="Return to the permanent School Registry profile."
          href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
          last
        />
      </div>

      {/* 06 DOCUMENT CONTROLS */}

      <SectionTitle
        number="06"
        title="DOCUMENT CONTROL RULES"
        reference="SCH/DOC/06"
      />

      <div style={styles.controlGrid}>
        <ControlPanel
          number="06.1"
          title="Document Number"
          text="Official documents should receive a unique system document number when created or uploaded."
        />

        <ControlPanel
          number="06.2"
          title="Version Control"
          text="Where a document is replaced, the previous version should remain available in the record history rather than being overwritten without trace."
        />

        <ControlPanel
          number="06.3"
          title="Issue & Expiry"
          text="Documents with validity periods should retain issue and expiry dates so the system can identify current and expired records."
        />

        <ControlPanel
          number="06.4"
          title="Audit History"
          text="Production document actions should record the responsible user, date and time, action performed and resulting record status."
        />
      </div>

      {/* 07 INFORMATION */}

      <SectionTitle
        number="07"
        title="REGISTER INFORMATION"
        reference="SCH/DOC/07"
      />

      <div style={styles.informationTable}>
        <InformationRow
          label="School Registry Number"
          value={registryNumber}
        />

        <InformationRow
          label="Register"
          value="School Documents"
        />

        <InformationRow
          label="Document Records"
          value={String(developmentDocuments.length)}
        />

        <InformationRow
          label="Document Storage"
          value="Production document repository pending connection"
        />

        <InformationRow
          label="Audit Status"
          value="Production audit service pending connection"
        />

        <InformationRow
          label="Data Source"
          value="Development dataset — production Schools and Documents services pending"
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
          )}/certificates`}
          style={styles.primaryButton}
        >
          CERTIFICATES
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
        <input type="text" placeholder={placeholder} style={styles.input} />
      </div>
    </div>
  );
}

function CategoryRow({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.categoryRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.categoryNumber}>{number}</div>
      <div style={styles.categoryTitle}>{title}</div>
      <div style={styles.categoryDescription}>{description}</div>
      <div style={styles.categoryStatus}>AVAILABLE</div>
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
    fontFamily: 'var(--font-system)',
  },

  topUtilityRow: {
    minHeight: "28px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontFamily: 'var(--font-system)',
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  referenceStatusValue: {
    marginTop: "3px",
    color: TEXT_BLUE,
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  noticeTitle: {
    color: WCG_BLUE,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.4px",
  },

  noticeText: {
    marginTop: "2px",
    color: MUTED,
    fontSize: "13px",
    lineHeight: 1.45,
  },

  noticeReference: {
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  sectionHeading: {
    color: TEXT_BLUE,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  sectionReference: {
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  summaryLabel: {
    marginTop: "5px",
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  searchTitleReference: {
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  searchLabel: {
    padding: "7px 9px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "13px",
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
    fontFamily: 'var(--font-system)',
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontFamily: 'var(--font-system)',
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryActionButton: {
    minHeight: "28px",
    padding: "0 12px",
    backgroundColor: "#ffffff",
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    fontFamily: 'var(--font-system)',
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  tableSubtitle: {
    marginLeft: "10px",
    color: "#dce3f4",
    fontSize: "13px",
  },

  titleBarButton: {
    minHeight: "23px",
    padding: "0 8px",
    backgroundColor: "#ffffff",
    border: "1px solid #ffffff",
    color: WCG_BLUE,
    fontFamily: 'var(--font-system)',
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
    minWidth: "1050px",
    borderCollapse: "collapse",
    fontSize: "13px",
  },

  tableHeading: {
    padding: "8px",
    backgroundColor: TABLE_HEADER,
    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  tableCell: {
    padding: "8px",
    borderRight: `1px solid ${LIGHT_BORDER}`,
    borderBottom: `1px solid ${LIGHT_BORDER}`,
    color: "#303b47",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  inlineButton: {
    minHeight: "24px",
    padding: "0 8px",
    backgroundColor: "#ffffff",
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    fontFamily: 'var(--font-system)',
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
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
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  emptyResultTitle: {
    color: WCG_BLUE,
    fontSize: "13px",
    fontWeight: 700,
  },

  emptyResultText: {
    maxWidth: "520px",
    marginTop: "5px",
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  categoryRegister: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  categoryRow: {
    minHeight: "45px",
    display: "grid",
    gridTemplateColumns: "65px 210px minmax(250px, 1fr) 120px",
    borderBottom: `1px solid ${BORDER}`,
  },

  categoryNumber: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TABLE_HEADER,
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "13px",
    fontWeight: 700,
  },

  categoryTitle: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "13px",
    fontWeight: 700,
  },

  categoryDescription: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "13px",
    lineHeight: 1.4,
  },

  categoryStatus: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: WCG_BLUE,
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  functionTitle: {
    padding: "8px 11px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "13px",
    fontWeight: 700,
  },

  functionDescription: {
    padding: "8px 11px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  controlTitle: {
    color: TEXT_BLUE,
    fontSize: "13px",
    fontWeight: 700,
  },

  controlBody: {
    padding: "10px",
    color: MUTED,
    fontSize: "13px",
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
    fontSize: "13px",
    fontWeight: 700,
  },

  informationValue: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    color: "#303b47",
    fontSize: "13px",
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