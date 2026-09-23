"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

/* ============================================================
   MyWCSA AMS
   SCHOOL REGISTRY
   Staff Interface
   ============================================================ */

const WCG_BLUE = "#001489";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";

type SchoolRecord = {
  registryNumber: string;
  emisNumber: string;
  schoolName: string;
  district: string;
  circuit: string;
  principal: string;
  membershipStatus: string;
  registrationStatus: string;
  participantCount: number;
};

const developmentSchools: SchoolRecord[] = [];

export default function SchoolsPage() {
  const [schoolName, setSchoolName] = useState("");
  const [emisNumber, setEmisNumber] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [searchCompleted, setSearchCompleted] = useState(false);

  const currentDate = useMemo(() => formatDate(), []);

  const filteredSchools = useMemo(() => {
    if (!searchCompleted) {
      return developmentSchools;
    }

    return developmentSchools.filter((school) => {
      const matchesName =
        !schoolName.trim() ||
        school.schoolName
          .toLowerCase()
          .includes(schoolName.trim().toLowerCase());

      const matchesEmis =
        !emisNumber.trim() ||
        school.emisNumber.includes(emisNumber.trim());

      const matchesRegistry =
        !registryNumber.trim() ||
        school.registryNumber
          .toLowerCase()
          .includes(registryNumber.trim().toLowerCase());

      const matchesDistrict =
        !district || school.district === district;

      const matchesMembership =
        !membershipStatus ||
        school.membershipStatus === membershipStatus;

      const matchesRegistration =
        !registrationStatus ||
        school.registrationStatus === registrationStatus;

      return (
        matchesName &&
        matchesEmis &&
        matchesRegistry &&
        matchesDistrict &&
        matchesMembership &&
        matchesRegistration
      );
    });
  }, [
    district,
    emisNumber,
    membershipStatus,
    registrationStatus,
    registryNumber,
    schoolName,
    searchCompleted,
  ]);

  function searchRegistry() {
    setSearchCompleted(true);
  }

  function clearSearch() {
    setSchoolName("");
    setEmisNumber("");
    setRegistryNumber("");
    setDistrict("");
    setMembershipStatus("");
    setRegistrationStatus("");
    setSearchCompleted(false);
  }

  return (
    <div style={styles.page}>
      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <div style={styles.utilityRow}>
        <div style={styles.breadcrumb}>
          <Link href="/my-apps" style={styles.breadcrumbLink}>
            MyGovApps
          </Link>

          <span style={styles.separator}>/</span>

          <Link href="/apps/ams" style={styles.breadcrumbLink}>
            MyWCSA AMS
          </Link>

          <span style={styles.separator}>/</span>

          <strong>Schools</strong>
        </div>

        <div style={styles.date}>{currentDate}</div>
      </div>

      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <section style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY
          </div>

          <h1 style={styles.pageTitle}>SCHOOL REGISTRY</h1>

          <p style={styles.pageSubtitle}>
            Search, register and manage schools participating in the
            Western Cape Sports Association network.
          </p>
        </div>

        <Link
          href="/apps/ams/schools/register"
          style={styles.registerButton}
        >
          + REGISTER SCHOOL
        </Link>
      </section>

      {/* =====================================================
          NOTICE
          ===================================================== */}

      <div style={styles.notice}>
        <div style={styles.noticeMarker}>i</div>

        <div>
          <div style={styles.noticeTitle}>
            SEARCH BEFORE REGISTRATION
          </div>

          <div style={styles.noticeText}>
            Search the School Registry before creating a new school
            record. Existing schools should be updated rather than
            registered again.
          </div>
        </div>
      </div>

      {/* =====================================================
          01 SCHOOL SEARCH
          ===================================================== */}

      <SectionHeading
        number="01"
        title="SCHOOL SEARCH"
        reference="REGISTRY ENQUIRY"
      />

      <section style={styles.formFrame}>
        <div style={styles.formHeader}>
          <div>
            <span style={styles.formHeaderNumber}>01.1</span>
            SEARCH CRITERIA
          </div>

          <span style={styles.formHeaderReference}>
            SCHOOL REGISTRY
          </span>
        </div>

        <FormRow>
          <RowNumber value="01" />

          <FormLabel>School Name</FormLabel>

          <FormControl>
            <input
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
              placeholder="Enter school name"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>EMIS Number</FormLabel>

          <FormControl last>
            <input
              value={emisNumber}
              onChange={(event) => setEmisNumber(event.target.value)}
              placeholder="Enter EMIS number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>School Registry No.</FormLabel>

          <FormControl>
            <input
              value={registryNumber}
              onChange={(event) =>
                setRegistryNumber(event.target.value)
              }
              placeholder="e.g. SCH274821"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Education District</FormLabel>

          <FormControl last>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              style={styles.input}
            >
              <option value="">All districts</option>
              <option>Cape Winelands</option>
              <option>Cape Metro Central</option>
              <option>Cape Metro East</option>
              <option>Cape Metro North</option>
              <option>Cape Metro South</option>
              <option>Garden Route and Central Karoo</option>
              <option>Overberg</option>
              <option>West Coast</option>
            </select>
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="03" />

          <FormLabel>Membership Status</FormLabel>

          <FormControl>
            <select
              value={membershipStatus}
              onChange={(event) =>
                setMembershipStatus(event.target.value)
              }
              style={styles.input}
            >
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Expired</option>
              <option>Suspended</option>
              <option>Not Affiliated</option>
            </select>
          </FormControl>

          <FormLabel>Registration Status</FormLabel>

          <FormControl last>
            <select
              value={registrationStatus}
              onChange={(event) =>
                setRegistrationStatus(event.target.value)
              }
              style={styles.input}
            >
              <option value="">All statuses</option>
              <option>Registered</option>
              <option>Pending Verification</option>
              <option>Draft</option>
              <option>Inactive</option>
              <option>Archived</option>
            </select>
          </FormControl>
        </FormRow>

        <div style={styles.formActions}>
          <span style={styles.formHelp}>
            Enter one or more criteria to search the registry.
          </span>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={clearSearch}
              style={styles.secondaryButton}
            >
              CLEAR
            </button>

            <button
              type="button"
              onClick={searchRegistry}
              style={styles.primaryButton}
            >
              SEARCH SCHOOL REGISTRY
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          02 REGISTRY SUMMARY
          ===================================================== */}

      <SectionHeading
        number="02"
        title="REGISTRY SUMMARY"
        reference="CURRENT RECORDS"
      />

      <div style={styles.summaryGrid}>
        <SummaryItem
          number="01"
          label="Registered Schools"
          value="0"
        />

        <SummaryItem
          number="02"
          label="Active Memberships"
          value="0"
        />

        <SummaryItem
          number="03"
          label="Pending Verification"
          value="0"
        />

        <SummaryItem
          number="04"
          label="Participants Linked"
          value="0"
        />
      </div>

      {/* =====================================================
          03 SCHOOL RECORDS
          ===================================================== */}

      <SectionHeading
        number="03"
        title="SCHOOL RECORDS"
        reference={
          searchCompleted
            ? `${filteredSchools.length} RECORD(S)`
            : "REGISTRY RESULTS"
        }
      />

      <div style={styles.tableFrame}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <TableHeading width="42px">#</TableHeading>

                <TableHeading width="125px">
                  REGISTRY NO.
                </TableHeading>

                <TableHeading width="100px">
                  EMIS NO.
                </TableHeading>

                <TableHeading minWidth="210px">
                  SCHOOL
                </TableHeading>

                <TableHeading width="150px">
                  DISTRICT
                </TableHeading>

                <TableHeading width="115px">
                  MEMBERSHIP
                </TableHeading>

                <TableHeading width="115px">
                  REGISTRATION
                </TableHeading>

                <TableHeading width="95px">
                  PARTICIPANTS
                </TableHeading>

                <TableHeading width="80px">
                  ACTION
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school, index) => (
                  <tr key={school.registryNumber}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell strong>
                      {school.registryNumber}
                    </TableCell>

                    <TableCell>{school.emisNumber}</TableCell>

                    <TableCell>{school.schoolName}</TableCell>

                    <TableCell>{school.district}</TableCell>

                    <TableCell>
                      {school.membershipStatus}
                    </TableCell>

                    <TableCell>
                      {school.registrationStatus}
                    </TableCell>

                    <TableCell>
                      {school.participantCount}
                    </TableCell>

                    <TableCell last>
                      <Link
                        href={`/apps/ams/schools/${school.registryNumber}`}
                        style={styles.tableAction}
                      >
                        VIEW
                      </Link>
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={styles.emptyCell}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyCode}>
                        {searchCompleted
                          ? "NO RECORDS RETURNED"
                          : "AWAITING SEARCH"}
                      </div>

                      <div style={styles.emptyTitle}>
                        {searchCompleted
                          ? "NO MATCHING SCHOOL RECORDS"
                          : "SEARCH THE SCHOOL REGISTRY"}
                      </div>

                      <div style={styles.emptyText}>
                        {searchCompleted
                          ? "No school records match the current search criteria. This development registry does not yet contain live database records."
                          : "Use the search form above to locate an existing school before creating a new registration."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          04 REGISTRATION & AFFILIATION CONTROLS
          ===================================================== */}

      <SectionHeading
        number="04"
        title="REGISTRATION & AFFILIATION CONTROLS"
        reference="SCHOOL GOVERNANCE"
      />

      <div style={styles.controlGrid}>
        <ControlItem
          number="04.1"
          title="School Registration"
          text="Create and maintain the official AMS school registry record."
          href="/apps/ams/schools/register"
          action="REGISTER SCHOOL"
        />

        <ControlItem
          number="04.2"
          title="Membership & Affiliation"
          text="Manage annual WCSA school membership and affiliation status."
          href="/apps/ams/schools"
          action="VIEW REGISTRY"
        />

        <ControlItem
          number="04.3"
          title="School Participants"
          text="View learners, athletes, coaches, officials and other participants linked to schools."
          href="/apps/ams/participants"
          action="PARTICIPANTS"
        />

        <ControlItem
          number="04.4"
          title="Certificates"
          text="Manage registration and affiliation certificates issued to schools."
          href="/apps/ams/schools"
          action="CERTIFICATES"
        />
      </div>

      {/* =====================================================
          05 SCHOOL FUNCTIONS
          ===================================================== */}

      <SectionHeading
        number="05"
        title="SCHOOL FUNCTIONS"
        reference="AMS OPERATIONS"
      />

      <div style={styles.functionFrame}>
        <FunctionRow
          number="05.1"
          title="Register New School"
          description="Create a new school registry record after completing the duplicate search."
          href="/apps/ams/schools/register"
        />

        <FunctionRow
          number="05.2"
          title="Participant Management"
          description="Manage participants and sporting participation associated with registered schools."
          href="/apps/ams/participants"
        />

        <FunctionRow
          number="05.3"
          title="Documents & Certificates"
          description="Access school documentation, registration records and certificate functions."
          href="/apps/ams/schools"
        />

        <FunctionRow
          number="05.4"
          title="Affiliation Management"
          description="Manage school membership, sporting-code affiliations and historical affiliation records."
          href="/apps/ams/schools"
        />
      </div>

      {/* =====================================================
          06 REGISTRY INFORMATION
          ===================================================== */}

      <SectionHeading
        number="06"
        title="REGISTRY INFORMATION"
        reference="SYSTEM CONTROL"
      />

      <div style={styles.informationFrame}>
        <InformationRow
          label="Registry"
          value="MyWCSA AMS School Registry"
        />

        <InformationRow
          label="Registry Scope"
          value="Schools participating in WCSA programmes, memberships, sporting codes and related activities"
        />

        <InformationRow
          label="School Registry Number"
          value="Permanent internal MyWCSA identifier assigned after successful registration"
        />

        <InformationRow
          label="EMIS Number"
          value="Education Management Information System identifier where applicable"
        />

        <InformationRow
          label="Duplicate Control"
          value="Search and verify the existing School Registry before creating a new school record"
        />

        <InformationRow
          label="Development Status"
          value="Front-end registry interface — live AMS database integration pending"
          last
        />
      </div>

      <div style={styles.developmentNotice}>
        <strong>DEVELOPMENT MODE:</strong> The School Registry
        interface is ready for AMS database integration. Summary
        figures and search results currently remain empty until the
        Schools API and database are connected.
      </div>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function SectionHeading({
  number,
  title,
  reference,
}: {
  number: string;
  title: string;
  reference: string;
}) {
  return (
    <div style={styles.sectionHeading}>
      <div style={styles.sectionHeadingLeft}>
        <span style={styles.sectionNumber}>{number}</span>

        <span style={styles.sectionTitle}>{title}</span>
      </div>

      <span style={styles.sectionReference}>{reference}</span>
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={styles.formRow}>{children}</div>;
}

function RowNumber({ value }: { value: string }) {
  return <div style={styles.rowNumber}>{value}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <div style={styles.formLabel}>{children}</div>;
}

function FormControl({
  children,
  last = false,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.formControl,
        ...(last ? styles.formControlLast : {}),
      }}
    >
      {children}
    </div>
  );
}

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
      <div style={styles.summaryNumber}>{number}</div>

      <div style={styles.summaryContent}>
        <div style={styles.summaryLabel}>{label}</div>
        <div style={styles.summaryValue}>{value}</div>
      </div>
    </div>
  );
}

