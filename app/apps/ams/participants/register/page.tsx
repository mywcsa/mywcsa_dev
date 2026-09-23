"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ============================================================
   MyWCSA AMS
   REGISTER PARTICIPANT

   Staff Interface
   Western Cape Sports Association

   IMPORTANT
   ------------------------------------------------------------
   This page currently provides the complete front-end workflow.

   Production still requires:
   - participant search API
   - duplicate detection API
   - registry database
   - affiliation registry lookups
   - transactional participant-number generation
   - audit logging
   - server-side validation
   - authorisation checks
   ============================================================ */

const WCG_BLUE = "#001489";
const DARK_BLUE = "#00105f";
const TEXT_BLUE = "#00175a";
const BORDER = "#9fa9b4";
const LIGHT_BORDER = "#d4d9df";
const MUTED = "#65717d";
const PALE_BLUE = "#edf2f8";
const TABLE_HEADER = "#eef1f5";

type RegistrationData = {
  firstName: string;
  middleNames: string;
  surname: string;
  dateOfBirth: string;
  gender: string;
  idType: string;
  idNumber: string;
  participantType: string;

  mobile: string;
  email: string;

  addressLine1: string;
  addressLine2: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;

  guardianFirstName: string;
  guardianSurname: string;
  guardianRelationship: string;
  guardianMobile: string;
  guardianEmail: string;

  emergencyName: string;
  emergencyRelationship: string;
  emergencyMobile: string;

  sportingCode: string;
  participantRole: string;
  ageGroup: string;
  division: string;

  school: string;
  club: string;
  team: string;
  association: string;

  notes: string;
};

type DuplicateSearchData = {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  idNumber: string;
  participantNumber: string;
};

const initialRegistrationData: RegistrationData = {
  firstName: "",
  middleNames: "",
  surname: "",
  dateOfBirth: "",
  gender: "",
  idType: "South African ID",
  idNumber: "",
  participantType: "Learner / Athlete",

  mobile: "",
  email: "",

  addressLine1: "",
  addressLine2: "",
  suburb: "",
  townCity: "",
  province: "Western Cape",
  postalCode: "",

  guardianFirstName: "",
  guardianSurname: "",
  guardianRelationship: "",
  guardianMobile: "",
  guardianEmail: "",

  emergencyName: "",
  emergencyRelationship: "",
  emergencyMobile: "",

  sportingCode: "",
  participantRole: "Athlete / Participant",
  ageGroup: "",
  division: "",

  school: "",
  club: "",
  team: "",
  association: "",

  notes: "",
};

const initialDuplicateSearch: DuplicateSearchData = {
  firstName: "",
  surname: "",
  dateOfBirth: "",
  idNumber: "",
  participantNumber: "",
};

const workflowSteps = [
  {
    number: 1,
    short: "01",
    title: "Duplicate Check",
  },
  {
    number: 2,
    short: "02",
    title: "Personal Details",
  },
  {
    number: 3,
    short: "03",
    title: "Contact & Guardian",
  },
  {
    number: 4,
    short: "04",
    title: "Participation",
  },
  {
    number: 5,
    short: "05",
    title: "Affiliations",
  },
  {
    number: 6,
    short: "06",
    title: "Review & Register",
  },
];

