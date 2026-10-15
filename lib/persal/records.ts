import "server-only";
import {supabaseConfig} from "@/lib/ams/supabase";
import type {Official} from "./server";
import {canUseModule,caseWorkspace} from "./permissions";
import {persalModules} from "@/app/persal/modules";
import {fieldDefinitions} from "./fields";

export type CaseRow={id:string;reference:string;module:string;tab:string;workspace:string;title:string;fields:Record<string,string>;status:"draft"|"submitted"|"approved"|"returned"|"rejected";created_by:string;decided_by:string|null;decision_note:string|null;created_at:string;updated_at:string;submitted_at:string|null;decided_at:string|null};
export class CaseError extends Error{constructor(public status:number,message:string){super(message);}}
function config(){const c=supabaseConfig();return{origin:c.origin,headers:{apikey:c.secret,Authorization:"Bearer "+c.secret,"Content-Type":"application/json"}};}
export function isModuleTab(module:string,tab:string){
 const m=persalModules.find(m=>m.slug===module);return Boolean(m&&m.tabs.some(t=>t===tab));
}
export function validateCaseFields(tab:string,raw:unknown):Record<string,string>{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw new CaseError(400,"Invalid fields");
 const input=raw as Record<string,unknown>;
 const allowed=fieldDefinitions(tab);
 const result:Record<string,string>={};
 for(const field of allowed){
  const value=input[field.key];const normalized=typeof value==="string"?value.trim():"";
  if(field.required&&!normalized)throw new CaseError(400,field.label+" is required.");
  if(normalized.length>3000)throw new CaseError(400,"Field too long: "+field.label);
  if(field.type==="number"&&normalized&&!/^-?\d{1,12}(\.\d{1,2})?$/.test(normalized))throw new CaseError(400,"Invalid amount: "+field.label);
  if(field.type==="date"&&normalized&&!/^\d{4}-\d{2}-\d{2}$/.test(normalized))throw new CaseError(400,"Invalid date: "+field.label);
  if(field.type==="select"&&normalized&&!field.options?.includes(normalized))throw new CaseError(400,"Invalid selection: "+field.label);
  result[field.key]=normalized;
 }
 return result;
}
async function requestRows<T>(path:string,params:Record<string,string>):Promise<T[]>{
 const c=config();const url=c.origin+"/rest/v1/"+path+"?"+new URLSearchParams(params).toString();
 const response=await fetch(url,{headers:c.headers,cache:"no-store",signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new CaseError(503,"Database request unavailable");
 const result:unknown=await response.json();return Array.isArray(result)?result as T[]:[];
}
async function invoke<T>(name:string,args:Record<string,unknown>):Promise<T>{
 if(!/^persal_case_(create|update|transition)$/.test(name))throw new CaseError(400,"Unknown operation");
 const c=config();
 const response=await fetch(c.origin+"/rest/v1/rpc/"+name,{method:"POST",headers:c.headers,body:JSON.stringify(args),cache:"no-store",signal:AbortSignal.timeout(12000)});
 const result:unknown=await response.json().catch(()=>null);
 if(!response.ok){
  const e=(result&&typeof result==="object"?result as Record<string,string>:{});
  if(e.code==="42501")throw new CaseError(403,"Not authorised for this action or independent reviewer required");
  if(e.code==="22023")throw new CaseError(400,e.message||"Invalid business record");
  if(e.code==="P0002")throw new CaseError(404,"Record not found");
  throw new CaseError(503,"The case transaction could not be completed");
 }
 return result as T;
}
export async function listCases(official:Official,module:string,tab?:string):Promise<CaseRow[]>{
 if(!canUseModule(official,module))throw new CaseError(403,"Insufficient permissions");
 const workspaces=official.workspaces.filter(w=>w===caseWorkspace(official,module)||w!==undefined&&canUseModule(official,module));
 const valid=workspaces.filter(w=>module==="utilities"||((module==="salary-administration")?w==="finance":module==="back-office"?["executive","personnel","ict_bit","innovation","communications"].includes(w):module==="personnel-administration"?["personnel","executive"].includes(w):module==="human-resource-planning"?["personnel","management","executive"].includes(w):module==="management-information"?["executive","management","personnel","finance"].includes(w):["executive","management","personnel"].includes(w)));
 if(!valid.length)return[];
 const params:Record<string,string>={select:"id,reference,module,tab,workspace,title,fields,status,created_by,decided_by,decision_note,created_at,updated_at,submitted_at,decided_at",module:"eq."+module,workspace:"in.("+valid.join(",")+")",order:"created_at.desc",limit:"75"};
 if(tab)params.tab="eq."+tab;
 return await requestRows<CaseRow>("persal_cases",params);
}
export async function createCase(official:Official,body:{module:string;tab:string;title:string;fields:unknown;workspace?:string}){
 if(!isModuleTab(body.module,body.tab)||!canUseModule(official,body.module))throw new CaseError(403,"Module access denied");
 const w=caseWorkspace(official,body.module);
 if(!w)throw new CaseError(403,"No approved workspace");
 const fields=validateCaseFields(body.tab,body.fields);
 const title=String(body.title||"").trim();
 if(title.length<3||title.length>160)throw new CaseError(400,"Enter a meaningful title");
 return invoke<string>("persal_case_create",{p_actor:official.id,p_module:body.module,p_tab:body.tab,p_workspace:w,p_title:title,p_fields:fields});
}
export async function changeCase(official:Official,id:string,body:{action:string;note?:string;title?:string;fields?:unknown}){
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(id))throw new CaseError(400,"Invalid record ID");
 const records=await requestRows<CaseRow>("persal_cases",{select:"*",id:"eq."+id,limit:"1"});
 const rec=records[0];
 if(!rec||!isModuleTab(rec.module,rec.tab)||!canUseModule(official,rec.module)||
 !official.workspaces.includes(rec.workspace as Official["primary"]))throw new CaseError(404,"Record unavailable");
 if(body.action==="save"){
  return invoke<string>("persal_case_update",{p_actor:official.id,p_case:id,p_title:body.title,p_fields:validateCaseFields(rec.tab,body.fields)});
 }
 if(!["submit","approve","reject","return"].includes(body.action))throw new CaseError(400,"Unknown action");
 return invoke<string>("persal_case_transition",{p_actor:official.id,p_case:id,p_action:body.action,p_note:body.note||""});
}
export async function listAudit(official:Official){
 if(!official.workspaces.some(w=>["executive","personnel","ict_bit"].includes(w)))throw new CaseError(403,"Audit access restricted");
 const records=await requestRows<{id:number;event_type:string;entity_type:string;entity_id:string|null;occurred_at:string}>("persal_audit_events",{select:"id,event_type,entity_type,entity_id,occurred_at",order:"occurred_at.desc",limit:"80"});
 return records;
}
export async function listEvents(official:Official){
 if(!official.workspaces.some(w=>["ict_bit","innovation","executive","personnel"].includes(w)))throw new CaseError(403,"Automation monitoring restricted");
 return requestRows<{id:string;event_type:string;status:string;attempts:number;created_at:string}>("persal_event_outbox",{select:"id,event_type,status,attempts,created_at",order:"created_at.desc",limit:"80"});
}
export async function listAccess(official:Official){
 if(!official.workspaces.some(w=>["executive","personnel","ict_bit"].includes(w)))throw new CaseError(403,"Access register restricted");
 return requestRows<{id:string;full_name:string;position_title:string;enabled:boolean;verified_at:string|null}>("persal_access_register",{select:"id,full_name,position_title,enabled,verified_at",order:"full_name.asc",limit:"40"});
}
