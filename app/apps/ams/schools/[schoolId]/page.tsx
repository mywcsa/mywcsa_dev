import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const WCG_BLUE = "#001489";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type SchoolRecord = {
  registryNumber: string;
  schoolName: string;
  emisNumber: string;
  schoolType: string;
  sector: string;
  phase: string;
  registrationStatus: string;
  membershipStatus: string;
  membershipType: string;
  membershipYear: string;
  annualTariff: string;
  educationDistrict: string;
  circuitNumber: string;
  principal: string;
  deputyPrincipal: string;
  schoolEmail: string;
  telephone: string;
  alternativeTelephone: string;
  website: string;
  physicalAddress: string;
  postalCode: string;
  representative: string;
  representativePosition: string;
  representativeEmail: string;
  representativeMobile: string;
  participantCount: number;
  sportingCodeCount: number;
  documentCount: number;
  certificateCount: number;
  createdDate: string;
  lastModified: string;
  createdBy: string;
};

function getDevelopmentSchool(registryNumber: string): SchoolRecord {
  return {
    registryNumber,
    schoolName: "School Record",
    emisNumber: "Not provided",
    schoolType: "Not provided",
    sector: "Not provided",
    phase: "Not provided",
    registrationStatus: "Pending Verification",
    membershipStatus: "Pending",
    membershipType: "School Membership",
    membershipYear: "2026",
    annualTariff: "R350.00",
    educationDistrict: "Not provided",
    circuitNumber: "Not provided",
    principal: "Not provided",
    deputyPrincipal: "Not provided",
    schoolEmail: "Not provided",
    telephone: "Not provided",
    alternativeTelephone: "Not provided",
    website: "Not provided",
    physicalAddress: "Not provided",
    postalCode: "Not provided",
    representative: "Not provided",
    representativePosition: "Not provided",
    representativeEmail: "Not provided",
    representativeMobile: "Not provided",
    participantCount: 0,
    sportingCodeCount: 0,
    documentCount: 0,
    certificateCount: 0,
    createdDate: "Not available",
    lastModified: "Not available",
    createdBy: "Not available",
  };
}

