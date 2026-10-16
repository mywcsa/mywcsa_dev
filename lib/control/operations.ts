import "server-only";
import { supabaseConfig } from "@/lib/ams/supabase";
export type OperatorRole="director"|"einnovation"|"servicedesk"|"bit"|"ict"|"viewer";
export type Operator={email:string;role:OperatorRole;display_name?:string};
export type RecordObject=Record<string,unknown>;
export const manager=(role:string)=>["director","einnovation"].includes(role);
export const support=(role:string)=>["director","einnovation","servicedesk"].includes(role);
export const writer=(role:string)=>role!=="viewer";
export async function opsDb<T=unknown>(path:string,init:RequestInit={}):Promise<T>{
 const c=supabaseConfig();
 const res=await fetch(c.origin+"/rest/v1/"+path,{...init,
  headers:{apikey:c.secret,Authorization:"Bearer "+c.secret,
   ...(init.body?{"Content-Type":"application/json"}:{}),...init.headers},
  cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
 if(!res.ok){
  const reason=(await res.json().catch(()=>null)) as {code?:string}|null;
  if(reason?.code==="23505")throw new Error("A record already exists or the booking time is taken.");
  if(reason?.code==="42501")throw new Error("The requested action requires additional authorisation.");
  throw new Error("The secure operations database could not complete the action.");
 }
 const text=await res.text();
 return (text?JSON.parse(text):null) as T;
}
export function query(table:string, params:Record<string,string>):string{
 return table+"?"+new URLSearchParams(params).toString();
}
export async function opsRead<T>(table:string,params:Record<string,string>):Promise<T[]>{
 return opsDb<T[]>(query(table,params));
}
export async function opsInsert<T=unknown>(table:string,data:RecordObject):Promise<T>{
 return opsDb<T>(table,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(data)});
}
export async function opsPatch<T=unknown>(table:string,filters:Record<string,string>,data:RecordObject):Promise<T>{
 return opsDb<T>(query(table,{...filters,select:"*"}),{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(data)});
}
export async function opsRpc<T>(name:string,args:RecordObject):Promise<T>{
 if(!["govapps_create_account","govapps_control_book_appointment","govapps_control_resolve_ticket",
 "govapps_control_partner_app_decision","govapps_staff_create_password_account",
 "govapps_control_set_app_grant","govapps_external_request_app"].includes(name))
  throw new Error("Unsupported operation.");
 return opsDb<T>("rpc/"+name,{method:"POST",body:JSON.stringify(args)});
}
export async function opsAudit(actor:string,action:string,detail:RecordObject):Promise<void>{
 await opsInsert("govapps_control_audit",{actor_email:actor,action,detail});
}
export async function opsIncident(action:string):Promise<void>{
 // Never log request bodies, emails, credentials, DOBs or raw exception messages.
 try{await opsInsert("govapps_control_incidents",{
  source:"Command Centre",level:"error",message:"An operational action failed. Review server logs.",route:"/api/control/operations",
  created_by:"system:operations",status:"open"
 });}catch{/* avoid failures during diagnostic logging */}
}
export async function opsSnapshot(role:string){
 const all=manager(role)||role==="servicedesk";
 const p=Promise.resolve([] as RecordObject[]);
 const [tickets,notes,visits,bookings,equipment,incidents,documents,accounts,partnerGrants,operators]=await Promise.all([
  opsRead<RecordObject>("govapps_control_requests",{select:"id,kind,title,team,priority,status,assignee,requested_by,created_at,updated_at,description,target_email,external_reference",order:"created_at.desc",limit:"150"}),
  opsRead<RecordObject>("govapps_control_ticket_updates",{select:"id,request_id,actor_email,update_kind,content,created_at",order:"created_at.desc",limit:"200"}),
  all?opsRead<RecordObject>("govapps_control_visits",{select:"id,account_type,visitor_name,visitor_email,purpose,status,created_at,account_id",order:"created_at.desc",limit:"120"}):p,
  all?opsRead<RecordObject>("govapps_control_bookings",{select:"id,visitor_name,visitor_email,service,assigned_to,team,starts_at,ends_at,status,notes,created_by",order:"starts_at.asc",limit:"180"}):p,
  opsRead<RecordObject>("govapps_control_equipment",{select:"id,asset_tag,item_name,serial_number,equipment_type,condition,status,custodian_email,location,notes,created_at",order:"created_at.desc",limit:"150"}),
  opsRead<RecordObject>("govapps_control_incidents",{select:"id,source,level,message,route,status,occurred_at,updated_by",order:"occurred_at.desc",limit:"150"}),
  all?opsRead<RecordObject>("govapps_control_documents",{select:"id,title,category,related_id,file_name,content_type,size_bytes,uploaded_by,created_at",order:"created_at.desc",limit:"150"}):p,
  all?opsRead<RecordObject>("govapps_accounts",{select:"id,account_type,email,username,wcsa_id,status,created_at",order:"created_at.desc",limit:"150"}):p,
  all?opsRead<RecordObject>("govapps_control_partner_app_grants",{select:"account_id,app_slug,status,updated_at,reviewed_by",order:"updated_at.desc",limit:"150"}):p,
  opsRead<RecordObject>("govapps_control_operators",{select:"email,display_name,department,designation,role,active",active:"eq.true",order:"display_name.asc",limit:"150"}),
 ]);
 // Prevent cross-team data exposure for departmental operators.
 const teamOnly=["bit","ict"].includes(role);
 const scopedTickets=role==="viewer"?[]:teamOnly?tickets.filter(t=>t.team===role):tickets;
 const ticketIds=new Set(scopedTickets.map(t=>t.id));
 return {tickets:scopedTickets,notes:notes.filter(n=>ticketIds.has(n.request_id)),
  visits,bookings,equipment:role==="viewer"?[]:teamOnly?equipment.filter(e=>role==="ict"||e.equipment_type==="other"):equipment,
  incidents:role==="viewer"?[]:incidents,documents,accounts,partnerGrants,operators,serverCheckedAt:new Date().toISOString(),
  monitoringLabel:"Database operational records. No Vercel live log integration."};
}
export function safeCsv(data:RecordObject[],cols:string[]):string {
 // Prefix potential formula attacks. All values quoted and escaped.
 const cell=(v:unknown)=>{
  let text=typeof v==="string"?v:typeof v==="number"?String(v):v==null?"":String(v);
  if(/^[\s]*[=+\-@]/.test(text))text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
 };
 return [cols.map(cell).join(","),...data.map(row=>cols.map(k=>cell(row[k])).join(","))].join("\r\n")+"\r\n";
}
