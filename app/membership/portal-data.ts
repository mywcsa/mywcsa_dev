export const sections = [
  { id: "dashboard", label: "Dashboard", mark: "▦", description: "Membership, tasks and quick links" },
  { id: "profile", label: "School / Organisation Profile", mark: "⌂", description: "Organisation details and authorised contacts" },
  { id: "membership", label: "Membership & Payments", mark: "◈", description: "Annual membership, renewal and payment records" },
  { id: "participants", label: "Learners & Participants", mark: "♧", description: "Participant registration in your organisation interface" },
  { id: "programmes", label: "Sports & Programmes", mark: "⚑", description: "Annual codes, programmes and targets" },
  { id: "teams", label: "Teams & Officials", mark: "♙", description: "Teams and staff in your organisation interface" },
  { id: "fixtures", label: "Fixtures & Results", mark: "≡", description: "Schedules, venues, results and standings" },
  { id: "events", label: "Events & Calendar", mark: "□", description: "Competitions, meetings and training" },
  { id: "documents", label: "Documents", mark: "▤", description: "Supporting documents, forms and reports" },
  { id: "messages", label: "Messages & Notices", mark: "✉", description: "Announcements and Registry correspondence" },
  { id: "support", label: "Support & Requests", mark: "?", description: "Enquiries, assistance and request drafts" },
  { id: "settings", label: "Settings & Access", mark: "⚙", description: "School users and notification preferences" },
] as const;

export type SectionId = typeof sections[number]["id"];
export const initiatives = [
  { id: "WCSSA", name: "Western Cape Schools Sports Association", categories: ["School"] },
  { id: "WCSA", name: "Western Cape Sports Association", categories: ["Club", "Association", "Community Organisation", "Provincial / Umbrella Body", "Athlete", "Coach", "Official", "Sports Staff", "Volunteer"] },
  { id: "IKM", name: "iKapa Kultuur Mosaic", categories: ["Art Group", "Cultural Organisation", "Artist / Individual"] },
  { id: "WCDA", name: "Western Cape Development Authority", categories: ["Development Organisation", "Community Organisation", "Programme Partner"] },
  { id: "WCOB", name: "Western Cape Organisations Board", categories: ["Organisation", "Association", "Umbrella Body"] },
] as const;

export const sports = ["Athletics", "Rugby", "Netball", "Cricket", "Football", "Basketball", "Hockey", "Chess", "Tennis", "Table Tennis", "Swimming", "Volleyball", "Coding & Robotics", "Other"];
export const arts = ["Visual Arts", "Music", "Dance", "Theatre", "Cultural Heritage", "Creative Writing", "Other"];
export const development = ["Youth Development", "Skills Development", "Community Development", "Education & STEM", "Organisation Development", "Other"];
export function programmeOptions(initiative: string) { return initiative === "IKM" ? arts : ["WCDA", "WCOB"].includes(initiative) ? development : sports; }
export function isIndividual(category: string) { return ["Athlete", "Coach", "Official", "Sports Staff", "Volunteer", "Artist / Individual"].includes(category); }
export function feeLabel(category: string) { return category === "School" ? "R350 / year" : "Fee to be confirmed"; }
export const applicationStages = ["Account & Verification", "Choose Membership", "Organisation Details", "Annual Information", "Documents", "Review & Submit"];
export const reviewStages = ["Submitted", "Under Review", "Information Required", "Approved for Payment", "Payment Verified", "Active"];

export type Organisation = { name: string; emis: string; registration: string; address: string; town: string; postalCode: string; district: string; municipality: string; province: string; email: string; phone: string; head: string; headEmail: string; coordinator: string; coordinatorEmail: string; representative: string; position: string; authority: boolean; addressConfirmed: boolean; dob: string; guardian: string; guardianEmail: string };
export const emptyOrganisation: Organisation = { name: "", emis: "", registration: "", address: "", town: "", postalCode: "", district: "", municipality: "", province: "Western Cape", email: "", phone: "", head: "", headEmail: "", coordinator: "", coordinatorEmail: "", representative: "", position: "", authority: false, addressConfirmed: false, dob: "", guardian: "", guardianEmail: "" };
export const demoOrganisation: Organisation = { ...emptyOrganisation, name: "Charleston Hill Primary School", emis: "0108470716", address: "Hilaris Avenue", town: "Paarl", postalCode: "7646", district: "Cape Winelands", municipality: "Drakenstein", representative: "Sample school representative", email: "school@example.org", phone: "021 000 0000", head: "Sample principal", headEmail: "principal@example.org", authority: true, addressConfirmed: true };
export type LocalDocument = { name: string; size: number; type: string; status: "Selected locally" };
export type Draft = { initiative: string; category: string; year: string; application: "New Application" | "Renewal"; wcsaId: string; account: { firstName: string; surname: string; email: string; mobile: string; terms: boolean; privacy: boolean; verifiedPreview: boolean }; organisation: Organisation; codes: string[]; otherCode: string; level: string; divisions: string; participationTarget: string; performanceTarget: string; priorities: string; assistance: string; estimates: Record<string, { teams: string; participants: string }>; documents: LocalDocument[]; step: number; reviewedPreview: boolean; sample: boolean };
export const emptyDraft: Draft = { initiative: "WCSSA", category: "School", year: "2027", application: "New Application", wcsaId: "", account: { firstName: "", surname: "", email: "", mobile: "", terms: false, privacy: false, verifiedPreview: false }, organisation: emptyOrganisation, codes: [], otherCode: "", level: "Development", divisions: "", participationTarget: "", performanceTarget: "", priorities: "", assistance: "", estimates: {}, documents: [], step: 1, reviewedPreview: false, sample: false };