export default async function SchoolProfilePage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;

  const registryNumber = decodeURIComponent(schoolId);
  const school = getDevelopmentSchool(registryNumber);
  const currentDate = formatDate(new Date());

  return (
    <main style={styles.page}>
      {/* =====================================================
          TOP UTILITY
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

          <Link href="/apps/ams/schools" style={styles.breadcrumbLink}>
            Schools
          </Link>

          <span style={styles.breadcrumbSeparator}>/</span>

          <strong>{school.registryNumber}</strong>
        </div>

        <div style={styles.currentDate}>{currentDate}</div>
      </div>

      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <div style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY / SCHOOL PROFILE
          </div>

          <h1 style={styles.pageTitle}>SCHOOL PROFILE</h1>

          <p style={styles.pageSubtitle}>
            View and manage the registered school record, participation,
            affiliations, documents and certificates.
          </p>
        </div>

        <div style={styles.headingActions}>
          <Link href="/apps/ams/schools" style={styles.secondaryButton}>
            BACK TO REGISTRY
          </Link>

          <Link
            href={`/apps/ams/schools/${encodeURIComponent(
              school.registryNumber
            )}/documents`}
            style={styles.primaryButton}
          >
            SCHOOL DOCUMENTS
          </Link>
        </div>
      </div>

      {/* =====================================================
          RECORD IDENTIFICATION
          ===================================================== */}

      <div style={styles.recordHeader}>
        <div style={styles.recordHeaderNumber}>
          <span style={styles.recordHeaderLabel}>SCHOOL REGISTRY NO.</span>

          <span style={styles.recordHeaderValue}>
            {school.registryNumber}
          </span>
        </div>

        <div style={styles.recordHeaderName}>
          <span style={styles.recordHeaderLabel}>REGISTERED SCHOOL</span>

          <span style={styles.recordSchoolName}>{school.schoolName}</span>
        </div>

        <div style={styles.recordStatusArea}>
          <span style={styles.recordHeaderLabel}>RECORD STATUS</span>

          <span style={styles.statusBadge}>
            {school.registrationStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* =====================================================
          PROFILE NAVIGATION
          ===================================================== */}

      <div style={styles.profileNavigation}>
        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}`}
          style={styles.activeProfileNavigationItem}
        >
          OVERVIEW
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/participants`}
          style={styles.profileNavigationItem}
        >
          PARTICIPANTS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/affiliations`}
          style={styles.profileNavigationItem}
        >
          AFFILIATIONS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/documents`}
          style={styles.profileNavigationItem}
        >
          DOCUMENTS
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/certificates`}
          style={styles.profileNavigationItem}
        >
          CERTIFICATES
        </Link>
      </div>

      {/* =====================================================
          DEVELOPMENT NOTICE
          ===================================================== */}

      <div style={styles.notice}>
        <div style={styles.noticeMarker}>i</div>

        <div style={styles.noticeContent}>
          <div style={styles.noticeTitle}>DEVELOPMENT RECORD</div>

          <div style={styles.noticeText}>
            This interface is ready for the Schools data service. School
            information shown as “Not provided” will be populated from the
            permanent AMS School Registry once the production database is
            connected.
          </div>
        </div>

        <div style={styles.noticeReference}>AMS-SCH-PROFILE</div>
      </div>

      {/* =====================================================
          01 RECORD SUMMARY
          ===================================================== */}

      <SectionTitle
        number="01"
        title="RECORD SUMMARY"
        reference="SCH/PROFILE/01"
      />

      <div style={styles.summaryRegister}>
        <SummaryItem
          number="01.1"
          label="REGISTRATION"
          value={school.registrationStatus}
        />

        <SummaryItem
          number="01.2"
          label="MEMBERSHIP"
          value={school.membershipStatus}
        />

        <SummaryItem
          number="01.3"
          label="PARTICIPANTS"
          value={String(school.participantCount)}
        />

        <SummaryItem
          number="01.4"
          label="SPORTING CODES"
          value={String(school.sportingCodeCount)}
          last
        />
      </div>

      {/* =====================================================
          02 SCHOOL DETAILS
          ===================================================== */}

      <SectionTitle
        number="02"
        title="SCHOOL DETAILS"
        reference="SCH/PROFILE/02"
      />

      <DataTable>
        <DataRow
          number="02.1"
          leftLabel="School Registry Number"
          leftValue={school.registryNumber}
          rightLabel="EMIS Number"
          rightValue={school.emisNumber}
        />

        <DataRow
          number="02.2"
          leftLabel="School Name"
          leftValue={school.schoolName}
          rightLabel="Registration Status"
          rightValue={school.registrationStatus}
        />

        <DataRow
          number="02.3"
          leftLabel="School Type"
          leftValue={school.schoolType}
          rightLabel="Sector"
          rightValue={school.sector}
        />

        <DataRow
          number="02.4"
          leftLabel="Phase"
          leftValue={school.phase}
          rightLabel="Education District"
          rightValue={school.educationDistrict}
        />

        <DataRow
          number="02.5"
          leftLabel="Circuit Number"
          leftValue={school.circuitNumber}
          rightLabel="Record Year"
          rightValue={school.membershipYear}
          last
        />
      </DataTable>

      {/* =====================================================
          03 MANAGEMENT & CONTACT
          ===================================================== */}

      <SectionTitle
        number="03"
        title="MANAGEMENT & CONTACT INFORMATION"
        reference="SCH/PROFILE/03"
      />

      <DataTable>
        <DataRow
          number="03.1"
          leftLabel="Principal"
          leftValue={school.principal}
          rightLabel="Deputy Principal"
          rightValue={school.deputyPrincipal}
        />

        <DataRow
          number="03.2"
          leftLabel="School Email"
          leftValue={school.schoolEmail}
          rightLabel="Telephone"
          rightValue={school.telephone}
        />

        <DataRow
          number="03.3"
          leftLabel="Alternative Telephone"
          leftValue={school.alternativeTelephone}
          rightLabel="Website"
          rightValue={school.website}
        />

        <DataRow
          number="03.4"
          leftLabel="Physical Address"
          leftValue={school.physicalAddress}
          rightLabel="Postal Code"
          rightValue={school.postalCode}
          last
        />
      </DataTable>

      {/* =====================================================
          04 WCSA MEMBERSHIP
          ===================================================== */}

      <SectionTitle
        number="04"
        title="WCSA MEMBERSHIP & PARTICIPATION"
        reference="SCH/PROFILE/04"
      />

      <DataTable>
        <DataRow
          number="04.1"
          leftLabel="Membership Type"
          leftValue={school.membershipType}
          rightLabel="Membership Status"
          rightValue={school.membershipStatus}
        />

        <DataRow
          number="04.2"
          leftLabel="Membership Year"
          leftValue={school.membershipYear}
          rightLabel="Annual Tariff"
          rightValue={school.annualTariff}
        />

        <DataRow
          number="04.3"
          leftLabel="Registered Participants"
          leftValue={String(school.participantCount)}
          rightLabel="Active Sporting Codes"
          rightValue={String(school.sportingCodeCount)}
          last
        />
      </DataTable>

      {/* =====================================================
          05 SCHOOL REPRESENTATIVE
          ===================================================== */}

      <SectionTitle
        number="05"
        title="WCSA SCHOOL REPRESENTATIVE"
        reference="SCH/PROFILE/05"
      />

      <DataTable>
        <DataRow
          number="05.1"
          leftLabel="Representative"
          leftValue={school.representative}
          rightLabel="Position"
          rightValue={school.representativePosition}
        />

        <DataRow
          number="05.2"
          leftLabel="Email Address"
          leftValue={school.representativeEmail}
          rightLabel="Mobile Number"
          rightValue={school.representativeMobile}
          last
        />
      </DataTable>

      {/* =====================================================
          06 SCHOOL FUNCTIONS
          ===================================================== */}

      <SectionTitle
        number="06"
        title="SCHOOL FUNCTIONS"
        reference="SCH/PROFILE/06"
      />

      <div style={styles.functionPanel}>
        <FunctionRow
          number="06.1"
          title="Participants"
          description="View participants currently linked to this school record."
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/participants`}
        />

        <FunctionRow
          number="06.2"
          title="Affiliations"
          description="Manage sporting codes, programmes and organisation affiliations."
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/affiliations`}
        />

        <FunctionRow
          number="06.3"
          title="Documents"
          description="View school applications, supporting records and official documents."
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/documents`}
        />

        <FunctionRow
          number="06.4"
          title="Certificates"
          description="View and manage registration and affiliation certificates."
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/certificates`}
          last
        />
      </div>

      {/* =====================================================
          07 DOCUMENT SUMMARY
          ===================================================== */}

      <SectionTitle
        number="07"
        title="DOCUMENT & CERTIFICATE REGISTER"
        reference="SCH/PROFILE/07"
      />

      <div style={styles.documentRegister}>
        <div style={styles.documentRegisterHeader}>
          <div style={styles.documentRegisterHeadingNumber}>NO.</div>
          <div style={styles.documentRegisterHeading}>REGISTER</div>
          <div style={styles.documentRegisterHeading}>RECORDS</div>
          <div style={styles.documentRegisterHeading}>STATUS</div>
          <div style={styles.documentRegisterHeading}>ACTION</div>
        </div>

        <DocumentRow
          number="07.1"
          register="School Documents"
          records={school.documentCount}
          status="Available"
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/documents`}
        />

        <DocumentRow
          number="07.2"
          register="Certificates"
          records={school.certificateCount}
          status="Available"
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/certificates`}
          last
        />
      </div>

      {/* =====================================================
          08 RECORD ADMINISTRATION
          ===================================================== */}

      <SectionTitle
        number="08"
        title="RECORD ADMINISTRATION"
        reference="SCH/PROFILE/08"
      />

      <DataTable>
        <DataRow
          number="08.1"
          leftLabel="Created Date"
          leftValue={school.createdDate}
          rightLabel="Created By"
          rightValue={school.createdBy}
        />

        <DataRow
          number="08.2"
          leftLabel="Last Modified"
          leftValue={school.lastModified}
          rightLabel="Registry Status"
          rightValue={school.registrationStatus}
          last
        />
      </DataTable>

      {/* =====================================================
          09 RECORD CONTROLS
          ===================================================== */}

      <SectionTitle
        number="09"
        title="RECORD CONTROLS"
        reference="SCH/PROFILE/09"
      />

      <div style={styles.controlGrid}>
        <ControlPanel
          number="09.1"
          title="Record Integrity"
          text="The School Registry Number identifies this school record within MyWCSA AMS. Production changes must be recorded through the system audit history."
        />

        <ControlPanel
          number="09.2"
          title="Affiliation Control"
          text="School affiliations, sporting codes and programme participation should be maintained against the permanent school record rather than duplicated as separate school records."
        />

        <ControlPanel
          number="09.3"
          title="Participant Control"
          text="Participants linked to the school remain individual provincial participant records. The school relationship is maintained as an affiliation."
        />

        <ControlPanel
          number="09.4"
          title="Document Control"
          text="Issued certificates and formal documents should retain their issue date, document number, status, template version and audit information."
        />
      </div>

      {/* =====================================================
          BOTTOM ACTIONS
          ===================================================== */}

      <div style={styles.bottomActions}>
        <Link href="/apps/ams/schools" style={styles.secondaryButton}>
          RETURN TO SCHOOL REGISTRY
        </Link>

        <Link
          href={`/apps/ams/schools/${encodeURIComponent(
            school.registryNumber
          )}/participants`}
          style={styles.primaryButton}
        >
          VIEW SCHOOL PARTICIPANTS
        </Link>
      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTS
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

function DataTable({ children }: { children: ReactNode }) {
  return <div style={styles.dataTable}>{children}</div>;
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

function DocumentRow({
  number,
  register,
  records,
  status,
  href,
  last = false,
}: {
  number: string;
  register: string;
  records: number;
  status: string;
  href: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.documentRegisterRow,
        ...(last ? { borderBottom: "none" } : {}),
      }}
    >
      <div style={styles.documentNumber}>{number}</div>

      <div style={styles.documentValue}>{register}</div>

      <div style={styles.documentValue}>{records}</div>

      <div style={styles.documentValue}>{status}</div>

      <div
        style={{
          ...styles.documentValue,
          borderRight: "none",
        }}
      >
        <Link href={href} style={styles.tableAction}>
          OPEN REGISTER
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

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/* ============================================================
   STYLES
   ============================================================ */

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

  breadcrumbSeparator: {
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

  recordHeader: {
    minHeight: "70px",
    marginBottom: "9px",
    display: "grid",
    gridTemplateColumns: "230px minmax(250px, 1fr) 210px",
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  recordHeaderNumber: {
    padding: "11px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRight: `1px solid ${BORDER}`,
  },

  recordHeaderName: {
    padding: "11px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRight: `1px solid ${BORDER}`,
  },

  recordStatusArea: {
    padding: "11px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  recordHeaderLabel: {
    marginBottom: "5px",
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  recordHeaderValue: {
    color: WCG_BLUE,
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  recordSchoolName: {
    color: TEXT_BLUE,
    fontSize: "15px",
    fontWeight: 700,
  },

  statusBadge: {
    width: "fit-content",
    padding: "5px 8px",
    backgroundColor: PALE_BLUE,
    border: `1px solid ${WCG_BLUE}`,
    color: WCG_BLUE,
    fontSize: "8px",
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
    letterSpacing: "0.3px",
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
    letterSpacing: "0.3px",
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

  noticeContent: {
    minWidth: 0,
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
    letterSpacing: "0.3px",
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
    lineHeight: 1.2,
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
    alignItems: "stretch",
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
    fontSize: "9px",
    lineHeight: 1.35,
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

  documentRegister: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  documentRegisterHeader: {
    minHeight: "34px",
    display: "grid",
    gridTemplateColumns: "65px minmax(250px, 1fr) 120px 150px 150px",
    alignItems: "stretch",
    backgroundColor: TABLE_HEADER,
    borderBottom: `1px solid ${BORDER}`,
  },

  documentRegisterHeadingNumber: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  documentRegisterHeading: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  documentRegisterRow: {
    minHeight: "42px",
    display: "grid",
    gridTemplateColumns: "65px minmax(250px, 1fr) 120px 150px 150px",
    alignItems: "stretch",
    borderBottom: `1px solid ${BORDER}`,
  },

  documentNumber: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: MUTED,
    fontSize: "8px",
    fontWeight: 700,
  },

  documentValue: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    borderRight: `1px solid ${BORDER}`,
    color: "#303b47",
    fontSize: "8px",
  },

  tableAction: {
    color: WCG_BLUE,
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
    letterSpacing: "0.3px",
  },

  controlBody: {
    padding: "10px",
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.5,
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