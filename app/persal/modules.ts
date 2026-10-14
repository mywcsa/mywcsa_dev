export const persalModules = [
  { slug:"utilities", name:"Utilities", icon:"⌕", description:"Reference codes, transaction searches and controlled record corrections", tabs:["Transaction Search","My Tasks","Correction Register","Reference Codes","Duplicate Review"] },
  { slug:"human-resource-planning", name:"Human Resource Planning", icon:"▧", description:"Organisational structures, positions and establishment controls", tabs:["Organogram","Approved Establishment","Funded Posts","Vacancies","Staffing Plans","Post Requests"] },
  { slug:"personnel-administration", name:"Personnel Administration", icon:"♙", description:"Employee master records, appointments, movements and personnel files", tabs:["Employee Registry","Appointments","Employment Contracts","Transfers & Promotions","Exits & Terminations","Employee Documents"] },
  { slug:"salary-administration", name:"Salary Administration", icon:"▥", description:"Secure payroll operations, salary changes, statutory deductions and reconciliation", tabs:["Payroll Cycles","Salary Adjustments","Allowances & Deductions","Payslips","Banking Verification","Reconciliations"] },
  { slug:"supporting-sub-systems", name:"Supporting Sub-Systems", icon:"◷", description:"Leave, performance, attendance, training and benefits", tabs:["Leave Administration","Attendance","Performance","Training","Benefits","HR Service Requests"] },
  { slug:"management-information", name:"Management Information", icon:"▤", description:"Workforce insight, controlled reporting and management oversight", tabs:["Workforce Overview","Headcount & Establishment","Payroll Cost Overview","Compliance Reports","Trend Analysis","Exports"] },
  { slug:"back-office", name:"Back-Office Administration", icon:"⚙", description:"Access controls, integrations, audit and system operations", tabs:["Access Register","Role Assignments","Audit Register","Automation Outbox","Integrations","Configuration"] }
] as const;

export const workspaceNames:Record<string,string> = {
  executive:"Executive Directors", management:"Management Team", personnel:"People's Management",
  finance:"Finance Department", ict_bit:"ICT & BiT Directors", innovation:"WCSA e-Innovation", communications:"Communications"
};
