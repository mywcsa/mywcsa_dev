import { NextRequest,NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { ControlAccessError, requireControlOperator } from "@/lib/control/centre";
import { staffRows, staffRpc, type StaffPasswordAccount, type StaffAppGrant, type StaffNotice, type StaffSetting } from "@/lib/govapps/staff-operations";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store, private"};
type Action={action:string;email?:string;name?:string;app?:string;active?:boolean;title?:string;content?:string;severity?:string;id?:number;key?:string;enabled?:boolean};
function fail(error:unknown){return NextResponse.json({error:error instanceof Error?error.message:"Administrative action failed."},
 {status:error instanceof ControlAccessError?error.status:400,headers});}
function requireDirector(role:string){if(role!=="director")throw new ControlAccessError(403,"Executive Director authorisation required.");}
function validEmail(value:string){return /^[^@\s]+@wcsports\.co\.za$/i.test(value)&&value.length<=254;}
export async function GET(){
 try{
  const operator=await requireControlOperator();
  if(!["director","einnovation"].includes(operator.role))throw new ControlAccessError(403,"Administrative access required.");
  const [accounts,grants,notices,settings]=await Promise.all([
   staffRows<StaffPasswordAccount>("govapps_staff_password_accounts",{
    select:"id,email,display_name,enabled,must_change,failed_attempts,blocked_until,created_at",order:"created_at.desc",limit:"200"}),
   staffRows<StaffAppGrant>("govapps_staff_app_grants",{select:"email,app_slug,active,granted_by,updated_at",order:"updated_at.desc",limit:"200"}),
   staffRows<StaffNotice>("govapps_staff_notices",{select:"id,title,content,severity,active,created_at",order:"created_at.desc",limit:"100"}),
   staffRows<StaffSetting>("govapps_control_settings",{select:"key,enabled,updated_at",order:"key.asc"}),
  ]);
  return NextResponse.json({operator,accounts,grants,notices,settings},{headers});
 }catch(e){return fail(e);}
}
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)throw new ControlAccessError(403,"Official GovApps origin required.");
  const operator=await requireControlOperator();
  if(!["director","einnovation"].includes(operator.role))throw new ControlAccessError(403,"Administrative access required.");
  const raw=await request.text();if(raw.length>9000)throw new ControlAccessError(413,"Command too large.");
  const obj:unknown=JSON.parse(raw);
  if(!obj||typeof obj!=="object"||Array.isArray(obj))throw new Error("Invalid command payload");
  const body=obj as Action;
  const email=String(body.email||"").trim().toLowerCase();
  let result:unknown=null;
  let initialPassword:string|undefined;
  if(body.action==="create_staff_login"){
   if(!validEmail(email)||typeof body.name!=="string"||body.name.trim().length<2||body.name.length>120)
    throw new Error("Use a WCSA email address and an employee display name.");
   // One-time code returned only to the command creator. Never stored or logged in plaintext.
   initialPassword=randomBytes(24).toString("base64url");
   result=await staffRpc("govapps_staff_create_password_account",{
    p_actor:operator.email,p_email:email,p_display_name:body.name.trim(),p_temporary_password:initialPassword
   });
  }else if(body.action==="staff_login_status"){
   requireDirector(operator.role);
   if(!validEmail(email)||typeof body.active!=="boolean")throw new Error("Invalid account status request");
   result=await staffRpc("govapps_control_set_staff_password_status",{p_actor:operator.email,p_email:email,p_active:body.active});
  }else if(body.action==="app_grant"){
   if(!validEmail(email)||!["csd","applications","membership"].includes(body.app||"")||typeof body.active!=="boolean")
    throw new Error("Only CSD, Applications and Membership are managed in general app allocations.");
   result=await staffRpc("govapps_control_set_app_grant",{p_actor:operator.email,p_email:email,p_app:body.app,p_active:body.active});
  }else if(body.action==="publish_notice"){
   requireDirector(operator.role);
   const title=String(body.title||"").trim(),content=String(body.content||"").trim();
   if(title.length<4||title.length>140||content.length<5||content.length>4000||
    !["information","important","urgent"].includes(body.severity||""))throw new Error("Check title, notice details and priority.");
   result=await staffRpc("govapps_control_publish_notice",{p_actor:operator.email,p_title:title,
    p_content:content,p_severity:body.severity,p_active:true});
  }else if(body.action==="notice_status"){
   requireDirector(operator.role);
   if(!Number.isSafeInteger(body.id)||Number(body.id)<1||typeof body.active!=="boolean")throw new Error("Invalid notice status");
   result=await staffRpc("govapps_control_set_notice",{p_actor:operator.email,p_notice:body.id,p_active:body.active});
  }else if(body.action==="setting"){
   requireDirector(operator.role);
   if(!["staff_password_login_enabled","notice_board_enabled"].includes(body.key||"")||typeof body.enabled!=="boolean")
    throw new Error("Unsupported configuration setting.");
   result=await staffRpc("govapps_control_set_setting",{p_actor:operator.email,p_key:body.key,p_enabled:body.enabled});
  }else throw new Error("Unknown administrative command.");
  return NextResponse.json({ok:true,result,...(initialPassword?{temporaryPassword:initialPassword}: {})},{headers});
 }catch(e){return fail(e);}
}
