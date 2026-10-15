import {NextRequest,NextResponse} from "next/server";
import {getPersalOfficial,getPersalEmployees} from "@/lib/persal/server";
import {CaseError,listAudit,listEvents,listAccess} from "@/lib/persal/records";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const official=await getPersalOfficial();
 if(!official)return NextResponse.json({error:"Verified PERSAL staff access required"},{status:403});
 const view=req.nextUrl.searchParams.get("view");
 try{
  let records:unknown;
  if(view==="access")records=await listAccess(official);
  else if(view==="audit")records=await listAudit(official);
  else if(view==="outbox")records=await listEvents(official);
  else if(view==="employees"){
   if(!official.workspaces.some(w=>w==="executive"||w==="personnel"))throw new CaseError(403,"Employee records restricted");
   records=await getPersalEmployees(official);
  }
  else return NextResponse.json({error:"Invalid view"},{status:400});
  return NextResponse.json({records},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof CaseError?e.message:"Service unavailable"},{status:e instanceof CaseError?e.status:503,headers:{"Cache-Control":"no-store"}});}
}
