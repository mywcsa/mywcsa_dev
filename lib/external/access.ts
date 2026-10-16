import "server-only";
import { auth } from "@/auth";
import { supabaseConfig } from "@/lib/ams/supabase";

export const externalCatalog=[
 {slug:"membership",name:"MyWCSA Membership",description:"Apply for and manage eligible membership services.",href:"/membership",category:"Membership",available:true},
 {slug:"wcda-events",name:"MyWCDA Events",description:"Register events, submit information and follow approved organiser workflows.",href:"/WCDA-Events",category:"Events",available:true},
 {slug:"applications",name:"MyWCSA Applications",description:"Request access to upcoming applications and submissions.",href:null,category:"Services",available:false},
] as const;
export type ExternalAppSlug=typeof externalCatalog[number]["slug"];
export type ExternalRequest={id:number;account_id:string;app_slug:ExternalAppSlug;reason:string;status:"pending"|"approved"|"declined";reviewed_at:string|null;created_at:string;updated_at:string};
export type ExternalIdentity={id:string;email:string;name:string};

export async function externalDb<T>(path:string, init:RequestInit={}):Promise<T>{
 const c=supabaseConfig();
 const response=await fetch(c.origin+"/rest/v1/"+path,{...init,headers:{apikey:c.secret,Authorization:"Bearer "+c.secret,...(init.body?{"Content-Type":"application/json"}:{})},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error("External GovApps service is currently unavailable");
 return response.json() as Promise<T>;
}
export async function externalSession():Promise<ExternalIdentity|null>{
 const session=await auth();
 const user=session?.user as ({id?:string;email?:string|null;name?:string|null;authProvider?:string}|undefined);
 if(user?.authProvider!=="external-user"||!user.id||!user.email||
  !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(user.id))return null;
 const rows=await externalDb<Array<{id:string;email:string;username:string}>>(
   "govapps_accounts?"+new URLSearchParams({select:"id,email,username",id:"eq."+user.id,
    account_type:"eq.external_user",status:"eq.active",limit:"1"}).toString()
 );
 const account=rows[0];
 if(!account||account.email.toLowerCase()!==user.email.toLowerCase())return null;
 return {id:account.id,email:account.email,name:account.username};
}
export async function externalRequests(accountId:string):Promise<ExternalRequest[]>{
 return externalDb<ExternalRequest[]>(
  "govapps_external_app_requests?"+new URLSearchParams({select:"id,account_id,app_slug,reason,status,reviewed_at,created_at,updated_at",account_id:"eq."+accountId,order:"created_at.desc"}).toString()
 );
}
export async function externalAppApproved(accountId:string,slug:ExternalAppSlug):Promise<boolean>{
 const rows=await externalDb<Array<{id:number}>>(
  "govapps_external_app_requests?"+new URLSearchParams({select:"id",account_id:"eq."+accountId,app_slug:"eq."+slug,status:"eq.approved",limit:"1"}).toString());
 return rows.length>0;
}
