import {NextRequest,NextResponse} from "next/server";
import {requireControlOperator,ControlAccessError} from "@/lib/control/centre";
import {mailSettings,sendGovAppsEmail} from "@/lib/govapps/email";
import {opsRead} from "@/lib/control/operations";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store, private"};
type Event={id:number;category:string;status:string;error_category:string|null;reference_type:string|null;reference_id:string|null;actor_email:string|null;created_at:string};
function fail(e:unknown){return NextResponse.json({error:e instanceof ControlAccessError?e.message:"Email Centre is temporarily unavailable."},
 {status:e instanceof ControlAccessError?e.status:503,headers});}
export async function GET(){
 try{
  const actor=await requireControlOperator();
  const events=await opsRead<Event>("govapps_email_delivery_log",{
   select:"id,category,status,error_category,reference_type,reference_id,actor_email,created_at",
   order:"created_at.desc",limit:"100"
  });
  return NextResponse.json({sender:mailSettings(),events,operator:actor.email},{headers});
 }catch(e){return fail(e);}
}
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)throw new ControlAccessError(403,"GovApps origin required.");
  const actor=await requireControlOperator();
  const raw=await request.text();if(raw.length>120)throw new ControlAccessError(413,"Invalid test email request.");
  const body:unknown=JSON.parse(raw);
  if(!body||typeof body!=="object"||(body as {action?:string}).action!=="send_test")
   throw new ControlAccessError(400,"Unknown email operation.");
  if(!mailSettings().ready)throw new ControlAccessError(409,"Email delivery is not configured. Connect the Microsoft application and sending mailbox first.");
  // No arbitrary recipients or email content. Rate-limit the authenticated operator's test requests.
  const since=new Date(Date.now()-10*60_000).toISOString();
  const attempts=await opsRead<{id:number}>("govapps_email_delivery_log",{
   select:"id",category:"eq.test",actor_email:"eq."+actor.email,created_at:"gte."+since,limit:"3"
  });
  if(attempts.length>=3)throw new ControlAccessError(429,"Maximum 3 test emails per 10 minutes. Please retry later.");
  const response=await sendGovAppsEmail({
   to:actor.email,category:"test",actor:actor.email,
   subject:"MyWCSA GovApps — Email Connection Test",
   body:"This is a test from MyWCSA GovApps.\n\nThe email was requested by your signed-in Command Centre account.\nIf this email arrived, your outbound Microsoft 365 configuration is working.\n\nMyWCSA GovApps\nhttps://govapps.wcsports.co.za"
  });
  if(response.status!=="accepted")return NextResponse.json({
   status:response.status,error:response.errorCategory||"Email was not accepted by Microsoft."
  },{status:502,headers});
  return NextResponse.json({status:"accepted",message:"Microsoft Graph accepted this test email. Please confirm it appears in your mailbox."},{headers});
 }catch(e){return fail(e);}
}
