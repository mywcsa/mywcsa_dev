"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RegistrationData = {
  // Step 1
  firstName: string;
  middleNames: string;
  surname: string;
  preferredName: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;

  // Step 2
  gender: string;
  nationality: string;
  countryOfBirth: string;
  recordStatus: string;

  // Step 3
  mobileNumber: string;
  emailAddress: string;
  addressLine1: string;
  addressLine2: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;

  guardianRequired: string;
  guardianFirstName: string;
  guardianSurname: string;
  guardianRelationship: string;
  guardianMobile: string;
  guardianEmail: string;

  emergencyName: string;
  emergencyRelationship: string;
  emergencyMobile: string;

  // Step 4
  participantType: string;
  sportingCode: string;
  participantRole: string;
  ageGroup: string;
  division: string;
  participationLevel: string;

  // Step 5
  schoolName: string;
  clubName: string;
  teamName: string;
  associationName: string;
  affiliationStartDate: string;

  // Declaration
  declarationAccepted: boolean;
};

const initialData: RegistrationData = {
  firstName: "",
  middleNames: "",
  surname: "",
  preferredName: "",
  dateOfBirth: "",
  idType: "Not Provided",
  idNumber: "",

  gender: "",
  nationality: "South African",
  countryOfBirth: "South Africa",
  recordStatus: "Active",

  mobileNumber: "",
  emailAddress: "",
  addressLine1: "",
  addressLine2: "",
  suburb: "",
  townCity: "",
  province: "Western Cape",
  postalCode: "",

  guardianRequired: "Yes",
  guardianFirstName: "",
  guardianSurname: "",
  guardianRelationship: "",
  guardianMobile: "",
  guardianEmail: "",

  emergencyName: "",
  emergencyRelationship: "",
  emergencyMobile: "",

  participantType: "",
  sportingCode: "",
  participantRole: "",
  ageGroup: "",
  division: "",
  participationLevel: "",

  schoolName: "",
  clubName: "",
  teamName: "",
  associationName: "",
  affiliationStartDate: "",

  declarationAccepted: false,
};

