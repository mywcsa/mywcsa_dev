import {NextRequest,NextResponse} from "next/server";
import {randomBytes} from "node:crypto";
import {requireControlOperator,ControlAccessError} from "@/lib/control/centre";
import {manager,support,writer,opsSnapshot,opsInsert,opsPatch,opsRead,opsRpc,opsAudit,opsIncident,safeCsv,query,type RecordObject} from "@/lib/control/operations";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store, private"};
type Payload=Record<string,unknown>;
const value=(o:Payload,k:string)=>typeof o[k]==="string"?String(o[k]).trim():"";
const validEmail=(e:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)&&e.length<=254;
const validStaff=(e:string)=>/^[^\s@]+@wcsports\.co\.za$/i.test(e);
const id=(n:unknown)=>Number.isSafeInteger(Number(n))&&Number(n)>0?Number(n):null;
const requireRole=(condition:boolean)=>{if(!condition)throw new ControlAccessError(403,"This command needs additional authorisation.");};
const check=(request:NextRequest)=>{if(request.headers.get("origin")!==request.nextUrl.origin)throw new ControlAccessError(403,"Official GovApps origin required.");};
const wrong=(msg:string)=>{throw new ControlAccessError(400,msg);};
function failure(e:unknown){
 return NextResponse.json({error:e instanceof ControlAccessError?e.message:e instanceof Error?e.message:"Command failed."},
 {status:e instanceof ControlAccessError?e.status:400,headers});
}
export async function GET(request:NextRequest){
 try{
  const operator=await requireControlOperator();
  const report=request.nextUrl.searchParams.get("report");
  const data=await opsSnapshot(operator.role);
  if(!report)return NextResponse.json({operator,data},{headers});
  requireRole(support(operator.role));
  const schema:Record<string,string[]>={
   tickets:["id","kind","title","team","status","priority","assignee","created_at","updated_at"],
   visits:["id","visitor_name","visitor_email","account_type","purpose","status","created_at"],
   equipment:["asset_tag","item_name","equipment_type","status","condition","custodian_email","location"],
   bookings:["id","visitor_name","visitor_email","service","assigned_to","team","starts_at","ends_at","status"],
   incidents:["id","source","level","message","route","status","occurred_at"]
  };
  const cols=schema[report];if(!cols)wrong("Unsupported report type.");
  const rows=(data as unknown as Record<string,RecordObject[]>)[report];
  return new NextResponse(safeCsv(rows||[],cols),{headers:{
   ...headers,"Content-Type":"text/csv; charset=utf-8",
   "Content-Disposition":'attachment; filename="govapps-'+report+'.csv"',
   "X-Content-Type-Options":"nosniff"
  }});
 }catch(e){return failure(e);}
}
export async function POST(request:NextRequest){
 let action="";
 try{
  check(request);
  const operator=await requireControlOperator();
  requireRole(writer(operator.role));
  const raw=await request.text();
  if(raw.length>12000)wrong("The command exceeds the maximum size.");
  const object:unknown=JSON.parse(raw);
  if(!object||typeof object!=="object"||Array.isArray(object))wrong("Invalid command.");
  const p=object as Payload; action=value(p,"action");
  const actor=operator.email;
  let result:unknown=null;
  let temporaryPassword:string|undefined;
  if(action==="walkin"){
   requireRole(support(operator.role));
   const type=value(p,"account_type"),name=value(p,"name"),email=value(p,"email").toLowerCase(),purpose=value(p,"purpose");
   const username=value(p,"username"),dob=value(p,"dob"),wcsaId=value(p,"wcsa_id");
   if(!["staff","external_user","business_partner"].includes(type)||name.length<2||name.length>150||
    !validEmail(email)||purpose.length<4||purpose.length>700)wrong("Provide a valid visitor, account type, email and visit purpose.");
   let accountId:string|null=null;
   if(p.create_account===true){
    requireRole(manager(operator.role));
    temporaryPassword=randomBytes(24).toString("base64url");
    if(type==="staff"){
     if(!validStaff(email))wrong("A WCSA work email is required for staff login creation.");
     await opsRpc("govapps_staff_create_password_account",{p_actor:actor,p_email:email,p_display_name:name,p_temporary_password:temporaryPassword});
    }else{
     if(username.length<4||username.length>64)wrong("Enter a username of 4–64 characters.");
     if(type==="business_partner"&&(!wcsaId||wcsaId.length>80))wrong("A verified, issued WCSA ID is compulsory for a Business Partner.");
     if(type==="external_user"){
      const birth=new Date(dob+"T00:00:00Z");
      if(!/^\d{4}-\d{2}-\d{2}$/.test(dob)||Number.isNaN(birth.valueOf())||
       birth.toISOString().slice(0,10)!==dob||dob>new Date().toISOString().slice(0,10)||dob<"1900-01-01")wrong("Enter a valid date of birth.");
      const minor=(Date.now()-birth.valueOf())<18*365.2425*86400000;
      if(minor&&p.guardian_confirmed!==true)wrong("Confirm the minor's required parent/guardian authorisation before proceeding.");
     }
     accountId=await opsRpc<string>("govapps_create_account",{
      p_account_type:type,p_email:email,p_username:username,p_password:temporaryPassword,
      p_wcsa_id:type==="business_partner"?wcsaId:null,
      p_date_of_birth:type==="external_user"?dob:null
     });
    }
   }
   const visit=(await opsInsert<RecordObject[]>("govapps_control_visits",{
    account_type:type,visitor_name:name,visitor_email:email,purpose,status:"open",account_id:accountId,created_by:actor
   }))[0];
   result={visit,accountCreated:p.create_account===true,method:type==="staff"?"GovApps fallback (not Microsoft Entra)":"GovApps credentials"};
   await opsAudit(actor,"walkin_recorded",{visit_id:visit.id,account_type:type,account_created:p.create_account===true,account_id:accountId});
  }else if(action==="visit_status"){
   requireRole(support(operator.role));const record=id(p.id),status=value(p,"status");
   if(!record||!["open","served","referred","cancelled"].includes(status))wrong("Invalid visitor status.");
   result=await opsPatch("govapps_control_visits",{id:"eq."+record},{status});
   if(!Array.isArray(result)||!result.length)wrong("Visitor record no longer exists.");
   await opsAudit(actor,"walkin_updated",{visit_id:record,status});
  }else if(action==="ticket_note"||action==="solve_ticket"){
   const ticket=id(p.ticket_id),content=value(p,"content");
   if(!ticket||content.length<10||content.length>3000)wrong("Enter a ticket ID and meaningful work details (10–3000 characters).");
   const rows=await opsRead<RecordObject>("govapps_control_requests",{select:"id,team,kind,status",id:"eq."+ticket,limit:"1"});
   const t=rows[0];if(!t)wrong("Ticket not found.");
   requireRole(support(operator.role)||operator.role===t.team);
   if(action==="solve_ticket"){
    result=await opsRpc("govapps_control_resolve_ticket",{p_actor:actor,p_request:ticket,p_solution:content});
   }else{
    result=await opsInsert("govapps_control_ticket_updates",{request_id:ticket,actor_email:actor,
     update_kind:value(p,"kind")==="worklog"?"worklog":"note",content});
    await opsAudit(actor,"ticket_worklogged",{ticket_id:ticket});
   }
  }else if(action==="book_appointment"){
   requireRole(support(operator.role));
   const name=value(p,"name"),email=value(p,"email").toLowerCase(),service=value(p,"service"),
    assignee=value(p,"assignee").toLowerCase(),team=value(p,"team"),start=value(p,"starts_at"),minutes=Number(p.minutes);
   if(name.length<2||name.length>150||!validEmail(email)||service.length<4||service.length>140||
    !validStaff(assignee)||!["servicedesk","ict","bit","einnovation"].includes(team)||
    Number.isNaN(Date.parse(start))||![15,30,45,60,90,120].includes(minutes)||
    value(p,"notes").length>900)wrong("Review appointment details and selected duration.");
   result=await opsRpc("govapps_control_book_appointment",{p_actor:actor,p_name:name,p_email:email,
    p_service:service,p_assignee:assignee,p_team:team,p_start:new Date(start).toISOString(),p_minutes:minutes,p_notes:value(p,"notes")});
  }else if(action==="booking_status"){
   requireRole(support(operator.role));const record=id(p.id),status=value(p,"status");
   if(!record||!["arrived","completed","cancelled","no_show"].includes(status))wrong("Invalid appointment state.");
   const previous=await opsRead<RecordObject>("govapps_control_bookings",{select:"id,status",id:"eq."+record,limit:"1"});
   if(!previous.length||!["booked","arrived"].includes(String(previous[0].status)))wrong("Appointment is no longer active.");
   result=await opsPatch("govapps_control_bookings",{id:"eq."+record,status:"in.(booked,arrived)"},{status,updated_by:actor});
   if(!Array.isArray(result)||!result.length)wrong("Booking was already changed.");
   await opsAudit(actor,"appointment_status",{booking_id:record,status});
  }else if(action==="equipment_add"){
   requireRole(["director","einnovation","ict"].includes(operator.role));
   const tag=value(p,"asset_tag"),name=value(p,"item_name"),kind=value(p,"equipment_type");
   if(tag.length<3||tag.length>100||name.length<3||name.length>140||
    !["computer","mobile","network","peripheral","other"].includes(kind)||
    value(p,"serial_number").length>140||value(p,"location").length>180||
    value(p,"notes").length>1200)wrong("Review equipment registration details.");
   result=await opsInsert("govapps_control_equipment",{asset_tag:tag,item_name:name,serial_number:value(p,"serial_number"),
    equipment_type:kind,location:value(p,"location"),notes:value(p,"notes"),created_by:actor});
   await opsAudit(actor,"equipment_registered",{asset_tag:tag});
  }else if(action==="equipment_update"){
   requireRole(["director","einnovation","ict"].includes(operator.role));
   const record=id(p.id),status=value(p,"status"),condition=value(p,"condition"),custodian=value(p,"custodian_email").toLowerCase();
   if(!record||!["available","allocated","repair","retired"].includes(status)||
    !["new","good","needs_repair","unusable"].includes(condition)||
    (custodian&&!validEmail(custodian))||(status==="allocated"&&!custodian))wrong("An allocated device must have a valid custodian.");
   result=await opsPatch("govapps_control_equipment",{id:"eq."+record},
    {status,condition,custodian_email:custodian||null,updated_by:actor,updated_at:new Date().toISOString()});
   if(!Array.isArray(result)||!result.length)wrong("Equipment record no longer exists.");
   await opsAudit(actor,"equipment_status_changed",{equipment_id:record,status,condition});
  }else if(action==="partner_app"){
   requireRole(manager(operator.role));const account=value(p,"account_id"),decision=value(p,"decision");
   if(!/^[0-9a-f-]{36}$/i.test(account)||!["pending","approved","declined","revoked"].includes(decision))
    wrong("Select an existing Business Partner and a valid approval decision.");
   result=await opsRpc("govapps_control_partner_app_decision",{p_actor:actor,p_account:account,p_decision:decision});
  }else if(action==="external_app"){
   requireRole(manager(operator.role));
   const account=value(p,"account_id"),app=value(p,"app"),reason=value(p,"reason");
   if(!/^[0-9a-f-]{36}$/i.test(account)||!["membership","wcda-events","applications"].includes(app)||
    reason.length>1200)wrong("Select a valid external account and application.");
   result=await opsRpc("govapps_external_request_app",{p_account_id:account,p_app:app,p_reason:reason});
   await opsAudit(actor,"external_app_requested_for_walkin",{account_id:account,app});
  }else if(action==="staff_app"){
   requireRole(manager(operator.role));
   const email=value(p,"email").toLowerCase(),app=value(p,"app"),enabled=p.enabled;
   if(!validStaff(email)||!["csd","membership","applications"].includes(app)||typeof enabled!=="boolean")
    wrong("Only supported staff apps can be allocated from this panel.");
   result=await opsRpc("govapps_control_set_app_grant",{p_actor:actor,p_email:email,p_app:app,p_active:enabled});
  }else if(action==="incident"){
   requireRole(support(operator.role));const level=value(p,"level"),message=value(p,"message"),source=value(p,"source");
   if(!["info","warning","error","critical"].includes(level)||message.length<5||message.length>1000||
    source.length<2||source.length>80||value(p,"route").length>180)wrong("Review incident details.");
   result=await opsInsert("govapps_control_incidents",{level,message,source,route:value(p,"route"),created_by:actor});
   await opsAudit(actor,"incident_recorded",{incident_level:level,source});
  }else if(action==="incident_status"){
   requireRole(support(operator.role));const record=id(p.id),status=value(p,"status");
   if(!record||!["open","investigating","resolved"].includes(status))wrong("Invalid incident status.");
   result=await opsPatch("govapps_control_incidents",{id:"eq."+record},{status,updated_by:actor});
   if(!Array.isArray(result)||!result.length)wrong("Incident record no longer exists.");
   await opsAudit(actor,"incident_status_changed",{incident_id:record,status});
  }else{
   wrong("Unknown command.");
  }
  return NextResponse.json({ok:true,result,...(temporaryPassword?{temporaryPassword}: {})},{headers});
 }catch(e){
  if(!(e instanceof ControlAccessError)||e.status>=500)await opsIncident(action||"unknown");
  return failure(e);
 }
}
