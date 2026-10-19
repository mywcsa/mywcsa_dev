import {NextRequest,NextResponse} from "next/server";
import {currentPartner,partnerGrant} from "@/lib/control/partner-access";
import {opsInsert,opsPatch,opsAudit} from "@/lib/control/operations";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"no-store, private"};
export async function GET(){
 try{
  const partner=await currentPartner();
  if(!partner)return NextResponse.json({error:"Business Partner account required."},{status:401,headers});
  return NextResponse.json({partner,wcdaStatus:await partnerGrant(partner.id)},{headers});
 }catch{return NextResponse.json({error:"Partner workspace unavailable."},{status:503,headers});}
}
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)return NextResponse.json({error:"GovApps origin required."},{status:403,headers});
  const partner=await currentPartner();
  if(!partner)return NextResponse.json({error:"Business Partner account required."},{status:401,headers});
  const status=await partnerGrant(partner.id);
  if(status==="approved")return NextResponse.json({ok:true,status},{headers});
  if(status==="pending")return NextResponse.json({ok:true,status},{headers});
  if(status==="not_requested"){
   await opsInsert("govapps_control_partner_app_grants",{
    account_id:partner.id,app_slug:"wcda-events",status:"pending",requested_by:partner.email
   });
  }else{
   await opsPatch("govapps_control_partner_app_grants",{
    account_id:"eq."+partner.id,app_slug:"eq.wcda-events",status:"in.(declined,revoked)"
   },{status:"pending",requested_by:partner.email,reviewed_by:null,updated_at:new Date().toISOString()});
  }
  await opsAudit(partner.email,"partner_self_service_wcda_request",{account_id:partner.id,app:"wcda-events"});
  return NextResponse.json({ok:true,status:"pending"},{headers});
 }catch{return NextResponse.json({error:"Could not submit application request."},{status:400,headers});}
}
