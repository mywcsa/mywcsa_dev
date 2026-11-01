import "server-only";
import { auth } from "@/auth";
import { supabaseConfig } from "@/lib/ams/supabase";

export type CamsRole = "system_admin" | "registrar" | "approver" | "org_admin" | "org_user" | "read_only";
export type CamsStaff = { email: string; full_name: string; role: CamsRole; directorate: string | null };
export class CamsAccessError extends Error { constructor(public status: number, message: string) { super(message); } }

async function request(path: string, init: RequestInit & { schema?: "cams" } = {}) {
  const c = supabaseConfig();
  const { schema, ...rest } = init;
  const response = await fetch(c.origin + "/rest/v1/" + path, {
    ...rest,
    headers: {
      apikey: c.secret, Authorization: "Bearer " + c.secret,
      ...(schema ? { "Accept-Profile": schema, "Content-Profile": schema } : {}),
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers || {}),
    },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new CamsAccessError(502, "The CAMS database is temporarily unavailable.");
  return response;
}
const cams = async <T,>(path: string, init: RequestInit = {}) => (await request(path, { ...init, schema: "cams" })).json() as Promise<T>;
const pub = async <T,>(path: string) => (await request(path)).json() as Promise<T>;

/** Same identity gate as the Command Centre: Entra or provisioned staff-password only, then a CAMS role. */
export async function requireCamsStaff(): Promise<CamsStaff> {
  const session = await auth();
  const user = session?.user as ({ email?: string | null; authProvider?: string; staffMustChange?: boolean } | undefined);
  const email = user?.email?.toLowerCase().trim();
  if (!email || !["microsoft-entra-id", "staff-password"].includes(user?.authProvider || "") || !email.endsWith("@wcsports.co.za") || user?.staffMustChange)
    throw new CamsAccessError(403, "Authorised WCSA staff sign-in is required.");
  if (user?.authProvider === "staff-password") {
    const [acct, setting] = await Promise.all([
      pub<Array<{ must_change: boolean }>>("govapps_staff_password_accounts?select=must_change&email=eq." + encodeURIComponent(email) + "&enabled=eq.true&limit=1"),
      pub<Array<{ enabled: boolean }>>("govapps_control_settings?select=enabled&key=eq.staff_password_login_enabled&limit=1"),
    ]);
    if (!acct.length || acct[0].must_change || setting[0]?.enabled !== true)
      throw new CamsAccessError(403, "Staff password access has been disabled or requires a password change.");
  }
  const rows = await cams<CamsStaff[]>("staff_access?select=email,full_name,role,directorate&email=eq." + encodeURIComponent(email) + "&active=eq.true&limit=1");
  if (!rows[0]) throw new CamsAccessError(403, "CAMS access has not been granted to this staff account.");
  return rows[0];
}

async function count(table: string) {
  const r = await request(table + "?select=*&limit=1", { schema: "cams", headers: { Prefer: "count=exact" } });
  return Number((r.headers.get("content-range") || "").split("/")[1]) || 0;
}
export type Row = Record<string, string | number | boolean | null>;
export async function loadCams(me: CamsStaff) {
  const writer = ["system_admin", "registrar", "approver"].includes(me.role);
  const admin = me.role === "system_admin";
  const [orgs, schools, assets, persons, staff, audit, counts] = await Promise.all([
    cams<Row[]>("organisations?select=ref,name,type,status,contact_email,created_at&deleted_at=is.null&order=created_at.desc&limit=200"),
    cams<Row[]>("schools?select=emis_number,quintile,learner_count,status&order=emis_number.asc&limit=200"),
    cams<Row[]>("assets?select=tag,description,location,condition,status&order=tag.asc&limit=200"),
    writer ? cams<Row[]>("persons?select=ref,first_name,last_name,kind,status&deleted_at=is.null&order=created_at.desc&limit=200") : Promise.resolve([] as Row[]),
    admin ? cams<Row[]>("staff_access?select=email,full_name,role,directorate,active&order=email.asc&limit=200") : Promise.resolve([] as Row[]),
    admin ? cams<Row[]>("audit_log?select=at,actor_email,action,table_name&order=at.desc&limit=60") : Promise.resolve([] as Row[]),
    Promise.all(["organisations", "schools", "persons", "assets", "staff_access"].map(count)),
  ]);
  return { orgs, schools, assets, persons, staff, audit, counts: { organisations: counts[0], schools: counts[1], persons: counts[2], assets: counts[3], staff: counts[4] } };
}
export type CamsData = Awaited<ReturnType<typeof loadCams>>;

export async function camsInsert(actor: string, table: "organisations" | "assets" | "staff_access", row: Record<string, unknown>) {
  try {
    return await cams<unknown>("rpc/api_insert", { method: "POST", body: JSON.stringify({ p_actor: actor, p_table: table, p_row: row }) });
  } catch { throw new CamsAccessError(400, "Could not save this record. Check the details and your permissions."); }
}
