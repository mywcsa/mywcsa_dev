export type Field={key:string;label:string;type?:"text"|"date"|"number"|"textarea"|"select";required?:boolean;options?:string[];placeholder?:string};
const text=(key:string,label:string,required=false):Field=>({key,label,required});
const date=(key:string,label:string,required=false):Field=>({key,label,type:"date",required});
const number=(key:string,label:string,required=false):Field=>({key,label,type:"number",required});
const long=(key:string,label:string,required=false):Field=>({key,label,type:"textarea",required});
const select=(key:string,label:string,options:string[]):Field=>({key,label,type:"select",options});
const common=[text("reference","Source/reference number"),date("effective_date","Effective date"),long("supporting_notes","Supporting reasons and evidence",true)];
const definitions:Record<string,Field[]>={
 "Organogram":[text("division","Directorate / division",true),text("reports_to","Reports to"),text("position","Position",true),date("effective_date","Effective date"),long("change_reason","Organisational change justification",true)],
 "Approved Establishment":[text("position_code","Post code",true),text("position_title","Post title",true),text("division","Department",true),select("funding","Funding status",["Funded","Unfunded","Frozen"]),number("salary_level","Proposed salary level"),long("rationale","Establishment justification",true)],
 "Funded Posts":[text("post_code","Approved post code",true),text("division","Directorate",true),select("funding_status","Budget status",["Proposed","Confirmed","Frozen"]),number("budget_amount","Annual budget (ZAR)"),date("effective_date","Effective date")],
 "Vacancies":[text("post_code","Vacant position code",true),text("job_title","Vacancy title",true),text("directorate","Directorate",true),date("target_date","Target appointment date"),long("motivation","Recruitment motivation",true)],
 "Staffing Plans":[text("division","Department",true),text("planning_year","Plan year",true),number("planned_posts","Projected posts"),number("projected_cost","Projected annual cost (ZAR)"),long("justification","Planning rationale",true)],
 "Post Requests":[text("post_title","Post title",true),text("directorate","Department",true),text("grade","Proposed grade"),long("motivation","Motivation and funding source",true)],
 "Appointments":[text("first_name","Employee first name",true),text("last_name","Employee last name",true),text("division","Directorate / division",true),text("post_title","Appointed post",true),date("start_date","Appointment start date",true),text("reference","Approved recruitment reference"),long("appointment_basis","Appointment basis and supporting documents",true)],
 "Employment Contracts":[text("employee_number","Internal personnel number",true),select("contract_type","Contract type",["Permanent","Fixed term","Part time","Other"]),date("start_date","Contract start date",true),date("end_date","Contract end date"),long("terms","Employment terms and statutory review notes",true)],
 "Transfers & Promotions":[text("employee_number","Employee number",true),text("from_division","Current division",true),text("to_division","New division",true),text("new_post","New post title",true),date("effective_date","Effective date",true),long("motivation","Reason for personnel movement",true)],
 "Exits & Terminations":[text("employee_number","Employee number",true),select("exit_type","Exit type",["Resignation","Retirement","End of contract","Dismissal","Other"]),date("exit_date","Effective date",true),long("supporting_notes","Lawful basis, documentation and final-pay checks",true)],
 "Employee Documents":[text("employee_number","Employee number",true),text("document_type","Document type",true),text("sharepoint_reference","SharePoint document reference"),date("document_date","Document date"),long("record_note","Records classification and retention notes",true)],
 "Payroll Cycles":[text("period","Payroll period (YYYY-MM)",true),text("run_type","Run description",true),select("phase","Processing stage",["Inputs","Validation","Reconciliation","Awaiting delegated approval"]),long("validation","Exceptions and control checklist",true)],
 "Salary Adjustments":[text("employee_number","Employee number",true),date("effective_date","Effective date",true),text("adjustment_type","Adjustment reason",true),number("proposed_amount","Proposed gross amount (ZAR)"),long("authority","Delegated approval and employment basis",true)],
 "Allowances & Deductions":[text("employee_number","Employee number",true),select("category","Type",["Allowance","Deduction"]),text("description","Allowance / deduction description",true),number("amount","Amount (ZAR)"),long("lawful_basis","Statutory / contractual authority and checks",true)],
 "Payslips":[text("employee_number","Employee number",true),text("pay_period","Pay period (YYYY-MM)",true),text("sharepoint_reference","Approved payslip file reference"),long("release_notes","Verification and publication controls",true)],
 "Banking Verification":[text("employee_number","Employee number",true),select("verification_result","Independent verification",["Pending","Evidence reviewed","Returned for correction"]),text("evidence_reference","Secure evidence reference"),long("checks","Verification notes (never enter bank numbers here)",true)],
 "Reconciliations":[text("pay_period","Pay period",true),text("bank_batch_reference","Bank batch reference"),number("gross_total","Gross amount (ZAR)"),number("net_total","Net amount (ZAR)"),long("exceptions","Differences and reconciliation sign-off",true)],
 "Leave Administration":[text("employee_number","Employee number",true),select("leave_type","Leave category",["Annual","Sick","Family responsibility","Maternity","Parental","Other"]),date("start_date","Start date",true),date("end_date","End date",true),long("entitlement_note","Balance and statutory entitlement check",true)],
 "Attendance":[text("employee_number","Employee number",true),date("attendance_date","Attendance date",true),select("status","Attendance status",["Present","Absent","Remote work","Training","Authorised travel"]),long("notes","Supporting attendance notes")],
 "Performance":[text("employee_number","Employee number",true),text("review_cycle","Review cycle",true),select("review_type","Review type",["Objective setting","Midyear","Annual"]),long("evidence","Performance evidence and objectives",true)],
 "Training":[text("employee_number","Employee number",true),text("course","Training course",true),date("course_date","Training date"),select("funding","Funding source",["Compulsory - WCSA","WCSA","Employee","Sponsor"]),long("training_need","Development objectives",true)],
 "Benefits":[text("employee_number","Employee number",true),select("benefit","Benefit",["Medical","Pension","Housing","Transport","Disability","Other"]),date("effective_date","Effective date",true),long("eligibility","Eligibility and benefits-administrator checks",true)],
 "HR Service Requests":[text("employee_number","Employee number"),select("request_type","Service category",["Personnel documents","Employment enquiry","Leave","Benefits","Other"]),long("request_details","Request details",true)],
 "Workforce Overview":[text("division","Department / division"),date("as_of","Reporting date"),long("purpose","Management information purpose",true)],
 "Headcount & Establishment":[text("division","Division"),date("as_of","As at date"),long("analysis","Establishment variance / analysis",true)],
 "Payroll Cost Overview":[text("period","Reporting period",true),text("cost_centre","Cost centre"),long("analysis","Payroll budget comparison and access purpose",true)],
 "Compliance Reports":[select("report_type","Compliance review",["Personnel","Payroll","Access","Employment law","Records"]),date("review_date","Review date",true),long("findings","Findings and corrective actions",true)],
 "Trend Analysis":[text("indicator","Workforce indicator",true),text("period","Period",true),long("notes","Trend observations",true)],
 "Exports":[select("report_type","Export request",["Headcount","Vacancies","Payroll totals","Activity","Leave"]),long("business_purpose","Export purpose and legal basis",true)],
 "Access Register":[text("official_reference","Official reference",true),text("requested_role","Requested role",true),long("access_reason","Business approval basis",true)],
 "Role Assignments":[text("official_reference","Official reference",true),text("requested_role","Requested role / workspace",true),long("delegation","Delegation and expiry conditions",true)],
 "Audit Register":[text("record_reference","Audit record reference",true),long("audit_reason","Audit scope and supporting authorisation",true)],
 "Automation Outbox":[text("event_type","Event type",true),text("correlation_reference","Correlation ID"),long("incident","Processing or delivery exception",true)],
 "Integrations":[select("application","Application",["WorkHub","Careers","Microsoft 365","SharePoint","Dataverse","Communications","Other GovApps"]),text("integration_reference","Integration reference"),long("change_request","Authorised integration change",true)],
 "Configuration":[text("setting","Configuration item",true),text("proposed_value","Proposed change",true),long("impact","Security impact and rollback plan",true)],
 "Correction Register":[text("record_reference","Record reference",true),text("field_name","Field proposed for correction",true),long("reason","Why the correction is necessary",true)],
 "Reference Codes":[text("code_family","Code type",true),text("code","Reference code",true),text("label","Display label",true),long("usage","Intended application",true)],
 "Duplicate Review":[text("source_record","Original record number",true),text("possible_duplicate","Possible duplicate number",true),long("findings","Match checks and recommendation",true)],
 "Transaction Search":[text("reference","Transaction reference"),date("since","Created since")],
 "My Tasks":[text("reference","Task reference")]
};
export const fieldDefinitions=(tab:string):Field[]=>definitions[tab]||common;
export const readOnlySections=["Transaction Search","My Tasks","Employee Registry","Audit Register","Automation Outbox","Access Register"];
