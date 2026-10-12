import "server-only";
import { supabaseConfig } from "@/lib/ams/supabase";

export type EmployeeRow = {
  id: string;
  identity_email: string;
  display_name: string | null;
  employment_status: "pending" | "active" | "inactive";
  personnel_verified: boolean;
  created_at: string;
};
export async function listEmployeeRegistry(): Promise<EmployeeRow[]> {
  const config = supabaseConfig();
  const endpoint = new URL("/rest/v1/workhub_employee_profiles", config.origin);
  endpoint.searchParams.set("select", "id,identity_email,display_name,employment_status,personnel_verified,created_at");
  endpoint.searchParams.set("order", "created_at.desc");
  endpoint.searchParams.set("limit", "100");
  const response = await fetch(endpoint.toString(), {
    headers: { apikey: config.secret, Authorization: `Bearer ${config.secret}` },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Employee registry database request failed");
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(item =>
    item && typeof item === "object" && typeof item.id === "string" &&
    typeof item.identity_email === "string" &&
    ["pending", "active", "inactive"].includes(item.employment_status) &&
    typeof item.personnel_verified === "boolean"
  )) throw new Error("Employee registry returned an invalid response");
  return data as EmployeeRow[];
}
