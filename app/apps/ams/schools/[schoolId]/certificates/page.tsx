import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const WCG_BLUE = "#001489";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type CertificateRecord = {
  certificateNumber: string;
  certificateType: string;
  academicYear: string;
  issueDate: string;
  validFrom: string;
  validUntil: string;
  status: string;
  version: string;
};

const developmentCertificates: CertificateRecord[] = [];

export default async function SchoolCertificatesPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const registryNumber = decodeURIComponent(schoolId);
  const currentDate = formatDate(new Date());

  const issuedCount = developmentCertificates.filter(
    (certificate) => certificate.status === "Issued"
  ).length;

  const validCount = developmentCertificates.filter(
    (certificate) => certificate.status === "Valid"
  ).length;

  const draftCount = developmentCertificates.filter(
    (certificate) =>
      certificate.status === "Draft" ||
      certificate.status === "Awaiting Approval"
  ).length;

  const historicalCount = developmentCertificates.filter(
    (certificate) =>
      certificate.status === "Expired" ||
      certificate.status === "Superseded" ||
      certificate.status === "Revoked"
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

          <strong>Certificates</strong>
        </div>

        <div style={styles.currentDate}>{currentDate}</div>
      </div>

      {/* PAGE HEADING */}

      <div style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY / CERTIFICATES
          </div>

          <h1 style={styles.pageTitle}>SCHOOL CERTIFICATES</h1>

          <p style={styles.pageSubtitle}>
            Generate, issue and maintain official school registration and
            affiliation certificates.
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
            GENERATE CERTIFICATE
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
          <span style={styles.referenceStatusLabel}>
            CERTIFICATE REGISTER
          </span>

          <span style={styles.referenceStatusValue}>
            REGISTRATION &amp; AFFILIATION
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
          style={styles.profileNavigationItem}
        >
          DOCUMENTS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/certificates`}
          style={styles.activeProfileNavigationItem}
        >
          CERTIFICATES
        </Link>
      </div>

      {/* NOTICE */}

      <div style={styles.notice}>
        <div style={styles.noticeMarker}>i</div>

        <div>
          <div style={styles.noticeTitle}>CERTIFICATE CONTROL</div>

          <div style={styles.noticeText}>
            Official certificates must only be issued after the required
            school registration, membership and approval controls have been
            completed. Issued certificates must remain in the audit history.
          </div>
        </div>

        <div style={styles.noticeReference}>AMS-SCH-CERT</div>
      </div>

      {/* 01 SUMMARY */}

      <SectionTitle
        number="01"
        title="CERTIFICATE REGISTER SUMMARY"
        reference="SCH/CERT/01"
      />

      <div style={styles.summaryRegister}>
        <SummaryItem
          number="01.1"
          label="TOTAL CERTIFICATES"
          value={String(developmentCertificates.length)}
        />

        <SummaryItem
          number="01.2"
          label="VALID"
          value={String(validCount)}
        />

        <SummaryItem
          number="01.3"
          label="ISSUED"
          value={String(issuedCount)}
        />

        <SummaryItem
          number="01.4"
          label="DRAFT / APPROVAL"
          value={String(draftCount)}
        />

        <SummaryItem
          number="01.5"
          label="HISTORICAL"
          value={String(historicalCount)}
          last
        />
      </div>

      {/* 02 ELIGIBILITY */}

      <SectionTitle
        number="02"
        title="CERTIFICATE ELIGIBILITY"
        reference="SCH/CERT/02"
      />

      <div style={styles.dataTable}>
        <DataRow
          number="02.1"
          leftLabel="School Registration"
          leftValue="Pending database connection"
          rightLabel="Registration Status"
          rightValue="Not available"
        />

        <DataRow
          number="02.2"
          leftLabel="Membership Type"
          leftValue="School Membership"
          rightLabel="Membership Status"
          rightValue="Pending database connection"
        />

        <DataRow
          number="02.3"
          leftLabel="Annual Tariff"
          leftValue="R350.00 / year"
          rightLabel="Finance Verification"
          rightValue="Not available"
        />

        <DataRow
          number="02.4"
          leftLabel="Approval Status"
          leftValue="Not available"
          rightLabel="Certificate Eligibility"
          rightValue="Pending verification"
          last
        />
      </div>

      {/* 03 SEARCH */}

      <SectionTitle
        number="03"
        title="SEARCH CERTIFICATES"
        reference="SCH/CERT/03"
      />

      <div style={styles.searchFrame}>
        <div style={styles.searchTitleBar}>
          <span>CERTIFICATE SEARCH</span>

          <span style={styles.searchTitleReference}>{registryNumber}</span>
        </div>

        <div style={styles.searchGrid}>
          <SearchField
            number="03.1"
            label="Certificate Number"
            placeholder="Enter certificate number"
          />

          <SearchField
            number="03.2"
            label="Certificate Type"
            placeholder="Enter certificate type"
          />

          <SearchField
            number="03.3"
            label="Year"
            placeholder="Enter certificate year"
          />

          <SearchField
            number="03.4"
            label="Status"
            placeholder="Enter certificate status"
          />
        </div>

        <div style={styles.searchActions}>
          <div style={styles.searchInformation}>
            Search certificates issued or prepared against this School
            Registry record.
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
        title="CERTIFICATE REGISTER"
        reference="SCH/CERT/04"
      />

      <div style={styles.tableFrame}>
        <div style={styles.tableTitleBar}>
          <div>
            <span style={styles.tableTitle}>CERTIFICATE RECORDS</span>

            <span style={styles.tableSubtitle}>
              {developmentCertificates.length} RECORD(S)
            </span>
          </div>

          <button type="button" style={styles.titleBarButton}>
            GENERATE CERTIFICATE
          </button>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeading}>NO.</th>
                <th style={styles.tableHeading}>CERTIFICATE NO.</th>
                <th style={styles.tableHeading}>TYPE</th>
                <th style={styles.tableHeading}>YEAR</th>
                <th style={styles.tableHeading}>ISSUE DATE</th>
                <th style={styles.tableHeading}>VALID FROM</th>
                <th style={styles.tableHeading}>VALID UNTIL</th>
                <th style={styles.tableHeading}>VERSION</th>
                <th style={styles.tableHeading}>STATUS</th>
                <th style={styles.tableHeading}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {developmentCertificates.length === 0 ? (
                <tr>
                  <td colSpan={10} style={styles.emptyCell}>
                    <div style={styles.emptyResults}>
                      <div style={styles.emptyResultCode}>SCH-CERT-000</div>

                      <div style={styles.emptyResultTitle}>
                        NO CERTIFICATES FOUND
                      </div>

                      <div style={styles.emptyResultText}>
                        No registration or affiliation certificates are
                        currently recorded for this school in the development
                        register.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                developmentCertificates.map((certificate, index) => (
                  <tr key={certificate.certificateNumber}>
                    <td style={styles.tableCell}>
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.certificateNumber}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.certificateType}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.academicYear}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.issueDate}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.validFrom}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.validUntil}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.version}
                    </td>

                    <td style={styles.tableCell}>
                      {certificate.status}
                    </td>

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
            TOTAL CERTIFICATES: {developmentCertificates.length}
          </span>
        </div>
      </div>

      {/* 05 CERTIFICATE TYPES */}

      <SectionTitle
        number="05"
        title="CERTIFICATE TYPES"
        reference="SCH/CERT/05"
      />

      <div style={styles.typeRegister}>
        <CertificateTypeRow
          number="05.1"
          title="Certificate of Registration"
          description="Confirms the school's registration in the MyWCSA School Registry."
        />

        <CertificateTypeRow
          number="05.2"
          title="Certificate of Registration and Affiliation"
          description="Confirms approved school registration and current WCSA affiliation."
        />

        <CertificateTypeRow
          number="05.3"
          title="Sporting Code Affiliation Certificate"
          description="Records approved participation or affiliation in an applicable sporting code."
        />

        <CertificateTypeRow
          number="05.4"
          title="Programme Participation Certificate"
          description="Records approved participation in an applicable WCSA programme."
          last
        />
      </div>

      {/* 06 LIFECYCLE */}

      <SectionTitle
        number="06"
        title="CERTIFICATE LIFECYCLE"
        reference="SCH/CERT/06"
      />

      <div style={styles.lifecycle}>
        <LifecycleItem
          number="01"
          title="DRAFT"
          description="Certificate record prepared."
        />

        <LifecycleArrow />

        <LifecycleItem
          number="02"
          title="AWAITING APPROVAL"
          description="Required approval pending."
        />

        <LifecycleArrow />

        <LifecycleItem
          number="03"
          title="ISSUED"
          description="Certificate officially issued."
        />

        <LifecycleArrow />

        <LifecycleItem
          number="04"
          title="VALID"
          description="Certificate currently valid."
        />

        <LifecycleArrow />

        <LifecycleItem
          number="05"
          title="CLOSED"
          description="Expired, superseded or revoked."
        />
      </div>

      {/* 07 CERTIFICATE INFORMATION */}

      <SectionTitle
        number="07"
        title="CERTIFICATE OUTPUT INFORMATION"
        reference="SCH/CERT/07"
      />

      <div style={styles.informationTable}>
        <InformationRow
          label="Organisation"
          value="Western Cape Sports Association"
        />

        <InformationRow
          label="School Registry Number"
          value={registryNumber}
        />

        <InformationRow
          label="Certificate Number"
          value="Generated by production certificate service"
        />

        <InformationRow
          label="Certificate Format"
          value="Official PDF document"
        />

        <InformationRow
          label="Verification"
          value="Public certificate verification service pending"
        />

        <InformationRow
          label="QR Verification"
          value="Production verification URL pending"
        />

        <InformationRow
          label="Template Version"
          value="Recorded against each issued certificate"
        />

        <InformationRow
          label="Audit Record"
          value="Production audit service pending connection"
          last
        />
      </div>

      {/* 08 CONTROL RULES */}

      <SectionTitle
        number="08"
        title="CERTIFICATE CONTROL RULES"
        reference="SCH/CERT/08"
      />

      <div style={styles.controlGrid}>
        <ControlPanel
          number="08.1"
          title="Unique Certificate Number"
          text="Every issued certificate must receive a unique certificate number generated by the production certificate service."
        />

        <ControlPanel
          number="08.2"
          title="Immutable Issued Record"
          text="Once issued, the certificate record should remain archived with its original issue information and template version."
        />

        <ControlPanel
          number="08.3"
          title="Superseded Certificates"
          text="A replacement certificate should create a new version or record while the previous certificate is marked as superseded."
        />

        <ControlPanel
          number="08.4"
          title="Revocation"
          text="Revoked certificates must remain searchable for audit purposes and must not appear as currently valid."
        />
      </div>

      {/* 09 FUNCTIONS */}

      <SectionTitle
        number="09"
        title="CERTIFICATE FUNCTIONS"
        reference="SCH/CERT/09"
      />

      <div style={styles.functionPanel}>
        <FunctionRow
          number="09.1"
          title="School Documents"
          description="Open the supporting document register for this school."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/documents`}
        />

        <FunctionRow
          number="09.2"
          title="School Affiliations"
          description="Review membership, sporting code and programme affiliations."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/affiliations`}
        />

        <FunctionRow
          number="09.3"
          title="Participants"
          description="Review participant affiliations linked to the school."
          href={`/apps/ams/schools/${encodeURIComponent(
            registryNumber
          )}/participants`}
        />

        <FunctionRow
          number="09.4"
          title="School Profile"
          description="Return to the permanent School Registry profile."
          href={`/apps/ams/schools/${encodeURIComponent(registryNumber)}`}
          last
        />
      </div>

      {/* 10 REGISTER INFORMATION */}

      <SectionTitle
        number="10"
        title="REGISTER INFORMATION"
        reference="SCH/CERT/10"
      />

      <div style={styles.informationTable}>
        <InformationRow
          label="School Registry Number"
          value={registryNumber}
        />

        <InformationRow
          label="Register"
          value="School Certificates"
        />

        <InformationRow
          label="Certificate Records"
          value={String(developmentCertificates.length)}
        />

        <InformationRow
          label="Certificate Generator"
          value="Production certificate service pending connection"
        />

        <InformationRow
          label="Approval Workflow"
          value="Production approval workflow pending connection"
        />

        <InformationRow
          label="Data Source"
          value="Development dataset — production Schools and Certificates services pending"
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

function CertificateTypeRow({
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
        ...styles.typeRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.typeNumber}>{number}</div>

      <div style={styles.typeTitle}>{title}</div>

      <div style={styles.typeDescription}>{description}</div>

      <div style={styles.typeStatus}>AVAILABLE</div>
    </div>
  );
}

function LifecycleItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div style={styles.lifecycleItem}>
      <div style={styles.lifecycleNumber}>{number}</div>
      <div style={styles.lifecycleTitle}>{title}</div>
      <div style={styles.lifecycleDescription}>{description}</div>
    </div>
  );
}

function LifecycleArrow() {
  return <div style={styles.lifecycleArrow}>›</div>;
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
    fontFamily: 'var(--font-system)',
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
    fontFamily: 'var(--font-system)',
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
    fontFamily: 'var(--font-system)',
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
    fontFamily: 'var(--font-system)',
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
    fontFamily: 'var(--font-system)',
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

  inlineButton: {
    minHeight: "24px",
    padding: "0 8px",
    backgroundColor: "#ffffff",
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    fontFamily: 'var(--font-system)',
    fontSize: "7px",
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

  typeRegister: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  typeRow: {
    minHeight: "47px",
    display: "grid",
    gridTemplateColumns: "65px 260px minmax(260px, 1fr) 110px",
    borderBottom: `1px solid ${BORDER}`,
  },

  typeNumber: {
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

  typeTitle: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  typeDescription: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.4,
  },

  typeStatus: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: WCG_BLUE,
    fontSize: "7px",
    fontWeight: 700,
  },

  lifecycle: {
    padding: "12px",
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  lifecycleItem: {
    flex: 1,
    minHeight: "83px",
    padding: "10px",
    boxSizing: "border-box",
    backgroundColor: PALE_BLUE,
    border: `1px solid ${BORDER}`,
  },

  lifecycleNumber: {
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
  },

  lifecycleTitle: {
    marginTop: "5px",
    color: WCG_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  lifecycleDescription: {
    marginTop: "5px",
    color: MUTED,
    fontSize: "7px",
    lineHeight: 1.4,
  },

  lifecycleArrow: {
    width: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: WCG_BLUE,
    fontSize: "22px",
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