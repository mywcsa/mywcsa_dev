import { jsPDF } from "jspdf";
import { feeLabel, initiatives, type Draft } from "./portal-data";

export type ReportKind = "application" | "profile" | "annual-plan";
const titles = { application: "Membership application", profile: "Organisation profile", "annual-plan": "Annual sporting & programme plan" };
async function asset(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("A document asset could not be loaded. Please try again.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

export async function createDraftPdf(draft: Draft, kind: ReportKind = "application") {
  const [regular, bold, logo] = await Promise.all([asset("/membership/fonts/SourceSans3-Regular.ttf"), asset("/membership/fonts/SourceSans3-Bold.ttf"), asset("/mywcsa-logo.png")]);
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pdf.addFileToVFS("SourceSans-Regular.ttf", regular); pdf.addFont("SourceSans-Regular.ttf", "SourceSans", "normal");
  pdf.addFileToVFS("SourceSans-Bold.ttf", bold); pdf.addFont("SourceSans-Bold.ttf", "SourceSans", "bold");
  pdf.setProperties({ title: `MyWCSA ${titles[kind]} - ${draft.year}`, author: "MyWCSA Membership Portal", subject: "Local application draft; not proof of registration" });
  let y = 65;
  function header() {
    pdf.setFillColor(0, 20, 137); pdf.rect(0, 0, 210, 4, "F");
    pdf.addImage(`data:image/png;base64,${logo}`, "PNG", 17, 12, 57, 18);
    pdf.setFont("SourceSans", "bold"); pdf.setFontSize(12); pdf.setTextColor(0, 20, 137); pdf.text("MyWCSA", 193, 19, { align: "right" });
    pdf.setFont("SourceSans", "normal"); pdf.setFontSize(9); pdf.text("MEMBERSHIP PORTAL", 193, 25, { align: "right" });
    pdf.setFont("SourceSans", "bold"); pdf.setFontSize(20); pdf.text(titles[kind], 17, 43);
    pdf.setFontSize(10); pdf.text(`${draft.initiative}  |  ${draft.category}  |  ${draft.year}`, 17, 51);
    pdf.setFillColor(238, 242, 251); pdf.roundedRect(17, 55, 176, 7, 1, 1, "F");
    pdf.setFontSize(8); pdf.text(draft.sample ? "SAMPLE DRAFT - NOT SUBMITTED OR APPROVED" : "DRAFT - NOT SUBMITTED, VERIFIED OR APPROVED", 20, 59.7);
  }
  function space(height: number) { if (y + height > 271) { pdf.addPage(); header(); y = 69; } }
  function section(title: string) { space(29); y += 4; pdf.setFillColor(0, 20, 137); pdf.rect(17, y, 176, 8, "F"); pdf.setFont("SourceSans", "bold"); pdf.setFontSize(11); pdf.setTextColor(255); pdf.text(title, 20, y + 5.4); y += 12; }
  function row(label: string, value: unknown) {
    pdf.setFont("SourceSans", "normal"); pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(String(value || "Not provided").replace(/\r\n/g, "\n"), 111) as string[];
    let offset = 0;
    while (offset < lines.length) {
      space(11); const count = Math.max(1, Math.floor((271 - y - 4) / 5)); const chunk = lines.slice(offset, offset + count); const height = Math.max(10, chunk.length * 5 + 4);
      pdf.setFillColor(247, 249, 252); pdf.rect(17, y, 176, height, "F");
      pdf.setFont("SourceSans", "bold"); pdf.setFontSize(9); pdf.setTextColor(63, 77, 97); pdf.text(offset ? "(continued)" : label, 20, y + 5);
      pdf.setFont("SourceSans", "normal"); pdf.setFontSize(10); pdf.setTextColor(22, 34, 55); pdf.text(chunk, 78, y + 5);
      y += height + 1; offset += chunk.length;
    }
  }
  header();
  section("Membership details");
  row("Initiative", initiatives.find(i => i.id === draft.initiative)?.name || draft.initiative);
  row("Application", draft.application); row("Membership year", draft.year); row("WCSA ID", draft.wcsaId || "Not issued"); row("Annual fee", `${feeLabel(draft.category)} - not an invoice`);
  const o = draft.organisation;
  if (kind !== "annual-plan") {
    section("Organisation & contact details");
    const fields: [string, unknown][] = [["Official name", o.name], ["EMIS / paypoint", o.emis], ["Registration number", o.registration], ["Physical address", [o.address, o.town, o.postalCode, o.province].filter(Boolean).join(", ")], ["District / municipality", [o.district, o.municipality].filter(Boolean).join(" / ")], ["Organisation email", o.email], ["Telephone", o.phone], ["Principal / head", o.head], ["Head email", o.headEmail], ["Coordinator", o.coordinator], ["Coordinator email", o.coordinatorEmail], ["Representative", o.representative], ["Position", o.position], ["Date of birth", o.dob], ["Guardian", o.guardian], ["Guardian email", o.guardianEmail]];
    for (const [label, value] of fields) if (value || ["Official name", "Physical address", "Organisation email"].includes(label)) row(label, value);
    row("Authority declaration", o.authority ? "Acknowledged locally; Registry verification pending" : "Not acknowledged");
  }
  if (kind !== "profile") {
    section("Annual codes & participation"); row("Selected codes", draft.codes.join(", ")); if (draft.otherCode) row("Other code", draft.otherCode);
    row("Participation level", draft.level); row("Age groups / divisions", draft.divisions);
    for (const code of draft.codes) row(code, `${draft.estimates[code]?.teams || "Not provided"} teams; ${draft.estimates[code]?.participants || "Not provided"} estimated participants`);
    section("Targets & development"); row("Participation targets", draft.participationTarget); row("Performance targets", draft.performanceTarget); row("Development priorities", draft.priorities); row("Support required", draft.assistance);
  }
  if (kind === "application") {
    section("Applicant & supporting documents"); row("Applicant", `${draft.account.firstName} ${draft.account.surname}`.trim()); row("Applicant email", draft.account.email); row("Mobile", draft.account.mobile);
    row("Documents", draft.documents.length ? draft.documents.map(d => `${d.name} (${Math.ceil(d.size / 1024)} KB) - selected locally, not uploaded`).join("\n") : "None selected");
    row("Privacy & terms", draft.account.privacy && draft.account.terms ? "Acknowledged locally" : "Not both acknowledged");
  }
  section("Document status"); row("Important", "This is a local draft for review. It is not a membership certificate, registration confirmation, invoice or payment receipt. No Registry approval or payment is confirmed by this document.");
  const pages = pdf.getNumberOfPages();
  for (let n = 1; n <= pages; n++) { pdf.setPage(n); pdf.setDrawColor(220, 226, 237); pdf.line(17, 280, 193, 280); pdf.setFont("SourceSans", "normal"); pdf.setFontSize(8); pdf.setTextColor(80, 94, 114); pdf.text("Western Cape Sports Association NPC | MyWCSA", 17, 286); pdf.text(`Page ${n} of ${pages}`, 193, 286, { align: "right" }); }
  return pdf;
}

export async function downloadDraftPdf(draft: Draft, kind: ReportKind = "application") {
  const pdf = await createDraftPdf(draft, kind);
  pdf.save(`MyWCSA-${kind}-${draft.year}-draft.pdf`);
}
