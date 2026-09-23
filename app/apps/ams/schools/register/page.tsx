"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const WCG_BLUE = "#001489";
const DARK_BLUE = "#00105f";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type SchoolData = {
  schoolName: string;
  emisNumber: string;
  schoolType: string;
  sector: string;
  phase: string;
  registrationStatus: string;

  principalTitle: string;
  principalFirstName: string;
  principalSurname: string;
  deputyPrincipal: string;
  schoolEmail: string;
  telephone: string;
  alternativeTelephone: string;
  website: string;

  addressLine1: string;
  addressLine2: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;
  educationDistrict: string;
  circuitNumber: string;

  membershipType: string;
  participationStatus: string;
  primarySportingCode: string;
  additionalSportingCodes: string;
  representativeName: string;
  representativePosition: string;
  representativeEmail: string;
  representativeMobile: string;

  notes: string;
};

type DuplicateSearch = {
  schoolName: string;
  emisNumber: string;
  registryNumber: string;
};

const initialSchoolData: SchoolData = {
  schoolName: "",
  emisNumber: "",
  schoolType: "",
  sector: "",
  phase: "",
  registrationStatus: "Pending Verification",

  principalTitle: "",
  principalFirstName: "",
  principalSurname: "",
  deputyPrincipal: "",
  schoolEmail: "",
  telephone: "",
  alternativeTelephone: "",
  website: "",

  addressLine1: "",
  addressLine2: "",
  suburb: "",
  townCity: "",
  province: "Western Cape",
  postalCode: "",
  educationDistrict: "",
  circuitNumber: "",

  membershipType: "School Membership",
  participationStatus: "",
  primarySportingCode: "",
  additionalSportingCodes: "",
  representativeName: "",
  representativePosition: "",
  representativeEmail: "",
  representativeMobile: "",

  notes: "",
};

const initialDuplicateSearch: DuplicateSearch = {
  schoolName: "",
  emisNumber: "",
  registryNumber: "",
};

const workflow = [
  { number: "01", title: "Duplicate Check" },
  { number: "02", title: "School Details" },
  { number: "03", title: "Contact & Management" },
  { number: "04", title: "Address & Education" },
  { number: "05", title: "Participation & Affiliations" },
  { number: "06", title: "Review & Register" },
];