export default function RegisterParticipantPage() {
  const [step, setStep] = useState(1);

  const [data, setData] =
    useState<RegistrationData>(
      initialRegistrationData
    );

  const [
    duplicateSearch,
    setDuplicateSearch,
  ] = useState<DuplicateSearchData>(
    initialDuplicateSearch
  );

  const [
    duplicateSearchCompleted,
    setDuplicateSearchCompleted,
  ] = useState(false);

  const [
    duplicateSearchRunning,
    setDuplicateSearchRunning,
  ] = useState(false);

  const [
    declarationAccepted,
    setDeclarationAccepted,
  ] = useState(false);

  const [
    registrationComplete,
    setRegistrationComplete,
  ] = useState(false);

  const [
    validationMessage,
    setValidationMessage,
  ] = useState("");

  const currentDate = useMemo(
    () => formatDate(),
    []
  );

  const participantAge = useMemo(
    () => calculateAge(data.dateOfBirth),
    [data.dateOfBirth]
  );

  const isMinor =
    participantAge !== null &&
    participantAge < 18;

  const developmentParticipantNumber =
    useMemo(
      () =>
        buildDevelopmentParticipantNumber(
          data.dateOfBirth,
          data.firstName,
          data.surname
        ),
      [
        data.dateOfBirth,
        data.firstName,
        data.surname,
      ]
    );

  function updateData(
    field: keyof RegistrationData,
    value: string
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationMessage("");
  }

  function updateDuplicateSearch(
    field: keyof DuplicateSearchData,
    value: string
  ) {
    setDuplicateSearch((current) => ({
      ...current,
      [field]: value,
    }));

    setDuplicateSearchCompleted(false);
    setValidationMessage("");
  }

  function runDuplicateSearch() {
    const hasSearchValue =
      duplicateSearch.firstName.trim() ||
      duplicateSearch.surname.trim() ||
      duplicateSearch.dateOfBirth ||
      duplicateSearch.idNumber.trim() ||
      duplicateSearch.participantNumber.trim();

    if (!hasSearchValue) {
      setValidationMessage(
        "Enter at least one participant search value before searching the registry."
      );
      return;
    }

    setValidationMessage("");
    setDuplicateSearchRunning(true);
    setDuplicateSearchCompleted(false);

    window.setTimeout(() => {
      setDuplicateSearchRunning(false);
      setDuplicateSearchCompleted(true);
    }, 500);
  }

  function clearDuplicateSearch() {
    setDuplicateSearch(
      initialDuplicateSearch
    );

    setDuplicateSearchCompleted(false);
    setValidationMessage("");
  }

  function validateStep(
    targetStep: number
  ) {
    if (targetStep === 1) {
      if (!duplicateSearchCompleted) {
        return (
          "Complete the duplicate registry " +
          "search before continuing."
        );
      }
    }

    if (targetStep === 2) {
      if (!data.firstName.trim()) {
        return "First Name(s) is required.";
      }

      if (!data.surname.trim()) {
        return "Surname is required.";
      }

      if (!data.dateOfBirth) {
        return "Date of Birth is required.";
      }

      if (!data.gender) {
        return "Gender is required.";
      }

      if (!data.participantType) {
        return "Participant Type is required.";
      }
    }

    if (targetStep === 3) {
      if (isMinor) {
        if (
          !data.guardianFirstName.trim() ||
          !data.guardianSurname.trim()
        ) {
          return (
            "Parent / Guardian name is " +
            "required for a participant under 18."
          );
        }

        if (
          !data.guardianRelationship
        ) {
          return (
            "Parent / Guardian relationship " +
            "is required for a participant under 18."
          );
        }

        if (
          !data.guardianMobile.trim()
        ) {
          return (
            "Parent / Guardian mobile number " +
            "is required for a participant under 18."
          );
        }
      }
    }

    if (targetStep === 4) {
      if (!data.sportingCode) {
        return "Sporting Code is required.";
      }

      if (!data.participantRole) {
        return "Participant Role is required.";
      }
    }

    return "";
  }

  function nextStep() {
    const message =
      validateStep(step);

    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");

    setStep((current) =>
      Math.min(current + 1, 6)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    setValidationMessage("");

    setStep((current) =>
      Math.max(current - 1, 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToStep(
    targetStep: number
  ) {
    if (targetStep < step) {
      setValidationMessage("");
      setStep(targetStep);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (targetStep === step) {
      return;
    }

    if (targetStep === step + 1) {
      nextStep();
    }
  }

  function registerParticipant() {
    if (!declarationAccepted) {
      setValidationMessage(
        "Confirm the declaration before registering the participant."
      );
      return;
    }

    setValidationMessage("");

    /*
      DEVELOPMENT MODE ONLY.

      Production registration must POST the
      validated record to the AMS API.

      The server/database must:
      1. re-check duplicates;
      2. validate affiliation conflicts;
      3. allocate the permanent participant
         number transactionally;
      4. save the participant;
      5. create audit history;
      6. return the official record.
    */

    setRegistrationComplete(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (registrationComplete) {
    return (
      <RegistrationSuccess
        participantName={
          `${data.firstName} ${data.surname}`.trim()
        }
        developmentParticipantNumber={
          developmentParticipantNumber
        }
      />
    );
  }

  return (
    <div style={styles.page}>
      {/* =====================================================
          BREADCRUMB / DATE
          ===================================================== */}

      <div style={styles.topUtilityRow}>
        <div style={styles.breadcrumb}>
          <Link
            href="/my-apps"
            style={styles.breadcrumbLink}
          >
            MyGovApps
          </Link>

          <span
            style={styles.breadcrumbSeparator}
          >
            /
          </span>

          <Link
            href="/apps/ams"
            style={styles.breadcrumbLink}
          >
            MyWCSA AMS
          </Link>

          <span
            style={styles.breadcrumbSeparator}
          >
            /
          </span>

          <Link
            href="/apps/ams/participants"
            style={styles.breadcrumbLink}
          >
            Participants
          </Link>

          <span
            style={styles.breadcrumbSeparator}
          >
            /
          </span>

          <strong>
            Register Participant
          </strong>
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
            AMS / PARTICIPANTS / REGISTRATION
          </div>

          <h1 style={styles.pageTitle}>
            REGISTER PARTICIPANT
          </h1>

          <p style={styles.pageSubtitle}>
            Create a permanent participant
            record in the MyWCSA Participant
            Registry.
          </p>
        </div>

        <Link
          href="/apps/ams/participants"
          style={styles.cancelButton}
        >
          CANCEL REGISTRATION
        </Link>
      </section>

      {/* =====================================================
          WORKFLOW
          ===================================================== */}

      <div style={styles.workflow}>
        {workflowSteps.map(
          (workflowStep) => {
            const isCurrent =
              workflowStep.number === step;

            const isComplete =
              workflowStep.number < step;

            return (
              <button
                key={workflowStep.number}
                type="button"
                onClick={() =>
                  goToStep(
                    workflowStep.number
                  )
                }
                style={{
                  ...styles.workflowStep,

                  ...(isCurrent
                    ? styles.workflowCurrent
                    : {}),

                  ...(isComplete
                    ? styles.workflowComplete
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.workflowNumber,

                    ...(isCurrent
                      ? styles.workflowNumberCurrent
                      : {}),

                    ...(isComplete
                      ? styles.workflowNumberComplete
                      : {}),
                  }}
                >
                  {isComplete
                    ? "✓"
                    : workflowStep.short}
                </span>

                <span>
                  <span
                    style={
                      styles.workflowSmallLabel
                    }
                  >
                    STEP{" "}
                    {workflowStep.short}
                  </span>

                  <span
                    style={
                      styles.workflowTitle
                    }
                  >
                    {workflowStep.title}
                  </span>
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* =====================================================
          VALIDATION MESSAGE
          ===================================================== */}

      {validationMessage ? (
        <div style={styles.errorBox}>
          <div style={styles.errorMarker}>
            !
          </div>

          <div>
            <div style={styles.errorTitle}>
              ACTION REQUIRED
            </div>

            <div style={styles.errorText}>
              {validationMessage}
            </div>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          STEP CONTENT
          ===================================================== */}

      {step === 1 ? (
        <DuplicateCheckStep
          search={duplicateSearch}
          updateSearch={
            updateDuplicateSearch
          }
          searchCompleted={
            duplicateSearchCompleted
          }
          searchRunning={
            duplicateSearchRunning
          }
          onSearch={runDuplicateSearch}
          onClear={clearDuplicateSearch}
        />
      ) : null}

      {step === 2 ? (
        <PersonalDetailsStep
          data={data}
          updateData={updateData}
          participantAge={participantAge}
        />
      ) : null}

      {step === 3 ? (
        <ContactGuardianStep
          data={data}
          updateData={updateData}
          participantAge={participantAge}
          isMinor={isMinor}
        />
      ) : null}

      {step === 4 ? (
        <ParticipationStep
          data={data}
          updateData={updateData}
        />
      ) : null}

      {step === 5 ? (
        <AffiliationsStep
          data={data}
          updateData={updateData}
        />
      ) : null}

      {step === 6 ? (
        <ReviewStep
          data={data}
          participantAge={participantAge}
          developmentParticipantNumber={
            developmentParticipantNumber
          }
          declarationAccepted={
            declarationAccepted
          }
          setDeclarationAccepted={
            setDeclarationAccepted
          }
          setStep={setStep}
        />
      ) : null}

      {/* =====================================================
          BOTTOM NAVIGATION
          ===================================================== */}

      <div style={styles.bottomNavigation}>
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={previousStep}
              style={styles.secondaryButton}
            >
              ← PREVIOUS
            </button>
          ) : (
            <Link
              href="/apps/ams/participants"
              style={styles.secondaryLink}
            >
              CANCEL
            </Link>
          )}
        </div>

        <div style={styles.navigationRight}>
          <span style={styles.stepIndicator}>
            STEP {step} OF 6
          </span>

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
              onClick={
                registerParticipant
              }
              style={styles.registerFinalButton}
            >
              REGISTER PARTICIPANT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 1
   DUPLICATE CHECK
   ============================================================ */

function DuplicateCheckStep({
  search,
  updateSearch,
  searchCompleted,
  searchRunning,
  onSearch,
  onClear,
}: {
  search: DuplicateSearchData;

  updateSearch: (
    field: keyof DuplicateSearchData,
    value: string
  ) => void;

  searchCompleted: boolean;
  searchRunning: boolean;

  onSearch: () => void;
  onClear: () => void;
}) {
  return (
    <>
      <StepHeading
        number="01"
        title="DUPLICATE CHECK"
        description="Search the provincial participant registry before creating a new record."
      />

      <Notice
        title="SEARCH BEFORE REGISTRATION"
        text="A participant must only have one permanent MyWCSA participant record. If an existing record is found, use the existing record and the appropriate affiliation or transfer process instead of creating a duplicate."
      />

      <FormSection
        number="01.1"
        title="PARTICIPANT IDENTITY SEARCH"
        reference="REGISTRY ENQUIRY"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>
            Participant Number
          </FormLabel>

          <FormControl>
            <input
              value={
                search.participantNumber
              }
              onChange={(event) =>
                updateSearch(
                  "participantNumber",
                  event.target.value
                )
              }
              placeholder="Enter participant number"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            ID / Passport Number
          </FormLabel>

          <FormControl last>
            <input
              value={search.idNumber}
              onChange={(event) =>
                updateSearch(
                  "idNumber",
                  event.target.value
                )
              }
              placeholder="Enter ID or passport number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>
            First Name(s)
          </FormLabel>

          <FormControl>
            <input
              value={search.firstName}
              onChange={(event) =>
                updateSearch(
                  "firstName",
                  event.target.value
                )
              }
              placeholder="Enter first name"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Surname
          </FormLabel>

          <FormControl last>
            <input
              value={search.surname}
              onChange={(event) =>
                updateSearch(
                  "surname",
                  event.target.value
                )
              }
              placeholder="Enter surname"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="03" />

          <FormLabel>
            Date of Birth
          </FormLabel>

          <FormControl>
            <input
              type="date"
              value={search.dateOfBirth}
              onChange={(event) =>
                updateSearch(
                  "dateOfBirth",
                  event.target.value
                )
              }
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Search Status
          </FormLabel>

          <FormControl last>
            <div
              style={
                styles.readOnlyControl
              }
            >
              {searchCompleted
                ? "SEARCH COMPLETED"
                : "NOT YET SEARCHED"}
            </div>
          </FormControl>
        </FormRow>

        <div style={styles.formActions}>
          <div
            style={
              styles.formActionInformation
            }
          >
            Enter one or more known
            participant details.
          </div>

          <div
            style={
              styles.formActionButtons
            }
          >
            <button
              type="button"
              onClick={onClear}
              style={
                styles.secondaryButton
              }
            >
              CLEAR
            </button>

            <button
              type="button"
              onClick={onSearch}
              disabled={searchRunning}
              style={{
                ...styles.primaryButton,

                ...(searchRunning
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {searchRunning
                ? "SEARCHING..."
                : "SEARCH REGISTRY"}
            </button>
          </div>
        </div>
      </FormSection>

      <SectionTitle
        number="01.2"
        title="POSSIBLE MATCHES"
        reference="SEARCH RESULTS"
      />

      <div style={styles.tableFrame}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <TableHeading width="48px">
                  #
                </TableHeading>

                <TableHeading width="150px">
                  PARTICIPANT NO.
                </TableHeading>

                <TableHeading width="200px">
                  PARTICIPANT
                </TableHeading>

                <TableHeading width="110px">
                  DATE OF BIRTH
                </TableHeading>

                <TableHeading>
                  CURRENT AFFILIATION
                </TableHeading>

                <TableHeading width="95px">
                  STATUS
                </TableHeading>

                <TableHeading width="80px">
                  ACTION
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={7}
                  style={styles.emptyTableCell}
                >
                  {!searchCompleted ? (
                    <EmptyTableState
                      code="AWAITING SEARCH"
                      title="REGISTRY SEARCH REQUIRED"
                      text="Complete the identity search above to check for an existing participant record."
                    />
                  ) : (
                    <EmptyTableState
                      code="DEVELOPMENT MODE"
                      title="NO MATCHES RETURNED"
                      text="No possible matches are shown in this development build. Production will display live registry matches returned by the participant search API."
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {searchCompleted ? (
        <div
          style={
            styles.searchCompletionNotice
          }
        >
          <div
            style={
              styles.searchCompletionMarker
            }
          >
            ✓
          </div>

          <div>
            <div
              style={
                styles.searchCompletionTitle
              }
            >
              DUPLICATE CHECK COMPLETED
            </div>

            <div
              style={
                styles.searchCompletionText
              }
            >
              This development version
              allows the workflow to continue.
              The production system must
              re-check the live registry on
              the server before registration
              is committed.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ============================================================
   STEP 2
   PERSONAL DETAILS
   ============================================================ */

function PersonalDetailsStep({
  data,
  updateData,
  participantAge,
}: {
  data: RegistrationData;

  updateData: (
    field: keyof RegistrationData,
    value: string
  ) => void;

  participantAge: number | null;
}) {
  return (
    <>
      <StepHeading
        number="02"
        title="PERSONAL DETAILS"
        description="Capture the participant's official personal and identity information."
      />

      <FormSection
        number="02.1"
        title="PARTICIPANT IDENTITY"
        reference="CORE RECORD"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel required>
            First Name(s)
          </FormLabel>

          <FormControl>
            <input
              value={data.firstName}
              onChange={(event) =>
                updateData(
                  "firstName",
                  event.target.value
                )
              }
              placeholder="Enter first name(s)"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Middle Name(s)
          </FormLabel>

          <FormControl last>
            <input
              value={data.middleNames}
              onChange={(event) =>
                updateData(
                  "middleNames",
                  event.target.value
                )
              }
              placeholder="Enter middle name(s)"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel required>
            Surname
          </FormLabel>

          <FormControl>
            <input
              value={data.surname}
              onChange={(event) =>
                updateData(
                  "surname",
                  event.target.value
                )
              }
              placeholder="Enter surname"
              style={styles.input}
            />
          </FormControl>

          <FormLabel required>
            Date of Birth
          </FormLabel>

          <FormControl last>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(event) =>
                updateData(
                  "dateOfBirth",
                  event.target.value
                )
              }
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="03" />

          <FormLabel>
            Calculated Age
          </FormLabel>

          <FormControl>
            <div
              style={
                styles.readOnlyControl
              }
            >
              {participantAge === null
                ? "PENDING DATE OF BIRTH"
                : `${participantAge} YEARS`}
            </div>
          </FormControl>

          <FormLabel required>
            Gender
          </FormLabel>

          <FormControl last>
            <select
              value={data.gender}
              onChange={(event) =>
                updateData(
                  "gender",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>

              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </select>
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="04" />

          <FormLabel>
            Identity Document Type
          </FormLabel>

          <FormControl>
            <select
              value={data.idType}
              onChange={(event) =>
                updateData(
                  "idType",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option>
                South African ID
              </option>

              <option>
                Passport
              </option>

              <option>
                Birth Certificate
              </option>

              <option>
                Other
              </option>
            </select>
          </FormControl>

          <FormLabel>
            ID / Passport Number
          </FormLabel>

          <FormControl last>
            <input
              value={data.idNumber}
              onChange={(event) =>
                updateData(
                  "idNumber",
                  event.target.value
                )
              }
              placeholder="Enter document number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="05" />

          <FormLabel required>
            Participant Type
          </FormLabel>

          <FormControl>
            <select
              value={
                data.participantType
              }
              onChange={(event) =>
                updateData(
                  "participantType",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option>
                Learner / Athlete
              </option>

              <option>
                Coach
              </option>

              <option>
                Official
              </option>

              <option>
                Sports Staff
              </option>

              <option>
                Volunteer
              </option>

              <option>
                Other
              </option>
            </select>
          </FormControl>

          <FormLabel>
            Record Status
          </FormLabel>

          <FormControl last>
            <div
              style={
                styles.readOnlyControl
              }
            >
              NEW REGISTRATION
            </div>
          </FormControl>
        </FormRow>
      </FormSection>

      <Notice
        title="PERMANENT PARTICIPANT RECORD"
        text="The participant's identity details form the core permanent registry record. Corrections to official identity information should later be controlled through an authorised amendment and audit process."
      />
    </>
  );
}

/* ============================================================
   STEP 3
   CONTACT & GUARDIAN
   ============================================================ */

function ContactGuardianStep({
  data,
  updateData,
  participantAge,
  isMinor,
}: {
  data: RegistrationData;

  updateData: (
    field: keyof RegistrationData,
    value: string
  ) => void;

  participantAge: number | null;
  isMinor: boolean;
}) {
  return (
    <>
      <StepHeading
        number="03"
        title="CONTACT & GUARDIAN"
        description="Capture participant contact details, physical address, guardian information and emergency contact details."
      />

      {isMinor ? (
        <Notice
          title="MINOR PARTICIPANT"
          text={`The participant is currently calculated as ${participantAge} years old. Parent or guardian information is therefore required before registration can continue.`}
        />
      ) : null}

      <FormSection
        number="03.1"
        title="PARTICIPANT CONTACT DETAILS"
        reference="CONTACT"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>
            Mobile Number
          </FormLabel>

          <FormControl>
            <input
              type="tel"
              value={data.mobile}
              onChange={(event) =>
                updateData(
                  "mobile",
                  event.target.value
                )
              }
              placeholder="Enter mobile number"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Email Address
          </FormLabel>

          <FormControl last>
            <input
              type="email"
              value={data.email}
              onChange={(event) =>
                updateData(
                  "email",
                  event.target.value
                )
              }
              placeholder="Enter email address"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormSection>

      <FormSection
        number="03.2"
        title="PHYSICAL ADDRESS"
        reference="ADDRESS"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>
            Address Line 1
          </FormLabel>

          <FormControl>
            <input
              value={data.addressLine1}
              onChange={(event) =>
                updateData(
                  "addressLine1",
                  event.target.value
                )
              }
              placeholder="Street / house address"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Address Line 2
          </FormLabel>

          <FormControl last>
            <input
              value={data.addressLine2}
              onChange={(event) =>
                updateData(
                  "addressLine2",
                  event.target.value
                )
              }
              placeholder="Complex / additional address"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>
            Suburb
          </FormLabel>

          <FormControl>
            <input
              value={data.suburb}
              onChange={(event) =>
                updateData(
                  "suburb",
                  event.target.value
                )
              }
              placeholder="Enter suburb"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Town / City
          </FormLabel>

          <FormControl last>
            <input
              value={data.townCity}
              onChange={(event) =>
                updateData(
                  "townCity",
                  event.target.value
                )
              }
              placeholder="Enter town or city"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="03" />

          <FormLabel>
            Province
          </FormLabel>

          <FormControl>
            <select
              value={data.province}
              onChange={(event) =>
                updateData(
                  "province",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option>
                Western Cape
              </option>

              <option>
                Eastern Cape
              </option>

              <option>
                Northern Cape
              </option>

              <option>
                Gauteng
              </option>

              <option>
                KwaZulu-Natal
              </option>

              <option>
                Free State
              </option>

              <option>
                Limpopo
              </option>

              <option>
                Mpumalanga
              </option>

              <option>
                North West
              </option>
            </select>
          </FormControl>

          <FormLabel>
            Postal Code
          </FormLabel>

          <FormControl last>
            <input
              value={data.postalCode}
              onChange={(event) =>
                updateData(
                  "postalCode",
                  event.target.value
                )
              }
              placeholder="Enter postal code"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormSection>

      <FormSection
        number="03.3"
        title="PARENT / GUARDIAN DETAILS"
        reference={
          isMinor
            ? "REQUIRED"
            : "WHERE APPLICABLE"
        }
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel required={isMinor}>
            Guardian First Name
          </FormLabel>

          <FormControl>
            <input
              value={
                data.guardianFirstName
              }
              onChange={(event) =>
                updateData(
                  "guardianFirstName",
                  event.target.value
                )
              }
              placeholder="Enter first name"
              style={styles.input}
            />
          </FormControl>

          <FormLabel required={isMinor}>
            Guardian Surname
          </FormLabel>

          <FormControl last>
            <input
              value={
                data.guardianSurname
              }
              onChange={(event) =>
                updateData(
                  "guardianSurname",
                  event.target.value
                )
              }
              placeholder="Enter surname"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel required={isMinor}>
            Relationship
          </FormLabel>

          <FormControl>
            <select
              value={
                data.guardianRelationship
              }
              onChange={(event) =>
                updateData(
                  "guardianRelationship",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option value="">
                Select relationship
              </option>

              <option>
                Mother
              </option>

              <option>
                Father
              </option>

              <option>
                Legal Guardian
              </option>

              <option>
                Grandparent
              </option>

              <option>
                Other
              </option>
            </select>
          </FormControl>

          <FormLabel required={isMinor}>
            Mobile Number
          </FormLabel>

          <FormControl last>
            <input
              type="tel"
              value={
                data.guardianMobile
              }
              onChange={(event) =>
                updateData(
                  "guardianMobile",
                  event.target.value
                )
              }
              placeholder="Enter mobile number"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="03" />

          <FormLabel>
            Guardian Email
          </FormLabel>

          <FormControl>
            <input
              type="email"
              value={
                data.guardianEmail
              }
              onChange={(event) =>
                updateData(
                  "guardianEmail",
                  event.target.value
                )
              }
              placeholder="Enter email address"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Guardian Status
          </FormLabel>

          <FormControl last>
            <div
              style={
                styles.readOnlyControl
              }
            >
              {isMinor
                ? "REQUIRED FOR MINOR"
                : "OPTIONAL"}
            </div>
          </FormControl>
        </FormRow>
      </FormSection>

      <FormSection
        number="03.4"
        title="EMERGENCY CONTACT"
        reference="SAFETY CONTACT"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>
            Contact Name
          </FormLabel>

          <FormControl>
            <input
              value={data.emergencyName}
              onChange={(event) =>
                updateData(
                  "emergencyName",
                  event.target.value
                )
              }
              placeholder="Enter emergency contact"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Relationship
          </FormLabel>

          <FormControl last>
            <input
              value={
                data.emergencyRelationship
              }
              onChange={(event) =>
                updateData(
                  "emergencyRelationship",
                  event.target.value
                )
              }
              placeholder="Enter relationship"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>
            Mobile Number
          </FormLabel>

          <FormControl>
            <input
              type="tel"
              value={
                data.emergencyMobile
              }
              onChange={(event) =>
                updateData(
                  "emergencyMobile",
                  event.target.value
                )
              }
              placeholder="Enter emergency number"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Contact Record
          </FormLabel>

          <FormControl last>
            <div
              style={
                styles.readOnlyControl
              }
            >
              EMERGENCY CONTACT
            </div>
          </FormControl>
        </FormRow>
      </FormSection>
    </>
  );
}

/* ============================================================
   STEP 4
   PARTICIPATION
   ============================================================ */

function ParticipationStep({
  data,
  updateData,
}: {
  data: RegistrationData;

  updateData: (
    field: keyof RegistrationData,
    value: string
  ) => void;
}) {
  return (
    <>
      <StepHeading
        number="04"
        title="PARTICIPATION"
        description="Capture the participant's sporting code, role and competition classification."
      />

      <FormSection
        number="04.1"
        title="SPORTING PARTICIPATION"
        reference="PARTICIPATION RECORD"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel required>
            Sporting Code
          </FormLabel>

          <FormControl>
            <select
              value={data.sportingCode}
              onChange={(event) =>
                updateData(
                  "sportingCode",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option value="">
                Select sporting code
              </option>

              <option>
                Athletics
              </option>

              <option>
                Basketball
              </option>

              <option>
                Chess
              </option>

              <option>
                Cricket
              </option>

              <option>
                Cross Country
              </option>

              <option>
                Cycling
              </option>

              <option>
                Football
              </option>

              <option>
                Gymnastics
              </option>

              <option>
                Hockey
              </option>

              <option>
                Judo
              </option>

              <option>
                Netball
              </option>

              <option>
                Rugby
              </option>

              <option>
                Softball
              </option>

              <option>
                Swimming
              </option>

              <option>
                Table Tennis
              </option>

              <option>
                Tennis
              </option>

              <option>
                Volleyball
              </option>

              <option>
                Other
              </option>
            </select>
          </FormControl>

          <FormLabel required>
            Participant Role
          </FormLabel>

          <FormControl last>
            <select
              value={
                data.participantRole
              }
              onChange={(event) =>
                updateData(
                  "participantRole",
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option>
                Athlete / Participant
              </option>

              <option>
                Coach
              </option>

              <option>
                Official
              </option>

              <option>
                Team Manager
              </option>

              <option>
                Sports Staff
              </option>

              <option>
                Volunteer
              </option>

              <option>
                Other
              </option>
            </select>
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>
            Age Group
          </FormLabel>

          <FormControl>
            <input
              value={data.ageGroup}
              onChange={(event) =>
                updateData(
                  "ageGroup",
                  event.target.value
                )
              }
              placeholder="e.g. U13"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Division / Category
          </FormLabel>

          <FormControl last>
            <input
              value={data.division}
              onChange={(event) =>
                updateData(
                  "division",
                  event.target.value
                )
              }
              placeholder="Enter division or category"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormSection>

      <Notice
        title="MULTIPLE SPORTING CODES"
        text="This development form captures the participant's primary sporting code. The production participant profile can later support additional sporting-code participation records without creating another participant."
      />
    </>
  );
}

/* ============================================================
   STEP 5
   AFFILIATIONS
   ============================================================ */

function AffiliationsStep({
  data,
  updateData,
}: {
  data: RegistrationData;

  updateData: (
    field: keyof RegistrationData,
    value: string
  ) => void;
}) {
  return (
    <>
      <StepHeading
        number="05"
        title="ORGANISATION & AFFILIATIONS"
        description="Record the participant's current school, club, team and association affiliations."
      />

      <Notice
        title="AFFILIATION CONTROL"
        text="A participant should have only one active affiliation in each applicable category. Existing conflicting affiliations must be resolved through the release or transfer process rather than by creating a duplicate participant."
      />

      <FormSection
        number="05.1"
        title="CURRENT AFFILIATIONS"
        reference="DEVELOPMENT ENTRY"
      >
        <FormRow>
          <RowNumber value="01" />

          <FormLabel>
            School
          </FormLabel>

          <FormControl>
            <input
              value={data.school}
              onChange={(event) =>
                updateData(
                  "school",
                  event.target.value
                )
              }
              placeholder="Search / enter school"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Club
          </FormLabel>

          <FormControl last>
            <input
              value={data.club}
              onChange={(event) =>
                updateData(
                  "club",
                  event.target.value
                )
              }
              placeholder="Search / enter club"
              style={styles.input}
            />
          </FormControl>
        </FormRow>

        <FormRow>
          <RowNumber value="02" />

          <FormLabel>
            Team
          </FormLabel>

          <FormControl>
            <input
              value={data.team}
              onChange={(event) =>
                updateData(
                  "team",
                  event.target.value
                )
              }
              placeholder="Search / enter team"
              style={styles.input}
            />
          </FormControl>

          <FormLabel>
            Association
          </FormLabel>

          <FormControl last>
            <input
              value={data.association}
              onChange={(event) =>
                updateData(
                  "association",
                  event.target.value
                )
              }
              placeholder="Search / enter association"
              style={styles.input}
            />
          </FormControl>
        </FormRow>
      </FormSection>

      <div style={styles.developmentNotice}>
        <div
          style={
            styles.developmentNoticeCode
          }
        >
          DEVELOPMENT CONTROL
        </div>

        <div
          style={
            styles.developmentNoticeText
          }
        >
          These organisation fields are
          currently temporary text-entry
          controls. Production must replace
          them with searches against the
          official AMS Schools, Clubs &
          Teams and Associations registries.
        </div>
      </div>

      <FormSection
        number="05.2"
        title="REGISTRATION NOTES"
        reference="INTERNAL"
      >
        <div style={styles.textAreaRow}>
          <div style={styles.textAreaNumber}>
            01
          </div>

          <div style={styles.textAreaLabel}>
            Internal Notes
          </div>

          <div style={styles.textAreaControl}>
            <textarea
              value={data.notes}
              onChange={(event) =>
                updateData(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Enter internal registration notes where applicable"
              style={styles.textarea}
            />
          </div>
        </div>
      </FormSection>
    </>
  );
}

/* ============================================================
   STEP 6
   REVIEW
   ============================================================ */

function ReviewStep({
  data,
  participantAge,
  developmentParticipantNumber,
  declarationAccepted,
  setDeclarationAccepted,
  setStep,
}: {
  data: RegistrationData;

  participantAge: number | null;

  developmentParticipantNumber: string;

  declarationAccepted: boolean;

  setDeclarationAccepted: (
    value: boolean
  ) => void;

  setStep: (value: number) => void;
}) {
  return (
    <>
      <StepHeading
        number="06"
        title="REVIEW & REGISTER"
        description="Review the participant record before final registration."
      />

      <ReviewSection
        number="06.1"
        title="PERSONAL DETAILS"
        onEdit={() => setStep(2)}
      >
        <ReviewRow
          label="First Name(s)"
          value={data.firstName}
          label2="Middle Name(s)"
          value2={data.middleNames}
        />

        <ReviewRow
          label="Surname"
          value={data.surname}
          label2="Date of Birth"
          value2={
            formatValue(
              data.dateOfBirth
            )
          }
        />

        <ReviewRow
          label="Age"
          value={
            participantAge === null
              ? "—"
              : `${participantAge} years`
          }
          label2="Gender"
          value2={data.gender}
        />

        <ReviewRow
          label="Identity Type"
          value={data.idType}
          label2="ID / Passport No."
          value2={data.idNumber}
        />

        <ReviewRow
          label="Participant Type"
          value={data.participantType}
          label2="Record Status"
          value2="New Registration"
        />
      </ReviewSection>

      <ReviewSection
        number="06.2"
        title="CONTACT & GUARDIAN"
        onEdit={() => setStep(3)}
      >
        <ReviewRow
          label="Mobile"
          value={data.mobile}
          label2="Email"
          value2={data.email}
        />

        <ReviewRow
          label="Address"
          value={buildAddress(data)}
          label2="Province"
          value2={data.province}
        />

        <ReviewRow
          label="Guardian"
          value={
            `${data.guardianFirstName} ${data.guardianSurname}`.trim()
          }
          label2="Relationship"
          value2={
            data.guardianRelationship
          }
        />

        <ReviewRow
          label="Guardian Mobile"
          value={data.guardianMobile}
          label2="Guardian Email"
          value2={data.guardianEmail}
        />

        <ReviewRow
          label="Emergency Contact"
          value={data.emergencyName}
          label2="Emergency Mobile"
          value2={data.emergencyMobile}
        />
      </ReviewSection>

      <ReviewSection
        number="06.3"
        title="PARTICIPATION"
        onEdit={() => setStep(4)}
      >
        <ReviewRow
          label="Sporting Code"
          value={data.sportingCode}
          label2="Participant Role"
          value2={data.participantRole}
        />

        <ReviewRow
          label="Age Group"
          value={data.ageGroup}
          label2="Division / Category"
          value2={data.division}
        />
      </ReviewSection>

      <ReviewSection
        number="06.4"
        title="AFFILIATIONS"
        onEdit={() => setStep(5)}
      >
        <ReviewRow
          label="School"
          value={data.school}
          label2="Club"
          value2={data.club}
        />

        <ReviewRow
          label="Team"
          value={data.team}
          label2="Association"
          value2={data.association}
        />

        <ReviewRow
          label="Internal Notes"
          value={data.notes}
          label2="Affiliation Status"
          value2="Pending registration"
        />
      </ReviewSection>

      <SectionTitle
        number="06.5"
        title="PARTICIPANT NUMBER"
        reference="DEVELOPMENT PREVIEW"
      />

      <div
        style={
          styles.participantNumberFrame
        }
      >
        <div
          style={
            styles.participantNumberLabel
          }
        >
          DEVELOPMENT PREVIEW
        </div>

        <div
          style={
            styles.participantNumberValue
          }
        >
          {developmentParticipantNumber}
        </div>

        <div
          style={
            styles.participantNumberExplanation
          }
        >
          This is not an official allocated
          participant number. Production must
          allocate the sequence and permanent
          number on the server only after the
          registration transaction succeeds.
        </div>
      </div>

      <SectionTitle
        number="06.6"
        title="DECLARATION"
        reference="FINAL CONFIRMATION"
      />

      <div style={styles.declarationBox}>
        <label
          style={
            styles.declarationRow
          }
        >
          <input
            type="checkbox"
            checked={
              declarationAccepted
            }
            onChange={(event) =>
              setDeclarationAccepted(
                event.target.checked
              )
            }
            style={styles.checkbox}
          />

          <span>
            I confirm that the information
            captured in this registration
            has been reviewed and is correct
            to the best of my knowledge. I
            understand that the production
            system must perform final
            duplicate, affiliation and
            server-side validation before
            creating the permanent record.
          </span>
        </label>
      </div>

      <div style={styles.finalWarning}>
        <strong>
          DEVELOPMENT MODE:
        </strong>{" "}
        Selecting Register Participant
        currently completes the front-end
        demonstration only. No participant
        is written to a production database.
      </div>
    </>
  );
}

/* ============================================================
   REGISTRATION SUCCESS
   ============================================================ */

function RegistrationSuccess({
  participantName,
  developmentParticipantNumber,
}: {
  participantName: string;
  developmentParticipantNumber: string;
}) {
  return (
    <div style={styles.successPage}>
      <div style={styles.successTopLine}>
        AMS / PARTICIPANTS / REGISTRATION
      </div>

      <div style={styles.successMark}>
        ✓
      </div>

      <div style={styles.successEyebrow}>
        REGISTRATION WORKFLOW COMPLETED
      </div>

      <h1 style={styles.successTitle}>
        PARTICIPANT RECORD PREPARED
      </h1>

      <p style={styles.successDescription}>
        {participantName || "The participant"}{" "}
        has completed the front-end
        registration workflow.
      </p>

      <div
        style={
          styles.successNumberFrame
        }
      >
        <div
          style={
            styles.successNumberLabel
          }
        >
          DEVELOPMENT PARTICIPANT NUMBER
        </div>

        <div
          style={
            styles.successNumberValue
          }
        >
          {developmentParticipantNumber}
        </div>
      </div>

      <div
        style={
          styles.developmentWarning
        }
      >
        <strong>
          NOT AN OFFICIAL REGISTRY NUMBER.
        </strong>
        <br />
        The production AMS must allocate the
        final sequence and permanent
        participant number through the
        backend/database transaction.
      </div>

      <div style={styles.successActions}>
        <Link
          href="/apps/ams/participants"
          style={styles.secondaryLink}
        >
          PARTICIPANT REGISTRY
        </Link>

        <Link
          href="/apps/ams/participants/register"
          style={styles.primaryLink}
        >
          REGISTER ANOTHER
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function StepHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <section style={styles.stepHeading}>
      <div style={styles.stepHeadingNumber}>
        {number}
      </div>

      <div>
        <div style={styles.stepHeadingLabel}>
          PARTICIPANT REGISTRATION
        </div>

        <h2 style={styles.stepHeadingTitle}>
          {title}
        </h2>

        <p
          style={
            styles.stepHeadingDescription
          }
        >
          {description}
        </p>
      </div>
    </section>
  );
}

function Notice({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={styles.notice}>
      <div style={styles.noticeMarker}>
        i
      </div>

      <div>
        <div style={styles.noticeTitle}>
          {title}
        </div>

        <div style={styles.noticeText}>
          {text}
        </div>
      </div>
    </div>
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

function FormSection({
  number,
  title,
  reference,
  children,
}: {
  number: string;
  title: string;
  reference: string;
  children: ReactNode;
}) {
  return (
    <section style={styles.formSection}>
      <div style={styles.formSectionHeader}>
        <div>
          <span
            style={
              styles.formSectionNumber
            }
          >
            {number}
          </span>

          <span>
            {title}
          </span>
        </div>

        <span
          style={
            styles.formSectionReference
          }
        >
          {reference}
        </span>
      </div>

      {children}
    </section>
  );
}

function FormRow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={styles.formRow}>
      {children}
    </div>
  );
}

function RowNumber({
  value,
}: {
  value: string;
}) {
  return (
    <div style={styles.rowNumber}>
      {value}
    </div>
  );
}

function FormLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div style={styles.formLabel}>
      <span>{children}</span>

      {required ? (
        <span style={styles.required}>
          *
        </span>
      ) : null}
    </div>
  );
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

        ...(last
          ? styles.formControlLast
          : {}),
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

        ...(width
          ? { width }
          : {}),
      }}
    >
      {children}
    </th>
  );
}

function EmptyTableState({
  code,
  title,
  text,
}: {
  code: string;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.emptyTableState}>
      <div style={styles.emptyTableCode}>
        {code}
      </div>

      <div style={styles.emptyTableTitle}>
        {title}
      </div>

      <div style={styles.emptyTableText}>
        {text}
      </div>
    </div>
  );
}

function ReviewSection({
  number,
  title,
  onEdit,
  children,
}: {
  number: string;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section style={styles.reviewSection}>
      <div style={styles.reviewHeader}>
        <div>
          <span style={styles.reviewNumber}>
            {number}
          </span>

          <span style={styles.reviewTitle}>
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={onEdit}
          style={styles.editButton}
        >
          EDIT
        </button>
      </div>

      {children}
    </section>
  );
}

function ReviewRow({
  label,
  value,
  label2,
  value2,
}: {
  label: string;
  value: string;
  label2: string;
  value2: string;
}) {
  return (
    <div style={styles.reviewRow}>
      <div style={styles.reviewLabel}>
        {label}
      </div>

      <div style={styles.reviewValue}>
        {displayValue(value)}
      </div>

      <div style={styles.reviewLabel}>
        {label2}
      </div>

      <div
        style={
          styles.reviewValueLast
        }
      >
        {displayValue(value2)}
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function displayValue(
  value: string
) {
  return value.trim()
    ? value
    : "—";
}

function formatValue(
  value: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(`${value}T00:00:00`);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatDate() {
  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());
}

function calculateAge(
  dateOfBirth: string
) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate =
    new Date(
      `${dateOfBirth}T00:00:00`
    );

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function alphabetPosition(
  value: string
) {
  const letter =
    value
      .trim()
      .charAt(0)
      .toUpperCase();

  const code =
    letter.charCodeAt(0);

  if (
    code < 65 ||
    code > 90
  ) {
    return "00";
  }

  return String(
    code - 64
  ).padStart(2, "0");
}

function buildDevelopmentParticipantNumber(
  dateOfBirth: string,
  firstName: string,
  surname: string
) {
  if (
    !dateOfBirth ||
    !firstName.trim() ||
    !surname.trim()
  ) {
    return "PENDING";
  }

  const [
    year,
    month,
    day,
  ] = dateOfBirth.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return "PENDING";
  }

  const dob =
    `${year.slice(-2)}${month}${day}`;

  const firstInitial =
    alphabetPosition(firstName);

  const surnameInitial =
    alphabetPosition(surname);

  /*
    001 IS A DEVELOPMENT PREVIEW ONLY.

    Production must request the next
    sequence from the server/database
    transaction.
  */

  return (
    dob +
    firstInitial +
    surnameInitial +
    "001"
  );
}

function buildAddress(
  data: RegistrationData
) {
  return [
    data.addressLine1,
    data.addressLine2,
    data.suburb,
    data.townCity,
    data.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    width: "100%",
    color: TEXT_BLUE,
  },

  topUtilityRow: {
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

  /* =========================================================
     WORKFLOW
     NORMAL NAVIGATION — NOT DOUBLE BORDERED
     ========================================================= */

  workflow: {
    marginBottom: "18px",

    display: "grid",

    gridTemplateColumns:
      "repeat(6, minmax(0, 1fr))",

    backgroundColor: "#ffffff",

    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  workflowStep: {
    minHeight: "55px",

    padding: "7px 9px",

    display: "flex",
    alignItems: "center",

    gap: "7px",

    backgroundColor: "#ffffff",

    border: "none",
    borderRight:
      `1px solid ${LIGHT_BORDER}`,

    color: "#697581",

    fontFamily: "inherit",

    textAlign: "left",

    cursor: "pointer",
  },

  workflowCurrent: {
    backgroundColor: WCG_BLUE,
    color: "#ffffff",
  },

  workflowComplete: {
    backgroundColor: "#edf3ef",
    color: "#315f40",
  },

  workflowNumber: {
    width: "24px",
    height: "24px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border: `1px solid #aeb7c0`,
    borderRadius: "50%",

    color: "inherit",

    fontSize: "7px",
    fontWeight: 700,
  },

  workflowNumberCurrent: {
    borderColor: "#ffffff",
  },

  workflowNumberComplete: {
    borderColor: "#71907c",
  },

  workflowSmallLabel: {
    display: "block",

    marginBottom: "2px",

    color: "inherit",

    opacity: 0.72,

    fontSize: "6px",
    fontWeight: 700,

    letterSpacing: "0.4px",
  },

  workflowTitle: {
    display: "block",

    color: "inherit",

    fontSize: "7px",
    fontWeight: 700,

    lineHeight: 1.25,
  },

  /* =========================================================
     ERROR
     ========================================================= */

  errorBox: {
    marginBottom: "15px",

    padding: "9px 11px",

    display: "flex",
    alignItems: "center",

    gap: "9px",

    backgroundColor: "#f9eeee",

    borderLeft: "4px solid #a33f3f",
    borderTop: "1px solid #e0c5c5",
    borderRight: "1px solid #e0c5c5",
    borderBottom: "1px solid #e0c5c5",
  },

  errorMarker: {
    width: "22px",
    height: "22px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border: "1px solid #a33f3f",
    borderRadius: "50%",

    color: "#8d3434",

    fontSize: "8px",
    fontWeight: 700,
  },

  errorTitle: {
    color: "#823434",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.25px",
  },

  errorText: {
    marginTop: "2px",

    color: "#724242",

    fontSize: "8px",
  },

  /* =========================================================
     STEP HEADING
     ========================================================= */

  stepHeading: {
    minHeight: "67px",

    marginBottom: "13px",
    padding: "10px 12px",

    display: "grid",

    gridTemplateColumns: "42px 1fr",

    alignItems: "center",

    gap: "10px",

    backgroundColor:
      "rgba(255,255,255,0.94)",

    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  stepHeadingNumber: {
    color: WCG_BLUE,

    fontSize: "19px",
    fontWeight: 700,
  },

  stepHeadingLabel: {
    color: "#75808b",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.7px",
  },

  stepHeadingTitle: {
    margin: "2px 0",

    color: WCG_BLUE,

    fontSize: "14px",
    fontWeight: 700,
  },

  stepHeadingDescription: {
    margin: 0,

    color: "#66727e",

    fontSize: "8px",

    lineHeight: 1.4,
  },

  /* =========================================================
     NOTICE — NOT TABULATED
     ========================================================= */

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

  /* =========================================================
     SECTION TITLE
     ========================================================= */

  sectionTitle: {
    minHeight: "30px",

    marginTop: "17px",
    marginBottom: "7px",

    padding: "0 8px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor:
      "rgba(255,255,255,0.93)",

    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },

  sectionTitleLeft: {
    display: "flex",
    alignItems: "center",

    gap: "9px",
  },

  sectionNumber: {
    minWidth: "30px",

    color: WCG_BLUE,

    fontSize: "8px",
    fontWeight: 700,
  },

  sectionHeading: {
    color: TEXT_BLUE,

    fontSize: "9px",
    fontWeight: 700,

    letterSpacing: "0.45px",
  },

  sectionReference: {
    color: "#808b96",

    fontSize: "7px",
  },

  /* =========================================================
     ACTUAL ONLINE FORM
     DOUBLE-LINE GOVERNMENT FORM TREATMENT
     ========================================================= */

  formSection: {
    marginBottom: "14px",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  formSectionHeader: {
    minHeight: "31px",

    padding: "0 10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    boxSizing: "border-box",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",

    fontSize: "8px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  formSectionNumber: {
    marginRight: "9px",

    color:
      "rgba(255,255,255,0.72)",

    fontSize: "7px",
  },

  formSectionReference: {
    color:
      "rgba(255,255,255,0.76)",

    fontSize: "7px",
    fontWeight: 600,
  },

  formRow: {
    minHeight: "47px",

    display: "grid",

    gridTemplateColumns:
      "42px 150px minmax(170px, 1fr) 150px minmax(170px, 1fr)",

    alignItems: "stretch",

    borderBottom:
      `1px solid ${BORDER}`,
  },

  rowNumber: {
    padding: "7px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#f1f3f5",

    borderRight:
      `1px solid ${BORDER}`,

    color: "#6d7883",

    fontSize: "7px",
    fontWeight: 700,
  },

  formLabel: {
    padding: "7px 9px",

    display: "flex",
    alignItems: "center",

    gap: "3px",

    backgroundColor: PALE_BLUE,

    borderRight:
      `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "8px",
    fontWeight: 700,
  },

  required: {
    color: "#9a3535",
  },

  formControl: {
    padding: "6px 7px",

    display: "flex",
    alignItems: "center",

    borderRight:
      `1px solid ${BORDER}`,
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

  readOnlyControl: {
    width: "100%",
    minHeight: "31px",

    padding: "0 8px",

    display: "flex",
    alignItems: "center",

    boxSizing: "border-box",

    backgroundColor: "#f1f3f5",

    border: "1px solid #c4cbd2",

    color: "#5f6b76",

    fontSize: "8px",
    fontWeight: 600,
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

  formActionInformation: {
    color: "#707b86",

    fontSize: "7px",
  },

  formActionButtons: {
    display: "flex",
    alignItems: "center",

    gap: "6px",
  },

  /* =========================================================
     BUTTONS
     ========================================================= */

  primaryButton: {
    minHeight: "31px",

    padding: "0 13px",

    backgroundColor: WCG_BLUE,

    border: `1px solid ${WCG_BLUE}`,

    color: "#ffffff",

    fontFamily: "inherit",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.2px",

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
    cursor: "default",
  },

  secondaryLink: {
    minHeight: "31px",

    padding: "0 12px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    boxSizing: "border-box",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    textDecoration: "none",

    fontSize: "7px",
    fontWeight: 700,
  },

  registerFinalButton: {
    minHeight: "32px",

    padding: "0 15px",

    backgroundColor: DARK_BLUE,

    border: `1px solid ${DARK_BLUE}`,

    color: "#ffffff",

    fontFamily: "inherit",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.25px",

    cursor: "pointer",
  },

  /* =========================================================
     RESULTS TABLE
     ========================================================= */

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

    minWidth: "900px",

    borderCollapse: "collapse",

    tableLayout: "fixed",
  },

  tableHeading: {
    padding: "7px 8px",

    backgroundColor: TABLE_HEADER,

    borderRight:
      `1px solid ${BORDER}`,
    borderBottom:
      `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "7px",
    fontWeight: 700,

    textAlign: "left",

    whiteSpace: "nowrap",
  },

  emptyTableCell: {
    padding: 0,
  },

  emptyTableState: {
    minHeight: "115px",

    padding: "20px",

    display: "flex",
    flexDirection: "column",

    alignItems: "center",
    justifyContent: "center",

    textAlign: "center",
  },

  emptyTableCode: {
    color: "#7d8791",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  emptyTableTitle: {
    marginTop: "5px",

    color: TEXT_BLUE,

    fontSize: "9px",
    fontWeight: 700,
  },

  emptyTableText: {
    maxWidth: "520px",

    marginTop: "4px",

    color: "#707b86",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  searchCompletionNotice: {
    marginTop: "10px",

    padding: "9px 11px",

    display: "grid",

    gridTemplateColumns: "25px 1fr",

    gap: "9px",

    backgroundColor: "#edf4ef",

    borderLeft: "4px solid #427452",
    borderTop: "1px solid #cadbce",
    borderRight: "1px solid #cadbce",
    borderBottom: "1px solid #cadbce",
  },

  searchCompletionMarker: {
    width: "20px",
    height: "20px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    border: "1px solid #427452",
    borderRadius: "50%",

    color: "#315f40",

    fontSize: "8px",
    fontWeight: 700,
  },

  searchCompletionTitle: {
    color: "#315f40",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  searchCompletionText: {
    marginTop: "2px",

    color: "#587063",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  /* =========================================================
     TEXTAREA FORM
     ========================================================= */

  textAreaRow: {
    minHeight: "105px",

    display: "grid",

    gridTemplateColumns:
      "42px 150px 1fr",
  },

  textAreaNumber: {
    padding: "8px",

    display: "flex",
    justifyContent: "center",

    backgroundColor: "#f1f3f5",

    borderRight:
      `1px solid ${BORDER}`,

    color: "#6d7883",

    fontSize: "7px",
    fontWeight: 700,
  },

  textAreaLabel: {
    padding: "9px",

    backgroundColor: PALE_BLUE,

    borderRight:
      `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "8px",
    fontWeight: 700,
  },

  textAreaControl: {
    padding: "7px",
  },

  textarea: {
    width: "100%",
    minHeight: "88px",

    padding: "8px",

    boxSizing: "border-box",

    resize: "vertical",

    backgroundColor: "#ffffff",

    border: "1px solid #9da7b1",
    borderRadius: 0,

    outline: "none",

    color: "#26323d",

    fontFamily: "inherit",

    fontSize: "9px",

    lineHeight: 1.5,
  },

  developmentNotice: {
    marginBottom: "14px",

    padding: "9px 11px",

    backgroundColor: "#f6f2e9",

    borderLeft: "4px solid #9a7b3d",
    borderTop: "1px solid #ddd2b8",
    borderRight: "1px solid #ddd2b8",
    borderBottom: "1px solid #ddd2b8",
  },

  developmentNoticeCode: {
    color: "#765f30",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  developmentNoticeText: {
    marginTop: "3px",

    color: "#6c603f",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  /* =========================================================
     REVIEW TABLES
     ========================================================= */

  reviewSection: {
    marginBottom: "14px",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,
  },

  reviewHeader: {
    minHeight: "31px",

    padding: "0 9px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    backgroundColor: WCG_BLUE,

    color: "#ffffff",
  },

  reviewNumber: {
    marginRight: "9px",

    color:
      "rgba(255,255,255,0.72)",

    fontSize: "7px",
    fontWeight: 700,
  },

  reviewTitle: {
    fontSize: "8px",
    fontWeight: 700,

    letterSpacing: "0.3px",
  },

  editButton: {
    minHeight: "23px",

    padding: "0 8px",

    backgroundColor: "#ffffff",

    border: "1px solid #ffffff",

    color: WCG_BLUE,

    fontFamily: "inherit",

    fontSize: "7px",
    fontWeight: 700,

    cursor: "pointer",
  },

  reviewRow: {
    minHeight: "39px",

    display: "grid",

    gridTemplateColumns:
      "145px 1fr 145px 1fr",

    borderBottom:
      `1px solid ${LIGHT_BORDER}`,
  },

  reviewLabel: {
    padding: "7px 9px",

    display: "flex",
    alignItems: "center",

    backgroundColor: PALE_BLUE,

    borderRight:
      `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "7px",
    fontWeight: 700,
  },

  reviewValue: {
    padding: "7px 9px",

    display: "flex",
    alignItems: "center",

    borderRight:
      `1px solid ${BORDER}`,

    color: "#596570",

    fontSize: "8px",
  },

  reviewValueLast: {
    padding: "7px 9px",

    display: "flex",
    alignItems: "center",

    color: "#596570",

    fontSize: "8px",
  },

  participantNumberFrame: {
    padding: "15px",

    backgroundColor: "#ffffff",

    border: `3px double ${WCG_BLUE}`,

    textAlign: "center",
  },

  participantNumberLabel: {
    color: "#74808b",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  participantNumberValue: {
    marginTop: "6px",

    color: WCG_BLUE,

    fontSize: "21px",
    fontWeight: 700,

    letterSpacing: "2px",
  },

  participantNumberExplanation: {
    maxWidth: "600px",

    margin: "7px auto 0",

    color: "#6b7681",

    fontSize: "7px",

    lineHeight: 1.5,
  },

  declarationBox: {
    padding: "12px",

    backgroundColor: "#ffffff",

    border: `1px solid ${BORDER}`,
  },

  declarationRow: {
    display: "flex",
    alignItems: "flex-start",

    gap: "9px",

    color: "#53606c",

    fontSize: "8px",

    lineHeight: 1.55,

    cursor: "pointer",
  },

  checkbox: {
    width: "16px",
    height: "16px",

    marginTop: "1px",

    flexShrink: 0,
  },

  finalWarning: {
    marginTop: "10px",

    padding: "9px 11px",

    backgroundColor: "#f6f2e9",

    borderLeft: "4px solid #9a7b3d",

    color: "#6c603f",

    fontSize: "8px",

    lineHeight: 1.5,
  },

  /* =========================================================
     BOTTOM NAVIGATION
     ========================================================= */

  bottomNavigation: {
    marginTop: "17px",
    paddingTop: "12px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",

    borderTop: `1px solid ${BORDER}`,
  },

  navigationRight: {
    display: "flex",
    alignItems: "center",

    gap: "10px",
  },

  stepIndicator: {
    color: "#74808b",

    fontSize: "7px",
    fontWeight: 700,
  },

  /* =========================================================
     SUCCESS
     ========================================================= */

  successPage: {
    maxWidth: "760px",

    margin: "20px auto",

    padding: "28px",

    boxSizing: "border-box",

    backgroundColor: "#ffffff",

    borderTop: `5px solid ${WCG_BLUE}`,
    borderRight: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    borderLeft: `1px solid ${BORDER}`,

    textAlign: "center",
  },

  successTopLine: {
    paddingBottom: "10px",

    borderBottom:
      `1px solid ${LIGHT_BORDER}`,

    color: "#74808b",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  successMark: {
    width: "48px",
    height: "48px",

    margin: "24px auto 12px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    border: "2px solid #427452",
    borderRadius: "50%",

    color: "#315f40",

    fontSize: "18px",
    fontWeight: 700,
  },

  successEyebrow: {
    color: "#61796a",

    fontSize: "7px",
    fontWeight: 700,

    letterSpacing: "0.6px",
  },

  successTitle: {
    margin: "5px 0",

    color: WCG_BLUE,

    fontSize: "19px",
    fontWeight: 700,
  },

  successDescription: {
    margin: "0 auto",

    color: "#65717d",

    fontSize: "9px",
  },

  successNumberFrame: {
    maxWidth: "470px",

    margin: "20px auto 10px",

    border: `3px double ${WCG_BLUE}`,
  },

  successNumberLabel: {
    padding: "7px",

    backgroundColor: PALE_BLUE,

    borderBottom:
      `1px solid ${BORDER}`,

    color: TEXT_BLUE,

    fontSize: "7px",
    fontWeight: 700,
  },

  successNumberValue: {
    padding: "14px",

    color: WCG_BLUE,

    fontSize: "20px",
    fontWeight: 700,

    letterSpacing: "2px",
  },

  developmentWarning: {
    maxWidth: "560px",

    margin: "0 auto",

    padding: "10px",

    backgroundColor: "#f6f2e9",

    borderLeft: "4px solid #9a7b3d",

    color: "#6c603f",

    fontSize: "7px",

    lineHeight: 1.5,
  },

  successActions: {
    marginTop: "19px",

    display: "flex",
    justifyContent: "center",

    gap: "8px",
  },

  primaryLink: {
    minHeight: "31px",

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
  },
};