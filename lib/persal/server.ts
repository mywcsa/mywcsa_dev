import "server-only";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { supabaseConfig } from "@/lib/ams/supabase";

export type Workspace = "executive" | "management" | "personnel" | "finance" | "ict_bit" | "innovation" | "communications";
export type Official = { id: string; name: string; title: string; workspaces: Workspace[]; primary: Workspace };
export type WorkItem = { id: string; reference: string; title: string; workspace: Workspace; type: string; status: string; priority: string; due_at: string | null };
export type EmployeeSummary = { id: string; persal_number: string; first_name: string; last_name: string; division: string | null; post_title: string | null; employment_status: string };

const validWorkspaces = new Set<Workspace>(["executive","management","personnel","finance","ict_bit","innovation","communications"]);
type AccessRow = { id: string; full_name: string; position_title: string | null };
type Membership = { workspace: Workspace; is_primary: boolean };

function headers() {
  const c = supabaseConfig();
  return { origin: c.origin, headers: { apikey: c.secret, Authorization: "Bearer " + c.secret } };
}
function queryString(args: Record<string,string>) { return new URLSearchParams(args).toString(); }
async function rows<T>(table: string, query: Record<string,string>): Promise<T[]> {
  const c = headers();
  const response = await fetch(c.origin + "/rest/v1/" + table + "?" + queryString(query), { headers:c.headers,cache:"no-store",signal:AbortSignal.timeout(8000) });
  if(!response.ok) throw new Error("PERSAL database query failed");
  const body: unknown = await response.json();
  if(!Array.isArray(body)) throw new Error("Unexpected PERSAL response");
  return body as T[];
}
async function count(table: string, filter?: Record<string,string>): Promise<number | null> {
  const c = headers();
  const response = await fetch(c.origin + "/rest/v1/" + table + "?" + queryString({select:"id",limit:"1",...(filter || {})}), { method:"HEAD",headers:{...c.headers,Prefer:"count=exact"},cache:"no-store",signal:AbortSignal.timeout(8000) });
  if(!response.ok) return null;
  const range=response.headers.get("content-range");
  const number=range?.match(/\/(\d+)$/)?.[1];
  return number ? Number(number) : null;
}

/** Always deny unless an administrator has bound a verified immutable Entra subject. */
export async function getPersalOfficial(): Promise<Official | null> {
  try {
    const session=await auth();
    const user=session?.user as ({id?:string;authProvider?:string}|undefined);
    const issuer=process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER;
    if(!user?.id || user.authProvider!=="microsoft-entra-id" || !issuer) return null;
    const matches=await rows<AccessRow>("persal_access_register",{
      select:"id,full_name,position_title",entra_subject:"eq."+user.id,entra_issuer:"eq."+issuer,
      verified_at:"not.is.null",enabled:"eq.true",limit:"1"
    });
    const official=matches[0];
    if(!official) return null;
    const memberships=await rows<Membership>("persal_workspace_memberships",{
      select:"workspace,is_primary",access_id:"eq."+official.id,enabled:"eq.true"
    });
    const workspaces=memberships.map(v=>v.workspace).filter(v=>validWorkspaces.has(v));
    if(!workspaces.length) return null;
    const primary=memberships.find(v=>v.is_primary && validWorkspaces.has(v.workspace))?.workspace || workspaces[0];
    return { id:official.id,name:official.full_name,title:official.position_title||"Authorised official",primary,workspaces };
  } catch { return null; }
}
export async function requirePersalOfficial():Promise<Official> {
  const official=await getPersalOfficial();
  if(!official) notFound();
  return official;
}
export async function getPersalOverview(official: Official) {
  try {
    const [active, vacancies, total, workItems]=await Promise.all([
      count("persal_employees",{employment_status:"eq.active"}),
      count("persal_employees",{employment_status:"eq.pending_start"}),
      count("persal_employees"),
      rows<WorkItem>("persal_work_items",{
        select:"id,reference,title,workspace,type,status,priority,due_at",
        assigned_access_id:"eq."+official.id,
        workspace:"in.("+official.workspaces.join(",")+")",
        order:"created_at.desc",limit:"30"
      })
    ]);
    return { active, pendingStarts:vacancies, total, workItems };
  } catch {
    return { active:null,pendingStarts:null,total:null,workItems:[] as WorkItem[] };
  }
}
export async function getPersalEmployees(official:Official, term=""):Promise<EmployeeSummary[]> {
  if(!official.workspaces.includes("personnel") && !official.workspaces.includes("executive")) return [];
  const query:Record<string,string>={ select:"id,persal_number,first_name,last_name,division,post_title,employment_status",order:"last_name.asc",limit:"25" };
  const safe=term.trim().replace(/[^a-zA-Z0-9 \-']/g,"").slice(0,60);
  if(safe) {
    if(/^5\d{0,7}$/.test(safe)) query.persal_number="ilike."+safe+"*";
    else query.or="(first_name.ilike.*"+safe+"*,last_name.ilike.*"+safe+"*)";
  }
  try { return await rows<EmployeeSummary>("persal_employees",query); } catch { return []; }
}
