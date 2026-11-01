import "server-only";

import { supabaseConfig } from "@/lib/ams/supabase";

export type CamsStaffAccess = {
  email: string;
  username: string | null;
  full_name: string;
  role: "system_admin" | "registrar" | "approver" | "org_admin" | "org_user" | "read_only";
  directorate: string | null;
};

export async function getCamsStaffAccess(email: string): Promise<CamsStaffAccess | null> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^@\\s]+@wcsports\\.co\\.za$/.test(normalized)) return null;

  const config = supabaseConfig();
  const response = await fetch(config.origin + "/rest/v1/rpc/cams_get_staff_access", {
    method: "POST",
    headers: {
      apikey: config.secret,
      Authorization: "Bearer " + config.secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_email: normalized }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(7000),
  });

  if (!response.ok) throw new Error("CAMS staff authorisation could not be verified.");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) return null;
  const row = rows[0] as Record<string, unknown>;
  if (row.email !== normalized || typeof row.full_name !== "string") return null;

  const roles = ["system_admin", "registrar", "approver", "org_admin", "org_user", "read_only"];
  if (typeof row.role !== "string" || !roles.includes(row.role)) return null;

  return {
    email: normalized,
    username: typeof row.username === "string" ? row.username : null,
    full_name: row.full_name,
    role: row.role as CamsStaffAccess["role"],
    directorate: typeof row.directorate === "string" ? row.directorate : null,
  };
}
