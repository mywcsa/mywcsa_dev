export const sections = [
  { id: "dashboard", label: "Dashboard", mark: "▦", description: "Membership status, renewals and important actions" },
  { id: "membership", label: "My Membership", mark: "◈", description: "Current membership, WCSA ID and membership history" },
  { id: "renewals", label: "Renewals", mark: "↻", description: "Renew your organisation membership" },
  { id: "payments", label: "Payments & Invoices", mark: "R", description: "WCSA membership charges, invoices, receipts and Paystack payments" },
  { id: "certificates", label: "Certificates", mark: "✓", description: "Official membership certificates and verification records" },
  { id: "profile", label: "Organisation Profile", mark: "⌂", description: "Verified organisation and authorised representative details" },
  { id: "documents", label: "Membership Documents", mark: "▤", description: "Documents submitted for membership and Registry verification" },
  { id: "messages", label: "Registry Correspondence", mark: "✉", description: "Membership notices and Registry correspondence" },
  { id: "support", label: "Help & Support", mark: "?", description: "Membership enquiries and Service Desk support" },
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
export function feeLabel(category: string) { const fees: Record<string,string> = { School: "R350 / year", Club: "R300 / year", Association: "R450 / year", "Community Organisation": "R400 / year", "Provincial / Umbrella Body": "R800 / year" }; return fees[category] || "See membership schedule"; }
export const applicationStages = ["Account & Verification", "Choose Membership", "Organisation Details", "Annual Information", "Documents", "Review & Submit"];
export const reviewStages = ["Submitted", "Under Review", "Information Required", "Approved for Payment", "Payment Verified", "Active"];
export type Organisation = { name: string; emis: string; registration: string; address: string; town: string; postalCode: string; district: string; municipality: string; province: string; email: string; phone: string; head: string; headEmail: string; coordinator: string; coordinatorEmail: string; representative: string; position: string; authority: boolean; addressConfirmed: boolean; dob: string; guardian: string; guardianEmail: string };
export const emptyOrganisation: Organisation = { name: "", emis: "", registration: "", address: "", town: "", postalCode: "", district: "", municipality: "", province: "Western Cape", email: "", phone: "", head: "", headEmail: "", coordinator: "", coordinatorEmail: "", representative: "", position: "", authority: false, addressConfirmed: false, dob: "", guardian: "", guardianEmail: "" };
export type LocalDocument = { name: string; size: number; type: string; status: "Selected locally" };
export type Draft = { initiative: string; category: string; year: string; application: "New Application" | "Renewal"; wcsaId: string; account: { firstName: string; surname: string; email: string; mobile: string; terms: boolean; privacy: boolean; verifiedPreview: boolean }; organisation: Organisation; codes: string[]; otherCode: string; level: string; divisions: string; participationTarget: string; performanceTarget: string; priorities: string; assistance: string; estimates: Record<string, { teams: string; participants: string }>; documents: LocalDocument[]; step: number; reviewedPreview: boolean; sample: boolean };
export const emptyDraft: Draft = { initiative: "WCSSA", category: "School", year: "2027", application: "New Application", wcsaId: "", account: { firstName: "", surname: "", email: "", mobile: "", terms: false, privacy: false, verifiedPreview: false }, organisation: emptyOrganisation, codes: [], otherCode: "", level: "Development", divisions: "", participationTarget: "", performanceTarget: "", priorities: "", assistance: "", estimates: {}, documents: [], step: 1, reviewedPreview: false, sample: false };