import "server-only";
import { auth } from "@/auth";
import { supabaseConfig } from "@/lib/ams/supabase";
import { externalAppApproved, externalSession } from "@/lib/external/access";

export const EMS_ROOT = "/WCDA-Events" as const;
export const EMS_PRODUCTION_URL = "https://GovApps.wcsports.co.za/WCDA-Events" as const;
export const EMS_MAILBOXES = {
  billing: "finances@wcsports.co.za",
  certificates: "WCDA.Certificates@wcsports.co.za",
  notifications: "WCDAEms@govapps.wcsports.co.za",
  support: "ServiceDesk@wcsports.co.za",
} as const;

export type EmsEvent = {
  id: string;
  reference: string;
  organiser_name: string;
  name: string;
  category: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};
export type EmsActor = {
  id: string;
  email: string;
  name: string;
  mode: "staff" | "organiser";
  role?: string;
};

export class EmsError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "EmsError";
  }
}
function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function emsDatabase<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const config = supabaseConfig();
  let result: Response;
  try {
    result = await fetch(config.origin + "/rest/v1/" + pathname, {
      ...init,
      headers: {
        apikey: config.secret,
        Authorization: "Bearer " + config.secret,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new EmsError(503, "The WCDA EMS database is currently unavailable.");
  }
  const json: unknown = await result.json().catch(() => null);
  if (!result.ok) {
    const error = json as {code?: string; message?: string} | null;
    if (error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST202") {
      throw new EmsError(503, "EMS database setup is pending. No event records have been created.");
    }
    if (error?.code === "42501") throw new EmsError(403, "This action requires additional WCDA authorisation.");
    if (error?.code === "22023" || error?.code === "22P02") throw new EmsError(400, "The requested EMS update contains invalid details.");
    if (result.status === 401 || result.status === 403) {
      throw new EmsError(503, "The EMS database connection is not authorised.");
    }
    if (result.status === 409) throw new EmsError(409, "An EMS record conflict occurred. Please retry.");
    if (result.status >= 500) throw new EmsError(503, "The EMS database cannot complete the operation.");
    throw new EmsError(result.status, "EMS could not process the request.");
  }
  return json as T;
}

export async function getEmsActor(): Promise<EmsActor | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as typeof session.user & {id?: string; authProvider?: string};
  const email = str(user.email).toLowerCase();
  const id = str(user.id);
  if (!email || !id) return null;
  if (user.authProvider === "microsoft-entra-id") {
    // A Microsoft staff session alone NEVER grants EMS access.
    // Require a current, active WCDA appointment; fail closed on lookup errors.
    try {
      const rows = await emsDatabase<Array<{role:string;active:boolean}>>(
        "wcda_ems_staff_access?select=role,active&email=eq." + encodeURIComponent(email) + "&active=eq.true&limit=1"
      );
      if (!rows.length || !rows[0].active) return null;
      return {id,email,name:str(user.name)||email,mode:"staff",role:rows[0].role};
    } catch {
      return null;
    }
  }
  if (user.authProvider === "external-user") {
    // External users require an approved WCDA Events app allocation,
    // independently from their basic GovApps account.
    try {
      const account=await externalSession();
      if(!account||account.id!==id||!(await externalAppApproved(id,"wcda-events")))return null;
      return {id,email,name:str(user.name)||email,mode:"organiser"};
    } catch {return null;}
  }
  if (user.authProvider === "business-partner") {
    // App allocation is mandatory; neither possession of a partner account nor a
    // registered WCSA ID automatically permits direct WCDA Event operations.
    try {
      const partners=await emsDatabase<Array<{id:string;email:string}>>(
        "govapps_accounts?select=id,email&id=eq."+encodeURIComponent(id)+"&account_type=eq.business_partner&status=eq.active&limit=1"
      );
      if(!partners.length||partners[0].email.toLowerCase()!==email)return null;
      const grants=await emsDatabase<Array<{account_id:string}>>(
        "govapps_control_partner_app_grants?select=account_id&account_id=eq."+encodeURIComponent(id)+"&app_slug=eq.wcda-events&status=eq.approved&limit=1"
      );
      if(!grants.length)return null;
      return {id,email,name:str(user.name)||email,mode:"organiser"};
    }catch{return null;}
  }
  // Sessions without an explicit recognised provider receive no EMS staff privileges.
  return null;
}

export async function requireEmsActor(): Promise<EmsActor> {
  const actor = await getEmsActor();
  if (!actor) throw new EmsError(403, "You do not have an authorised EMS session. Sign in or contact the service desk.");
  return actor;
}

export async function listEmsEvents(actor: EmsActor): Promise<EmsEvent[]> {
  if (actor.mode === "staff" && (!actor.role || actor.role === "viewer"))
    throw new EmsError(403, "Your EMS account has no active data access.");
  const fields = "id,reference,organiser_name,name,category,venue_name,start_date,end_date,status,capture_channel,date_received,captured_by_email,assigned_to_email,priority,risk_level,review_due,created_at";
  const ownerFilter = actor.mode === "organiser"
    ? "&created_by_id=eq." + encodeURIComponent(actor.id)
    : actor.mode === "staff" && actor.role === "intake"
      ? "&or=(" + ["created_by_id.eq." + actor.id,"assigned_to_email.eq." + actor.email].join(",") + ")"
      : "";
  return emsDatabase<EmsEvent[]>("wcda_ems_events?select=" + fields + ownerFilter + "&order=created_at.desc&limit=100");
}

export type CreateEmsInput = {
  organiserName: string;
  name: string;
  category: string;
  venueName: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
  estimatedAttendance: number | null;
};

export function validateEmsInput(raw: unknown): CreateEmsInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new EmsError(400,"Enter the event details.");
  const obj = raw as Record<string,unknown>;
  const organiserName = str(obj.organiserName), name = str(obj.name), category = str(obj.category);
  const venueName = str(obj.venueName), venueAddress = str(obj.venueAddress);
  const startDate = str(obj.startDate), endDate = str(obj.endDate);
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  if (organiserName.length < 2 || organiserName.length > 200 ||
      name.length < 3 || name.length > 200 ||
      category.length < 2 || category.length > 100 ||
      venueName.length < 2 || venueName.length > 200 ||
      venueAddress.length > 300 || !validDate(startDate) || !validDate(endDate) || endDate < startDate)
    throw new EmsError(400,"Check the organiser, event, venue and valid event dates.");
  let estimatedAttendance: number | null = null;
  if (obj.estimatedAttendance !== "" && obj.estimatedAttendance != null) {
    const n = Number(obj.estimatedAttendance);
    if (!Number.isSafeInteger(n) || n < 0 || n > 100000000) throw new EmsError(400,"Attendance must be a valid non-negative whole number.");
    estimatedAttendance = n;
  }
  return {organiserName,name,category,venueName,venueAddress,startDate,endDate,estimatedAttendance};
}

export async function createEmsEvent(actor: EmsActor, input: CreateEmsInput): Promise<{id:string;reference:string;status:string;created_at:string}> {
  return emsDatabase("rpc/wcda_ems_create_event", {
    method: "POST",
    body: JSON.stringify({
      p_actor_id:actor.id,
      p_actor_email:actor.email,
      p_organiser_name:input.organiserName,
      p_name:input.name,
      p_category:input.category,
      p_venue_name:input.venueName,
      p_venue_address:input.venueAddress,
      p_start_date:input.startDate,
      p_end_date:input.endDate,
      p_estimated_attendance:input.estimatedAttendance,
    }),
  });
}
