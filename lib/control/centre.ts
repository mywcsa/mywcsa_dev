import "server-only";
import { auth } from "@/auth";
import { supabaseConfig } from "@/lib/ams/supabase";

export type ControlRole = "director" | "einnovation" | "servicedesk" | "bit" | "ict" | "viewer";
export type ControlOperator = { email: string; role: ControlRole; active: boolean; granted_by: string; full_name: string; display_name: string; department: string; designation: string };
export type ControlRequest = {
  id: number; kind: string; title: string; description: string; target_email: string | null; wcsa_id: string | null;
  priority: string; team: string; status: string; assignee: string | null; external_reference: string | null;
  requested_by: string; updated_by: string | null; created_at: string; updated_at: string;
};
export type ControlAllocation = {
  id: number; category: string; item_name: string; asset_tag: string | null;
  recipient_email: string; team: string; status: string; note: string; reference_request_id: number | null;
  assigned_by: string; assigned_at: string;
};
export type ControlAudit = { id: number; actor_email: string; action: string; request_id: number | null; allocation_id: number | null; detail: Record<string, unknown>; happened_at: string };
export type ControlPartner = { id: string; email: string; username: string; wcsa_id: string | null; status: string; created_at: string };
export type ControlStaff = { identity_email: string; display_name: string | null; employment_status: string; personnel_verified: boolean };

export type ControlData = {
  requests: ControlRequest[]; allocations: ControlAllocation[]; audit: ControlAudit[];
  operators: ControlOperator[]; partners: ControlPartner[]; staff: ControlStaff[];
};
export class ControlAccessError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const editRoles: ControlRole[] = ["director","einnovation","servicedesk","bit","ict"];

async function database<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  const response = await fetch(config.origin + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: config.secret,
      Authorization: "Bearer " + config.secret,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    // Never expose SQL or schema internals through the public service API.
    throw new ControlAccessError(502, "The Command Centre database is temporarily unavailable.");
  }
  return response.json() as Promise<T>;
}
export async function controlRpc<T>(operation: string, data: Record<string, unknown>): Promise<T> {
  if (![
    "govapps_control_create_request", "govapps_control_update_request",
    "govapps_control_create_allocation", "govapps_control_update_allocation",
    "govapps_control_set_operator",
  ].includes(operation)) throw new ControlAccessError(400, "Unknown command.");
  try {
    return await database<T>("rpc/" + operation, { method: "POST", body: JSON.stringify(data) });
  } catch (error) {
    if (error instanceof ControlAccessError) throw error;
    throw new ControlAccessError(502, "Could not save this command.");
  }
}
async function activeOperator(email: string): Promise<ControlOperator | null> {
  const rows = await database<ControlOperator[]>(
    "govapps_control_operators?select=email,role,active,granted_by,full_name,display_name,department,designation&email=eq." + encodeURIComponent(email) + "&active=eq.true&limit=1",
  );
  return rows[0] || null;
}
export async function requireControlOperator(): Promise<ControlOperator> {
  const session = await auth();
  const user = session?.user as ({ email?: string | null; authProvider?: string; staffMustChange?:boolean } | undefined);
  const email = user?.email?.toLowerCase().trim();
  // Entra and separately provisioned staff-password identities only.
  // Business Partner, External User and stale sessions never qualify.
  if (!email || !["microsoft-entra-id","staff-password"].includes(user?.authProvider||"") || !email.endsWith("@wcsports.co.za") || user?.staffMustChange) {
    throw new ControlAccessError(403, "Authorised WCSA staff sign-in is required.");
  }
  if(user?.authProvider==="staff-password"){
    const [enabled,setting] = await Promise.all([
      database<Array<{email:string;must_change:boolean}>>(
        "govapps_staff_password_accounts?select=email,must_change&email=eq."+encodeURIComponent(email)+"&enabled=eq.true&limit=1"
      ),
      database<Array<{enabled:boolean}>>(
        "govapps_control_settings?select=enabled&key=eq.staff_password_login_enabled&limit=1"
      ),
    ]);
    if(!enabled.length||enabled[0].must_change||setting[0]?.enabled!==true)
      throw new ControlAccessError(403,"Staff password access has been disabled or requires a password change.");
  }
  const operator = await activeOperator(email);
  if (!operator) throw new ControlAccessError(403, "Command Centre access has not been granted to this staff account.");
  return operator;
}
export async function loadControlData(role: ControlRole): Promise<ControlData> {
  const canSeeAccounts = ["director","einnovation","servicedesk"].includes(role);
  const [requests, allocations, audit, operators, partners, staff] = await Promise.all([
    database<ControlRequest[]>("govapps_control_requests?select=id,kind,title,description,target_email,wcsa_id,priority,team,status,assignee,external_reference,requested_by,updated_by,created_at,updated_at&order=created_at.desc&limit=150"),
    database<ControlAllocation[]>("govapps_control_allocations?select=id,category,item_name,asset_tag,recipient_email,team,status,note,reference_request_id,assigned_by,assigned_at&order=assigned_at.desc&limit=150"),
    database<ControlAudit[]>("govapps_control_audit?select=id,actor_email,action,request_id,allocation_id,detail,happened_at&order=happened_at.desc&limit=80"),
    database<ControlOperator[]>("govapps_control_operators?select=email,role,active,granted_by,full_name,display_name,department,designation&order=email.asc&limit=150"),
    canSeeAccounts ? database<ControlPartner[]>("govapps_accounts?select=id,email,username,wcsa_id,status,created_at&account_type=eq.business_partner&order=created_at.desc&limit=100") : Promise.resolve([]),
    canSeeAccounts ? database<ControlStaff[]>("workhub_employee_profiles?select=identity_email,display_name,employment_status,personnel_verified&order=created_at.desc&limit=100") : Promise.resolve([]),
  ]);
  return { requests, allocations, audit, operators, partners, staff };
}