export default function RegisterSchoolPage() {
  const [step, setStep] = useState(1);
  const [school, setSchool] = useState<SchoolData>(initialSchoolData);
  const [duplicateSearch, setDuplicateSearch] =
    useState<DuplicateSearch>(initialDuplicateSearch);

  const [duplicateSearchCompleted, setDuplicateSearchCompleted] =
    useState(false);
  const [searching, setSearching] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentDate = useMemo(() => formatDate(new Date()), []);

  const developmentRegistryNumber = useMemo(
    () => buildDevelopmentSchoolRegistryNumber(school),
    [school]
  );

  function updateSchool<K extends keyof SchoolData>(
    field: K,
    value: SchoolData[K]
  ) {
    setSchool((current) => ({
      ...current,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function updateDuplicateSearch<K extends keyof DuplicateSearch>(
    field: K,
    value: DuplicateSearch[K]
  ) {
    setDuplicateSearch((current) => ({
      ...current,
      [field]: value,
    }));

    setDuplicateSearchCompleted(false);
    setErrorMessage("");
  }

  function clearDuplicateSearch() {
    setDuplicateSearch(initialDuplicateSearch);
    setDuplicateSearchCompleted(false);
    setErrorMessage("");
  }

  async function runDuplicateSearch() {
    const hasSearchValue = Object.values(duplicateSearch).some(
      (value) => value.trim().length > 0
    );

    if (!hasSearchValue) {
      setErrorMessage(
        "Enter a school name, EMIS number or School Registry Number before searching."
      );
      return;
    }

    setSearching(true);
    setErrorMessage("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    setSearching(false);
    setDuplicateSearchCompleted(true);

    if (duplicateSearch.schoolName.trim()) {
      updateSchool("schoolName", duplicateSearch.schoolName.trim());
    }

    if (duplicateSearch.emisNumber.trim()) {
      updateSchool("emisNumber", duplicateSearch.emisNumber.trim());
    }
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!duplicateSearchCompleted) {
        setErrorMessage(
          "Complete the School Registry duplicate search before continuing."
        );
        return false;
      }
    }

    if (step === 2) {
      if (!school.schoolName.trim()) {
        setErrorMessage("School Name is required.");
        return false;
      }

      if (!school.schoolType) {
        setErrorMessage("School Type is required.");
        return false;
      }

      if (!school.sector) {
        setErrorMessage("School Sector is required.");
        return false;
      }

      if (!school.phase) {
        setErrorMessage("School Phase is required.");
        return false;
      }
    }

    if (step === 3) {
      if (!school.principalFirstName.trim()) {
        setErrorMessage("Principal First Name is required.");
        return false;
      }

      if (!school.principalSurname.trim()) {
        setErrorMessage("Principal Surname is required.");
        return false;
      }

      if (!school.schoolEmail.trim()) {
        setErrorMessage("School Email Address is required.");
        return false;
      }

      if (!school.telephone.trim()) {
        setErrorMessage("School Telephone Number is required.");
        return false;
      }
    }

    if (step === 4) {
      if (!school.addressLine1.trim()) {
        setErrorMessage("Physical Address is required.");
        return false;
      }

      if (!school.townCity.trim()) {
        setErrorMessage("Town / City is required.");
        return false;
      }

      if (!school.educationDistrict) {
        setErrorMessage("Education District is required.");
        return false;
      }
    }

    if (step === 5) {
      if (!school.participationStatus) {
        setErrorMessage("WCSA Participation Status is required.");
        return false;
      }

      if (!school.representativeName.trim()) {
        setErrorMessage("School Representative Name is required.");
        return false;
      }

      if (!school.representativePosition.trim()) {
        setErrorMessage("School Representative Position is required.");
        return false;
      }
    }

    setErrorMessage("");
    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;

    setStep((current) => Math.min(current + 1, 6));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    setErrorMessage("");
    setStep((current) => Math.max(current - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToStep(targetStep: number) {
    if (targetStep >= step) return;

    setErrorMessage("");
    setStep(targetStep);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function completeRegistration() {
    if (!declarationAccepted) {
      setErrorMessage(
        "Confirm the registration declaration before registering the school."
      );
      return;
    }

    setErrorMessage("");
    setRegistrationComplete(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (registrationComplete) {
    return (
      <div style={styles.page}>
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

            <Link href="/apps/ams/schools" style={styles.breadcrumbLink}>
              Schools
            </Link>

            <span style={styles.separator}>/</span>

            <strong>Registration Complete</strong>
          </div>

          <div style={styles.date}>{currentDate}</div>
        </div>

        <section style={styles.pageHeading}>
          <div>
            <div style={styles.pageReference}>
              AMS / SCHOOL REGISTRY / REGISTRATION
            </div>

            <h1 style={styles.pageTitle}>SCHOOL REGISTRATION COMPLETE</h1>

            <p style={styles.pageSubtitle}>
              Development registration workflow completed successfully.
            </p>
          </div>
        </section>

        <div style={styles.successBanner}>
          <div style={styles.successCode}>REGISTRATION COMPLETED</div>

          <div style={styles.successTitle}>{school.schoolName}</div>

          <div style={styles.successText}>
            The registration workflow has been completed in the current
            development interface.
          </div>
        </div>

        <SectionHeading
          number="01"
          title="REGISTRATION RESULT"
          reference="DEVELOPMENT ENVIRONMENT"
        />

        <div style={styles.informationFrame}>
          <InformationRow
            label="School Name"
            value={displayValue(school.schoolName)}
          />

          <InformationRow
            label="EMIS Number"
            value={displayValue(school.emisNumber)}
          />

          <InformationRow
            label="School Registry Number"
            value={developmentRegistryNumber}
          />

          <InformationRow
            label="Education District"
            value={displayValue(school.educationDistrict)}
          />

          <InformationRow
            label="Registration Status"
            value={school.registrationStatus}
          />

          <InformationRow
            label="Membership Type"
            value={school.membershipType}
            last
          />
        </div>

        <div style={styles.developmentNotice}>
          <strong>DEVELOPMENT CONTROL:</strong> No production database record
          has been created. The School Registry Number displayed above is a
          development preview only. The production backend must allocate the
          official permanent number and write the registration, audit history
          and affiliation records transactionally.
        </div>

        <div style={styles.successActions}>
          <Link href="/apps/ams/schools" style={styles.secondaryLinkButton}>
            RETURN TO SCHOOL REGISTRY
          </Link>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => {
              setSchool(initialSchoolData);
              setDuplicateSearch(initialDuplicateSearch);
              setDuplicateSearchCompleted(false);
              setDeclarationAccepted(false);
              setRegistrationComplete(false);
              setStep(1);
            }}
          >
            REGISTER ANOTHER SCHOOL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
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

          <Link href="/apps/ams/schools" style={styles.breadcrumbLink}>
            Schools
          </Link>

          <span style={styles.separator}>/</span>

          <strong>Register School</strong>
        </div>

        <div style={styles.date}>{currentDate}</div>
      </div>

      <section style={styles.pageHeading}>
        <div>
          <div style={styles.pageReference}>
            AMS / SCHOOL REGISTRY / NEW REGISTRATION
          </div>

          <h1 style={styles.pageTitle}>REGISTER SCHOOL</h1>

          <p style={styles.pageSubtitle}>
            Create and verify a new school record in the MyWCSA AMS School
            Registry.
          </p>
        </div>

        <Link href="/apps/ams/schools" style={styles.cancelButton}>
          CANCEL REGISTRATION
        </Link>
      </section>

      <div style={styles.workflow}>
        {workflow.map((item, index) => {
          const itemStep = index + 1;
          const active = itemStep === step;
          const completed = itemStep < step;

          return (
            <button
              key={item.number}
              type="button"
              onClick={() => goToStep(itemStep)}
              disabled={itemStep >= step}
              style={{
                ...styles.workflowItem,
                ...(active ? styles.workflowItemActive : {}),
                ...(completed ? styles.workflowItemCompleted : {}),
              }}
            >
              <span
                style={{
                  ...styles.workflowNumber,
                  ...(active ? styles.workflowNumberActive : {}),
                }}
              >
                {item.number}
              </span>

              <span style={styles.workflowTitle}>{item.title}</span>
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div style={styles.errorNotice}>
          <strong>ATTENTION:</strong> {errorMessage}
        </div>
      )}

      {step === 1 && (
        <DuplicateCheckStep
          search={duplicateSearch}
          completed={duplicateSearchCompleted}
          searching={searching}
          updateSearch={updateDuplicateSearch}
          clearSearch={clearDuplicateSearch}
          runSearch={runDuplicateSearch}
        />
      )}

      {step === 2 && (
        <SchoolDetailsStep school={school} updateSchool={updateSchool} />
      )}

      {step === 3 && (
        <ContactManagementStep
          school={school}
          updateSchool={updateSchool}
        />
      )}

      {step === 4 && (
        <AddressEducationStep
          school={school}
          updateSchool={updateSchool}
        />
      )}

      {step === 5 && (
        <ParticipationAffiliationStep
          school={school}
          updateSchool={updateSchool}
        />
      )}

      {step === 6 && (
        <ReviewStep
          school={school}
          registryNumber={developmentRegistryNumber}
          declarationAccepted={declarationAccepted}
          setDeclarationAccepted={setDeclarationAccepted}
        />
      )}

      <div style={styles.navigationBar}>
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={previousStep}
              style={styles.secondaryButton}
            >
              ← PREVIOUS
            </button>
          )}
        </div>

        <div style={styles.navigationRight}>
          <span style={styles.stepIndicator}>STEP {step} OF 6</span>

          {step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              style={styles.primaryButton}
            >
              CONTINUE →
            </button>
          ) : (
            <button
              type="button"
              onClick={completeRegistration}
              style={styles.primaryButton}
            >
              REGISTER SCHOOL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 01
   ============================================================ */

function DuplicateCheckStep({
  search,
  completed,
  searching,
  updateSearch,
  clearSearch,
  runSearch,
}: {
  search: DuplicateSearch;
  completed: boolean;
  searching: boolean;
  updateSearch: <K extends keyof DuplicateSearch>(
    field: K,
    value: DuplicateSearch[K]
  ) => void;
  clearSearch: () => void;
  runSearch: () => void;
}) {
  return (
    <>
      <StepHeading
        number="01"
        title="DUPLICATE CHECK"
        text="Search the existing School Registry before creating a new school record."
      />

      <div style={styles.notice}>
        <div style={styles.noticeMarker}>i</div>

        <div>
          <div style={styles.noticeTitle}>MANDATORY REGISTRY SEARCH</div>

          <div style={styles.noticeText}>
            A school must not be registered twice. Search by school name, EMIS
            number or an existing MyWCSA School Registry Number. If a matching
            school exists, use the existing record instead of creating a
            duplicate.
          </div>
        </div>
      </div>

      <FormFrame title="01.1 SCHOOL REGISTRY SEARCH">
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>School Name</FormLabel>

          <FormControl>
            <input
              value={search.schoolName}
              onChange={(event) =>
                updateSearch("schoolName", event.target.value)
              }
              placeholder="Enter school name"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>EMIS Number</FormLabel>

          <FormControl last>
            <input
              value={search.emisNumber}
              onChange={(event) =>
                updateSearch("emisNumber", event.target.value)
              }
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
              value={search.registryNumber}
              onChange={(event) =>
                updateSearch("registryNumber", event.target.value)
              }
              placeholder="e.g. SCH274821"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Search Scope</FormLabel>

          <FormControl last>
            <div style={styles.readOnlyValue}>
              MyWCSA AMS Provincial School Registry
            </div>
          </FormControl>
        </FormRow>

        <div style={styles.formActions}>
          <span style={styles.formHelp}>
            At least one search criterion is required.
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
              onClick={runSearch}
              disabled={searching}
              style={{
                ...styles.primaryButton,
                ...(searching ? styles.disabledButton : {}),
              }}
            >
              {searching ? "SEARCHING..." : "SEARCH SCHOOL REGISTRY"}
            </button>
          </div>
        </div>
      </FormFrame>

      <SectionHeading
        number="01.2"
        title="POSSIBLE MATCHES"
        reference="DUPLICATE CONTROL"
      />

      <div style={styles.tableFrame}>
        <table style={styles.table}>
          <thead>
            <tr>
              <TableHeading width="55px">#</TableHeading>
              <TableHeading>REGISTRY NO.</TableHeading>
              <TableHeading>EMIS NO.</TableHeading>
              <TableHeading>SCHOOL NAME</TableHeading>
              <TableHeading>DISTRICT</TableHeading>
              <TableHeading>STATUS</TableHeading>
              <TableHeading>ACTION</TableHeading>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={7} style={styles.emptyCell}>
                <div style={styles.emptyState}>
                  <div style={styles.emptyCode}>
                    {completed
                      ? "NO DEVELOPMENT MATCHES RETURNED"
                      : "SEARCH REQUIRED"}
                  </div>

                  <div style={styles.emptyTitle}>
                    {completed
                      ? "NO MATCHING SCHOOL FOUND"
                      : "COMPLETE THE REGISTRY SEARCH"}
                  </div>

                  <div style={styles.emptyText}>
                    {completed
                      ? "The development interface has completed the duplicate-check step. Live database matching will be connected to the production Schools API."
                      : "Possible existing school records will appear here after the registry search is completed."}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {completed && (
        <div style={styles.successNotice}>
          <strong>DUPLICATE CHECK COMPLETED:</strong> No matching record was
          returned by the current development registry. You may continue with
          the registration workflow.
        </div>
      )}
    </>
  );
}

/* ============================================================
   STEP 02
   ============================================================ */

function SchoolDetailsStep({
  school,
  updateSchool,
}: {
  school: SchoolData;
  updateSchool: <K extends keyof SchoolData>(
    field: K,
    value: SchoolData[K]
  ) => void;
}) {
  return (
    <>
      <StepHeading
        number="02"
        title="SCHOOL DETAILS"
        text="Capture the official identification and classification information for the school."
      />

      <FormFrame title="02.1 SCHOOL IDENTIFICATION">
        <FullFormRow number="01" label="Official School Name">
          <input
            value={school.schoolName}
            onChange={(event) =>
              updateSchool("schoolName", event.target.value)
            }
            placeholder="Enter official school name"
            style={styles.input}
          />
        </FullFormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>EMIS Number</FormLabel>

          <FormControl>
            <input
              value={school.emisNumber}
              onChange={(event) =>
                updateSchool("emisNumber", event.target.value)
              }
              placeholder="Enter EMIS number"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Registration Status</FormLabel>

          <FormControl last>
            <select
              value={school.registrationStatus}
              onChange={(event) =>
                updateSchool("registrationStatus", event.target.value)
              }
              style={styles.input}
            >
              <option>Pending Verification</option>
              <option>Registered</option>
              <option>Draft</option>
              <option>Inactive</option>
            </select>
          </FormControl>
        </FormRow>
      </FormFrame>

      <FormFrame title="02.2 SCHOOL CLASSIFICATION">
        <FormRow>
          <RowNumber value="03" />

          <FormLabel>School Type *</FormLabel>

          <FormControl>
            <select
              value={school.schoolType}
              onChange={(event) =>
                updateSchool("schoolType", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select school type</option>
              <option>Primary School</option>
              <option>Secondary School</option>
              <option>Combined School</option>
              <option>Special School</option>
              <option>Independent School</option>
              <option>Other Education Institution</option>
            </select>
          </FormControl>

          <FormLabel>Sector *</FormLabel>

          <FormControl last>
            <select
              value={school.sector}
              onChange={(event) =>
                updateSchool("sector", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select sector</option>
              <option>Public</option>
              <option>Independent</option>
              <option>Specialised</option>
              <option>Other</option>
            </select>
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="04" />

          <FormLabel>School Phase *</FormLabel>

          <FormControl>
            <select
              value={school.phase}
              onChange={(event) =>
                updateSchool("phase", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select phase</option>
              <option>Foundation Phase</option>
              <option>Intermediate Phase</option>
              <option>Senior Phase</option>
              <option>FET Phase</option>
              <option>Primary</option>
              <option>Secondary</option>
              <option>Combined</option>
              <option>Multiple Phases</option>
            </select>
          </FormControl>

          <FormLabel>Registry Authority</FormLabel>

          <FormControl last>
            <div style={styles.readOnlyValue}>
              Western Cape Sports Association
            </div>
          </FormControl>
        </FormRow>
      </FormFrame>
    </>
  );
}

/* ============================================================
   STEP 03
   ============================================================ */

function ContactManagementStep({
  school,
  updateSchool,
}: {
  school: SchoolData;
  updateSchool: <K extends keyof SchoolData>(
    field: K,
    value: SchoolData[K]
  ) => void;
}) {
  return (
    <>
      <StepHeading
        number="03"
        title="CONTACT & MANAGEMENT"
        text="Capture the school's official contact information and responsible management personnel."
      />

      <FormFrame title="03.1 PRINCIPAL / HEAD OF SCHOOL">
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>Title</FormLabel>

          <FormControl>
            <select
              value={school.principalTitle}
              onChange={(event) =>
                updateSchool("principalTitle", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select title</option>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
              <option>Dr</option>
              <option>Prof</option>
            </select>
          </FormControl>

          <FormLabel>Principal First Name *</FormLabel>

          <FormControl last>
            <input
              value={school.principalFirstName}
              onChange={(event) =>
                updateSchool("principalFirstName", event.target.value)
              }
              placeholder="First name"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>Principal Surname *</FormLabel>

          <FormControl>
            <input
              value={school.principalSurname}
              onChange={(event) =>
                updateSchool("principalSurname", event.target.value)
              }
              placeholder="Surname"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Deputy Principal</FormLabel>

          <FormControl last>
            <input
              value={school.deputyPrincipal}
              onChange={(event) =>
                updateSchool("deputyPrincipal", event.target.value)
              }
              placeholder="Full name"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormFrame>

      <FormFrame title="03.2 SCHOOL CONTACT INFORMATION">
        <FormRow>
          <RowNumber value="03" />

          <FormLabel>School Email *</FormLabel>

          <FormControl>
            <input
              type="email"
              value={school.schoolEmail}
              onChange={(event) =>
                updateSchool("schoolEmail", event.target.value)
              }
              placeholder="school@example.org"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Telephone *</FormLabel>

          <FormControl last>
            <input
              value={school.telephone}
              onChange={(event) =>
                updateSchool("telephone", event.target.value)
              }
              placeholder="Telephone number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="04" />

          <FormLabel>Alternative Telephone</FormLabel>

          <FormControl>
            <input
              value={school.alternativeTelephone}
              onChange={(event) =>
                updateSchool("alternativeTelephone", event.target.value)
              }
              placeholder="Alternative number"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Website</FormLabel>

          <FormControl last>
            <input
              value={school.website}
              onChange={(event) =>
                updateSchool("website", event.target.value)
              }
              placeholder="School website"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormFrame>
    </>
  );
}

/* ============================================================
   STEP 04
   ============================================================ */

function AddressEducationStep({
  school,
  updateSchool,
}: {
  school: SchoolData;
  updateSchool: <K extends keyof SchoolData>(
    field: K,
    value: SchoolData[K]
  ) => void;
}) {
  return (
    <>
      <StepHeading
        number="04"
        title="ADDRESS & EDUCATION DETAILS"
        text="Capture the physical location and education-administration information for the school."
      />

      <FormFrame title="04.1 PHYSICAL ADDRESS">
        <FullFormRow number="01" label="Address Line 1 *">
          <input
            value={school.addressLine1}
            onChange={(event) =>
              updateSchool("addressLine1", event.target.value)
            }
            placeholder="Street number and street name"
            style={styles.input}
          />
        </FullFormRow>

        <FullFormRow number="02" label="Address Line 2">
          <input
            value={school.addressLine2}
            onChange={(event) =>
              updateSchool("addressLine2", event.target.value)
            }
            placeholder="Additional address information"
            style={styles.input}
          />
        </FullFormRow>

        <FormRow>
          <RowNumber value="03" />

          <FormLabel>Suburb</FormLabel>

          <FormControl>
            <input
              value={school.suburb}
              onChange={(event) =>
                updateSchool("suburb", event.target.value)
              }
              placeholder="Suburb"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Town / City *</FormLabel>

          <FormControl last>
            <input
              value={school.townCity}
              onChange={(event) =>
                updateSchool("townCity", event.target.value)
              }
              placeholder="Town or city"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="04" />

          <FormLabel>Province</FormLabel>

          <FormControl>
            <select
              value={school.province}
              onChange={(event) =>
                updateSchool("province", event.target.value)
              }
              style={styles.input}
            >
              <option>Western Cape</option>
              <option>Eastern Cape</option>
              <option>Northern Cape</option>
              <option>Free State</option>
              <option>Gauteng</option>
              <option>KwaZulu-Natal</option>
              <option>Limpopo</option>
              <option>Mpumalanga</option>
              <option>North West</option>
            </select>
          </FormControl>

          <FormLabel>Postal Code</FormLabel>

          <FormControl last>
            <input
              value={school.postalCode}
              onChange={(event) =>
                updateSchool("postalCode", event.target.value)
              }
              placeholder="Postal code"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormFrame>

      <FormFrame title="04.2 EDUCATION ADMINISTRATION">
        <FormRow>
          <RowNumber value="05" />

          <FormLabel>Education District *</FormLabel>

          <FormControl>
            <select
              value={school.educationDistrict}
              onChange={(event) =>
                updateSchool("educationDistrict", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select district</option>
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

          <FormLabel>Circuit Number</FormLabel>

          <FormControl last>
            <input
              value={school.circuitNumber}
              onChange={(event) =>
                updateSchool("circuitNumber", event.target.value)
              }
              placeholder="Enter circuit number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormFrame>
    </>
  );
}

/* ============================================================
   STEP 05
   ============================================================ */

function ParticipationAffiliationStep({
  school,
  updateSchool,
}: {
  school: SchoolData;
  updateSchool: <K extends keyof SchoolData>(
    field: K,
    value: SchoolData[K]
  ) => void;
}) {
  return (
    <>
      <StepHeading
        number="05"
        title="PARTICIPATION & AFFILIATIONS"
        text="Capture the school's WCSA membership, sporting participation and nominated representative."
      />

      <FormFrame title="05.1 WCSA MEMBERSHIP">
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>Membership Type</FormLabel>

          <FormControl>
            <div style={styles.readOnlyValue}>{school.membershipType}</div>
          </FormControl>

          <FormLabel>Annual Tariff</FormLabel>

          <FormControl last>
            <div style={styles.readOnlyValue}>R350.00 / year</div>
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>Participation Status *</FormLabel>

          <FormControl>
            <select
              value={school.participationStatus}
              onChange={(event) =>
                updateSchool("participationStatus", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select status</option>
              <option>New Applicant</option>
              <option>Active Participant</option>
              <option>Previous Participant</option>
              <option>Membership Renewal</option>
              <option>Programme Participant Only</option>
            </select>
          </FormControl>

          <FormLabel>Primary Sporting Code</FormLabel>

          <FormControl last>
            <select
              value={school.primarySportingCode}
              onChange={(event) =>
                updateSchool("primarySportingCode", event.target.value)
              }
              style={styles.input}
            >
              <option value="">Select sporting code</option>
              <option>Athletics</option>
              <option>Basketball</option>
              <option>Chess</option>
              <option>Cricket</option>
              <option>Cross Country</option>
              <option>Cycling</option>
              <option>Football</option>
              <option>Gymnastics</option>
              <option>Hockey</option>
              <option>Judo</option>
              <option>Netball</option>
              <option>Rugby</option>
              <option>Softball</option>
              <option>Swimming</option>
              <option>Table Tennis</option>
              <option>Tennis</option>
              <option>Volleyball</option>
              <option>Multiple Codes</option>
            </select>
          </FormControl>
        </FormRow>

        <FullFormRow number="03" label="Additional Sporting Codes">
          <input
            value={school.additionalSportingCodes}
            onChange={(event) =>
              updateSchool("additionalSportingCodes", event.target.value)
            }
            placeholder="Enter additional sporting codes, separated by commas"
            style={styles.input}
          />
        </FullFormRow>
      </FormFrame>

      <FormFrame title="05.2 SCHOOL REPRESENTATIVE">
        <FormRow>
          <RowNumber value="04" />

          <FormLabel>Representative Name *</FormLabel>

          <FormControl>
            <input
              value={school.representativeName}
              onChange={(event) =>
                updateSchool("representativeName", event.target.value)
              }
              placeholder="Full name"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Position *</FormLabel>

          <FormControl last>
            <input
              value={school.representativePosition}
              onChange={(event) =>
                updateSchool("representativePosition", event.target.value)
              }
              placeholder="e.g. Principal, Sports Coordinator"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="05" />

          <FormLabel>Representative Email</FormLabel>

          <FormControl>
            <input
              type="email"
              value={school.representativeEmail}
              onChange={(event) =>
                updateSchool("representativeEmail", event.target.value)
              }
              placeholder="Email address"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>Representative Mobile</FormLabel>

          <FormControl last>
            <input
              value={school.representativeMobile}
              onChange={(event) =>
                updateSchool("representativeMobile", event.target.value)
              }
              placeholder="Mobile number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormFrame>

      <FormFrame title="05.3 INTERNAL NOTES">
        <FullFormRow number="06" label="Registration Notes">
          <textarea
            value={school.notes}
            onChange={(event) => updateSchool("notes", event.target.value)}
            placeholder="Internal registration notes, verification requirements or additional information"
            style={styles.textarea}
          />
        </FullFormRow>
      </FormFrame>

      <div style={styles.developmentNotice}>
        <strong>DEVELOPMENT CONTROL:</strong> Sporting-code affiliations are
        currently captured as registration data only. The production system
        should create separate affiliation records linked to the permanent
        School Registry record so that historical affiliations can be retained.
      </div>
    </>
  );
}

/* ============================================================
   STEP 06
   ============================================================ */

function ReviewStep({
  school,
  registryNumber,
  declarationAccepted,
  setDeclarationAccepted,
}: {
  school: SchoolData;
  registryNumber: string;
  declarationAccepted: boolean;
  setDeclarationAccepted: (value: boolean) => void;
}) {
  return (
    <>
      <StepHeading
        number="06"
        title="REVIEW & REGISTER"
        text="Review the complete school registration record before submission."
      />

      <SectionHeading
        number="06.1"
        title="SCHOOL IDENTIFICATION"
        reference="REVIEW"
      />

      <ReviewTable>
        <ReviewRow
          label="Official School Name"
          value={displayValue(school.schoolName)}
        />
        <ReviewRow
          label="EMIS Number"
          value={displayValue(school.emisNumber)}
        />
        <ReviewRow
          label="School Type"
          value={displayValue(school.schoolType)}
        />
        <ReviewRow label="Sector" value={displayValue(school.sector)} />
        <ReviewRow label="Phase" value={displayValue(school.phase)} />
        <ReviewRow
          label="Registration Status"
          value={displayValue(school.registrationStatus)}
          last
        />
      </ReviewTable>

      <SectionHeading
        number="06.2"
        title="MANAGEMENT & CONTACT"
        reference="REVIEW"
      />

      <ReviewTable>
        <ReviewRow
          label="Principal"
          value={displayValue(
            [
              school.principalTitle,
              school.principalFirstName,
              school.principalSurname,
            ]
              .filter(Boolean)
              .join(" ")
          )}
        />
        <ReviewRow
          label="Deputy Principal"
          value={displayValue(school.deputyPrincipal)}
        />
        <ReviewRow
          label="School Email"
          value={displayValue(school.schoolEmail)}
        />
        <ReviewRow
          label="Telephone"
          value={displayValue(school.telephone)}
        />
        <ReviewRow
          label="Website"
          value={displayValue(school.website)}
          last
        />
      </ReviewTable>

      <SectionHeading
        number="06.3"
        title="ADDRESS & EDUCATION"
        reference="REVIEW"
      />

      <ReviewTable>
        <ReviewRow
          label="Physical Address"
          value={displayValue(
            [
              school.addressLine1,
              school.addressLine2,
              school.suburb,
              school.townCity,
              school.province,
              school.postalCode,
            ]
              .filter(Boolean)
              .join(", ")
          )}
        />
        <ReviewRow
          label="Education District"
          value={displayValue(school.educationDistrict)}
        />
        <ReviewRow
          label="Circuit Number"
          value={displayValue(school.circuitNumber)}
          last
        />
      </ReviewTable>

      <SectionHeading
        number="06.4"
        title="WCSA PARTICIPATION"
        reference="REVIEW"
      />

      <ReviewTable>
        <ReviewRow
          label="Membership Type"
          value={school.membershipType}
        />
        <ReviewRow label="Annual Tariff" value="R350.00 / year" />
        <ReviewRow
          label="Participation Status"
          value={displayValue(school.participationStatus)}
        />
        <ReviewRow
          label="Primary Sporting Code"
          value={displayValue(school.primarySportingCode)}
        />
        <ReviewRow
          label="Additional Sporting Codes"
          value={displayValue(school.additionalSportingCodes)}
        />
        <ReviewRow
          label="School Representative"
          value={displayValue(school.representativeName)}
        />
        <ReviewRow
          label="Representative Position"
          value={displayValue(school.representativePosition)}
          last
        />
      </ReviewTable>

      <SectionHeading
        number="06.5"
        title="SCHOOL REGISTRY NUMBER"
        reference="DEVELOPMENT PREVIEW"
      />

      <div style={styles.registryNumberFrame}>
        <div style={styles.registryNumberLabel}>
          DEVELOPMENT SCHOOL REGISTRY NUMBER
        </div>

        <div style={styles.registryNumberValue}>{registryNumber}</div>

        <div style={styles.registryNumberText}>
          This is a development preview only. The production backend must
          allocate and confirm the permanent School Registry Number after the
          registration transaction succeeds.
        </div>
      </div>

      <div style={styles.declaration}>
        <label style={styles.declarationLabel}>
          <input
            type="checkbox"
            checked={declarationAccepted}
            onChange={(event) =>
              setDeclarationAccepted(event.target.checked)
            }
            style={styles.checkbox}
          />

          <span>
            I confirm that the information captured in this registration has
            been reviewed and is ready to be submitted to the MyWCSA AMS
            School Registry.
          </span>
        </label>
      </div>
    </>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function StepHeading({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.stepHeading}>
      <div style={styles.stepHeadingNumber}>{number}</div>

      <div>
        <div style={styles.stepHeadingTitle}>{title}</div>
        <div style={styles.stepHeadingText}>{text}</div>
      </div>
    </div>
  );
}

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

function FormFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={styles.formFrame}>
      <div style={styles.formHeader}>{title}</div>
      {children}
    </section>
  );
}

function FormRow({ children }: { children: ReactNode }) {
  return <div style={styles.formRow}>{children}</div>;
}

function FullFormRow({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.fullFormRow}>
      <RowNumber value={number} />
      <FormLabel>{label}</FormLabel>
      <div style={styles.fullFormControl}>{children}</div>
    </div>
  );
}

function RowNumber({ value }: { value: string }) {
  return <div style={styles.rowNumber}>{value}</div>;
}

function FormLabel({ children }: { children: ReactNode }) {
  return <div style={styles.formLabel}>{children}</div>;
}

function FormControl({
  children,
  last = false,
}: {
  children: ReactNode;
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

function ReviewTable({ children }: { children: ReactNode }) {
  return <div style={styles.reviewTable}>{children}</div>;
}

function ReviewRow({
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
        ...styles.reviewRow,
        ...(last ? styles.reviewRowLast : {}),
      }}
    >
      <div style={styles.reviewLabel}>{label}</div>
      <div style={styles.reviewValue}>{value}</div>
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

function displayValue(value: string) {
  return value.trim() || "Not provided";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildDevelopmentSchoolRegistryNumber(school: SchoolData) {
  const name = school.schoolName
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();

  const nameCode = name.slice(0, 3).padEnd(3, "X");

  const emisDigits = school.emisNumber.replace(/\D/g, "");
  const emisCode = emisDigits.slice(-4).padStart(4, "0");

  return `SCH${nameCode}${emisCode}001`;
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
    marginBottom: "14px",
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

  cancelButton: {
    minHeight: "31px",
    padding: "0 12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    border: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    textDecoration: "none",
    fontSize: "7px",
    fontWeight: 700,
  },

  workflow: {
    marginBottom: "15px",
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    backgroundColor: "#ffffff",
    border: `1px solid ${BORDER}`,
  },

  workflowItem: {
    minHeight: "45px",
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "#ffffff",
    border: "none",
    borderRight: `1px solid ${LIGHT_BORDER}`,
    color: "#65717d",
    fontFamily: "inherit",
    textAlign: "left",
    cursor: "default",
  },

  workflowItemActive: {
    backgroundColor: WCG_BLUE,
    color: "#ffffff",
  },

  workflowItemCompleted: {
    backgroundColor: PALE_BLUE,
    color: TEXT_BLUE,
    cursor: "pointer",
  },

  workflowNumber: {
    minWidth: "21px",
    height: "21px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${BORDER}`,
    color: WCG_BLUE,
    fontSize: "7px",
    fontWeight: 700,
  },

  workflowNumberActive: {
    borderColor: "#ffffff",
    color: "#ffffff",
  },

  workflowTitle: {
    fontSize: "7px",
    fontWeight: 700,
    lineHeight: 1.25,
  },

  errorNotice: {
    marginBottom: "12px",
    padding: "9px 11px",
    backgroundColor: "#fff1f1",
    borderLeft: "4px solid #a32727",
    borderTop: "1px solid #e0b7b7",
    borderRight: "1px solid #e0b7b7",
    borderBottom: "1px solid #e0b7b7",
    color: "#7a2424",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  successNotice: {
    marginTop: "10px",
    padding: "9px 11px",
    backgroundColor: "#edf7ef",
    borderLeft: "4px solid #377a45",
    borderTop: "1px solid #bfd7c4",
    borderRight: "1px solid #bfd7c4",
    borderBottom: "1px solid #bfd7c4",
    color: "#315e39",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  notice: {
    marginBottom: "13px",
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

  stepHeading: {
    minHeight: "53px",
    marginBottom: "11px",
    padding: "8px 10px",
    display: "grid",
    gridTemplateColumns: "38px 1fr",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#ffffff",
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  stepHeadingNumber: {
    color: WCG_BLUE,
    fontSize: "14px",
    fontWeight: 700,
  },

  stepHeadingTitle: {
    color: TEXT_BLUE,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.35px",
  },

  stepHeadingText: {
    marginTop: "2px",
    color: MUTED,
    fontSize: "8px",
  },

  sectionHeading: {
    minHeight: "31px",
    marginTop: "16px",
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

  formFrame: {
    marginBottom: "13px",
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  formHeader: {
    minHeight: "31px",
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
    backgroundColor: WCG_BLUE,
    color: "#ffffff",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  formRow: {
    minHeight: "47px",
    display: "grid",
    gridTemplateColumns:
      "42px 150px minmax(170px, 1fr) 150px minmax(170px, 1fr)",
    alignItems: "stretch",
    borderBottom: `1px solid ${BORDER}`,
  },

  fullFormRow: {
    minHeight: "47px",
    display: "grid",
    gridTemplateColumns: "42px 150px 1fr",
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

  fullFormControl: {
    padding: "6px 7px",
    display: "flex",
    alignItems: "center",
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

  textarea: {
    width: "100%",
    minHeight: "82px",
    boxSizing: "border-box",
    padding: "8px",
    resize: "vertical",
    backgroundColor: "#ffffff",
    border: "1px solid #9da7b1",
    borderRadius: 0,
    outline: "none",
    color: "#26323d",
    fontFamily: "inherit",
    fontSize: "9px",
  },

  readOnlyValue: {
    width: "100%",
    minHeight: "31px",
    padding: "0 8px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f3f5f7",
    border: `1px solid ${LIGHT_BORDER}`,
    color: "#5f6b77",
    fontSize: "8px",
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

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  tableFrame: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  tableHeading: {
    padding: "7px 8px",
    backgroundColor: TABLE_HEADER,
    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "7px",
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  emptyCell: {
    padding: 0,
  },

  emptyState: {
    minHeight: "120px",
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
    maxWidth: "580px",
    marginTop: "4px",
    color: "#707b86",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  reviewTable: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  reviewRow: {
    minHeight: "39px",
    display: "grid",
    gridTemplateColumns: "230px 1fr",
    borderBottom: `1px solid ${BORDER}`,
  },

  reviewRowLast: {
    borderBottom: "none",
  },

  reviewLabel: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderRight: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    fontSize: "8px",
    fontWeight: 700,
  },

  reviewValue: {
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    color: "#5f6b76",
    fontSize: "8px",
    lineHeight: 1.4,
  },

  registryNumberFrame: {
    padding: "15px",
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
    textAlign: "center",
  },

  registryNumberLabel: {
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  registryNumberValue: {
    marginTop: "7px",
    color: WCG_BLUE,
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  registryNumberText: {
    maxWidth: "650px",
    margin: "7px auto 0",
    color: MUTED,
    fontSize: "8px",
    lineHeight: 1.5,
  },

  declaration: {
    marginTop: "13px",
    padding: "11px",
    backgroundColor: "#ffffff",
    border: `1px solid ${BORDER}`,
  },

  declarationLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    color: "#56626e",
    fontSize: "8px",
    lineHeight: 1.5,
    cursor: "pointer",
  },

  checkbox: {
    marginTop: "2px",
  },

  navigationBar: {
    minHeight: "55px",
    marginTop: "16px",
    paddingTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderTop: `1px solid ${BORDER}`,
  },

  navigationRight: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  stepIndicator: {
    color: MUTED,
    fontSize: "7px",
    fontWeight: 700,
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

  successBanner: {
    padding: "18px",
    backgroundColor: "#edf7ef",
    borderLeft: "5px solid #377a45",
    borderTop: "1px solid #bfd7c4",
    borderRight: "1px solid #bfd7c4",
    borderBottom: "1px solid #bfd7c4",
  },

  successCode: {
    color: "#52705a",
    fontSize: "7px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  successTitle: {
    marginTop: "5px",
    color: "#24582f",
    fontSize: "18px",
    fontWeight: 700,
  },

  successText: {
    marginTop: "4px",
    color: "#52705a",
    fontSize: "8px",
  },

  informationFrame: {
    backgroundColor: "#ffffff",
    border: `3px double ${WCG_BLUE}`,
  },

  informationRow: {
    minHeight: "39px",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
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
  },

  successActions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },

  secondaryLinkButton: {
    minHeight: "31px",
    padding: "0 12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    border: `1px solid ${BORDER}`,
    color: TEXT_BLUE,
    textDecoration: "none",
    fontSize: "7px",
    fontWeight: 700,
  },
};