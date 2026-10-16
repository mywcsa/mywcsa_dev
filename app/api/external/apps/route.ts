import { NextRequest,NextResponse } from "next/server";
import { externalAppApproved, externalCatalog, externalDb, externalRequests, externalSession } from "@/lib/external/access";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const h={"Cache-Control":"no-store, private"};
function responseError(msg:string,status:number){return NextResponse.json({error:msg},{status,headers:h});}
export async function GET(){
 try{
  const actor=await externalSession();
  if(!actor)return responseError("Please sign in with an active External User account.",401);
  const requests=await externalRequests(actor.id);
  return NextResponse.json({identity:actor,requests,apps:externalCatalog},{headers:h});
 }catch{return responseError("Unable to load your apps right now.",503);}
}
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)return responseError("Request must originate from GovApps.",403);
  const actor=await externalSession();
  if(!actor)return responseError("Please sign in to request an app.",401);
  const raw=await request.text();
  if(raw.length>2000)return responseError("Request too large.",413);
  const body:unknown=JSON.parse(raw);
  if(!body||typeof body!=="object"||Array.isArray(body))return responseError("Invalid app request.",400);
  const payload=body as {app?:unknown;reason?:unknown};
  const slug=typeof payload.app==="string"?payload.app:"";
  const reason=typeof payload.reason==="string"?payload.reason.trim():"";
  if(!externalCatalog.some(a=>a.slug===slug)||reason.length>1200)return responseError("Select a valid app and provide a shorter reason.",400);
  const result=await externalDb("rpc/govapps_external_request_app",{
   method:"POST",body:JSON.stringify({p_account_id:actor.id,p_app:slug,p_reason:reason}),
  });
  return NextResponse.json({ok:true,request:result},{headers:h});
 }catch{return responseError("Your request couldn't be saved. Please try again.",503);}
}
