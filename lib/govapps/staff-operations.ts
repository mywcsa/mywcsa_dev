import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/ams/supabase";

export type StaffNotice = {id:number; title:string; content:string; severity:"information"|"important"|"urgent"; created_at:string; active:boolean};
export type StaffSetting = {key:string; enabled:boolean; updated_at:string};
export type StaffPasswordAccount = {id:string;email:string;display_name:string;enabled:boolean;must_change:boolean;failed_attempts:number;blocked_until:string|null;created_at:string};
export type StaffAppGrant = {email:string;app_slug:string;active:boolean;granted_by:string;updated_at:string};

export async function staffRows<T>(table:string,params:Record<string,string>):Promise<T[]> {
 const c=supabaseConfig();
 const res=await fetch(c.origin+"/rest/v1/"+table+"?"+new URLSearchParams(params).toString(),{
  cache:"no-store",headers:{apikey:c.secret,Authorization:"Bearer "+c.secret},signal:AbortSignal.timeout(8000),redirect:"error"
 });
 if(!res.ok)throw new Error("Staff records currently unavailable");
 const data:unknown=await res.json();
 if(!Array.isArray(data))throw new Error("Invalid staff record response");
 return data as T[];
}
export async function staffRpc<T>(operation:string,values:Record<string,unknown>):Promise<T>{
 if(!["govapps_staff_change_password","govapps_staff_create_password_account","govapps_control_set_staff_password_status",
  "govapps_control_set_app_grant","govapps_control_publish_notice","govapps_control_set_notice","govapps_control_set_setting"].includes(operation))
  throw new Error("Unsupported administrative operation");
 const c=supabaseConfig();
 const res=await fetch(c.origin+"/rest/v1/rpc/"+operation,{method:"POST",cache:"no-store",
  headers:{apikey:c.secret,Authorization:"Bearer "+c.secret,"Content-Type":"application/json"},
  body:JSON.stringify(values),signal:AbortSignal.timeout(16000),redirect:"error"});
 if(!res.ok){const data=await res.json().catch(()=>null);if(data?.code==="23505")throw new Error("A fallback login already exists for this address.");
  if(data?.code==="42501"||data?.code==="22023")throw new Error(String(data?.message||"Permission or validation rejected."));
  throw new Error("The database could not save the change.");}
 return res.json() as Promise<T>;
}
export async function activeStaffNotices():Promise<StaffNotice[]>{
 return staffRows<StaffNotice>("govapps_staff_notices",{select:"id,title,content,severity,active,created_at",
 active:"eq.true",starts_at:"lte."+new Date().toISOString(),order:"created_at.desc",limit:"15"});
}
export async function noticeBoardEnabled():Promise<boolean>{
 try{const row=await staffRows<StaffSetting>("govapps_control_settings",{select:"key,enabled,updated_at",key:"eq.notice_board_enabled",limit:"1"});return row[0]?.enabled!==false;}catch{return true;}
}
type StaffSession={email?:string|null;staffLoginNonce?:string};
const cookieName="mywcsa_staff_notices_seen";
function expected(user:StaffSession):string{
 const secret=process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET;
 if(!secret)throw new Error("Staff notice signing secret unavailable");
 return createHmac("sha256",secret).update((user.email||"").toLowerCase()+"|"+(user.staffLoginNonce||"legacy")).digest("hex");
}
export async function hasSeenNotices(user:StaffSession):Promise<boolean>{
 const jar=await cookies();const found=jar.get(cookieName)?.value;
 if(!found||!/^[a-f0-9]{64}$/.test(found))return false;
 const good=expected(user);
 return timingSafeEqual(Buffer.from(found,"hex"),Buffer.from(good,"hex"));
}
export async function markNoticesSeen(user:StaffSession):Promise<void>{
 const jar=await cookies();
 jar.set(cookieName,expected(user),{httpOnly:true,secure:process.env.NODE_ENV==="production",
  sameSite:"lax",path:"/my-apps",maxAge:12*60*60});
}