function TableHeading({
  children,
  width,
  minWidth,
}: {
  children: React.ReactNode;
  width?: string;
  minWidth?: string;
}) {
  return (
    <th
      style={{
        ...styles.tableHeading,
        ...(width ? { width } : {}),
        ...(minWidth ? { minWidth } : {}),
      }}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  strong = false,
  last = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <td
      style={{
        ...styles.tableCell,
        ...(strong ? styles.tableCellStrong : {}),
        ...(last ? styles.tableCellLast : {}),
      }}
    >
      {children}
    </td>
  );
}

function ControlItem({
  number,
  title,
  text,
  href,
  action,
}: {
  number: string;
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div style={styles.controlItem}>
      <div style={styles.controlNumber}>{number}</div>

      <div style={styles.controlBody}>
        <div style={styles.controlTitle}>{title}</div>

        <div style={styles.controlText}>{text}</div>

        <Link href={href} style={styles.controlAction}>
          {action} →
        </Link>
      </div>
    </div>
  );
}

function FunctionRow({
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
    <div style={styles.functionRow}>
      <div style={styles.functionNumber}>{number}</div>

      <div style={styles.functionTitle}>{title}</div>

      <div style={styles.functionDescription}>{description}</div>

      <div style={styles.functionActionCell}>
        <Link href={href} style={styles.functionAction}>
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
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.informationRow,
        ...(last ? styles.informationRowLast : {}),
      }}
    >
      <div style={styles.informationLabel}>{label}</div>

      <div style={styles.informationValue}>{value}</div>
    </div>
  );
}

