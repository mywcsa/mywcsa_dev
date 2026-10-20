import "server-only";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { supabaseConfig } from "@/lib/ams/supabase";
import { getPersalOfficial } from "@/lib/persal/server";

/**
 * Launcher visibility is derived from the SAME live registers that authorise
 * protected apps. Catalog metadata alone never gives a user access.
 *
 * Entra staff baseline: WorkHub and MSuite.
 * Command Centre: active operator in govapps_control_operators.
 * PERSAL: immutable Entra subject+issuer verified by getPersalOfficial().
 * AMS: active wcsa_registry_staff entry.
 * WCDA EMS: active wcda_ems_staff_access entry.
 * Other staff-facing apps: explicit govapps_staff_app_grants entry.
 * Membership remains publicly available through its separate partner login,
 * but it is not advertised on the internal staff launcher without a grant.
 */
export type StaffAppSlug =
  | "workhub" | "msuite" | "control" | "persal" | "ams"
  | "wcda-events" | "applications" | "csd" | "membership";

const staffBaseline: StaffAppSlug[] = ["workhub", "msuite"];

export function isMicrosoftStaff(user: { email?: string | null; authProvider?: string } | undefined): boolean {
  return (user?.authProvider === "microsoft-entra-id" || user?.authProvider === "staff-password") &&
    /^[^@\s]+@wcsports\.co\.za$/i.test(user.email?.trim() || "");
}

async function scopedRows<T>(table: string, params: Record<string,string>): Promise<T[]> {
  const config = supabaseConfig();
  const search = new URLSearchParams(params);
  const response = await fetch(config.origin + "/rest/v1/" + table + "?" + search.toString(), {
    headers: { apikey: config.secret, Authorization: "Bearer " + config.secret },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error("App permission lookup failed");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("App permissions response invalid");
  return data as T[];
}

/** Fail closed on any registry/database error. No broad public catalog fallback. */
export async function authorisedStaffApps(user: {email?:string|null;authProvider?:string}|undefined): Promise<Set<StaffAppSlug>> {
  const allowed = new Set<StaffAppSlug>();
  if (!isMicrosoftStaff(user)) return allowed;
  for (const slug of staffBaseline) allowed.add(slug);
  const email = user!.email!.trim().toLowerCase();

  // A disabled fallback account loses access immediately, even with an older JWT.
  // First-use passwords must be rotated before any application access.
  if(user?.authProvider==="staff-password"){
    const [fallback,loginSetting]=await Promise.all([
      scopedRows<{email:string;must_change:boolean}>("govapps_staff_password_accounts",{
        select:"email,must_change",email:"eq."+email,enabled:"eq.true",limit:"1"
      }).catch(()=>[]),
      scopedRows<{enabled:boolean}>("govapps_control_settings",{
        select:"enabled",key:"eq.staff_password_login_enabled",limit:"1"
      }).catch(()=>[]),
    ]);
    if(!fallback.length||fallback[0].must_change||loginSetting[0]?.enabled!==true)
      return new Set<StaffAppSlug>();
  }

  // Each protected app is independently resolved; a failure cannot grant access.
  const [command, registry, wcda, special, persal] = await Promise.all([
    scopedRows<{email:string}>("govapps_control_operators", {
      select:"email",email:"eq."+email,active:"eq.true",limit:"1",
    }).catch(() => []),
    scopedRows<{email:string}>("wcsa_registry_staff", {
      select:"email",email:"eq."+email,active:"eq.true",limit:"1",
    }).catch(() => []),
    scopedRows<{email:string}>("wcda_ems_staff_access", {
      select:"email",email:"eq."+email,active:"eq.true",limit:"1",
    }).catch(() => []),
    scopedRows<{app_slug:StaffAppSlug}>("govapps_staff_app_grants", {
      select:"app_slug",email:"eq."+email,active:"eq.true",limit:"30",
    }).catch(() => []),
    getPersalOfficial().catch(() => null),
  ]);
  if (command.length) allowed.add("control");
  if (registry.length) allowed.add("ams");
  // Both Entra and approved staff-password sessions require an active EMS appointment.
  // Fallback password sessions have already passed live enablement and rotation checks above.
  if (wcda.length) allowed.add("wcda-events");
  // PERSAL stays Entra-bound even for users with a separate password login.
  if (user?.authProvider === "microsoft-entra-id" && persal) allowed.add("persal");
  for (const entry of special) {
    if (["applications","csd","membership"].includes(entry.app_slug)) allowed.add(entry.app_slug);
  }
  return allowed;
}

/** Guards direct app URL use as well as the launcher tile. */
export async function requireStaffApp(slug: StaffAppSlug) {
  const session = await auth();
  const user = session?.user as ({email?:string|null;authProvider?:string}|undefined);
  if (!isMicrosoftStaff(user)) notFound();
  const allowed = await authorisedStaffApps(user);
  if (!allowed.has(slug)) notFound();
}