export default function RegisterParticipantPage() {
  const [step, setStep] = useState(1);

  const [data, setData] =
    useState<RegistrationData>(initialData);

  const [duplicateChecked, setDuplicateChecked] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [participantNumber, setParticipantNumber] =
    useState("");

  const [error, setError] =
    useState("");

  const participantAge = useMemo(() => {
    if (!data.dateOfBirth) {
      return null;
    }

    const birthDate =
      new Date(`${data.dateOfBirth}T00:00:00`);

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
      age--;
    }

    return age;
  }, [data.dateOfBirth]);

  const isMinor =
    participantAge !== null &&
    participantAge < 18;

  function updateField<K extends keyof RegistrationData>(
    field: K,
    value: RegistrationData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");

    if (
      field === "firstName" ||
      field === "surname" ||
      field === "dateOfBirth" ||
      field === "idNumber"
    ) {
      setDuplicateChecked(false);
    }
  }

  function runDuplicateCheck() {
    setError("");

    if (
      !data.firstName.trim() ||
      !data.surname.trim() ||
      !data.dateOfBirth
    ) {
      setError(
        "Enter the participant's first name, surname and date of birth before searching the registry."
      );

      return;
    }

    setSearching(true);

    /*
      DEVELOPMENT MODE

      This currently simulates completion of the duplicate
      search interface.

      When the AMS database is connected, this function must
      call the secure server-side duplicate search.

      It must NOT automatically assume that no duplicate exists.
    */

    window.setTimeout(() => {
      setSearching(false);
      setDuplicateChecked(true);
    }, 500);
  }

  function validateStep(
    targetStep: number
  ) {
    setError("");

    if (targetStep === 1) {
      if (!duplicateChecked) {
        setError(
          "Complete the Participant Registry duplicate check before continuing."
        );

        return false;
      }
    }

    if (targetStep === 2) {
      if (
        !data.firstName.trim() ||
        !data.surname.trim() ||
        !data.dateOfBirth ||
        !data.gender ||
        !data.nationality.trim()
      ) {
        setError(
          "Complete all required Personal Details before continuing."
        );

        return false;
      }
    }

    if (targetStep === 3) {
      if (
        !data.mobileNumber.trim() &&
        !data.emailAddress.trim() &&
        !isMinor
      ) {
        setError(
          "Provide at least a mobile number or email address for the participant."
        );

        return false;
      }

      if (
        isMinor &&
        (!data.guardianFirstName.trim() ||
          !data.guardianSurname.trim() ||
          !data.guardianRelationship ||
          !data.guardianMobile.trim())
      ) {
        setError(
          "A parent or guardian name, relationship and mobile number are required for a participant under 18."
        );

        return false;
      }

      if (
        !data.emergencyName.trim() ||
        !data.emergencyMobile.trim()
      ) {
        setError(
          "Complete the emergency contact information before continuing."
        );

        return false;
      }
    }

    if (targetStep === 4) {
      if (
        !data.participantType ||
        !data.participantRole
      ) {
        setError(
          "Select the participant type and participant role before continuing."
        );

        return false;
      }
    }

    if (targetStep === 5) {
      if (!data.affiliationStartDate) {
        setError(
          "Enter the affiliation start date before continuing."
        );

        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) =>
      Math.min(current + 1, 6)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    setError("");

    setStep((current) =>
      Math.max(current - 1, 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToStep(
    requestedStep: number
  ) {
    if (requestedStep >= step) {
      return;
    }

    setError("");
    setStep(requestedStep);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function registerParticipant() {
    setError("");

    if (!data.declarationAccepted) {
      setError(
        "Confirm the registration declaration before registering the participant."
      );

      return;
    }

    /*
      IMPORTANT:

      This is TEMPORARY UI behaviour.

      The real permanent participant number must eventually
      be generated on the SERVER inside a database transaction.

      The browser must NOT generate the production sequence.
    */

    const previewNumber =
      buildDevelopmentParticipantNumber(
        data.dateOfBirth,
        data.firstName,
        data.surname
      );

    setParticipantNumber(
      previewNumber
    );

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (submitted) {
    return (
      <RegistrationSuccess
        participantNumber={
          participantNumber
        }
        data={data}
      />
    );
  }

  return (
    <main>
      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <div style={styles.breadcrumb}>
        <Link
          href="/apps/ams"
          style={styles.breadcrumbLink}
        >
          MyWCSA AMS
        </Link>

        <span>/</span>

        <Link
          href="/apps/ams/participants"
          style={styles.breadcrumbLink}
        >
          Participants
        </Link>

        <span>/</span>

        <span>
          Register Participant
        </span>
      </div>

      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <section style={styles.pageHeading}>
        <div>
          <div style={styles.eyebrow}>
            PARTICIPANT REGISTRATION
          </div>

          <h1 style={styles.pageTitle}>
            Register Participant
          </h1>

          <p style={styles.pageSubtitle}>
            Create a new permanent participant
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
          STATUS BAR
          ===================================================== */}

      <section style={styles.statusBar}>
        <StatusItem
          label="REGISTRATION"
          value="NEW PARTICIPANT"
        />

        <StatusItem
          label="STATUS"
          value="NOT SUBMITTED"
        />

        <StatusItem
          label="CURRENT STEP"
          value={`${step} OF 6`}
        />

        <StatusItem
          label="PARTICIPANT NO."
          value="PENDING"
        />
      </section>

      {/* =====================================================
          WORKFLOW
          ===================================================== */}

      <section style={styles.workflow}>
        <WorkflowStep
          number={1}
          title="Duplicate Check"
          currentStep={step}
          onClick={goToStep}
        />

        <WorkflowStep
          number={2}
          title="Personal Details"
          currentStep={step}
          onClick={goToStep}
        />

        <WorkflowStep
          number={3}
          title="Contact & Guardian"
          currentStep={step}
          onClick={goToStep}
        />

        <WorkflowStep
          number={4}
          title="Participation"
          currentStep={step}
          onClick={goToStep}
        />

        <WorkflowStep
          number={5}
          title="Affiliations"
          currentStep={step}
          onClick={goToStep}
        />

        <WorkflowStep
          number={6}
          title="Review"
          currentStep={step}
          onClick={goToStep}
        />
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div style={styles.errorBox}>
          <strong>
            ACTION REQUIRED
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      {/* =====================================================
          CURRENT STEP
          ===================================================== */}

      {step === 1 && (
        <DuplicateCheckStep
          data={data}
          updateField={updateField}
          duplicateChecked={
            duplicateChecked
          }
          searching={searching}
          runDuplicateCheck={
            runDuplicateCheck
          }
        />
      )}

      {step === 2 && (
        <PersonalDetailsStep
          data={data}
          updateField={updateField}
          participantAge={
            participantAge
          }
        />
      )}

      {step === 3 && (
        <ContactGuardianStep
          data={data}
          updateField={updateField}
          isMinor={isMinor}
          participantAge={
            participantAge
          }
        />
      )}

      {step === 4 && (
        <ParticipationStep
          data={data}
          updateField={updateField}
        />
      )}

      {step === 5 && (
        <AffiliationsStep
          data={data}
          updateField={updateField}
        />
      )}

      {step === 6 && (
        <ReviewStep
          data={data}
          participantAge={
            participantAge
          }
          updateField={updateField}
          goToStep={goToStep}
        />
      )}

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <section style={styles.bottomNavigation}>
        <div>
          {step === 1 ? (
            <Link
              href="/apps/ams/participants"
              style={styles.secondaryButton}
            >
              ← BACK TO PARTICIPANTS
            </Link>
          ) : (
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
          <span style={styles.stepIndicator}>
            STEP {step} OF 6
          </span>

          {step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              style={styles.primaryButton}
            >
              SAVE & CONTINUE →
            </button>
          ) : (
            <button
              type="button"
              onClick={
                registerParticipant
              }
              style={
                styles.registerFinalButton
              }
            >
              REGISTER PARTICIPANT
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   STEP 01
   DUPLICATE CHECK
   ============================================================ */

function DuplicateCheckStep({
  data,
  updateField,
  duplicateChecked,
  searching,
  runDuplicateCheck,
}: {
  data: RegistrationData;
  updateField: UpdateField;
  duplicateChecked: boolean;
  searching: boolean;
  runDuplicateCheck: () => void;
}) {
  return (
    <>
      <StepIntroduction
        number="01"
        title="Duplicate Check"
        description="Search the Participant Registry before creating a new record."
      />

      <InfoNotice
        title="SEARCH BEFORE REGISTRATION"
        text="Every participant must have only one permanent WCSA Participant Number. If the participant already exists, use the existing record instead of creating another registration."
      />

      <Panel
        number="01.1"
        title="PARTICIPANT IDENTITY SEARCH"
      >
        <p style={styles.instructions}>
          Enter the participant's basic
          identity information. First name,
          surname and date of birth are
          required.
        </p>

        <div style={styles.formGrid2}>
          <TextInput
            label="First Name(s)"
            required
            value={data.firstName}
            placeholder="Enter first name(s)"
            onChange={(value) =>
              updateField(
                "firstName",
                value
              )
            }
          />

          <TextInput
            label="Surname"
            required
            value={data.surname}
            placeholder="Enter surname"
            onChange={(value) =>
              updateField(
                "surname",
                value
              )
            }
          />

          <TextInput
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={(value) =>
              updateField(
                "dateOfBirth",
                value
              )
            }
          />

          <TextInput
            label="ID / Passport Number"
            value={data.idNumber}
            placeholder="Optional during search"
            onChange={(value) =>
              updateField(
                "idNumber",
                value
              )
            }
          />
        </div>

        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={
              runDuplicateCheck
            }
            disabled={searching}
            style={styles.primaryButton}
          >
            {searching
              ? "SEARCHING..."
              : "SEARCH PARTICIPANT REGISTRY"}
          </button>
        </div>
      </Panel>

      <Panel
        number="01.2"
        title="POSSIBLE MATCHES"
      >
        {!duplicateChecked ? (
          <EmptyState
            title="Duplicate check required"
            text="Search the Participant Registry before continuing with the registration."
          />
        ) : (
          <div style={styles.successSearch}>
            <div
              style={
                styles.successSearchIcon
              }
            >
              ✓
            </div>

            <div>
              <div
                style={
                  styles.successSearchTitle
                }
              >
                REGISTRY SEARCH COMPLETED
              </div>

              <p
                style={
                  styles.successSearchText
                }
              >
                The duplicate-check
                interface has completed.
                The live participant
                database is not connected
                yet, so this development
                version cannot confirm
                whether an actual matching
                record exists.
              </p>

              <div
                style={
                  styles.developmentBox
                }
              >
                <strong>
                  DEVELOPMENT MODE:
                </strong>{" "}
                Live matching will be
                connected to the AMS
                database before production
                registration is enabled.
              </div>
            </div>
          </div>
        )}
      </Panel>

      <div style={styles.twoCards}>
        <RuleCard
          number="01.3"
          title="IF A MATCH IS FOUND"
          text="Open the existing participant record. Do not issue another participant number. Transfers and affiliation changes must be processed against the existing participant."
        />

        <RuleCard
          number="01.4"
          title="IF NO MATCH IS FOUND"
          text="Continue with the new registration. The permanent participant number will only be issued after the complete registration has been successfully submitted."
        />
      </div>
    </>
  );
}

/* ============================================================
   STEP 02
   PERSONAL DETAILS
   ============================================================ */

function PersonalDetailsStep({
  data,
  updateField,
  participantAge,
}: {
  data: RegistrationData;
  updateField: UpdateField;
  participantAge: number | null;
}) {
  return (
    <>
      <StepIntroduction
        number="02"
        title="Personal Details"
        description="Capture the participant's official personal and identification information."
      />

      <Panel
        number="02.1"
        title="PERSONAL INFORMATION"
      >
        <div style={styles.formGrid3}>
          <TextInput
            label="First Name(s)"
            required
            value={data.firstName}
            onChange={(value) =>
              updateField(
                "firstName",
                value
              )
            }
          />

          <TextInput
            label="Middle Name(s)"
            value={data.middleNames}
            onChange={(value) =>
              updateField(
                "middleNames",
                value
              )
            }
          />

          <TextInput
            label="Surname"
            required
            value={data.surname}
            onChange={(value) =>
              updateField(
                "surname",
                value
              )
            }
          />

          <TextInput
            label="Preferred Name"
            value={data.preferredName}
            onChange={(value) =>
              updateField(
                "preferredName",
                value
              )
            }
          />

          <TextInput
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={(value) =>
              updateField(
                "dateOfBirth",
                value
              )
            }
          />

          <ReadOnlyField
            label="Calculated Age"
            value={
              participantAge === null
                ? "—"
                : `${participantAge} years`
            }
          />

          <SelectInput
            label="Gender"
            required
            value={data.gender}
            options={[
              "",
              "Male",
              "Female",
              "Other",
              "Prefer not to say",
            ]}
            onChange={(value) =>
              updateField(
                "gender",
                value
              )
            }
          />

          <TextInput
            label="Nationality"
            required
            value={data.nationality}
            onChange={(value) =>
              updateField(
                "nationality",
                value
              )
            }
          />

          <TextInput
            label="Country of Birth"
            value={data.countryOfBirth}
            onChange={(value) =>
              updateField(
                "countryOfBirth",
                value
              )
            }
          />
        </div>
      </Panel>

      <Panel
        number="02.2"
        title="IDENTIFICATION"
      >
        <div style={styles.formGrid3}>
          <SelectInput
            label="Identification Type"
            value={data.idType}
            options={[
              "Not Provided",
              "South African ID",
              "Passport",
              "Other Identification",
            ]}
            onChange={(value) =>
              updateField(
                "idType",
                value
              )
            }
          />

          <TextInput
            label="Identification Number"
            value={data.idNumber}
            placeholder="Enter ID / passport number"
            onChange={(value) =>
              updateField(
                "idNumber",
                value
              )
            }
          />

          <ReadOnlyField
            label="Record Status"
            value={data.recordStatus}
          />
        </div>
      </Panel>

      <InfoNotice
        title="SYSTEM CONTROLLED INFORMATION"
        text="The permanent WCSA Participant Number, registration date, creator and audit information will be generated by MyWCSA when the final registration is successfully submitted."
      />
    </>
  );
}

/* ============================================================
   STEP 03
   CONTACT & GUARDIAN
   ============================================================ */

function ContactGuardianStep({
  data,
  updateField,
  isMinor,
  participantAge,
}: {
  data: RegistrationData;
  updateField: UpdateField;
  isMinor: boolean;
  participantAge: number | null;
}) {
  return (
    <>
      <StepIntroduction
        number="03"
        title="Contact & Guardian"
        description="Capture contact, address, parent or guardian and emergency information."
      />

      {participantAge !== null && (
        <InfoNotice
          title={
            isMinor
              ? "MINOR PARTICIPANT"
              : "ADULT PARTICIPANT"
          }
          text={
            isMinor
              ? `The participant is ${participantAge} years old. Parent or guardian information is required.`
              : `The participant is ${participantAge} years old. Parent or guardian information is not required by age.`
          }
        />
      )}

      <Panel
        number="03.1"
        title="PARTICIPANT CONTACT DETAILS"
      >
        <div style={styles.formGrid2}>
          <TextInput
            label="Mobile Number"
            value={data.mobileNumber}
            placeholder="e.g. 082 000 0000"
            onChange={(value) =>
              updateField(
                "mobileNumber",
                value
              )
            }
          />

          <TextInput
            label="Email Address"
            type="email"
            value={data.emailAddress}
            placeholder="name@example.com"
            onChange={(value) =>
              updateField(
                "emailAddress",
                value
              )
            }
          />
        </div>
      </Panel>

      <Panel
        number="03.2"
        title="PHYSICAL ADDRESS"
      >
        <div style={styles.formGrid2}>
          <TextInput
            label="Address Line 1"
            value={data.addressLine1}
            onChange={(value) =>
              updateField(
                "addressLine1",
                value
              )
            }
          />

          <TextInput
            label="Address Line 2"
            value={data.addressLine2}
            onChange={(value) =>
              updateField(
                "addressLine2",
                value
              )
            }
          />

          <TextInput
            label="Suburb"
            value={data.suburb}
            onChange={(value) =>
              updateField(
                "suburb",
                value
              )
            }
          />

          <TextInput
            label="Town / City"
            value={data.townCity}
            onChange={(value) =>
              updateField(
                "townCity",
                value
              )
            }
          />

          <SelectInput
            label="Province"
            value={data.province}
            options={[
              "Western Cape",
              "Eastern Cape",
              "Northern Cape",
              "Free State",
              "Gauteng",
              "KwaZulu-Natal",
              "Limpopo",
              "Mpumalanga",
              "North West",
            ]}
            onChange={(value) =>
              updateField(
                "province",
                value
              )
            }
          />

          <TextInput
            label="Postal Code"
            value={data.postalCode}
            onChange={(value) =>
              updateField(
                "postalCode",
                value
              )
            }
          />
        </div>
      </Panel>

      <Panel
        number="03.3"
        title="PARENT / GUARDIAN"
      >
        <div style={styles.formGrid3}>
          <TextInput
            label="Guardian First Name"
            required={isMinor}
            value={
              data.guardianFirstName
            }
            onChange={(value) =>
              updateField(
                "guardianFirstName",
                value
              )
            }
          />

          <TextInput
            label="Guardian Surname"
            required={isMinor}
            value={
              data.guardianSurname
            }
            onChange={(value) =>
              updateField(
                "guardianSurname",
                value
              )
            }
          />

          <SelectInput
            label="Relationship"
            required={isMinor}
            value={
              data.guardianRelationship
            }
            options={[
              "",
              "Mother",
              "Father",
              "Parent",
              "Legal Guardian",
              "Grandparent",
              "Sibling",
              "Other",
            ]}
            onChange={(value) =>
              updateField(
                "guardianRelationship",
                value
              )
            }
          />

          <TextInput
            label="Guardian Mobile"
            required={isMinor}
            value={data.guardianMobile}
            onChange={(value) =>
              updateField(
                "guardianMobile",
                value
              )
            }
          />

          <TextInput
            label="Guardian Email"
            type="email"
            value={data.guardianEmail}
            onChange={(value) =>
              updateField(
                "guardianEmail",
                value
              )
            }
          />
        </div>
      </Panel>

      <Panel
        number="03.4"
        title="EMERGENCY CONTACT"
      >
        <div style={styles.formGrid3}>
          <TextInput
            label="Contact Name"
            required
            value={data.emergencyName}
            onChange={(value) =>
              updateField(
                "emergencyName",
                value
              )
            }
          />

          <TextInput
            label="Relationship"
            value={
              data.emergencyRelationship
            }
            onChange={(value) =>
              updateField(
                "emergencyRelationship",
                value
              )
            }
          />

          <TextInput
            label="Mobile Number"
            required
            value={
              data.emergencyMobile
            }
            onChange={(value) =>
              updateField(
                "emergencyMobile",
                value
              )
            }
          />
        </div>
      </Panel>
    </>
  );
}

/* ============================================================
   STEP 04
   PARTICIPATION
   ============================================================ */

function ParticipationStep({
  data,
  updateField,
}: {
  data: RegistrationData;
  updateField: UpdateField;
}) {
  return (
    <>
      <StepIntroduction
        number="04"
        title="Participation"
        description="Capture the participant's classification, role and sporting participation."
      />

      <Panel
        number="04.1"
        title="PARTICIPANT CLASSIFICATION"
      >
        <div style={styles.formGrid3}>
          <SelectInput
            label="Participant Type"
            required
            value={
              data.participantType
            }
            options={[
              "",
              "Learner / Athlete",
              "Coach",
              "Official",
              "Sports Staff",
              "Volunteer",
              "Other",
            ]}
            onChange={(value) =>
              updateField(
                "participantType",
                value
              )
            }
          />

          <SelectInput
            label="Participant Role"
            required
            value={
              data.participantRole
            }
            options={[
              "",
              "Athlete",
              "Learner",
              "Coach",
              "Assistant Coach",
              "Manager",
              "Official",
              "Referee",
              "Administrator",
              "Volunteer",
              "Support Staff",
              "Other",
            ]}
            onChange={(value) =>
              updateField(
                "participantRole",
                value
              )
            }
          />

          <SelectInput
            label="Participation Level"
            value={
              data.participationLevel
            }
            options={[
              "",
              "School",
              "Club",
              "Community",
              "Regional",
              "Provincial",
              "National",
              "Other",
            ]}
            onChange={(value) =>
              updateField(
                "participationLevel",
                value
              )
            }
          />
        </div>
      </Panel>

      <Panel
        number="04.2"
        title="SPORTING INFORMATION"
      >
        <div style={styles.formGrid3}>
          <SelectInput
            label="Primary Sporting Code"
            value={data.sportingCode}
            options={[
              "",
              "Athletics",
              "Basketball",
              "Boxing",
              "Chess",
              "Cricket",
              "Cross Country",
              "Cycling",
              "Football",
              "Gymnastics",
              "Hockey",
              "Judo",
              "Netball",
              "Rugby",
              "Softball",
              "Swimming",
              "Table Tennis",
              "Tennis",
              "Volleyball",
              "Other",
            ]}
            onChange={(value) =>
              updateField(
                "sportingCode",
                value
              )
            }
          />

          <TextInput
            label="Age Group"
            value={data.ageGroup}
            placeholder="e.g. U13"
            onChange={(value) =>
              updateField(
                "ageGroup",
                value
              )
            }
          />

          <TextInput
            label="Division / Category"
            value={data.division}
            placeholder="If applicable"
            onChange={(value) =>
              updateField(
                "division",
                value
              )
            }
          />
        </div>
      </Panel>

      <InfoNotice
        title="MULTIPLE SPORTING CODES"
        text="This registration captures the participant's primary sporting code. Additional sporting codes can later be attached to the permanent participant profile without creating another participant record."
      />
    </>
  );
}

/* ============================================================
   STEP 05
   AFFILIATIONS
   ============================================================ */

function AffiliationsStep({
  data,
  updateField,
}: {
  data: RegistrationData;
  updateField: UpdateField;
}) {
  return (
    <>
      <StepIntroduction
        number="05"
        title="Affiliations"
        description="Link the participant to the relevant school, club, team or association."
      />

      <InfoNotice
        title="AFFILIATION CONTROL"
        text="Affiliations belong to the participant's permanent record. Existing active affiliations must later be checked before conflicting affiliations are created."
      />

      <Panel
        number="05.1"
        title="ORGANISATION AFFILIATIONS"
      >
        <p style={styles.instructions}>
          These fields are temporary
          development inputs. When the
          organisation registries are
          connected, staff will search and
          select registered organisations
          instead of typing organisation
          names manually.
        </p>

        <div style={styles.formGrid2}>
          <TextInput
            label="School"
            value={data.schoolName}
            placeholder="Search registered school"
            onChange={(value) =>
              updateField(
                "schoolName",
                value
              )
            }
          />

          <TextInput
            label="Club"
            value={data.clubName}
            placeholder="Search registered club"
            onChange={(value) =>
              updateField(
                "clubName",
                value
              )
            }
          />

          <TextInput
            label="Team"
            value={data.teamName}
            placeholder="Search registered team"
            onChange={(value) =>
              updateField(
                "teamName",
                value
              )
            }
          />

          <TextInput
            label="Association"
            value={
              data.associationName
            }
            placeholder="Search registered association"
            onChange={(value) =>
              updateField(
                "associationName",
                value
              )
            }
          />

          <TextInput
            label="Affiliation Start Date"
            required
            type="date"
            value={
              data.affiliationStartDate
            }
            onChange={(value) =>
              updateField(
                "affiliationStartDate",
                value
              )
            }
          />
        </div>
      </Panel>

      <div style={styles.twoCards}>
        <RuleCard
          number="05.2"
          title="ONE ACTIVE AFFILIATION PER CATEGORY"
          text="The production system will prevent conflicting active school, club, team or association affiliations where the applicable rules require one active affiliation."
        />

        <RuleCard
          number="05.3"
          title="TRANSFER INSTEAD OF DUPLICATION"
          text="When a participant changes organisation, the existing affiliation history should be retained and the change processed through a release or transfer."
        />
      </div>
    </>
  );
}

/* ============================================================
   STEP 06
   REVIEW
   ============================================================ */

function ReviewStep({
  data,
  participantAge,
  updateField,
  goToStep,
}: {
  data: RegistrationData;
  participantAge: number | null;
  updateField: UpdateField;
  goToStep: (step: number) => void;
}) {
  return (
    <>
      <StepIntroduction
        number="06"
        title="Review Registration"
        description="Review all participant information before creating the permanent participant record."
      />

      <InfoNotice
        title="FINAL REVIEW"
        text="Check the information carefully. Once the production registration is submitted, the participant becomes part of the permanent WCSA Participant Registry and receives a permanent participant number."
      />

      <ReviewSection
        number="06.1"
        title="PERSONAL DETAILS"
        editStep={2}
        goToStep={goToStep}
        rows={[
          [
            "Full Name",
            buildFullName(data),
          ],
          [
            "Preferred Name",
            valueOrDash(
              data.preferredName
            ),
          ],
          [
            "Date of Birth",
            valueOrDash(
              data.dateOfBirth
            ),
          ],
          [
            "Age",
            participantAge === null
              ? "—"
              : `${participantAge} years`,
          ],
          [
            "Gender",
            valueOrDash(data.gender),
          ],
          [
            "Nationality",
            valueOrDash(
              data.nationality
            ),
          ],
          [
            "Identification Type",
            data.idType,
          ],
          [
            "Identification Number",
            valueOrDash(
              data.idNumber
            ),
          ],
        ]}
      />

      <ReviewSection
        number="06.2"
        title="CONTACT & GUARDIAN"
        editStep={3}
        goToStep={goToStep}
        rows={[
          [
            "Mobile",
            valueOrDash(
              data.mobileNumber
            ),
          ],
          [
            "Email",
            valueOrDash(
              data.emailAddress
            ),
          ],
          [
            "Address",
            buildAddress(data),
          ],
          [
            "Parent / Guardian",
            buildGuardian(data),
          ],
          [
            "Guardian Mobile",
            valueOrDash(
              data.guardianMobile
            ),
          ],
          [
            "Emergency Contact",
            valueOrDash(
              data.emergencyName
            ),
          ],
          [
            "Emergency Mobile",
            valueOrDash(
              data.emergencyMobile
            ),
          ],
        ]}
      />

      <ReviewSection
        number="06.3"
        title="PARTICIPATION"
        editStep={4}
        goToStep={goToStep}
        rows={[
          [
            "Participant Type",
            valueOrDash(
              data.participantType
            ),
          ],
          [
            "Role",
            valueOrDash(
              data.participantRole
            ),
          ],
          [
            "Sporting Code",
            valueOrDash(
              data.sportingCode
            ),
          ],
          [
            "Age Group",
            valueOrDash(
              data.ageGroup
            ),
          ],
          [
            "Division",
            valueOrDash(
              data.division
            ),
          ],
          [
            "Participation Level",
            valueOrDash(
              data.participationLevel
            ),
          ],
        ]}
      />

      <ReviewSection
        number="06.4"
        title="AFFILIATIONS"
        editStep={5}
        goToStep={goToStep}
        rows={[
          [
            "School",
            valueOrDash(
              data.schoolName
            ),
          ],
          [
            "Club",
            valueOrDash(
              data.clubName
            ),
          ],
          [
            "Team",
            valueOrDash(
              data.teamName
            ),
          ],
          [
            "Association",
            valueOrDash(
              data.associationName
            ),
          ],
          [
            "Start Date",
            valueOrDash(
              data.affiliationStartDate
            ),
          ],
        ]}
      />

      <Panel
        number="06.5"
        title="REGISTRATION DECLARATION"
      >
        <label
          style={
            styles.declarationRow
          }
        >
          <input
            type="checkbox"
            checked={
              data.declarationAccepted
            }
            onChange={(event) =>
              updateField(
                "declarationAccepted",
                event.target.checked
              )
            }
            style={
              styles.checkbox
            }
          />

          <span>
            I confirm that I have
            reviewed the information
            entered for this participant
            and that the record is ready
            to be submitted for
            registration.
          </span>
        </label>
      </Panel>

      <div style={styles.finalWarning}>
        <strong>
          PARTICIPANT NUMBER:
        </strong>{" "}
        The production participant number
        will be generated by the secure
        server only after the registration
        transaction succeeds.
      </div>
    </>
  );
}

/* ============================================================
   SUCCESS SCREEN
   ============================================================ */

function RegistrationSuccess({
  participantNumber,
  data,
}: {
  participantNumber: string;
  data: RegistrationData;
}) {
  return (
    <main>
      <div style={styles.successPage}>
        <div style={styles.successMark}>
          ✓
        </div>

        <div style={styles.successEyebrow}>
          REGISTRATION COMPLETED
        </div>

        <h1 style={styles.successTitle}>
          Participant Registered
        </h1>

        <p style={styles.successDescription}>
          {buildFullName(data)} has
          completed the development
          registration workflow.
        </p>

        <div style={styles.participantNumberBox}>
          <div
            style={
              styles.participantNumberLabel
            }
          >
            DEVELOPMENT PARTICIPANT NUMBER
          </div>

          <div
            style={
              styles.participantNumberValue
            }
          >
            {participantNumber}
          </div>
        </div>

        <div
          style={
            styles.developmentWarning
          }
        >
          <strong>
            DEVELOPMENT MODE:
          </strong>{" "}
          This number is a UI preview only.
          It has not been reserved in a
          database and must not be treated
          as an official WCSA Participant
          Number.
        </div>

        <div style={styles.successActions}>
          <Link
            href="/apps/ams/participants"
            style={styles.primaryLink}
          >
            PARTICIPANT REGISTRY
          </Link>

          <Link
            href="/apps/ams/participants/register"
            style={styles.secondaryButton}
          >
            REGISTER ANOTHER
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

type UpdateField = <
  K extends keyof RegistrationData
>(
  field: K,
  value: RegistrationData[K]
) => void;

function WorkflowStep({
  number,
  title,
  currentStep,
  onClick,
}: {
  number: number;
  title: string;
  currentStep: number;
  onClick: (step: number) => void;
}) {
  const current =
    number === currentStep;

  const complete =
    number < currentStep;

  return (
    <button
      type="button"
      onClick={() =>
        complete && onClick(number)
      }
      style={{
        ...styles.workflowStep,
        ...(current
          ? styles.workflowCurrent
          : {}),
        ...(complete
          ? styles.workflowComplete
          : {}),
        cursor: complete
          ? "pointer"
          : "default",
      }}
    >
      <span
        style={{
          ...styles.workflowNumber,
          ...(current
            ? styles.workflowNumberCurrent
            : {}),
        }}
      >
        {complete
          ? "✓"
          : String(number).padStart(
              2,
              "0"
            )}
      </span>

      <span
        style={styles.workflowTitle}
      >
        {title}
      </span>
    </button>
  );
}

function StepIntroduction({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <section style={styles.stepIntroduction}>
      <div style={styles.stepLargeNumber}>
        {number}
      </div>

      <div>
        <div style={styles.stepLabel}>
          REGISTRATION STEP
        </div>

        <h2 style={styles.stepTitle}>
          {title}
        </h2>

        <p style={styles.stepDescription}>
          {description}
        </p>
      </div>
    </section>
  );
}

function Panel({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <span style={styles.panelNumber}>
            {number}
          </span>

          <span style={styles.panelTitle}>
            {title}
          </span>
        </div>
      </div>

      <div style={styles.panelBody}>
        {children}
      </div>
    </section>
  );
}

function InfoNotice({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section style={styles.infoNotice}>
      <div style={styles.infoIcon}>
        i
      </div>

      <div>
        <div style={styles.infoTitle}>
          {title}
        </div>

        <div style={styles.infoText}>
          {text}
        </div>
      </div>
    </section>
  );
}

function RuleCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.ruleCard}>
      <div style={styles.ruleNumber}>
        {number}
      </div>

      <div>
        <div style={styles.ruleTitle}>
          {title}
        </div>

        <p style={styles.ruleText}>
          {text}
        </p>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}

        {required && (
          <span style={styles.required}>
            {" "}*
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}

        {required && (
          <span style={styles.required}>
            {" "}*
          </span>
        )}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      >
        {options.map((option) => (
          <option
            key={
              option ||
              "select-option"
            }
            value={option}
          >
            {option ||
              "Select an option"}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}
      </span>

      <div style={styles.readOnlyInput}>
        {value}
      </div>
    </div>
  );
}

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.statusItem}>
      <span style={styles.statusLabel}>
        {label}
      </span>

      <span style={styles.statusValue}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>
        ◎
      </div>

      <div style={styles.emptyTitle}>
        {title}
      </div>

      <div style={styles.emptyText}>
        {text}
      </div>
    </div>
  );
}

function ReviewSection({
  number,
  title,
  rows,
  editStep,
  goToStep,
}: {
  number: string;
  title: string;
  rows: [string, string][];
  editStep: number;
  goToStep: (step: number) => void;
}) {
  return (
    <section style={styles.panel}>
      <div style={styles.reviewHeader}>
        <div>
          <span style={styles.panelNumber}>
            {number}
          </span>

          <span style={styles.panelTitle}>
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            goToStep(editStep)
          }
          style={styles.editButton}
        >
          EDIT
        </button>
      </div>

      <div style={styles.reviewGrid}>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={styles.reviewItem}
          >
            <div
              style={styles.reviewLabel}
            >
              {label}
            </div>

            <div
              style={styles.reviewValue}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function buildFullName(
  data: RegistrationData
) {
  return [
    data.firstName,
    data.middleNames,
    data.surname,
  ]
    .filter(Boolean)
    .join(" ") || "—";
}

function buildGuardian(
  data: RegistrationData
) {
  const name = [
    data.guardianFirstName,
    data.guardianSurname,
  ]
    .filter(Boolean)
    .join(" ");

  if (!name) {
    return "—";
  }

  return data.guardianRelationship
    ? `${name} (${data.guardianRelationship})`
    : name;
}

function buildAddress(
  data: RegistrationData
) {
  const address = [
    data.addressLine1,
    data.addressLine2,
    data.suburb,
    data.townCity,
    data.province,
    data.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return address || "—";
}

function valueOrDash(
  value: string
) {
  return value.trim() || "—";
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
  if (!dateOfBirth) {
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
    001 IS ONLY A DEVELOPMENT PREVIEW.

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

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<
  string,
  React.CSSProperties
> = {
  breadcrumb: {
    marginBottom: "18px",
    display: "flex",
    gap: "7px",
    alignItems: "center",
    color: "#7b8691",
    fontSize: "8px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  breadcrumbLink: {
    color: "#536b84",
    textDecoration: "none",
  },

  pageHeading: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
  },

  eyebrow: {
    marginBottom: "5px",
    color: "#6f7c89",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.8px",
  },

  pageTitle: {
    margin: 0,
    color: "#071b3b",
    fontSize: "28px",
    fontWeight: 600,
  },

  pageSubtitle: {
    margin: "5px 0 0",
    color: "#747e88",
    fontSize: "10px",
  },

  cancelButton: {
    padding: "11px 14px",
    background: "#ffffff",
    border: "1px solid #bdc6cf",
    color: "#53606d",
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
  },

  statusBar: {
    minHeight: "50px",
    marginBottom: "15px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    gap: "38px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  statusItem: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },

  statusLabel: {
    color: "#89939d",
    fontSize: "7px",
    fontWeight: 700,
  },

  statusValue: {
    color: "#173452",
    fontSize: "8px",
    fontWeight: 700,
  },

  workflow: {
    marginBottom: "18px",
    display: "grid",
    gridTemplateColumns:
      "repeat(6, minmax(0, 1fr))",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  workflowStep: {
    minHeight: "67px",
    padding: "10px 12px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    background: "#ffffff",
    border: "none",
    borderRight:
      "1px solid #e2e6ea",
    color: "#89939d",
    fontFamily: "inherit",
    textAlign: "left",
  },

  workflowCurrent: {
    background: "#0b2b58",
    color: "#ffffff",
  },

  workflowComplete: {
    background: "#e8f0ea",
    color: "#315f40",
  },

  workflowNumber: {
    width: "26px",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #c7ced5",
    borderRadius: "50%",
    fontSize: "7px",
    fontWeight: 700,
  },

  workflowNumberCurrent: {
    borderColor: "#ffffff",
  },

  workflowTitle: {
    fontSize: "8px",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  errorBox: {
    marginBottom: "16px",
    padding: "13px 16px",
    display: "flex",
    gap: "12px",
    background: "#f8eded",
    borderLeft: "4px solid #9d4242",
    color: "#703636",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  stepIntroduction: {
    marginBottom: "17px",
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "52px 1fr",
    gap: "13px",
    background: "#0b2b58",
    color: "#ffffff",
  },

  stepLargeNumber: {
    color: "#a8bbd0",
    fontSize: "22px",
    fontWeight: 300,
  },

  stepLabel: {
    color: "#a9bbce",
    fontSize: "7px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  stepTitle: {
    margin: "4px 0",
    fontSize: "21px",
    fontWeight: 500,
  },

  stepDescription: {
    margin: 0,
    color: "#d4dfeb",
    fontSize: "9px",
    lineHeight: 1.6,
  },

  infoNotice: {
    marginBottom: "17px",
    padding: "15px 17px",
    display: "grid",
    gridTemplateColumns: "31px 1fr",
    gap: "10px",
    background: "#e8eef5",
    borderLeft: "4px solid #0b2b58",
  },

  infoIcon: {
    width: "23px",
    height: "23px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #7890a8",
    borderRadius: "50%",
    color: "#0b2b58",
    fontSize: "9px",
    fontWeight: 700,
  },

  infoTitle: {
    color: "#0b2b58",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  infoText: {
    marginTop: "3px",
    color: "#596a7b",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  panel: {
    marginBottom: "17px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  panelHeader: {
    minHeight: "52px",
    padding: "0 18px",
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
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.6px",
  },

  panelBody: {
    padding: "20px",
  },

  instructions: {
    maxWidth: "900px",
    margin: "0 0 17px",
    color: "#697581",
    fontSize: "9px",
    lineHeight: 1.65,
  },

  formGrid2: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  formGrid3: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  field: {
    display: "block",
  },

  fieldLabel: {
    minHeight: "18px",
    display: "block",
    marginBottom: "5px",
    color: "#4f5c68",
    fontSize: "8px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  required: {
    color: "#9c3d3d",
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    height: "41px",
    padding: "0 11px",
    background: "#ffffff",
    border: "1px solid #cbd2d9",
    borderRadius: 0,
    outline: "none",
    color: "#27323d",
    fontFamily: "inherit",
    fontSize: "10px",
  },

  readOnlyInput: {
    boxSizing: "border-box",
    width: "100%",
    height: "41px",
    padding: "0 11px",
    display: "flex",
    alignItems: "center",
    background: "#f1f3f5",
    border: "1px solid #d2d8de",
    color: "#596571",
    fontSize: "10px",
  },

  actionRow: {
    marginTop: "18px",
    display: "flex",
    gap: "10px",
  },

  primaryButton: {
    minHeight: "40px",
    padding: "0 18px",
    background: "#0b2b58",
    border: "1px solid #0b2b58",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: "40px",
    padding: "0 15px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #bdc6cf",
    color: "#53606d",
    fontFamily: "inherit",
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },

  registerFinalButton: {
    minHeight: "42px",
    padding: "0 21px",
    background: "#173f2b",
    border: "1px solid #173f2b",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    cursor: "pointer",
  },

  emptyState: {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyIcon: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d4dae0",
    borderRadius: "50%",
    color: "#758393",
    fontSize: "16px",
  },

  emptyTitle: {
    marginTop: "10px",
    color: "#3f4b56",
    fontSize: "9px",
    fontWeight: 700,
  },

  emptyText: {
    maxWidth: "450px",
    marginTop: "5px",
    color: "#838d97",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  successSearch: {
    padding: "5px 0",
    display: "flex",
    gap: "13px",
  },

  successSearchIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#e4efe7",
    color: "#315f40",
    fontWeight: 700,
  },

  successSearchTitle: {
    color: "#315f40",
    fontSize: "9px",
    fontWeight: 700,
  },

  successSearchText: {
    maxWidth: "800px",
    margin: "5px 0 10px",
    color: "#66727d",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  developmentBox: {
    padding: "9px 11px",
    background: "#f3f5f6",
    border: "1px solid #dde2e6",
    color: "#69737d",
    fontSize: "8px",
  },

  twoCards: {
    marginBottom: "17px",
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  ruleCard: {
    minHeight: "120px",
    padding: "17px",
    display: "grid",
    gridTemplateColumns: "38px 1fr",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
  },

  ruleNumber: {
    color: "#8995a2",
    fontSize: "8px",
    fontWeight: 700,
  },

  ruleTitle: {
    color: "#071b3b",
    fontSize: "9px",
    fontWeight: 700,
  },

  ruleText: {
    margin: "5px 0 0",
    color: "#697581",
    fontSize: "8px",
    lineHeight: 1.7,
  },

  bottomNavigation: {
    marginTop: "8px",
    padding: "17px 0 5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    borderTop: "1px solid #d8dde2",
  },

  navigationRight: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  stepIndicator: {
    color: "#7d8791",
    fontSize: "7px",
    fontWeight: 700,
  },

  reviewHeader: {
    minHeight: "52px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e1e5e9",
  },

  editButton: {
    padding: "7px 11px",
    background: "#ffffff",
    border: "1px solid #bdc6cf",
    color: "#53606d",
    fontFamily: "inherit",
    fontSize: "7px",
    fontWeight: 700,
    cursor: "pointer",
  },

  reviewGrid: {
    padding: "7px 18px",
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
  },

  reviewItem: {
    minHeight: "55px",
    padding: "11px 5px",
    borderBottom: "1px solid #edf0f2",
  },

  reviewLabel: {
    color: "#89939d",
    fontSize: "7px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  reviewValue: {
    marginTop: "4px",
    color: "#293641",
    fontSize: "9px",
    fontWeight: 500,
  },

  declarationRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    color: "#4f5d69",
    fontSize: "9px",
    lineHeight: 1.65,
    cursor: "pointer",
  },

  checkbox: {
    width: "17px",
    height: "17px",
    marginTop: "1px",
  },

  finalWarning: {
    padding: "13px 15px",
    background: "#f5f0e4",
    borderLeft: "4px solid #9a7b3d",
    color: "#6e5b35",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  successPage: {
    maxWidth: "750px",
    margin: "35px auto",
    padding: "45px",
    background: "#ffffff",
    border: "1px solid #dce1e6",
    textAlign: "center",
  },

  successMark: {
    width: "62px",
    height: "62px",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#e4efe7",
    color: "#315f40",
    fontSize: "25px",
    fontWeight: 700,
  },

  successEyebrow: {
    color: "#567461",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  successTitle: {
    margin: "7px 0",
    color: "#071b3b",
    fontSize: "27px",
    fontWeight: 600,
  },

  successDescription: {
    margin: "0 auto",
    color: "#697581",
    fontSize: "10px",
  },

  participantNumberBox: {
    maxWidth: "460px",
    margin: "25px auto 15px",
    border: "1px solid #ccd3da",
  },

  participantNumberLabel: {
    padding: "9px",
    background: "#f1f3f5",
    color: "#76818c",
    fontSize: "7px",
    fontWeight: 700,
  },

  participantNumberValue: {
    padding: "17px",
    color: "#071b3b",
    fontSize: "23px",
    fontWeight: 700,
    letterSpacing: "2px",
  },

  developmentWarning: {
    maxWidth: "550px",
    margin: "0 auto",
    padding: "12px",
    background: "#f5f0e4",
    color: "#6e5b35",
    fontSize: "8px",
    lineHeight: 1.6,
  },

  successActions: {
    marginTop: "23px",
    display: "flex",
    justifyContent: "center",
    gap: "9px",
  },

  primaryLink: {
    minHeight: "40px",
    padding: "0 18px",
    display: "inline-flex",
    alignItems: "center",
    background: "#0b2b58",
    border: "1px solid #0b2b58",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "8px",
    fontWeight: 700,
  },
};