/* ============================================================
   HELPERS
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

  utilityRow: {
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
  },

  breadcrumbLink: {
    color: TEXT_BLUE,
    textDecoration: "none",
  },

  separator: {
    color: "#9aa3ad",
  },

  date: {
    color: TEXT_BLUE,
    fontSize: "9px",
    whiteSpace: "nowrap",
  },

  pageHeading: {
    minHeight: "65px",

    marginBottom: "16px",
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
  },

  pageSubtitle: {
    margin: "4px 0 0",

    color: MUTED,

    fontSize: "10px",
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

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.2px",
  },

  notice: {
    marginBottom: "15px",

    padding: "9px 11px",

    display: "grid",

    gridTemplateColumns: "25px 1fr",

    gap: "9px",

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

    fontSize: "8px",
    fontWeight: 700,
  },

  noticeTitle: {
    color: WCG_BLUE,

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  noticeText: {
    marginTop: "2px",

    color: "#5e6b77",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  sectionHeading: {
    minHeight: "31px",

    marginTop: "17px",
    marginBottom: "7px",

    padding: "0 8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor: "rgba(255,255,255,0.94)",

    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  sectionHeadingLeft: {
    display: "flex",
    alignItems: "center",

    gap: "9px",
  },

  sectionNumber: {
    minWidth: "28px",

    color: WCG_BLUE,

    fontSize: "8px",
    fontWeight: 700,
  },

  sectionTitle: {
    color: TEXT_BLUE,

    fontSize: "9px",
    fontWeight: 700,

    letterSpacing: "0.4px",
  },

  sectionReference: {
    color: "#7b8792",

    fontSize: "7px",
    fontWeight: 600,
  },

  /* FORM */

  formFrame: {
    marginBottom: "14px",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  formHeader: {
    minHeight: "31px",

    padding: "0 10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    fontSize: "8px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  formHeaderNumber: {
    marginRight: "9px",

    color: "rgba(255,255,255,0.72)",

    fontSize: "7px",
  },

  formHeaderReference: {
    color: "rgba(255,255,255,0.76)",

    fontSize: "7px",
    fontWeight: 600,
  },

  formRow: {
    minHeight: "47px",

    display: "grid",

    gridTemplateColumns:
      "42px 150px minmax(170px, 1fr) 150px minmax(170px, 1fr)",

    alignItems: "stretch",

    borderBottom: `1px solid ${BORDER}`,
  },

  rowNumber: {
    padding: "7px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#f1f3f5",

    borderRight: `1px solid ${BORDER}`,

    color: "#6d7883",

    fontSize: "7px",
    fontWeight: 700,
  },

  formLabel: {
    padding: "7px 9px",

    display: "flex",
    alignItems: "center",

    backgroundColor: PALE_BLUE,

    borderRight: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "8px",
    fontWeight: 700,
  },

  formControl: {
    padding: "6px 7px",

    display: "flex",
    alignItems: "center",

    borderRight: `1px solid ${BORDER}`,
  },

  formControlLast: {
    borderRight: "none",
  },

  input: {
    width: "100%",
    height: "31px",

    boxSizing: "border-box",

    padding: "0 8px",

    backgroundColor: "#ffffff",

    border: "1px solid #9da7b1",
    borderRadius: 0,

    outline: "none",

    color: "#26323d",

    fontFamily: "inherit",

    fontSize: "9px",
  },

  formActions: {
    minHeight: "44px",

    padding: "6px 8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor: "#f7f8f9",
  },

  formHelp: {
    color: "#707b86",

    fontSize: "7px",
  },

  buttonGroup: {
    display: "flex",
    alignItems: "center",

    gap: "6px",
  },

  primaryButton: {
    minHeight: "31px",

    padding: "0 13px",

    backgroundColor: WCG_BLUE,

    border: `1px solid ${WCG_BLUE}`,

    color: "#ffffff",

    fontFamily: "inherit",

    fontSize: "7px",
    fontWeight: 700,

    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: "31px",

    padding: "0 12px",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontFamily: "inherit",

    fontSize: "7px",
    fontWeight: 700,

    cursor: "pointer",
  },

  /* SUMMARY */

  summaryGrid: {
    display: "grid",

    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  summaryItem: {
    minHeight: "64px",

    display: "grid",

    gridTemplateColumns: "37px 1fr",

    borderRight: `1px solid ${BORDER}`,
  },

  summaryNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: PALE_BLUE,

    borderRight: `1px solid ${BORDER}`,

    color: "#78838e",

    fontSize: "7px",
    fontWeight: 700,
  },

  summaryContent: {
    padding: "9px 10px",
  },

  summaryLabel: {
    color: "#65717c",

    fontSize: "7px",
    fontWeight: 700,

    textTransform: "uppercase",
  },

  summaryValue: {
    marginTop: "4px",

    color: WCG_BLUE,

    fontSize: "18px",
    fontWeight: 700,
  },

  /* TABLE */

  tableFrame: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  tableScroll: {
    width: "100%",

    overflowX: "auto",
  },

  table: {
    width: "100%",

    minWidth: "1100px",

    borderCollapse: "collapse",

    tableLayout: "fixed",
  },

  tableHeading: {
    padding: "7px 8px",

    backgroundColor: "#eef1f5",

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

    color: "#596570",

    fontSize: "8px",

    verticalAlign: "middle",
  },

  tableCellStrong: {
    color: TEXT_BLUE,
    fontWeight: 700,
  },

  tableCellLast: {
    borderRight: "none",
  },

  tableAction: {
    minHeight: "24px",

    padding: "0 8px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    textDecoration: "none",

    fontSize: "6px",
    fontWeight: 700,
  },

  emptyCell: {
    padding: 0,
  },

  emptyState: {
    minHeight: "125px",

    padding: "20px",

    display: "flex",
    flexDirection: "column",

    alignItems: "center",
    justifyContent: "center",

    textAlign: "center",
  },

  emptyCode: {
    color: "#7d8791",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  emptyTitle: {
    marginTop: "5px",

    color: TEXT_BLUE,

    fontSize: "9px",
    fontWeight: 700,
  },

  emptyText: {
    maxWidth: "560px",

    marginTop: "4px",

    color: "#707b86",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  /* CONTROL BLOCKS */

  controlGrid: {
    display: "grid",

    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",

    gap: "9px",
  },

  controlItem: {
    minHeight: "92px",

    display: "grid",

    gridTemplateColumns: "50px 1fr",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,
  },

  controlNumber: {
    paddingTop: "13px",

    backgroundColor: PALE_BLUE,

    borderRight: `1px solid ${BORDER}`,

    color: WCG_BLUE,

    fontSize: "8px",
    fontWeight: 700,

    textAlign: "center",
  },

  controlBody: {
    padding: "11px 12px",
  },

  controlTitle: {
    color: TEXT_BLUE,

    fontSize: "9px",
    fontWeight: 700,
  },

  controlText: {
    marginTop: "4px",

    color: "#687480",

    fontSize: "8px",

    lineHeight: 1.45,
  },

  controlAction: {
    marginTop: "8px",

    display: "inline-block",

    color: WCG_BLUE,

    textDecoration: "none",

    fontSize: "7px",
    fontWeight: 700,
  },

  /* FUNCTIONS */

  functionFrame: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  functionRow: {
    minHeight: "47px",

    display: "grid",

    gridTemplateColumns: "65px 190px 1fr 75px",

    borderBottom: `1px solid ${BORDER}`,
  },

  functionNumber: {
    padding: "8px",

    display: "flex",
    alignItems: "center",

    backgroundColor: "#f1f3f5",

    borderRight: `1px solid ${BORDER}`,

    color: "#697581",

    fontSize: "7px",
    fontWeight: 700,
  },

  functionTitle: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    backgroundColor: PALE_BLUE,

    borderRight: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "8px",
    fontWeight: 700,
  },

  functionDescription: {
    padding: "8px 10px",

    display: "flex",
    alignItems: "center",

    borderRight: `1px solid ${BORDER}`,

    color: "#66727e",

    fontSize: "8px",

    lineHeight: 1.4,
  },

  functionActionCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  functionAction: {
    color: WCG_BLUE,

    textDecoration: "none",

    fontSize: "7px",
    fontWeight: 700,
  },

  /* INFORMATION */

  informationFrame: {
    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  informationRow: {
    minHeight: "39px",

    display: "grid",

    gridTemplateColumns: "210px 1fr",

    borderBottom: `1px solid ${BORDER}`,
  },

  informationRowLast: {
    borderBottom: "none",
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

    color: "#616d78",

    fontSize: "8px",

    lineHeight: 1.4,
  },

  developmentNotice: {
    marginTop: "11px",

    padding: "9px 11px",

    backgroundColor: "#f6f2e9",

    borderLeft: "4px solid #9a7b3d",
    borderTop: "1px solid #ddd2b8",
    borderRight: "1px solid #ddd2b8",
    borderBottom: "1px solid #ddd2b8",

    color: "#6c603f",

    fontSize: "8px",

    lineHeight: 1.5,
  },
};